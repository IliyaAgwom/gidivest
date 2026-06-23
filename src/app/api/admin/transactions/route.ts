import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, name: true } }
      }
    });
    return NextResponse.json(transactions);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, status } = await req.json(); // status can be APPROVED or REJECTED

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const transaction = await tx.transaction.findUnique({ where: { id } });
      if (!transaction) throw new Error("Transaction not found");
      if (transaction.status !== "PENDING") throw new Error("Transaction already processed");

      // Update the transaction status
      const updatedTx = await tx.transaction.update({
        where: { id },
        data: { status }
      });

      // If it's a DEPOSIT and we are APPROVING it, add funds to user's wallet
      if (transaction.type === "DEPOSIT" && status === "APPROVED") {
        await tx.user.update({
          where: { id: transaction.userId },
          data: { walletBalance: { increment: transaction.amount } }
        });
      }

      // Note: If it's a WITHDRAWAL, we already deducted the balance when they created the request,
      // so if we REJECT it, we should theoretically refund the balance + fee. For simplicity here we just mark it rejected.
      // A more robust system would handle the refund:
      if (transaction.type === "WITHDRAWAL" && status === "REJECTED") {
        await tx.user.update({
          where: { id: transaction.userId },
          data: { walletBalance: { increment: transaction.amount } }
        });
      }

      return updatedTx;
    });

    return NextResponse.json({ message: `Transaction ${status}`, transaction: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
