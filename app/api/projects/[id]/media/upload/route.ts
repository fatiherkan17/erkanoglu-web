import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdminToken } from "@/lib/admin-auth";

function getCookieValue(request: Request, name: string) {
  const cookieHeader = request.headers.get("cookie") || "";
  const pair = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${name}=`));
  return pair ? pair.slice(name.length + 1) : undefined;
}

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const adminToken = getCookieValue(request, "erkanoglu_admin");
        if (!(await verifyAdminToken(adminToken))) throw new Error("Yetkisiz erişim.");

        const match = pathname.match(/^projects\/(\d+)\/media\//);
        if (!match) throw new Error("Geçersiz proje medya yolu.");

        const projectId = Number(match[1]);
        if (!Number.isInteger(projectId)) throw new Error("Geçersiz proje.");

        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
        if (!project) throw new Error("Proje bulunamadı.");

        let metadata: { originalName?: string; size?: number } = {};
        try {
          metadata = JSON.parse(clientPayload || "{}");
        } catch {
          metadata = {};
        }

        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({
            projectId,
            originalName: typeof metadata.originalName === "string" ? metadata.originalName : undefined,
            size: Number.isInteger(metadata.size) ? metadata.size : 0,
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const payload = JSON.parse(tokenPayload || "{}");
        const projectId = Number(payload.projectId);
        if (!Number.isInteger(projectId)) throw new Error("Geçersiz proje.");

        const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
        if (!project) throw new Error("Proje bulunamadı.");

        await prisma.projectMedia.create({
          data: {
            projectId,
            url: blob.url,
            pathname: blob.pathname,
            originalName: typeof payload.originalName === "string" ? payload.originalName : blob.pathname.split("/").pop() || blob.pathname,
            contentType: blob.contentType || "image/jpeg",
            size: Number.isInteger(payload.size) ? payload.size : 0,
            placement: "BEKLEMEDE",
          },
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "Yükleme başlatılamadı." },
      { status: 400 },
    );
  }
}
