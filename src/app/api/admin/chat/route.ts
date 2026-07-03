import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");

async function getAdmin(req: NextRequest) {
  const token = req.cookies.get("hv_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET) as any;
    if (payload.role !== "ADMIN") return null;
    return payload as { id: string; role: string };
  } catch { return null; }
}

// GET: Admin gets list of all users with chat messages + their unread count
export async function GET(req: NextRequest) {
  const admin = await getAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");

  if (userId) {
    // Get conversation with specific user
    const messages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
    });
    // Mark user messages as read
    await prisma.chatMessage.updateMany({
      where: { userId, sender: "USER", read: false },
      data: { read: true },
    });
    return NextResponse.json(messages);
  }

  // Get all users with messages grouped
  const conversations = await prisma.chatMessage.groupBy({
    by: ["userId"],
    _max: { createdAt: true },
    _count: { id: true },
  });

  const unreadCounts = await prisma.chatMessage.groupBy({
    by: ["userId"],
    where: { sender: "USER", read: false },
    _count: { id: true },
  });

  const unreadMap = new Map(unreadCounts.map(u => [u.userId, u._count.id]));

  const userIds = conversations.map(c => c.userId);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, email: true },
  });

  const userMap = new Map(users.map(u => [u.id, u]));

  const result = conversations
    .sort((a, b) => (b._max.createdAt?.getTime() ?? 0) - (a._max.createdAt?.getTime() ?? 0))
    .map(c => ({
      userId: c.userId,
      user: userMap.get(c.userId),
      lastMessage: c._max.createdAt,
      totalMessages: c._count.id,
      unread: unreadMap.get(c.userId) ?? 0,
    }));

  return NextResponse.json(result);
}

// POST: Admin sends reply to a user
export async function POST(req: NextRequest) {
  const admin = await getAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { userId, message } = await req.json();
  if (!userId || !message?.trim()) return NextResponse.json({ error: "userId and message required" }, { status: 400 });

  const chat = await prisma.chatMessage.create({
    data: { userId, message: message.trim(), sender: "ADMIN" },
  });

  return NextResponse.json(chat);
}
