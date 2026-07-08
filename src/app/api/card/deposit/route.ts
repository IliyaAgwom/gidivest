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

export async function POST(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, txHash } = await req.json();

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!txHash) {
      return NextResponse.json({ error: 'Transaction hash is required' }, { status: 400 });
    }

    const parsedAmount = Number(amount);

    // Get the user and their active card
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      include: {
        cryptoCards: {
          where: { status: 'ACTIVE' },
          take: 1,
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.cryptoCards.length === 0) {
      return NextResponse.json({ error: 'No active card found to deposit to' }, { status: 400 });
    }

    if (user.walletBalance < parsedAmount) {
      return NextResponse.json({ error: 'Insufficient wallet balance' }, { status: 400 });
    }

    const activeCard = user.cryptoCards[0];

    // Optional: check if there's already a pending deposit
    if (activeCard.pendingDepositAmount) {
      return NextResponse.json({ error: 'You already have a pending deposit on this card' }, { status: 400 });
    }

    // Execute in a transaction
    await prisma.$transaction(async (tx) => {
      // 1. Deduct wallet balance
      await tx.user.update({
        where: { id: user.id },
        data: { walletBalance: { decrement: parsedAmount } },
      });

      // 2. Add pending deposit to card
      await tx.cryptoCard.update({
        where: { id: activeCard.id },
        data: {
          pendingDepositAmount: parsedAmount,
          pendingDepositTxHash: txHash,
          pendingDepositAt: new Date(),
        }
      });

      // 3. Create a transaction log
      await tx.transaction.create({
        data: {
          userId: user.id,
          type: 'WITHDRAWAL', // Using WITHDRAWAL as they are withdrawing from wallet to card
          amount: parsedAmount,
          cryptoType: 'USD',
          walletAddress: 'Crypto Card Top-up',
          txHash: txHash,
          status: 'APPROVED', // Since it immediately deducts and starts pending on the card
        }
      });

      // 4. Create notification
      await tx.notification.create({
        data: {
          userId: user.id,
          title: 'Card Transfer Initiated',
          message: `Your transfer of $${parsedAmount.toLocaleString()} to your Crypto Card is processing.`,
        }
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit requested successfully. It will be credited to your card in 48 hours.',
    });
  } catch (error) {
    console.error('Card deposit error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
