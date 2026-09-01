import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const projectRequestId = Number(id);

    if (!Number.isInteger(projectRequestId)) {
      return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });
    }

    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
      include: { project: true },
    });

    if (!projectRequest) {
      return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });
    }

    if (projectRequest.project) {
      return NextResponse.json({
        success: true,
        message: "Bu talep zaten bir projeye dönüştürülmüş.",
        data: { projectRequest, project: projectRequest.project },
      });
    }

    const year = new Date().getFullYear();
    const projectCount = await prisma.project.count();
    const projectNo = `ERK-${year}-${String(projectCount + 1).padStart(4, "0")}`;

    const result = await prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          projectNo,
          name: projectRequest.fullName,
          status: "AKTIF",
          projectRequestId: projectRequest.id,
        },
      });

      const updatedRequest = await tx.projectRequest.update({
        where: { id: projectRequest.id },
        data: { status: "PROJE_OLUSTURULDU" },
        include: { project: true },
      });

      return { project, projectRequest: updatedRequest };
    });

    return NextResponse.json({
      success: true,
      message: "Proje başarıyla oluşturuldu.",
      data: result,
    }, { status: 201 });
  } catch (error) {
    console.error("Project conversion error:", error);
    return NextResponse.json({
      success: false,
      message: "Proje oluşturulamadı.",
      error: process.env.NODE_ENV === "development" ? error instanceof Error ? error.message : String(error) : undefined,
    }, { status: 500 });
  }
}
