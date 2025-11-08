import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
const sanitize = (s) => String(s || '').trim();

const SMTP_HOST = sanitize(process.env.SMTP_HOST) || 'smtp.gmail.com';
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const SMTP_SECURE = String(process.env.SMTP_SECURE || '').toLowerCase() === 'false' ? false : SMTP_PORT === 465;
const SMTP_USER = sanitize(process.env.SMTP_USER);
// Remove spaces from app password if provided with spaces
const SMTP_PASS = sanitize((process.env.SMTP_PASS || '').replace(/\s+/g, ''));
const SMTP_FROM_EMAIL = sanitize(process.env.SMTP_FROM_EMAIL);
const SMTP_FROM_NAME = sanitize(process.env.SMTP_FROM_NAME) || 'Digital';

let transporter = null;

export function getTransporter() {
  if (!transporter) {
    if (!SMTP_USER || !SMTP_PASS) {
      throw new Error('SMTP_USER et SMTP_PASS doivent être définis dans les variables d’environnement');
    }
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

export async function sendQuoteResponseEmail({ to, subject, text, html }) {
  const t = getTransporter();
  const info = await t.sendMail({
    from: `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  });
  return info;
}