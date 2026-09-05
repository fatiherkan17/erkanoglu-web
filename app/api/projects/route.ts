import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-auth";

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const pair = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : undefined;
}

const allowedCategories = ["KONUT", "VILLA", "TICARI", "KARMA", "ENDUSTRIYEL", "MEVCUT_YAPI", "KENTSEL_DONUSUM", "TADILAT_RENOVASYON"];
const allowedStatuses = ["AKTIF", "SOZLESME", "BEKLEMEDE", "TAMAMLANDI", "IPTAL"];
const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: { projectRequest: true },
    });
    return NextResponse.json({ success: true, data: projects });
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json({ success: false, message: error instanceof Error ? error.message : "Projeler alınamadı." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const adminToken = getCookieValue(request, "erkanoglu_admin");
    if (!(await verifyAdminToken(adminToken))) {
      return NextResponse.json({ success: false, message: "Yetkisiz erişim." }, { status: 401 });
    }

    const body = await request.json();
    const projectNo = clean(body.projectNo);
    const name = clean(body.name) || null;
    const category = clean(body.category) || "KONUT";
    const status = clean(body.status) || "TAMAMLANDI";
    const publicTitle = clean(body.publicTitle) || name;
    const publicSummary = clean(body.publicSummary) || null;

    if (!projectNo || !name) return NextResponse.json({ success: false, message: "Proje kodu ve proje adı zorunludur." }, { status: 400 });
    if (!allowedCategories.includes(category)) return NextResponse.json({ success: false, message: "Geçersiz proje kategorisi." }, { status: 400 });
    if (!allowedStatuses.includes(status)) return NextResponse.json({ success: false, message: "Geçersiz proje durumu." }, { status: 400 });

    const project = await prisma.project.create({
      data: {
        projectNo,
        name,
        status,
        category,
        publicTitle,
        publicSummary,
        published: false,
        projectRequestId: null,
      },
      include: { projectRequest: true },
    });

    return NextResponse.json({ success: true, data: project }, { status: 201 });
  } catch (error) {
    console.error("Reference project create error:", error);
    const message = error instanceof Error && error.message.includes("Unique constraint") ? "Bu proje kodu zaten kullanılıyor." : "Referans proje oluşturulamadı.";
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}
