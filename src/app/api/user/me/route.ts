import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");

async function getUserFromRequest(req: NextRequest) {
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
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    walletBalance: user.walletBalance,
    portfolio: user.portfolios[0] || { totalValue: 0, profit: 0 },
    transactions: user.transactions,
  });
}
