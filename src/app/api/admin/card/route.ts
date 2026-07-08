import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { sendEmail, getApprovalEmailHtml, getRejectionEmailHtml } from '@/lib/email';

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

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingCards = await prisma.cryptoCard.findMany({
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
      status: card.status,
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

    if (action !== 'approve' && action !== 'reject' && action !== 'restrict' && action !== 'unrestrict') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = action === 'approve' || action === 'unrestrict' ? 'ACTIVE' : action === 'restrict' ? 'RESTRICTED' : 'INACTIVE';

    const cryptoCard = await prisma.cryptoCard.findFirst({
      where: { cardId },
      include: { user: true }
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
    const title = action === 'approve' ? 'Card Activated' : action === 'restrict' ? 'Card Restricted' : action === 'unrestrict' ? 'Card Unrestricted' : 'Card Activation Rejected';
    const message = action === 'approve'
      ? `Your Crypto Card (${cardId}) has been successfully activated!`
      : action === 'restrict'
      ? `Your Crypto Card (${cardId}) has been restricted. Please contact support.`
      : action === 'unrestrict'
      ? `Your Crypto Card (${cardId}) has been unrestricted and is now active.`
      : `Your request to activate card ${cardId} was rejected.`;

    await prisma.notification.create({
      data: {
        userId: cryptoCard.userId,
        title,
        message,
      },
    });

    // Send Email (fail-safe)
    try {
      if (action === 'approve') {
        await sendEmail({
          to: cryptoCard.user.email,
          subject: 'Crypto Card Activated',
          html: getApprovalEmailHtml(cryptoCard.user.name || 'Investor', 'Crypto Card', `Your Crypto Card (${cardId}) is now active and ready to use.`)
        });
      } else if (action === 'reject') {
        await sendEmail({
          to: cryptoCard.user.email,
          subject: 'Crypto Card Rejected',
          html: getRejectionEmailHtml(cryptoCard.user.name || 'Investor', 'Crypto Card', `Your request for Crypto Card (${cardId}) was rejected.`)
        });
      }
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }

    return NextResponse.json({ 
      success: true, 
      message: `Card ${action}d successfully.`,
      status: newStatus
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
