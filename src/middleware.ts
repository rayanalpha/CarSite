import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminLogin = pathname.startsWith("/admin/login");
  if (pathname.startsWith("/admin") && !isAdminLogin) {
    const token = request.cookies.get("admin_token")?.value;
    if (!token || token.length < 10) {
      const res = NextResponse.redirect(new URL("/admin/login", request.url));
      res.cookies.delete("admin_token");
      return res;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
