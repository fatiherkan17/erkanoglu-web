import { NextResponse } from "next/server";
import { COOKIE_NAME } from "@/lib/admin-auth";

function clearCookie(response: NextResponse) {
  response.cookies.set({
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  return response;
}

export async function POST() {
  return clearCookie(NextResponse.json({ success: true }));
}

export async function GET(request: Request) {
  return clearCookie(NextResponse.redirect(new URL("/admin/login", request.url)));
}
