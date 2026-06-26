import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

export async function POST(req: NextRequest) {
  try {
    const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");
    const token = req.cookies.get("hv_session")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { payload } = await jwtVerify(token, SECRET);
    const userId = payload.id as string;

    const { investmentId } = await req.json();

    if (!investmentId) {
      return NextResponse.json({ error: "Investment ID is required" }, { status: 400 });
    }

    // Wrap in a transaction to ensure atomic updates
    const result = await prisma.$transaction(async (tx) => {
      const investment = await tx.userInvestment.findUnique({ where: { id: investmentId } });
      if (!investment || investment.userId !== userId) {
        throw new Error("Investment not found");
      }
      if (investment.status !== "ACTIVE") {
        throw new Error("Investment is already closed");
      }

      // Calculate final profit
      const adminSettings = await tx.adminSetting.findFirst();
      const investmentPercent = adminSettings?.investmentPercent || 10;
      const now = new Date();
      const fractionalDays = (now.getTime() - investment.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      const dailyProfit = investment.amount * (investmentPercent / 100);
      const finalProfit = dailyProfit * fractionalDays;
      const totalPayout = investment.amount + finalProfit;

      // Mark investment as CLOSED
      await tx.userInvestment.update({
        where: { id: investmentId },
        data: { status: "CLOSED" },
      });

      // Add to user wallet balance
      await tx.user.update({
        where: { id: userId },
        data: { walletBalance: { increment: totalPayout } },
      });

      // Update portfolio totalValue
      const existingPortfolio = await tx.portfolio.findFirst({ where: { userId } });
      if (existingPortfolio) {
        await tx.portfolio.update({
          where: { id: existingPortfolio.id },
          data: { totalValue: { decrement: investment.amount } },
        });
      }

      // Create transaction record for history
      await tx.transaction.create({
        data: {
          userId,
          type: "DEPOSIT", // Using DEPOSIT to represent funds entering wallet from sale
          cryptoType: `Sold Investment: ${investment.assetSymbol}`,
          amount: totalPayout,
          status: "APPROVED",
        },
      });

      return { totalPayout, finalProfit };
    });

    return NextResponse.json({ 
      message: "Investment sold successfully", 
      payout: result.totalPayout, 
      profit: result.finalProfit 
    });
  } catch (error: any) {
    console.error("Investment sale error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
