import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';

async function getUserFromRequest(req: NextRequest) {
  const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'hugvest-secret-key-2024');
  const token = req.cookies.get('hv_session')?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: string; email: string; name: string; role: string };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        verificationStatus: true,
        name: true,
        cryptoCards: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      verificationStatus: user.verificationStatus,
      userName: user.name || 'Valued Member',
      card: user.cryptoCards[0] || null,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardId } = await req.json();

    if (!cardId) {
      return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: { verificationStatus: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.verificationStatus !== 'APPROVED') {
      return NextResponse.json({
        error: 'Profile verification required before activating a Crypto Card.',
      }, { status: 400 });
    }

    const existingCard = await prisma.cryptoCard.findFirst({
      where: {
        userId: session.id,
        status: { in: ['PENDING', 'ACTIVE'] },
      },
    });

    if (existingCard) {
      return NextResponse.json({
        error: 'You already have a pending or active Crypto Card activation request.',
      }, { status: 400 });
    }

    const card = await prisma.cryptoCard.create({
      data: {
        userId: session.id,
        cardId: cardId,
        status: 'PENDING',
      },
    });

    await prisma.notification.create({
      data: {
        userId: session.id,
        title: 'Card Activation Requested',
        message: `Your request to activate card ${cardId} is pending admin review.`,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Card activation requested successfully and is pending review.',
      card,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
