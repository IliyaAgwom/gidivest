import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { sendEmail, getDepositEmailHtml } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");
    const token = req.cookies.get("hv_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as string;

    const { amount, cryptoType, txHash } = await req.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }
    if (!cryptoType) {
      return NextResponse.json({ error: "Crypto type is required" }, { status: 400 });
    }

    // Create a new PENDING transaction for the deposit
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        type: "DEPOSIT",
        amount: parseFloat(amount),
        cryptoType,
        txHash: txHash || null,
        status: "PENDING"
      }
    });

    // Send deposit email asynchronously
    sendEmail({
      to: session.email,
      subject: "Deposit Request Received",
      html: getDepositEmailHtml(session.name, amount, method),
    });

    return NextResponse.json({ message: "Deposit request submitted successfully", transaction });
  } catch (error: any) {
    console.error("Deposit request error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
