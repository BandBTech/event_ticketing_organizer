import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;

  // Block protected routes if not logged in
  if (!token && (req.nextUrl.pathname.startsWith("/organizerDashboard") || req.nextUrl.pathname.startsWith("/staffDashboard"))) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/organizerDashboard/:path*", "/staffDashboard/:path*"],
};
