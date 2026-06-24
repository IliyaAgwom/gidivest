import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function GET(req: NextRequest) {
  try {
    const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");
    const token = req.cookies.get("hv_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const email = req.nextUrl.searchParams.get("email");
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        walletBalance: true,
      },
    });

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Admin user search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
