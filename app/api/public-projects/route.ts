import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        projectNo: true,
        category: true,
        publicTitle: true,
        publicSummary: true,
        status: true,
        media: {
          orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          select: { id: true, url: true, placement: true, sortOrder: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Public projects GET error:", error);
    return NextResponse.json({ success: false, message: "Projeler alınamadı." }, { status: 500 });
  }
}
