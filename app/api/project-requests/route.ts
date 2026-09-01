import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const allowedSources = ["direct", "calculator", "collaboration"];

export async function GET() {
  try {
    const projectRequests = await prisma.projectRequest.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        project: {
          select: {
            id: true,
            projectNo: true,
            status: true,
            quotes: { select: { status: true, quoteDate: true }, orderBy: { quoteDate: "desc" }, take: 1 },
            meetingNotes: { select: { meetingAt: true }, orderBy: { meetingAt: "desc" }, take: 1 },
          },
        },
      },
    });
    return NextResponse.json(projectRequests, { status: 200 });
  } catch (error) {
    console.error("Project requests GET error:", error);
    return NextResponse.json({ success: false, message: "Proje talepleri alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, phone, province, district, neighborhood, buildingType, projectStage, approximateArea, interestAreas, description } = body;
    const source = typeof body.source === "string" && allowedSources.includes(body.source.trim()) ? body.source.trim() : "direct";

    if (!fullName || !phone || !province || !district || !neighborhood || !buildingType || !projectStage) {
      return NextResponse.json({ success: false, message: "Lütfen zorunlu alanları doldurun." }, { status: 400 });
    }

    const projectRequest = await prisma.projectRequest.create({
      data: {
        fullName: String(fullName).trim(),
        phone: String(phone).trim(),
        province: String(province).trim(),
        district: String(district).trim(),
        neighborhood: String(neighborhood).trim(),
        buildingType: String(buildingType).trim(),
        projectStage: String(projectStage).trim(),
        approximateArea: approximateArea ? String(approximateArea).trim() : null,
        interestAreas: Array.isArray(interestAreas) ? interestAreas.map(String).map((value: string) => value.trim()).filter(Boolean).join(", ") : String(interestAreas || "").trim(),
        description: description ? String(description).trim() : null,
        status: "YENI",
        source,
        priority: "NORMAL",
      },
    });

    return NextResponse.json({ success: true, message: "Proje talebiniz başarıyla oluşturuldu.", id: projectRequest.id }, { status: 201 });
  } catch (error) {
    console.error("Project request create error:", error);
    return NextResponse.json({ success: false, message: "Veritabanına kayıt sırasında hata oluştu." }, { status: 500 });
  }
}
