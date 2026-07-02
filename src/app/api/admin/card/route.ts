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
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingCards = await prisma.cryptoCard.findMany({
      where: { status: 'PENDING' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    const cards = pendingCards.map(card => ({
      id: card.id,
      user: card.user.name || 'Anonymous',
      email: card.user.email,
      cardId: card.cardId,
      date: card.createdAt.toISOString().split('T')[0],
      status: 'pending',
    }));

    return NextResponse.json(cards);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { cardId, action } = await req.json(); // action: 'approve' | 'reject'

    if (!cardId || !action) {
      return NextResponse.json({ error: 'Card ID and action are required' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'ACTIVE' : 'INACTIVE';

    const cryptoCard = await prisma.cryptoCard.findFirst({
      where: { cardId, status: 'PENDING' },
    });

    if (!cryptoCard) {
      return NextResponse.json({ error: 'Pending card request not found' }, { status: 404 });
    }

    await prisma.cryptoCard.update({
      where: { id: cryptoCard.id },
      data: {
        status: newStatus,
      },
    });

    // Create a notification for the user
    const title = action === 'approve' ? 'Card Activated' : 'Card Activation Rejected';
    const message = action === 'approve'
      ? `Your Crypto Card (${cardId}) has been successfully activated!`
      : `Your request to activate card ${cardId} was rejected.`;

    await prisma.notification.create({
      data: {
        userId: cryptoCard.userId,
        title,
        message,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: `Card ${action}d successfully.`,
      status: newStatus
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
