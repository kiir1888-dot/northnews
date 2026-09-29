import 'dotenv/config';
import { isMailConfigured, sendMail } from './mailer.js';

// Sends one test email to NOTIFY_EMAIL so you can confirm Gmail is set up.
if (!process.env.SMTP_PASS) {
  console.error('SMTP_PASS is empty in .env. Paste your Gmail App Password there first.');
  process.exit(1);
}
if (!isMailConfigured() || !process.env.NOTIFY_EMAIL) {
  console.error('Email settings are incomplete in .env (SMTP_HOST, MAIL_FROM, NOTIFY_EMAIL).');
  process.exit(1);
}
try {
  await sendMail({
    to: process.env.NOTIFY_EMAIL,
    subject: '[North i] Test email',
    text: 'Success! Your website can now send email. Contact messages and story submissions will arrive here.',
  });
  console.log(`Test email sent to ${process.env.NOTIFY_EMAIL}. Check the inbox (and Spam).`);
} catch (err) {
  console.error('Sending failed:', err.message);
  console.error('Check that SMTP_PASS is a Gmail App Password (not your normal password) and has no spaces.');
  process.exit(1);
}
