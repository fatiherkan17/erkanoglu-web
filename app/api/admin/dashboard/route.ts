import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const leadStatuses = ["YENI", "INCELENIYOR", "GORUSME_YAPILDI", "TEKLIF_HAZIRLANIYOR", "TEKLIF_GONDERILDI", "KAZANILDI", "KAYBEDILDI", "PROJE_OLUSTURULDU"];
const priorityRank: Record<string, number> = { ACIL: 0, YUKSEK: 1, NORMAL: 2, DUSUK: 3 };

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
      dueLeadsRaw,
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
        select: { id: true, fullName: true, phone: true, district: true, buildingType: true, status: true, priority: true, source: true, nextFollowUpAt: true, createdAt: true, project: { select: { id: true, projectNo: true } } },
      }),
      prisma.projectRequest.findMany({
        where: { nextFollowUpAt: { lte: now }, status: { notIn: ["KAYBEDILDI", "PROJE_OLUSTURULDU"] } },
        orderBy: { nextFollowUpAt: "asc" },
        take: 20,
        select: { id: true, fullName: true, phone: true, district: true, status: true, priority: true, nextFollowUpAt: true },
      }),
    ]);

    const dueLeads = [...dueLeadsRaw].sort((a, b) => {
      const priorityDifference = (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
      if (priorityDifference !== 0) return priorityDifference;
      return new Date(a.nextFollowUpAt ?? 0).getTime() - new Date(b.nextFollowUpAt ?? 0).getTime();
    }).slice(0, 8);

    return NextResponse.json({ success: true, data: { stats: { totalLeads, newLeads, activeLeads, sentQuotes, wonLeads, followUpsDue, projectCount }, latestLeads, dueLeads } });
  } catch (error) {
    console.error("Admin dashboard GET error:", error);
    return NextResponse.json({ success: false, message: "Yönetim özeti alınamadı." }, { status: 500 });
  }
}
