import "dotenv/config";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const leadStatuses = ["YENI", "INCELENIYOR", "GORUSME_YAPILDI", "TEKLIF_HAZIRLANIYOR", "TEKLIF_GONDERILDI", "KAZANILDI", "KAYBEDILDI", "PROJE_OLUSTURULDU"];

export async function GET() {
  try {
    const now = new Date();

    const [
      totalLeads,
      newLeads,
      activeLeads,
      sentQuotes,
      wonLeads,
      followUpsDue,
      projectCount,
      latestLeads,
      dueLeads,
    ] = await Promise.all([
      prisma.projectRequest.count(),
      prisma.projectRequest.count({ where: { status: "YENI" } }),
      prisma.projectRequest.count({ where: { status: { in: ["INCELENIYOR", "GORUSME_YAPILDI", "TEKLIF_HAZIRLANIYOR", "TEKLIF_GONDERILDI"] } } }),
      prisma.quote.count({ where: { status: "GONDERILDI" } }),
      prisma.projectRequest.count({ where: { status: "KAZANILDI" } }),
      prisma.projectRequest.count({ where: { nextFollowUpAt: { lte: now }, status: { in: leadStatuses.filter((status) => !["KAYBEDILDI", "PROJE_OLUSTURULDU"].includes(status)) } } }),
      prisma.project.count(),
      prisma.projectRequest.findMany({
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          fullName: true,
          phone: true,
          district: true,
          buildingType: true,
          status: true,
          priority: true,
          source: true,
          nextFollowUpAt: true,
          createdAt: true,
          project: { select: { id: true, projectNo: true } },
        },
      }),
      prisma.projectRequest.findMany({
        where: {
          nextFollowUpAt: { lte: now },
          status: { notIn: ["KAYBEDILDI", "PROJE_OLUSTURULDU"] },
        },
        orderBy: [{ priority: "desc" }, { nextFollowUpAt: "asc" }],
        take: 8,
        select: {
          id: true,
          fullName: true,
          phone: true,
          district: true,
          status: true,
          priority: true,
          nextFollowUpAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalLeads,
          newLeads,
          activeLeads,
          sentQuotes,
          wonLeads,
          followUpsDue,
          projectCount,
        },
        latestLeads,
        dueLeads,
      },
    });
  } catch (error) {
    console.error("Admin dashboard GET error:", error);
    return NextResponse.json({ success: false, message: "Yönetim özeti alınamadı." }, { status: 500 });
  }
}
