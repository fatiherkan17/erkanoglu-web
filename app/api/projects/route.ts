import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { projectRequest: true },
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ success: false, message: "Projeler alınamadı." }, { status: 500 });
  }
}
