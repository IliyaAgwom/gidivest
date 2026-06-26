import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

async function getUserFromRequest(req: NextRequest) {
  const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");
  const token = req.cookies.get("hv_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: string; email: string; name: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const session = await getUserFromRequest(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    include: {
      portfolios: true,
      investments: {
        where: { status: "ACTIVE" }
      },
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Dynamically calculate profit based on time elapsed
  let adminSettings = await prisma.adminSetting.findFirst();
  let investmentPercent = adminSettings?.investmentPercent || 10;
  
  let totalCalculatedProfit = 0;
  const now = new Date();

  for (const inv of user.investments) {
    // Calculate fractional days since investment was made
    const fractionalDays = (now.getTime() - inv.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const dailyProfit = inv.amount * (investmentPercent / 100);
    totalCalculatedProfit += dailyProfit * fractionalDays;
  }

  let portfolio = user.portfolios[0];
  if (portfolio) {
    // Update the portfolio in DB so it reflects the actual profit
    portfolio = await prisma.portfolio.update({
      where: { id: portfolio.id },
      data: { profit: totalCalculatedProfit }
    });
  } else {
    portfolio = { totalValue: 0, profit: 0 } as any;
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    walletBalance: user.walletBalance,
    portfolio,
    transactions: user.transactions,
  });
}
