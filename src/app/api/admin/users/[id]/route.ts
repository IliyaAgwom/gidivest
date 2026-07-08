import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id: userId } = await Promise.resolve(params);
    const body = await req.json();
    
    const updateData: any = {};
    if (body.banned !== undefined) updateData.banned = Boolean(body.banned);
    if (body.walletBalance !== undefined) updateData.walletBalance = Number(body.walletBalance);
    if (body.password) {
      updateData.passwordHash = await bcrypt.hash(String(body.password), 12);
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields provided for update" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json(user);
  } catch (error: any) {
    console.error("Prisma update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user" }, { status: 500 });
  }
}
