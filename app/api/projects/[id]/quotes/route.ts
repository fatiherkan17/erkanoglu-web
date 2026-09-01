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

function parseDates(body: Record<string, unknown>) {
  const quoteDate = typeof body.quoteDate === "string" && body.quoteDate ? new Date(body.quoteDate) : undefined;
  const validUntil = typeof body.validUntil === "string" && body.validUntil ? new Date(body.validUntil) : body.validUntil === null || body.validUntil === "" ? null : undefined;
  if (quoteDate && Number.isNaN(quoteDate.getTime())) throw new Error("Geçersiz teklif tarihi.");
  if (validUntil instanceof Date && Number.isNaN(validUntil.getTime())) throw new Error("Geçersiz geçerlilik tarihi.");
  return { quoteDate, validUntil };
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const projectId = Number((await params).id);
    if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });
    const quotes = await prisma.quote.findMany({
      where: { projectId },
      orderBy: { quoteDate: "desc" },
      include: { statusHistory: { orderBy: { changedAt: "desc" } } },
    });
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
    const updated = await prisma.quote.update({ where: { id: created.id }, data: { quoteNo }, include: { statusHistory: true } });
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

    const body = await request.json() as Record<string, unknown>;
    const quoteId = Number(body.quoteId);
    if (!Number.isInteger(quoteId)) return NextResponse.json({ success: false, message: "Geçersiz teklif." }, { status: 400 });
    const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId } });
    if (!quote) return NextResponse.json({ success: false, message: "Teklif bulunamadı." }, { status: 404 });

    const data: { status?: string; scope?: string; description?: string | null; subtotal?: number; vatRate?: number; total?: number; currency?: string; quoteDate?: Date; validUntil?: Date | null } = {};
    if (body.scope !== undefined) {
      const scope = typeof body.scope === "string" ? body.scope.trim() : "";
      if (!scope) return NextResponse.json({ success: false, message: "Hizmet kapsamı boş bırakılamaz." }, { status: 400 });
      data.scope = scope;
    }
    if (body.description !== undefined) data.description = typeof body.description === "string" ? body.description.trim() || null : null;
    if (body.subtotal !== undefined || body.vatRate !== undefined) {
      const subtotal = body.subtotal !== undefined ? Number(body.subtotal) : quote.subtotal / 100;
      const vatRate = body.vatRate !== undefined ? Number(body.vatRate) : quote.vatRate;
      if (!Number.isFinite(subtotal) || subtotal < 0) return NextResponse.json({ success: false, message: "Geçerli bir ara toplam girin." }, { status: 400 });
      if (!Number.isInteger(vatRate) || vatRate < 0 || vatRate > 100) return NextResponse.json({ success: false, message: "KDV oranı 0-100 arasında olmalı." }, { status: 400 });
      data.subtotal = Math.round(subtotal * 100);
      data.vatRate = vatRate;
      data.total = Math.round(data.subtotal * (1 + vatRate / 100));
    }
    if (body.currency !== undefined) {
      const currency = typeof body.currency === "string" ? body.currency.trim().toUpperCase() : "";
      if (!allowedCurrencies.includes(currency)) return NextResponse.json({ success: false, message: "Geçersiz para birimi." }, { status: 400 });
      data.currency = currency;
    }
    if (body.quoteDate !== undefined || body.validUntil !== undefined) {
      const dates = parseDates(body);
      if (dates.quoteDate) data.quoteDate = dates.quoteDate;
      if (dates.validUntil !== undefined) data.validUntil = dates.validUntil;
    }
    if (body.status !== undefined) {
      const status = typeof body.status === "string" ? body.status.trim().toUpperCase() : "";
      if (!allowedStatuses.includes(status)) return NextResponse.json({ success: false, message: "Geçersiz teklif durumu." }, { status: 400 });
      data.status = status;
    }

    const statusChanged = data.status !== undefined && data.status !== quote.status;
    const updated = await prisma.$transaction(async tx => {
      await tx.quote.update({ where: { id: quoteId }, data });
      if (statusChanged) await tx.quoteStatusHistory.create({ data: { quoteId, fromStatus: quote.status, toStatus: data.status! } });
      return tx.quote.findUniqueOrThrow({ where: { id: quoteId }, include: { statusHistory: { orderBy: { changedAt: "desc" } } } });
    });
    return NextResponse.json({ success: true, message: "Teklif güncellendi.", data: updated });
  } catch (error) {
    console.error("Quotes PATCH error:", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Teklif güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  try {
    const projectId = Number((await params).id);
    if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });
    const body = await request.json() as { quoteId?: unknown };
    const quoteId = Number(body.quoteId);
    if (!Number.isInteger(quoteId)) return NextResponse.json({ success: false, message: "Geçersiz teklif." }, { status: 400 });
    const quote = await prisma.quote.findFirst({ where: { id: quoteId, projectId }, select: { id: true } });
    if (!quote) return NextResponse.json({ success: false, message: "Teklif bulunamadı." }, { status: 404 });
    await prisma.quote.delete({ where: { id: quoteId } });
    return NextResponse.json({ success: true, message: "Teklif silindi." });
  } catch (error) {
    console.error("Quotes DELETE error:", error);
    return NextResponse.json({ success: false, message: "Teklif silinemedi." }, { status: 500 });
  }
}
