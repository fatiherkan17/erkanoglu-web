import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const projectRequestId = Number(id);
    if (!Number.isInteger(projectRequestId)) return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });

    const projectRequest = await prisma.projectRequest.findUnique({ where: { id: projectRequestId }, include: { project: true } });
    if (!projectRequest) return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });
    return NextResponse.json({ success: true, data: projectRequest });
  } catch (error) {
    console.error("Project request GET error:", error);
    return NextResponse.json({ success: false, message: "Proje talebi alınamadı." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const { id } = await params;
    const projectRequestId = Number(id);
    if (!Number.isInteger(projectRequestId)) return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });

    const body = await request.json();
    const status = typeof body.status === "string" ? body.status.trim() : "";
    const allowedStatuses = ["YENI", "INCELENIYOR", "GORUSME_YAPILDI", "TEKLIF_HAZIRLANIYOR", "TEKLIF_GONDERILDI", "KAZANILDI", "KAYBEDILDI", "PROJE_OLUSTURULDU"];
    if (!allowedStatuses.includes(status)) return NextResponse.json({ success: false, message: "Geçersiz durum." }, { status: 400 });

    const projectRequest = await prisma.projectRequest.update({ where: { id: projectRequestId }, data: { status }, include: { project: true } });
    return NextResponse.json({ success: true, message: "Proje talebi güncellendi.", data: projectRequest });
  } catch (error) {
    console.error("Project request PATCH error:", error);
    return NextResponse.json({ success: false, message: "Proje talebi güncellenemedi." }, { status: 500 });
  }
}
