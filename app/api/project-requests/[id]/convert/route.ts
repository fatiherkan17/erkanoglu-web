import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const projectRequestId = Number((await params).id);
    if (!Number.isInteger(projectRequestId)) return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });

    const projectRequest = await prisma.projectRequest.findUnique({ where: { id: projectRequestId }, include: { project: true } });
    if (!projectRequest) return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });
    if (projectRequest.project) return NextResponse.json({ success: true, message: "Bu talep zaten bir projeye dönüştürülmüş.", data: { projectRequest, project: projectRequest.project } });

    const year = new Date().getFullYear();
    const projectCount = await prisma.project.count();
    const projectNo = `ERK-${year}-${String(projectCount + 1).padStart(4, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({ data: { projectNo, name: projectRequest.fullName, status: "AKTIF", projectRequestId: projectRequest.id } });

      // Keep pre-project meeting history by attaching it to the newly created project.
      await tx.meetingNote.updateMany({
        where: { projectRequestId: projectRequest.id },
        data: { projectId: project.id, projectRequestId: null },
      });

      const updatedRequest = await tx.projectRequest.update({ where: { id: projectRequest.id }, data: { status: "PROJE_OLUSTURULDU" }, include: { project: true } });
      return { project, projectRequest: updatedRequest };
    });

    return NextResponse.json({ success: true, message: "Proje başarıyla oluşturuldu.", data: result }, { status: 201 });
  } catch (error) {
    console.error("Project conversion error:", error);
    return NextResponse.json({ success: false, message: "Proje oluşturulamadı.", error: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined }, { status: 500 });
  }
}
