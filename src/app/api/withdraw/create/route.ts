import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("hv_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.userId as string;

    const { amount, cryptoType, walletAddress, withdrawalType, totalRequired } = await req.json();

    if (!amount || amount <= 0 || !cryptoType || !walletAddress || !totalRequired) {
      return NextResponse.json({ error: "Invalid withdrawal data" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");
      
      if (user.walletBalance < totalRequired) {
        throw new Error("Insufficient wallet balance to cover withdrawal and fees.");
      }

      // Deduct total required from wallet
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: totalRequired } },
      });

      // Create transaction record
      const transaction = await tx.transaction.create({
        data: {
          userId,
          type: "WITHDRAWAL",
          amount: amount, // Only the actual requested withdrawal amount is recorded here, or we can use totalRequired. We'll use actual.
          cryptoType: cryptoType,
          walletAddress: walletAddress,
          status: "PENDING",
        },
      });

      // If express, create an additional transaction for the fee record
      if (withdrawalType === "EXPRESS") {
        const fee = totalRequired - amount;
        await tx.transaction.create({
          data: {
            userId,
            type: "WITHDRAWAL",
            amount: fee,
            cryptoType: "Express Processing Fee",
            status: "APPROVED",
          },
        });
      }

      return transaction;
    });

    return NextResponse.json({ message: "Withdrawal submitted successfully", transaction: result });
  } catch (error: any) {
    console.error("Withdrawal error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
