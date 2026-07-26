import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(req: NextRequest) {
  const SECRET = new TextEncoder().encode(
    process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024"
  );
  const token = req.cookies.get("hv_session")?.value;
  const { pathname } = req.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");

  // Pass the pathname as a header so Server Components (e.g. root layout)
  // can read it and avoid redirect loops for /maintenance, /login etc.
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pathname", pathname);

  // ─── Auth guard for dashboard / admin ─────────────────────────────────
  if (isDashboard || isAdmin) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, SECRET);

      if (isAdmin && payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return NextResponse.next({ request: { headers: requestHeaders } });
    } catch {
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.set("hv_session", "", { expires: new Date(0), path: "/" });
      return response;
    }
  }

  // For all other routes, just pass the pathname header through
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Match everything except Next.js internals and static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
