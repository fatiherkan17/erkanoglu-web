import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-auth";

const placements = new Set(["BEKLEMEDE", "KAPAK", "GALERI", "UYGULAMA", "IMALAT"]);

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const pair = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : undefined;
}

async function requireAdmin(request: Request) {
  const token = getCookieValue(request, "erkanoglu_admin");
  return verifyAdminToken(token);
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, name: true, publicTitle: true },
  });
  if (!project) return NextResponse.json({ success: false, message: "Proje bulunamadı." }, { status: 404 });

  const media = await prisma.projectMedia.findMany({ where: { projectId }, orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] });
  return NextResponse.json({ success: true, data: { project, media } });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { mediaId?: number; placement?: string };
  const mediaId = Number(body.mediaId);
  const placement = body.placement || "";
  if (!Number.isInteger(mediaId) || !placements.has(placement)) {
    return NextResponse.json({ success: false, message: "Geçersiz medya veya yerleşim." }, { status: 400 });
  }

  const media = await prisma.projectMedia.findFirst({ where: { id: mediaId, projectId } });
  if (!media) return NextResponse.json({ success: false, message: "Medya bulunamadı." }, { status: 404 });

  const updated = await prisma.projectMedia.update({ where: { id: mediaId }, data: { placement } });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 401 });
  }

  const { id } = await context.params;
  const projectId = Number(id);
  if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });

  const body = (await request.json().catch(() => ({}))) as { mediaId?: number };
  const mediaId = Number(body.mediaId);
  if (!Number.isInteger(mediaId)) {
    return NextResponse.json({ success: false, message: "Geçersiz medya." }, { status: 400 });
  }

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
