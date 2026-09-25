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

async function sendNotification(ownerEmail, roomName, visitorEmail, visitorName, roomUrl) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL] Would notify ${ownerEmail}: ${visitorEmail} visited "${roomName}" — ${roomUrl}`);
    console.log('[EMAIL] Set SMTP_* env vars to send real emails.');
    return { simulated: true };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Keel Data Room <noreply@keel.ai>',
    to: ownerEmail,
    subject: `👀 ${visitorName || 'Someone'} viewed your data room: ${roomName}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #333;">New Data Room Visitor</h2>
        <p style="color: #666; font-size: 14px;">Someone accessed your data room.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px 0; color: #888; width: 100px;">Data Room</td><td style="padding: 8px 0;"><strong>${roomName}</strong></td></tr>
          <tr><td style="padding: 8px 0; color: #888;">Visitor</td><td style="padding: 8px 0;"><strong>${visitorName || '—'}</strong> (${visitorEmail})</td></tr>
        </table>
        <a href="${roomUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          View Your Data Room
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          Sent by <a href="${process.env.BASE_URL || 'http://localhost:3000'}" style="color: #999;">Keel Data Room</a>
        </p>
      </div>
    `,
  });

  console.log('[EMAIL] Sent notification:', info.messageId);
  return { sent: true, messageId: info.messageId };
}

async function sendAccessGranted(visitorEmail, roomName, roomUrl) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[EMAIL] Would send access granted to ${visitorEmail} for "${roomName}"`);
    return { simulated: true };
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'Keel Data Room <noreply@keel.ai>',
    to: visitorEmail,
    subject: `Access granted to ${roomName}`,
    html: `
      <div style="font-family: -apple-system, sans-serif; max-width: 520px; margin: 0 auto;">
        <h2 style="color: #333;">Access Granted</h2>
        <p>You now have access to <strong>${roomName}</strong>.</p>
        <p>Click the link below to view the data room:</p>
        <a href="${roomUrl}" style="display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">
          Open Data Room
        </a>
        <p style="color: #999; font-size: 12px; margin-top: 24px;">
          If you didn't request access, you can ignore this email.
        </p>
      </div>
    `,
  });

  console.log('[EMAIL] Sent access granted:', info.messageId);
  return { sent: true, messageId: info.messageId };
}

module.exports = { sendNotification, sendAccessGranted };