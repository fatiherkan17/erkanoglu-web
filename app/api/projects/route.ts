import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
    });

    const requestIds = projects.map((project) => project.projectRequestId);
    const requests = requestIds.length
      ? await prisma.projectRequest.findMany({ where: { id: { in: requestIds } } })
      : [];
    const requestMap = new Map(requests.map((request) => [request.id, request]));

    const data = projects.map((project) => ({
      ...project,
      projectRequest: requestMap.get(project.projectRequestId) ?? null,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Projeler alınamadı.",
      },
      { status: 500 },
    );
  }
}
