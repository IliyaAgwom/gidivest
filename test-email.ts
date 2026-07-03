import nodemailer from 'nodemailer';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SMTP_HOST = process.env.SMTP_HOST || '';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '465', 10);
const SMTP_USER = process.env.SMTP_USER || '';
const SMTP_PASS = process.env.SMTP_PASS || '';

console.log('--- Testing SMTP Configuration ---');
console.log(`Host: ${SMTP_HOST}`);
console.log(`Port: ${SMTP_PORT}`);
console.log(`User: ${SMTP_USER}`);
console.log(`Pass: ${SMTP_PASS ? '********' : 'Not Set'}`);
console.log('----------------------------------\n');

if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
  console.error("❌ Error: Missing SMTP environment variables in your .env file.");
  console.log("Please ensure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS are set.");
  process.exit(1);
}

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465, // true for 465, false for other ports
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

async function runTest() {
  console.log("Attempting to connect to the SMTP server...");
  try {
    // Verify connection configuration
    await transporter.verify();
    console.log("✅ Success: Connected to SMTP server securely.\n");
    
    console.log("Attempting to send a test email to your own address...");
    
    const info = await transporter.sendMail({
      from: `"Martcapp System Test" <${SMTP_USER}>`,
      to: SMTP_USER, // Sending to itself for testing
      subject: "✅ Martcapp SMTP Test Successful",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>SMTP Test Successful!</h2>
          <p>If you are reading this, your Nodemailer configuration is working perfectly.</p>
          <p>Martcapp will now be able to send Registration, Deposit, and Withdrawal emails.</p>
        </div>
      `
    });

    console.log(`✅ Success: Test email sent! Message ID: ${info.messageId}`);
    console.log("Check your inbox (or spam folder) for the test message.");
    
  } catch (error) {
    console.error("❌ Failed to connect or send email. Error details:\n");
    console.error(error);
  }
}

runTest();
