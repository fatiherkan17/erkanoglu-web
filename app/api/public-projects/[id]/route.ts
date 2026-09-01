import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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
        coverImageUrl: true,
        galleryImages: true,
        status: true,
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
