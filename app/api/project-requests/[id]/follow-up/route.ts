import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const projectRequestId = Number((await params).id);
    if (!Number.isInteger(projectRequestId)) {
      return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });
    }

    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const action = body.action === "complete" || body.action === "reschedule" ? body.action : "";
    if (!action) {
      return NextResponse.json({ success: false, message: "Geçersiz takip işlemi." }, { status: 400 });
    }

    const existing = await prisma.projectRequest.findUnique({ where: { id: projectRequestId } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });
    }

    if (action === "complete") {
      const updated = await prisma.projectRequest.update({
        where: { id: projectRequestId },
        data: { lastContactAt: new Date(), nextFollowUpAt: null },
      });
      return NextResponse.json({ success: true, message: "Takip tamamlandı.", data: updated });
    }

    const nextFollowUpAt = typeof body.nextFollowUpAt === "string" ? new Date(body.nextFollowUpAt) : new Date(NaN);
    if (Number.isNaN(nextFollowUpAt.getTime())) {
      return NextResponse.json({ success: false, message: "Geçersiz yeni takip tarihi." }, { status: 400 });
    }

    const updated = await prisma.projectRequest.update({
      where: { id: projectRequestId },
      data: { nextFollowUpAt },
    });
    return NextResponse.json({ success: true, message: "Takip tarihi güncellendi.", data: updated });
  } catch (error) {
    console.error("Lead follow-up POST error:", error);
    return NextResponse.json({ success: false, message: "Takip işlemi gerçekleştirilemedi." }, { status: 500 });
  }
}
