import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type RouteContext = { params: Promise<{ id: string }> };
const allowedStatuses = ["AKTIF", "SOZLESME", "BEKLEMEDE", "TAMAMLANDI", "IPTAL"];

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ success: false, message: "Geçersiz proje numarası." }, { status: 400 });
    const project = await prisma.project.findUnique({ where: { id }, include: { projectRequest: true } });
    if (!project) return NextResponse.json({ success: false, message: "Proje bulunamadı." }, { status: 404 });
    return NextResponse.json({ success: true, data: project });
  } catch (error) {
    console.error("Project GET error:", error);
    return NextResponse.json({ success: false, message: "Proje alınamadı." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ success: false, message: "Geçersiz proje numarası." }, { status: 400 });
    const body = await request.json();
    const status = typeof body.status === "string" ? body.status.trim() : "";
    if (!allowedStatuses.includes(status)) return NextResponse.json({ success: false, message: "Geçersiz proje durumu." }, { status: 400 });
    const project = await prisma.project.update({ where: { id }, data: { status }, include: { projectRequest: true } });
    return NextResponse.json({ success: true, message: "Proje durumu güncellendi.", data: project });
  } catch (error) {
    console.error("Project PATCH error:", error);
    return NextResponse.json({ success: false, message: "Proje güncellenemedi." }, { status: 500 });
  }
}
