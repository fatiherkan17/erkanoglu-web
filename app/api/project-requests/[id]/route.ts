import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type RouteContext = { params: Promise<{ id: string }> };

const allowedStatuses = [
  "YENI",
  "INCELENIYOR",
  "GORUSME_YAPILDI",
  "TEKLIF_HAZIRLANIYOR",
  "TEKLIF_GONDERILDI",
  "KAZANILDI",
  "KAYBEDILDI",
  "PROJE_OLUSTURULDU",
];
const allowedSources = ["direct", "calculator", "collaboration"];
const allowedPriorities = ["DUSUK", "NORMAL", "YUKSEK", "ACIL"];

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const projectRequestId = Number((await params).id);
    if (!Number.isInteger(projectRequestId)) {
      return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });
    }

    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
      include: {
        project: {
          include: {
            quotes: {
              orderBy: { quoteDate: "desc" },
              take: 1,
              select: { id: true, quoteNo: true, status: true, total: true, currency: true, quoteDate: true },
            },
            meetingNotes: {
              orderBy: { meetingAt: "desc" },
              take: 1,
              select: { id: true, type: true, note: true, meetingAt: true },
            },
          },
        },
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: projectRequest });
  } catch (error) {
    console.error("Project request GET error:", error);
    return NextResponse.json({ success: false, message: "Proje talebi alınamadı." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const projectRequestId = Number((await params).id);
    if (!Number.isInteger(projectRequestId)) {
      return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });
    }

    const body = await request.json() as Record<string, unknown>;
    const data: {
      status?: string;
      source?: string;
      priority?: string;
      lastContactAt?: Date | null;
      nextFollowUpAt?: Date | null;
    } = {};

    if (body.status !== undefined) {
      const status = typeof body.status === "string" ? body.status.trim() : "";
      if (!allowedStatuses.includes(status)) return NextResponse.json({ success: false, message: "Geçersiz durum." }, { status: 400 });
      data.status = status;
    }

    if (body.source !== undefined) {
      const source = typeof body.source === "string" ? body.source.trim() : "";
      if (!allowedSources.includes(source)) return NextResponse.json({ success: false, message: "Geçersiz talep kaynağı." }, { status: 400 });
      data.source = source;
    }

    if (body.priority !== undefined) {
      const priority = typeof body.priority === "string" ? body.priority.trim() : "";
      if (!allowedPriorities.includes(priority)) return NextResponse.json({ success: false, message: "Geçersiz öncelik." }, { status: 400 });
      data.priority = priority;
    }

    for (const [key, label] of [["lastContactAt", "son görüşme"], ["nextFollowUpAt", "sonraki takip"]] as const) {
      if (body[key] === undefined) continue;
      if (body[key] === null || body[key] === "") {
        data[key] = null;
        continue;
      }
      if (typeof body[key] !== "string") {
        return NextResponse.json({ success: false, message: `Geçersiz ${label} tarihi.` }, { status: 400 });
      }
      const value = new Date(body[key]);
      if (Number.isNaN(value.getTime())) {
        return NextResponse.json({ success: false, message: `Geçersiz ${label} tarihi.` }, { status: 400 });
      }
      data[key] = value;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, message: "Güncellenecek alan bulunamadı." }, { status: 400 });
    }

    const projectRequest = await prisma.projectRequest.update({
      where: { id: projectRequestId },
      data,
      include: {
        project: {
          include: {
            quotes: { orderBy: { quoteDate: "desc" }, take: 1, select: { id: true, quoteNo: true, status: true, total: true, currency: true, quoteDate: true } },
            meetingNotes: { orderBy: { meetingAt: "desc" }, take: 1, select: { id: true, type: true, note: true, meetingAt: true } },
          },
        },
      },
    });

    return NextResponse.json({ success: true, message: "Proje talebi güncellendi.", data: projectRequest });
  } catch (error) {
    console.error("Project request PATCH error:", error);
    return NextResponse.json({ success: false, message: "Proje talebi güncellenemedi." }, { status: 500 });
  }
}
