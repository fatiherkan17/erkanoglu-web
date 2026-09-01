import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

type RouteContext = { params: Promise<{ id: string }> };
const allowedStatuses = ["AKTIF", "SOZLESME", "BEKLEMEDE", "TAMAMLANDI", "IPTAL"];
const allowedCategories = ["KONUT", "VILLA", "TICARI", "KARMA", "ENDUSTRIYEL", "MEVCUT_YAPI"];
const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

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

    const status = clean(body.status);
    const hasStatus = Object.prototype.hasOwnProperty.call(body, "status");
    const published = typeof body.published === "boolean" ? body.published : undefined;
    const category = clean(body.category);
    const publicTitle = clean(body.publicTitle) || null;
    const publicSummary = clean(body.publicSummary) || null;
    const coverImageUrl = clean(body.coverImageUrl) || null;
    const galleryImages = clean(body.galleryImages) || null;

    if (hasStatus && !allowedStatuses.includes(status)) {
      return NextResponse.json({ success: false, message: "Geçersiz proje durumu." }, { status: 400 });
    }
    if (category && !allowedCategories.includes(category)) {
      return NextResponse.json({ success: false, message: "Geçersiz proje kategorisi." }, { status: 400 });
    }
    if (body.galleryImages !== undefined && galleryImages) {
      try {
        const images = JSON.parse(galleryImages);
        if (!Array.isArray(images) || images.some((item) => typeof item !== "string")) {
          throw new Error("invalid gallery");
        }
      } catch {
        return NextResponse.json({ success: false, message: "Galeri görselleri geçerli bir JSON dizi olmalıdır." }, { status: 400 });
      }
    }

    const data: {
      status?: string;
      published?: boolean;
      category?: string;
      publicTitle?: string | null;
      publicSummary?: string | null;
      coverImageUrl?: string | null;
      galleryImages?: string | null;
    } = {};

    if (hasStatus) data.status = status;
    if (published !== undefined) data.published = published;
    if (category) data.category = category;
    if (Object.prototype.hasOwnProperty.call(body, "publicTitle")) data.publicTitle = publicTitle;
    if (Object.prototype.hasOwnProperty.call(body, "publicSummary")) data.publicSummary = publicSummary;
    if (Object.prototype.hasOwnProperty.call(body, "coverImageUrl")) data.coverImageUrl = coverImageUrl;
    if (Object.prototype.hasOwnProperty.call(body, "galleryImages")) data.galleryImages = galleryImages;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, message: "Güncellenecek alan bulunamadı." }, { status: 400 });
    }

    const project = await prisma.project.update({ where: { id }, data, include: { projectRequest: true } });
    return NextResponse.json({ success: true, message: "Proje güncellendi.", data: project });
  } catch (error) {
    console.error("Project PATCH error:", error);
    return NextResponse.json({ success: false, message: "Proje güncellenemedi." }, { status: 500 });
  }
}
