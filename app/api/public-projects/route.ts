import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

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
        coverImageUrl: true,
        galleryImages: true,
        status: true,
      },
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Public projects GET error:", error);
    return NextResponse.json({ success: false, message: "Projeler alınamadı." }, { status: 500 });
  }
}
