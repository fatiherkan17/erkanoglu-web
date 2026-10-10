import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

const allowedSources = ["direct", "calculator", "collaboration"];
const MAX_BODY_BYTES = 16_384;
const MAX_LENGTHS: Record<string, number> = {
  fullName: 120,
  phone: 32,
  province: 80,
  district: 100,
  neighborhood: 120,
  buildingType: 80,
  projectStage: 100,
  approximateArea: 80,
  description: 3_000,
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function cleanRequiredString(body: Record<string, unknown>, key: string) {
  const value = body[key];
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!cleaned || cleaned.length > MAX_LENGTHS[key]) return null;
  return cleaned;
}

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
  const rateLimit = checkRateLimit(request, "public-project-request", 5, 10 * 60 * 1000);
  if (rateLimit.limited) return rateLimitResponse(rateLimit.retryAfterSeconds);

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ success: false, message: "İstek boyutu çok büyük." }, { status: 413 });
  }

  try {
    const body: unknown = await request.json();
    if (!isPlainObject(body)) {
      return NextResponse.json({ success: false, message: "Geçersiz istek." }, { status: 400 });
    }

    const fullName = cleanRequiredString(body, "fullName");
    const phone = cleanRequiredString(body, "phone");
    const province = cleanRequiredString(body, "province");
    const district = cleanRequiredString(body, "district");
    const neighborhood = cleanRequiredString(body, "neighborhood");
    const buildingType = cleanRequiredString(body, "buildingType");
    const projectStage = cleanRequiredString(body, "projectStage");

    if (!fullName || !phone || !province || !district || !neighborhood || !buildingType || !projectStage) {
      return NextResponse.json({ success: false, message: "Lütfen zorunlu alanları kontrol edin." }, { status: 400 });
    }
    if (phone.length < 7 || !/[0-9]/.test(phone)) {
      return NextResponse.json({ success: false, message: "Lütfen geçerli bir telefon numarası girin." }, { status: 400 });
    }

    const approximateAreaValue = body.approximateArea;
    if (approximateAreaValue !== undefined && approximateAreaValue !== null && typeof approximateAreaValue !== "string") {
      return NextResponse.json({ success: false, message: "Geçersiz yaklaşık alan bilgisi." }, { status: 400 });
    }
    const approximateArea = typeof approximateAreaValue === "string" ? approximateAreaValue.trim() : "";
    if (approximateArea.length > MAX_LENGTHS.approximateArea) {
      return NextResponse.json({ success: false, message: "Yaklaşık alan bilgisi çok uzun." }, { status: 400 });
    }

    const descriptionValue = body.description;
    if (descriptionValue !== undefined && descriptionValue !== null && typeof descriptionValue !== "string") {
      return NextResponse.json({ success: false, message: "Geçersiz açıklama." }, { status: 400 });
    }
    const description = typeof descriptionValue === "string" ? descriptionValue.trim() : "";
    if (description.length > MAX_LENGTHS.description) {
      return NextResponse.json({ success: false, message: "Açıklama en fazla 3000 karakter olabilir." }, { status: 400 });
    }

    const interestAreasValue = body.interestAreas;
    if (interestAreasValue !== undefined && !Array.isArray(interestAreasValue) && typeof interestAreasValue !== "string") {
      return NextResponse.json({ success: false, message: "Geçersiz ilgi alanları." }, { status: 400 });
    }
    if (Array.isArray(interestAreasValue) && (!interestAreasValue.every((value) => typeof value === "string") || interestAreasValue.length > 20)) {
      return NextResponse.json({ success: false, message: "İlgi alanları geçersiz veya çok fazla." }, { status: 400 });
    }
    const interestAreas = Array.isArray(interestAreasValue)
      ? interestAreasValue.map((value) => value.trim()).filter(Boolean).join(", ")
      : typeof interestAreasValue === "string" ? interestAreasValue.trim() : "";
    if (interestAreas.length > 1_000) {
      return NextResponse.json({ success: false, message: "İlgi alanları çok uzun." }, { status: 400 });
    }

    const source = typeof body.source === "string" && allowedSources.includes(body.source.trim()) ? body.source.trim() : "direct";

    const projectRequest = await prisma.projectRequest.create({
      data: {
        fullName,
        phone,
        province,
        district,
        neighborhood,
        buildingType,
        projectStage,
        approximateArea: approximateArea || null,
        interestAreas,
        description: description || null,
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
