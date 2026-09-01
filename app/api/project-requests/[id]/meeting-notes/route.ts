import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const allowedTypes = ["YUZ_YUZE", "TELEFON", "WHATSAPP", "EPOSTA", "DIGER"];
type RouteContext = { params: Promise<{ id: string }> };

type MeetingNote = {
  id: number;
  projectId: number | null;
  projectRequestId: number | null;
  type: string;
  note: string;
  meetingAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

function sortNotes(notes: MeetingNote[]) {
  return notes.sort((a, b) => new Date(b.meetingAt).getTime() - new Date(a.meetingAt).getTime());
}

export async function GET(_request: Request, { params }: RouteContext) {
  try {
    const projectRequestId = Number((await params).id);
    if (!Number.isInteger(projectRequestId) || projectRequestId <= 0) {
      return NextResponse.json({ success: false, message: "Geçersiz proje talebi." }, { status: 400 });
    }

    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
      select: {
        id: true,
        meetingNotes: true,
        project: { select: { id: true, meetingNotes: true } },
      },
    });

    if (!projectRequest) {
      return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });
    }

    const notes = sortNotes([
      ...projectRequest.meetingNotes,
      ...(projectRequest.project?.meetingNotes ?? []),
    ] as MeetingNote[]);

    return NextResponse.json({ success: true, data: notes });
  } catch (error) {
    console.error("Lead meeting notes GET error:", error);
    return NextResponse.json({ success: false, message: "Görüşme notları alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const projectRequestId = Number((await params).id);
    if (!Number.isInteger(projectRequestId) || projectRequestId <= 0) {
      return NextResponse.json({ success: false, message: "Geçersiz proje talebi." }, { status: 400 });
    }

    const projectRequest = await prisma.projectRequest.findUnique({
      where: { id: projectRequestId },
      select: { id: true, status: true, project: { select: { id: true } } },
    });
    if (!projectRequest) {
      return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });
    }

    const body = await request.json() as Record<string, unknown>;
    const type = typeof body.type === "string" ? body.type.trim() : "";
    const note = typeof body.note === "string" ? body.note.trim() : "";
    const meetingAt = typeof body.meetingAt === "string" && body.meetingAt ? new Date(body.meetingAt) : new Date();

    if (!allowedTypes.includes(type)) {
      return NextResponse.json({ success: false, message: "Geçersiz görüşme türü." }, { status: 400 });
    }
    if (!note) {
      return NextResponse.json({ success: false, message: "Görüşme notu boş bırakılamaz." }, { status: 400 });
    }
    if (Number.isNaN(meetingAt.getTime())) {
      return NextResponse.json({ success: false, message: "Geçersiz görüşme tarihi." }, { status: 400 });
    }

    const nextStatus = type === "YUZ_YUZE" && ["YENI", "INCELENIYOR"].includes(projectRequest.status)
      ? "GORUSME_YAPILDI"
      : type === "TELEFON" && projectRequest.status === "YENI"
        ? "INCELENIYOR"
        : projectRequest.status;

    const created = await prisma.$transaction(async (tx) => {
      const meetingNote = await tx.meetingNote.create({
        data: projectRequest.project
          ? { projectId: projectRequest.project.id, type, note, meetingAt }
          : { projectRequestId: projectRequest.id, type, note, meetingAt },
      });

      await tx.projectRequest.update({
        where: { id: projectRequest.id },
        data: { lastContactAt: meetingAt, status: nextStatus },
      });

      return meetingNote;
    });

    return NextResponse.json({
      success: true,
      message: "Görüşme notu eklendi.",
      data: created,
      nextStatus,
    }, { status: 201 });
  } catch (error) {
    console.error("Lead meeting notes POST error:", error);
    return NextResponse.json({ success: false, message: "Görüşme notu eklenemedi." }, { status: 500 });
  }
}
