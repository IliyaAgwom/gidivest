const FROM_EMAIL = 'Martcapp <noreply@martcapp.com>';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (!process.env.RESEND_API_KEY) {
    console.log(`[Email Skipped] RESEND_API_KEY not set. Would send to: ${to}`);
    return { success: false, error: 'RESEND_API_KEY not configured' };
  }
  try {
    const { Resend } = await import('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) { console.error('Resend error:', error); return { success: false, error }; }
    console.log(`Email sent: ${data?.id}`);
    return { success: true, id: data?.id };
  } catch (error) {
    console.error('Error sending email:', error);
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

export function getApprovalEmailHtml(name: string, actionType: string, details?: string) {
  return baseTemplate(
    `${actionType} Approved`,
    `
    <p>Hi ${name},</p>
    <p>Great news! Your ${actionType.toLowerCase()} request has been <strong>approved</strong>.</p>
    ${details ? `<p>${details}</p>` : ''}
    <p>You can check your dashboard for more details.</p>
    <a href="https://martcapp.com/dashboard" class="btn" style="color: white;">Go to Dashboard</a>
    `
  );
}

export function getRejectionEmailHtml(name: string, actionType: string, details?: string) {
  return baseTemplate(
    `${actionType} Rejected`,
    `
    <p>Hi ${name},</p>
    <p>Unfortunately, your ${actionType.toLowerCase()} request was <strong>rejected</strong>.</p>
    ${details ? `<p>${details}</p>` : '<p>Please contact support if you need more information.</p>'}
    <p>You can check your dashboard or reach out via live chat for assistance.</p>
    `
  );
}

export function getNewChatMessageAdminEmailHtml(userName: string, userEmail: string, message: string) {
  return baseTemplate(
    "New Support Message",
    `
    <p>A new support message was received from <strong>${userName}</strong> (${userEmail}):</p>
    <div style="background-color: #f1f5f9; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0;">${message}</p>
    </div>
    <p>Log in to the admin panel to reply.</p>
    <a href="https://martcapp.com/admin/chat" class="btn" style="color: white;">Reply to Message</a>
    `
  );
}

export function getNewChatMessageUserEmailHtml(name: string, message: string) {
  return baseTemplate(
    "New Message from Support",
    `
    <p>Hi ${name},</p>
    <p>You have a new message from Martcapp Support:</p>
    <div style="background-color: #f1f5f9; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0;">${message}</p>
    </div>
    <p>You can view the full conversation or reply directly from your dashboard.</p>
    <a href="https://martcapp.com/dashboard" class="btn" style="color: white;">View in Dashboard</a>
    `
  );
}

export function getBroadcastEmailHtml(name: string, subject: string, body: string) {
  return baseTemplate(
    subject,
    `
    <p>Hi ${name},</p>
    <div>${body}</div>
    `
  );
}
