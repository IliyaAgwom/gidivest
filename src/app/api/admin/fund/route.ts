import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("hv_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { userId, amount } = await req.json();

    if (!userId || !amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid data" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: { increment: amount },
      },
    });

    // Create a transaction record for this admin deposit
    await prisma.transaction.create({
      data: {
        userId,
        type: "DEPOSIT",
        amount,
        cryptoType: "USD (Admin)",
        status: "APPROVED",
      },
    });

    return NextResponse.json({ message: "Funds added successfully", balance: updatedUser.walletBalance });
  } catch (error: any) {
    console.error("Admin fund error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
