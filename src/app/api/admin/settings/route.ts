import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.adminSetting.findFirst();
    if (!settings) {
      settings = await prisma.adminSetting.create({ data: {} });
    }
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    
    let settings = await prisma.adminSetting.findFirst();
    if (!settings) {
      settings = await prisma.adminSetting.create({ data: {} });
    }

    const updated = await prisma.adminSetting.update({
      where: { id: settings.id },
      data: {
        btcAddress: body.btcAddress ?? settings.btcAddress,
        ethAddress: body.ethAddress ?? settings.ethAddress,
        usdtAddress: body.usdtAddress ?? settings.usdtAddress,
        investmentPercent: body.investmentPercent ?? settings.investmentPercent,
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
