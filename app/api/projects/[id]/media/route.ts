import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-auth";

const placements = new Set(["PROJE", "INSAI"]);

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const pair = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : undefined;
}

async function requireAdmin(request: Request) {
  return verifyAdminToken(getCookieValue(request, "erkanoglu_admin"));
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true, name: true, publicTitle: true } });
  if (!project) return NextResponse.json({ success: false, message: "Proje bulunamadı." }, { status: 404 });

  const media = await prisma.projectMedia.findMany({
    where: { projectId },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return NextResponse.json({ success: true, data: { project, media } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 401 });

  const { id } = await context.params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as {
    mediaId?: number;
    placement?: string;
    sortOrder?: number;
    orderedIds?: number[];
  };

  if (Array.isArray(body.orderedIds)) {
    const ids = body.orderedIds.map(Number).filter(Number.isInteger);
    const media = await prisma.projectMedia.findMany({ where: { projectId }, select: { id: true } });
    const allowed = new Set(media.map((item) => item.id));
    if (ids.length !== media.length || ids.some((item) => !allowed.has(item)) || new Set(ids).size !== ids.length) {
      return NextResponse.json({ success: false, message: "Sıralama verisi geçersiz." }, { status: 400 });
    }
    await prisma.$transaction(ids.map((mediaId, index) => prisma.projectMedia.update({ where: { id: mediaId }, data: { sortOrder: index } })));
    const updated = await prisma.projectMedia.findMany({ where: { projectId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
    return NextResponse.json({ success: true, data: updated });
  }

  const mediaId = Number(body.mediaId);
  if (!Number.isInteger(mediaId)) return NextResponse.json({ success: false, message: "Geçersiz medya." }, { status: 400 });
  const media = await prisma.projectMedia.findFirst({ where: { id: mediaId, projectId } });
  if (!media) return NextResponse.json({ success: false, message: "Medya bulunamadı." }, { status: 404 });

  const data: { placement?: string; sortOrder?: number } = {};
  if (body.placement !== undefined) {
    if (!placements.has(body.placement)) return NextResponse.json({ success: false, message: "Geçersiz fotoğraf türü." }, { status: 400 });
    data.placement = body.placement;
  }
  if (body.sortOrder !== undefined) {
    const sortOrder = Number(body.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) return NextResponse.json({ success: false, message: "Geçersiz sıra." }, { status: 400 });
    data.sortOrder = sortOrder;
  }
  if (Object.keys(data).length === 0) return NextResponse.json({ success: false, message: "Güncellenecek alan bulunamadı." }, { status: 400 });

  const updated = await prisma.projectMedia.update({ where: { id: mediaId }, data });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 401 });

  const { id } = await context.params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });
  const body = (await request.json().catch(() => ({}))) as { mediaId?: number };
  const mediaId = Number(body.mediaId);
  if (!Number.isInteger(mediaId)) return NextResponse.json({ success: false, message: "Geçersiz medya." }, { status: 400 });

  const media = await prisma.projectMedia.findFirst({ where: { id: mediaId, projectId } });
  if (!media) return NextResponse.json({ success: false, message: "Medya bulunamadı." }, { status: 404 });

  try {
    await del(media.url);
  } catch (error) {
    console.error("Project media blob delete error:", error);
    return NextResponse.json({ success: false, message: "Dosya depolamadan silinemedi." }, { status: 500 });
  }

  await prisma.projectMedia.delete({ where: { id: mediaId } });
  return NextResponse.json({ success: true, data: { id: mediaId } });
}
