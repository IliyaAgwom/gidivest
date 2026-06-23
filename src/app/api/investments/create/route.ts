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

    const { assetSymbol, assetName, amount, term } = await req.json();

    if (!assetSymbol || !amount || amount <= 0 || !term) {
      return NextResponse.json({ error: "Invalid investment data" }, { status: 400 });
    }

    // Wrap in a transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error("User not found");
      
      if (user.walletBalance < amount) {
        throw new Error("Insufficient wallet balance.");
      }

      // Deduct from wallet
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { decrement: amount } },
      });

      // Create specific investment
      const investment = await tx.userInvestment.create({
        data: {
          userId,
          assetSymbol,
          assetName,
          amount,
          term,
          status: "ACTIVE",
        },
      });

      // Update or create aggregate Portfolio
      const existingPortfolio = await tx.portfolio.findFirst({ where: { userId } });
      if (existingPortfolio) {
        await tx.portfolio.update({
          where: { id: existingPortfolio.id },
          data: { totalValue: { increment: amount } },
        });
      } else {
        await tx.portfolio.create({
          data: {
            userId,
            totalValue: amount,
            profit: 0,
          },
        });
      }

      // Create transaction record for history
      await tx.transaction.create({
        data: {
          userId,
          type: "WITHDRAWAL", // Using WITHDRAWAL to represent funds leaving wallet
          cryptoType: `Investment in ${assetSymbol}`,
          amount,
          status: "APPROVED",
        },
      });

      return investment;
    });

    return NextResponse.json({ message: "Investment created successfully", investment: result });
  } catch (error: any) {
    console.error("Investment creation error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
