import "dotenv/config";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const allowedStatuses = ["TASLAK", "HAZIRLANIYOR", "GONDERILDI", "KABUL_EDILDI", "REDDEDILDI"];
const allowedCurrencies = ["TRY", "EUR", "USD"];
type RouteContext = { params: Promise<{ id: string }> };

function makeQuoteNo(id: number) {
  const year = new Date().getFullYear();
  return `TEK-${year}-${String(id).padStart(4, "0")}`;
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const projectId = Number((await params).id);
    if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });
    const quotes = await prisma.quote.findMany({ where: { projectId }, orderBy: { quoteDate: "desc" } });
    return NextResponse.json({ success: true, data: quotes });
  } catch (error) {
    console.error("Quotes GET error:", error);
    return NextResponse.json({ success: false, message: "Teklifler alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const projectId = Number((await params).id);
    if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) return NextResponse.json({ success: false, message: "Proje bulunamadı." }, { status: 404 });

    const body = await request.json();
    const scope = typeof body.scope === "string" ? body.scope.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : null;
    const subtotal = Number(body.subtotal);
    const vatRate = Number(body.vatRate);
    const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "TRY";
    const status = typeof body.status === "string" ? body.status.trim().toUpperCase() : "TASLAK";
    const quoteDate = typeof body.quoteDate === "string" && body.quoteDate ? new Date(body.quoteDate) : new Date();
    const validUntil = typeof body.validUntil === "string" && body.validUntil ? new Date(body.validUntil) : null;

    if (!scope) return NextResponse.json({ success: false, message: "Hizmet kapsamı boş bırakılamaz." }, { status: 400 });
    if (!Number.isFinite(subtotal) || subtotal < 0) return NextResponse.json({ success: false, message: "Geçerli bir ara toplam girin." }, { status: 400 });
    if (!Number.isInteger(vatRate) || vatRate < 0 || vatRate > 100) return NextResponse.json({ success: false, message: "KDV oranı 0-100 arasında olmalı." }, { status: 400 });
    if (!allowedCurrencies.includes(currency)) return NextResponse.json({ success: false, message: "Geçersiz para birimi." }, { status: 400 });
    if (!allowedStatuses.includes(status)) return NextResponse.json({ success: false, message: "Geçersiz teklif durumu." }, { status: 400 });
    if (Number.isNaN(quoteDate.getTime()) || (validUntil && Number.isNaN(validUntil.getTime()))) return NextResponse.json({ success: false, message: "Geçersiz teklif tarihi." }, { status: 400 });

    const subtotalKurus = Math.round(subtotal * 100);
    const totalKurus = Math.round(subtotalKurus * (1 + vatRate / 100));
    const created = await prisma.quote.create({ data: { projectId, quoteNo: "TEMP", quoteDate, validUntil, scope, description, subtotal: subtotalKurus, vatRate, total: totalKurus, currency, status } });
    const quoteNo = makeQuoteNo(created.id);
    const updated = await prisma.quote.update({ where: { id: created.id }, data: { quoteNo } });
    return NextResponse.json({ success: true, message: "Teklif oluşturuldu.", data: updated }, { status: 201 });
  } catch (error) {
    console.error("Quotes POST error:", error);
    return NextResponse.json({ success: false, message: "Teklif oluşturulamadı." }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const projectId = Number((await params).id);
    if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });

    const body = await request.json();
    const status = typeof body.status === "string" ? body.status.trim().toUpperCase() : "";
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Geçersiz teklif durumu." }, { status: 400 });
    }

    const quoteId = Number(body.quoteId);
    if (!Number.isInteger(quoteId)) {
      return NextResponse.json({ success: false, message: "Geçersiz teklif." }, { status: 400 });
    }

    const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } });
    if (!quote) return NextResponse.json({ success: false, message: "Teklif bulunamadı." }, { status: 404 });

    const updated = await prisma.quote.update({ where: { id: quoteId }, data: { status } });
    return NextResponse.json({ success: true, message: "Teklif durumu güncellendi.", data: updated });
  } catch (error) {
    console.error("Quotes PATCH error:", error);
    return NextResponse.json({ success: false, message: "Teklif durumu güncellenemedi." }, { status: 500 });
  }
}
