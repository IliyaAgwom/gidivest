import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { sendEmail, getNewChatMessageAdminEmailHtml } from "@/lib/email";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "hugvest-secret-key-2024");

async function getUser(req: NextRequest) {
  const token = req.cookies.get("hv_session")?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { id: string; email: string; name: string; role: string };
  } catch { return null; }
}

export async function GET(req: NextRequest) {
  const session = await getUser(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const messages = await prisma.chatMessage.findMany({
    where: { userId: session.id },
    orderBy: { createdAt: "asc" },
  });

  await prisma.chatMessage.updateMany({
    where: { userId: session.id, sender: "ADMIN", read: false },
    data: { read: true },
  });

  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const session = await getUser(req);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { message } = await req.json();
  if (!message?.trim()) return NextResponse.json({ error: "Message required" }, { status: 400 });

  const chat = await prisma.chatMessage.create({
    data: { userId: session.id, message: message.trim(), sender: "USER" },
  });

  // Notify admin (using a default admin email or support email)
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "support@martcapp.com";
  // We do not block the response on email sending to make chat feel snappy
  sendEmail({
    to: ADMIN_EMAIL,
    subject: `New Message from ${session.name || session.email}`,
    html: getNewChatMessageAdminEmailHtml(session.name || "User", session.email, chat.message)
  }).catch(console.error);

  return NextResponse.json(chat);
}
