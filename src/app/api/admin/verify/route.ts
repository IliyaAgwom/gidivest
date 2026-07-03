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

export async function GET(req: NextRequest) {
  try {
    const session = await getUserFromRequest(req);
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pendingUsers = await prisma.user.findMany({
      where: { verificationStatus: 'PENDING' },
      select: {
        id: true,
        name: true,
        email: true,
        verificationPhotoUrl: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'asc' },
    });

    const verifications = pendingUsers.map(user => ({
      id: user.id,
      user: user.name || 'Anonymous',
      email: user.email,
      photoUrl: user.verificationPhotoUrl,
      date: user.updatedAt.toISOString().split('T')[0],
      status: 'pending',
    }));

    return NextResponse.json(verifications);
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

    const { userId, action } = await req.json(); // action: 'approve' | 'reject'

    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: newStatus,
      },
    });

    // Create a notification for the user
    const title = action === 'approve' ? 'Verification Approved' : 'Verification Rejected';
    const message = action === 'approve'
      ? 'Congratulations! Your identity verification has been approved.'
      : 'Your identity verification was rejected. Please re-upload a clear selfie.';

    await prisma.notification.create({
      data: {
        userId: userId,
        title,
        message,
      },
    });

    // Send Email
    if (action === 'approve') {
      await sendEmail({
        to: user.email,
        subject: 'Identity Verification Approved',
        html: getApprovalEmailHtml(user.name || 'Investor', 'Identity Verification', 'You can now access all features of your account.')
      });
    } else if (action === 'reject') {
      await sendEmail({
        to: user.email,
        subject: 'Identity Verification Rejected',
        html: getRejectionEmailHtml(user.name || 'Investor', 'Identity Verification', 'Please log in to your dashboard and re-submit a clear selfie for verification.')
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Verification ${action}d successfully.`,
      status: newStatus
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
