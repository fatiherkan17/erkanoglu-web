import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const projectId = Number(id);
    if (!Number.isInteger(projectId) || projectId <= 0) {
      return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, published: true },
      select: {
        id: true,
        projectNo: true,
        category: true,
        publicTitle: true,
        publicSummary: true,
        status: true,
        media: {
          where: { placement: { in: ["PROJE", "INSAI"] } },
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true, url: true, originalName: true, placement: true, sortOrder: true },
        },
      },
    });

    if (!project) {
      return NextResponse.json({ success: false, message: "Proje bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Public project detail GET error:", error);
    return NextResponse.json({ success: false, message: "Proje alınamadı." }, { status: 500 });
  }
}
