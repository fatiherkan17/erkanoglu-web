import "dotenv/config";
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL ?? "file:./dev.db" });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const allowedTypes = ["YUZ_YUZE", "TELEFON", "WHATSAPP", "EPOSTA", "DIGER"];

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const projectId = Number((await params).id);
    if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });
    const notes = await prisma.meetingNote.findMany({ where: { projectId }, orderBy: { meetingAt: "desc" } });
    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error("Meeting notes GET error:", error);
    return NextResponse.json({ success: false, message: "Görüşme notları alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const projectId = Number((await params).id);
    if (!Number.isInteger(projectId)) return NextResponse.json({ success: false, message: "Geçersiz proje." }, { status: 400 });
    const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
    if (!project) return NextResponse.json({ success: false, message: "Proje bulunamadı." }, { status: 404 });

    const body = await request.json();
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const meetingAt = typeof body.meetingAt === "string" && body.meetingAt ? new Date(body.meetingAt) : new Date();
    if (!allowedTypes.includes(type)) return NextResponse.json({ success: false, message: "Geçersiz görüşme türü." }, { status: 400 });
    if (!note) return NextResponse.json({ success: false, message: "Görüşme notu boş bırakılamaz." }, { status: 400 });
    if (Number.isNaN(meetingAt.getTime())) return NextResponse.json({ success: false, message: "Geçersiz görüşme tarihi." }, { status: 400 });

    const created = await prisma.meetingNote.create({ data: { projectId, type, note, meetingAt } });
    return NextResponse.json({ success: true, message: "Görüşme notu eklendi.", data: created }, { status: 201 });
  } catch (error) {
    console.error("Meeting notes POST error:", error);
    return NextResponse.json({ success: false, message: "Görüşme notu eklenemedi." }, { status: 500 });
  }
}
