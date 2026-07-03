import nodemailer from 'nodemailer';

// Configuration defaults
const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';
const FROM_EMAIL = `Martcapp <${SMTP_USER}>`;

// Create the transporter
const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  // If SMTP is not configured, just log to console and return
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.log(`[Email Skipped] SMTP not configured. Would have sent:`);
    console.log(`To: ${to}\nSubject: ${subject}\n\n`);
    return { success: false, error: 'SMTP not configured' };
  }

  try {
    const info = await transporter.sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

// ------------------------------------------------------------------
// TEMPLATES
// ------------------------------------------------------------------

const baseTemplate = (title: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
    .container { max-w: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
    .header { text-align: center; margin-bottom: 30px; }
    .logo { font-size: 24px; font-weight: bold; color: #0f172a; }
    .logo span { color: #10b981; }
    .title { color: #0f172a; font-size: 20px; font-weight: bold; margin-bottom: 20px; }
    .content { color: #334155; font-size: 16px; line-height: 1.6; }
    .footer { text-align: center; margin-top: 40px; color: #94a3b8; font-size: 14px; }
    .btn { display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div style="padding: 40px 20px;">
    <div class="container">
      <div class="header">
        <div class="logo">Mart<span>capp</span></div>
      </div>
      <div class="title">${title}</div>
      <div class="content">
        ${content}
      </div>
      <div class="footer">
        &copy; ${new Date().getFullYear()} Martcapp. All rights reserved.<br>
        This is an automated message, please do not reply.
      </div>
    </div>
  </div>
</body>
</html>
`;

export function getWelcomeEmailHtml(name: string) {
  return baseTemplate(
    "Welcome to Martcapp!",
    `
    <p>Hi ${name},</p>
    <p>Welcome to Martcapp! Your account has been successfully created.</p>
    <p>You can now log in to your dashboard to complete your identity verification and start investing.</p>
    <a href="https://martcapp.com/login" class="btn" style="color: white;">Log In Now</a>
    `
  );
}

export function getDepositEmailHtml(name: string, amount: number, method: string) {
  return baseTemplate(
    "Deposit Request Received",
    `
    <p>Hi ${name},</p>
    <p>We have received your request to deposit <strong>$${amount.toLocaleString()}</strong> via ${method}.</p>
    <p>Please follow the instructions in your dashboard to complete the transfer. Once the funds are received, your account will be credited automatically.</p>
    `
  );
}

export function getWithdrawalEmailHtml(name: string, amount: number, method: string, address: string) {
  return baseTemplate(
    "Withdrawal Request Received",
    `
    <p>Hi ${name},</p>
    <p>We have received your request to withdraw <strong>$${amount.toLocaleString()}</strong> to the following ${method} address:</p>
    <p style="background: #f1f5f9; padding: 10px; border-radius: 6px; font-family: monospace; word-break: break-all;">${address}</p>
    <p>Your request is currently being processed. You will be notified once the funds are sent.</p>
    `
  );
}
