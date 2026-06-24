import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");
  const token = req.cookies.get("hv_session")?.value;
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  if (isDashboard || isAdmin) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);

      // Protect admin routes
      if (isAdmin && payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return NextResponse.next();
    } catch {
      // Token invalid or expired
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.set("hv_session", "", { expires: new Date(0), path: "/" });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
