import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: { id: true, projectNo: true, category: true, publicTitle: true, publicSummary: true, coverImageUrl: true, galleryImages: true, applicationProjects: true, workmanshipArchive: true, status: true },
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Public projects GET error:", error);
    return NextResponse.json({ success: false, message: "Projeler alınamadı." }, { status: 500 });
  }
}
