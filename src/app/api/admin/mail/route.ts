import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { sendEmail, getBroadcastEmailHtml } from "@/lib/email";

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

export async function POST(req: NextRequest) {
  try {
    const admin = await getAdmin(req);
    if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { subject, body, audience } = await req.json();

    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required." }, { status: 400 });
    }

    // Get users based on audience
    // For now, if "all", we just get everyone.
    let users = [];
    if (audience === "all") {
      users = await prisma.user.findMany({ select: { name: true, email: true } });
    } else {
      // In a real app we would filter by plan, for now fallback to all.
      users = await prisma.user.findMany({ select: { name: true, email: true } });
    }

    if (users.length === 0) {
      return NextResponse.json({ error: "No users found to send email to." }, { status: 404 });
    }

    // Send emails in parallel but in chunks to avoid rate limits
    let successCount = 0;
    let failCount = 0;
    let lastError = null;

    for (const user of users) {
      const result = await sendEmail({
        to: user.email,
        subject: subject,
        html: getBroadcastEmailHtml(user.name || "Investor", subject, body),
      });

      if (result.success) {
        successCount++;
      } else {
        failCount++;
        lastError = result.error;
      }
    }

    if (successCount === 0 && failCount > 0) {
      return NextResponse.json({ error: `Failed to send emails. Resend Error: ${JSON.stringify(lastError)}` }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully sent email to ${successCount} users. ${failCount > 0 ? `Failed for ${failCount} users.` : ''}` 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
