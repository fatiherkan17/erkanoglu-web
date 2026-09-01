import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/admin-auth";

const PUBLIC_API = new Set([
  "/api/admin/auth/login",
  "/api/admin/auth/logout",
]);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname === "/api/project-requests" && request.method === "POST") {
    return NextResponse.next();
  }

  if (pathname === "/api/public-projects" && request.method === "GET") {
    return NextResponse.next();
  }

  if (PUBLIC_API.has(pathname)) return NextResponse.next();

  const token = request.cookies.get("erkanoglu_admin")?.value;
  const authorized = await verifyAdminToken(token);

  if (pathname.startsWith("/admin")) {
    if (authorized) return NextResponse.next();

    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/api")) {
    if (authorized) return NextResponse.next();
    return NextResponse.json(
      { success: false, message: "Yetkisiz erişim." },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
