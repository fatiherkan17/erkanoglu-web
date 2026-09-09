import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = { params: Promise<{ id: string }> };

type ParcelData = {
  parcelAreaM2: string;
  emsal: string;
  taks: string;
  kaks: string;
  floors: string;
  frontageM: string;
  depthM: string;
  buildingSetbackFrontM: string;
  buildingSetbackSideM: string;
  buildingSetbackRearM: string;
  roadWidthM: string;
  zoningPlan: string;
  notes: string;
};

const allowedKeys: (keyof ParcelData)[] = [
  "parcelAreaM2",
  "emsal",
  "taks",
  "kaks",
  "floors",
  "frontageM",
  "depthM",
  "buildingSetbackFrontM",
  "buildingSetbackSideM",
  "buildingSetbackRearM",
  "roadWidthM",
  "zoningPlan",
  "notes",
];

function normalizeParcelData(value: unknown): ParcelData {
  const source = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return allowedKeys.reduce((result, key) => {
    result[key] = typeof source[key] === "string" ? source[key].trim() : "";
    return result;
  }, {} as ParcelData);
}

export async function GET(_request: Request, { params }: RouteContext) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });
  const requestData = await prisma.projectRequest.findUnique({ where: { id }, select: { id: true, fullName: true, buildingType: true, projectStage: true, approximateArea: true, interestAreas: true, description: true, parcelData: true, aiDraft: true } });
  if (!requestData) return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });
  return NextResponse.json({ success: true, data: requestData });
}

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });
    const body = await request.json();
    const parcelData = normalizeParcelData(body.parcelData);
    const updated = await prisma.projectRequest.update({ where: { id }, data: { parcelData } , select: { id: true, parcelData: true, aiDraft: true } });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("Parcel data PATCH error:", error);
    return NextResponse.json({ success: false, message: "Parsel bilgileri kaydedilemedi." }, { status: 500 });
  }
}

function extractResponseText(payload: any): string {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const chunks: string[] = [];
  for (const item of Array.isArray(payload?.output) ? payload.output : []) {
    for (const content of Array.isArray(item?.content) ? item.content : []) {
      if (typeof content?.text === "string") chunks.push(content.text);
    }
  }
  return chunks.join("\n");
}

export async function POST(request: Request, { params }: RouteContext) {
  try {
    const id = Number((await params).id);
    if (!Number.isInteger(id)) return NextResponse.json({ success: false, message: "Geçersiz proje talebi numarası." }, { status: 400 });

    const body = await request.json().catch(() => ({}));
    const incomingParcel = normalizeParcelData(body.parcelData);
    const record = await prisma.projectRequest.findUnique({ where: { id }, select: { id: true, buildingType: true, projectStage: true, approximateArea: true, interestAreas: true, description: true } });
    if (!record) return NextResponse.json({ success: false, message: "Proje talebi bulunamadı." }, { status: 404 });

    const missing = ["parcelAreaM2", "emsal", "taks", "floors"].filter((key) => !incomingParcel[key as keyof ParcelData]);
    if (missing.length > 0) {
      return NextResponse.json({ success: false, message: "Ön proje için en az parsel alanı, emsal, TAKS ve kat adedi girilmelidir." }, { status: 400 });
    }

    await prisma.projectRequest.update({ where: { id }, data: { parcelData: incomingParcel } });

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) return NextResponse.json({ success: false, message: "OPENAI_API_KEY tanımlı değil. Vercel Environment Variables içine eklenmeli." }, { status: 503 });

    const model = process.env.OPENAI_PROJECT_MODEL || "gpt-5.6-luna";
    const system = `Sen Erkanoğlu Mimarlık & Mühendislik ekibinin iç kullanımına yönelik çalışan bir ön proje asistanısın.\n\nGÖREV:\nVerilen müşteri ihtiyacı ve parsel/imar girdilerinden, yalnızca profesyonelin kontrol edip müşteriye ücretli ön proje/taslak hizmeti olarak sunabileceği bir ÖN ÇALIŞMA üret. Ruhsat projesi, kesin imar hakkı, statik proje veya uygulanabilirlik garantisi verme. Eksik veya doğrulanmamış mevzuat bilgisini kesin gerçek gibi yazma.\n\nÇIKTI: Sadece geçerli JSON üret. Şu alanları kullan:\n{\n  "summary": string,\n  "feasibility": "UYGUN GÖRÜNÜYOR" | "İNCELENMELİ" | "VERİ YETERSİZ",\n  "calculations": {"theoreticalEmsalAreaM2": number|null, "theoreticalTaksFootprintM2": number|null, "notes": string[]},\n  "program": [{"name": string, "count": number|null, "areaM2": number|null}],\n  "layoutAlternatives": [{"title": string, "description": string}],\n  "risks": string[],\n  "professionalChecks": string[],\n  "clientDeliverable": string[]\n}\n\nHesaplanabilir değerleri yalnızca verilen sayılar üzerinden yaklaşık ve teorik olarak hesapla. Özellikle çekme mesafeleri, plan notları, kot, yol, otopark, yangın, sığınak, emsal harici alanlar ve diğer mevzuat konularında kesin hüküm verme.`;
    const user = {
      customerRequest: {
        buildingType: record.buildingType,
        projectStage: record.projectStage,
        approximateArea: record.approximateArea,
        interestAreas: record.interestAreas,
        description: record.description,
      },
      parcel: incomingParcel,
    };

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, input: `${system}\n\nVERİ:\n${JSON.stringify(user)}` }),
    });
    const payload = await response.json();
    if (!response.ok) {
      console.error("OpenAI project response error:", payload);
      return NextResponse.json({ success: false, message: "AI ön proje üretimi başarısız oldu." }, { status: 502 });
    }

    const raw = extractResponseText(payload).trim();
    let aiDraft: unknown;
    try {
      aiDraft = JSON.parse(raw.replace(/^```json\s*/i, "").replace(/\s*```$/i, ""));
    } catch {
      return NextResponse.json({ success: false, message: "AI beklenen formatta sonuç üretmedi.", raw }, { status: 502 });
    }

    const updated = await prisma.projectRequest.update({ where: { id }, data: { aiDraft: aiDraft as object }, select: { id: true, parcelData: true, aiDraft: true } });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error("AI project draft error:", error);
    return NextResponse.json({ success: false, message: "AI ön proje oluşturulurken hata oluştu." }, { status: 500 });
  }
}
