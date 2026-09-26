import nodemailer from 'nodemailer';

/**
 * Optional outgoing email. Enabled only when SMTP_HOST is set in .env.
 * Without it, newsletters can be written but not sent from the dashboard,
 * and new-message notifications are skipped.
 */
const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
// A username without a password (e.g. a half-finished Gmail setup) can't send.
const credentialsReady = !process.env.SMTP_USER || Boolean(process.env.SMTP_PASS);

export const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER || '';

const transporter = host && credentialsReady
  ? nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : null;

export function isMailConfigured() {
  return Boolean(transporter && mailFrom);
}

export async function sendMail({ to, subject, text, html, replyTo }) {
  if (!isMailConfigured()) throw new Error('Email sending is not set up on the server.');
  return transporter.sendMail({ from: mailFrom, to, subject, text, html, replyTo });
}

/** Emails the newsroom (NOTIFY_EMAIL) about new activity. Never throws. */
export async function notifyNewsroom(subject, text, replyTo) {
  const to = process.env.NOTIFY_EMAIL;
  if (!to || !isMailConfigured()) return;
  try {
    await sendMail({ to, subject: `[NORTH i] ${subject}`, text, replyTo });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[northi] notification email failed:', err.message);
  }
}
