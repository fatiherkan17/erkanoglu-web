import { NextResponse } from "next/server";
import { COOKIE_NAME, SESSION_TTL_SECONDS, createAdminToken, passwordMatches } from "@/lib/admin-auth";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const limit = checkRateLimit(request, "admin-login", 5, 15 * 60 * 1000);
  if (limit.limited) return rateLimitResponse(limit.retryAfterSeconds);

  try {
    const body = await request.json().catch(() => ({})) as Record<string, unknown>;
    const password = typeof body.password === "string" ? body.password : "";

    if (!process.env.ADMIN_PASSWORD?.trim()) {
      return NextResponse.json(
        { success: false, message: "Admin şifresi sunucuda tanımlı değil." },
        { status: 503 },
      );
    }

    if (!password || password.length > 1024 || !await passwordMatches(password)) {
      return NextResponse.json(
        { success: false, message: "Şifre hatalı." },
        { status: 401 },
      );
    }

    const token = await createAdminToken();
    const response = NextResponse.json({ success: true });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, message: "Giriş yapılamadı." },
      { status: 500 },
    );
  }
}
