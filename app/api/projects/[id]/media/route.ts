import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const placements = new Set(["BEKLEMEDE", "KAPAK", "GALERI", "UYGULAMA", "IMALAT"]);

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
