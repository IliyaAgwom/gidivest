import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = params.id;
    const body = await req.json();
    
    // Allow updating banned status or wallet balance directly
    const updateData: any = {};
    if (typeof body.banned === "boolean") updateData.banned = body.banned;
    if (typeof body.walletBalance === "number") updateData.walletBalance = body.walletBalance;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
