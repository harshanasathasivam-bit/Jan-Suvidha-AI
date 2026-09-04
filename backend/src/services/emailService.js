import nodemailer from 'nodemailer';

/**
 * Send Transactional Email with 6-digit Verification Code
 */
export async function sendVerificationEmail({ toEmail, userName, code, purpose }) {
  const apiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  // Check if real email provider credentials exist
  const hasEmailConfig = apiKey || (smtpHost && smtpUser && smtpPass);

  if (!hasEmailConfig) {
    console.warn('⚠️ No transactional email provider key configured in environment variables.');
    return {
      success: false,
      error: 'EMAIL_KEY_REQUIRED',
      message: 'No transactional email API key configured. Please provide RESEND_API_KEY or SMTP credentials in your .env file.'
    };
  }

  try {
    let transporter;

    if (smtpHost) {
      transporter = nodemailer.createTransport({
        host: smtpHost,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: smtpUser,
          pass: smtpPass
        }
      });
    } else {
      // SMTP transport for Resend / SendGrid / Custom SMTP
      transporter = nodemailer.createTransport({
        host: 'smtp.resend.com',
        port: 465,
        secure: true,
        auth: {
          user: 'resend',
          pass: apiKey
        }
      });
    }

    const subject = purpose === 'login' 
      ? `${code} is your Jan Suvidha AI Login Verification Code`
      : `${code} is your Jan Suvidha AI Email Verification Code`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background: #0f172a; color: #f8fafc;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #60a5fa; margin: 0;">Jan Suvidha AI</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Tamil Nadu Citizen Welfare Portal</p>
        </div>
        <p style="font-size: 16px;">Hello <strong>${userName || 'Citizen'}</strong>,</p>
        <p style="color: #cbd5e1; font-size: 15px;">
          ${purpose === 'login' ? 'Your 2-Step Login Verification Code is:' : 'Thank you for registering. Your Email Verification Code is:'}
        </p>
        <div style="text-align: center; margin: 25px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #34d399; background: #1e293b; padding: 12px 24px; border-radius: 8px; border: 1px solid #334155;">
            ${code}
          </span>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This verification code is valid for <strong>10 minutes</strong> and can only be used once.</p>
        <hr style="border: none; border-top: 1px solid #334155; margin: 20px 0;" />
        <p style="color: #64748b; font-size: 12px; text-align: center;">Jan Suvidha AI • Tamil Nadu State Government Scheme Assistant</p>
      </div>
    `;

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Jan Suvidha AI" <onboarding@resend.dev>',
      to: toEmail,
      subject: subject,
      html: htmlBody
    });

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (err) {
    console.error('Failed to send verification email:', err);
    return {
      success: false,
      error: 'EMAIL_SEND_FAILED',
      details: err.message
    };
  }
}
