const nodemailer = require('nodemailer');

function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_SECURE === 'true',
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

async function sendNotification(ownerEmail, roomName, visitorEmail, visitorName, adminUrl) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL] ${visitorEmail} viewed "${roomName}" — would notify ${ownerEmail}`);
    console.log('[EMAIL] Set SMTP_* env vars to send real emails.');
    return { simulated: true };
  }

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Keel Data Room <noreply@keel.ai>',
    to: ownerEmail,
    subject: `👀 ${visitorName || visitorEmail} viewed your data room`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #333;">New Data Room Visitor</h2>
        <p style="color: #666;">Someone accessed your data room.</p>
        <table style="width:100%; border-collapse:collapse; margin:20px 0;">
          <tr><td style="padding:8px 0; color:#888; width:100px;">Data Room</td>
              <td style="padding:8px 0;"><strong>${roomName}</strong></td></tr>
          <tr><td style="padding:8px 0; color:#888;">Visitor</td>
              <td style="padding:8px 0;"><strong>${visitorName || '—'}</strong> (${visitorEmail})</td></tr>
          <tr><td style="padding:8px 0; color:#888;">Time</td>
              <td style="padding:8px 0;">${new Date().toLocaleString()}</td></tr>
        </table>
        <a href="${adminUrl}" style="display:inline-block; padding:12px 24px; background:#2563eb; color:white; text-decoration:none; border-radius:6px;">
          View Visitor Log
        </a>
      </div>
    `,
  });
}

module.exports = { sendNotification };