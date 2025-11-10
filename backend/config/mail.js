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
const SMTP_FROM_EMAIL = sanitize(process.env.SMTP_FROM_EMAIL) || SMTP_USER;
const SMTP_FROM_NAME = sanitize(process.env.SMTP_FROM_NAME) || 'Digital';
const SUPPORT_EMAIL = sanitize(process.env.STANDARD_EMAIL || process.env.SUPPORT_EMAIL || 'support@digital.tld');

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

// Fonction générique d’envoi d’email
export async function sendEmail({ to, subject, text, html, cc, bcc, replyTo, attachments }) {
  const t = getTransporter();
  const info = await t.sendMail({
    from: `${SMTP_FROM_NAME} <${SMTP_FROM_EMAIL}>`,
    to,
    cc,
    bcc,
    replyTo,
    subject,
    text,
    html,
    attachments,
  });
  return info;
}

// Compat: ancien nom utilisé pour l’envoi des devis
export async function sendQuoteResponseEmail({ to, subject, text, html }) {
  return await sendEmail({ to, subject, text, html });
}

// Helper: notifier l’admin/support d’un nouveau contact
export async function notifySupportAboutContact({ fullName, email, phone, startup, subject, message }) {
  const safeName = sanitize(fullName);
  const safeEmail = sanitize(email);
  const title = subject ? sanitize(subject) : 'Nouveau contact';
  const adminSubject = `Contact: ${title} – ${safeName}`;
  const plain = `Nouveau message de contact\n\nNom: ${safeName}\nEmail: ${safeEmail}\nTéléphone: ${phone || '-'}\nStartup: ${startup || '-'}\nSujet: ${title}\n\nMessage:\n${message}`;
  const html = `
    <h2>Nouveau message de contact</h2>
    <p><strong>Nom:</strong> ${safeName}</p>
    <p><strong>Email:</strong> ${safeEmail}</p>
    <p><strong>Téléphone:</strong> ${phone || '-'}</p>
    <p><strong>Startup:</strong> ${startup || '-'}</p>
    <p><strong>Sujet:</strong> ${title}</p>
    <pre style="white-space:pre-wrap; font-family:inherit;">${sanitize(message)}</pre>
  `;
  return await sendEmail({ to: SUPPORT_EMAIL, subject: adminSubject, text: plain, html });
}

// Helper: accusé de réception côté utilisateur
export async function sendContactAcknowledgement({ to, fullName }) {
  const subject = 'Nous avons bien reçu votre message';
  const plain = `Bonjour ${sanitize(fullName)},\n\nMerci pour votre message. Notre équipe vous répondra dans les plus brefs délais.\n\nCordialement,\nDigital`;
  const html = `
    <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6;">
      <p>Bonjour ${sanitize(fullName)},</p>
      <p>Merci pour votre message. Notre équipe vous répondra dans les plus brefs délais.</p>
      <p>Cordialement,<br/><strong>Digital</strong></p>
    </div>
  `;
  return await sendEmail({ to, subject, text: plain, html });
}

// Helpers Devis: notification support et accusé de réception
export async function notifySupportAboutQuoteRequest({ fullName, email, phone, projectType, description }) {
  const safeName = sanitize(fullName);
  const safeEmail = sanitize(email);
  const subject = `Devis: Nouvelle demande – ${safeName}`;
  const plain = `Nouvelle demande de devis\n\nNom: ${safeName}\nEmail: ${safeEmail}\nTéléphone: ${phone || '-'}\nType de projet: ${projectType || '-'}\n\nDescription:\n${sanitize(description)}`;
  const html = `
    <h2>Nouvelle demande de devis</h2>
    <p><strong>Nom: </strong> ${safeName}</p>
    <p><strong>Email: </strong> ${safeEmail}</p>
    <p><strong>Téléphone: </strong> ${phone || '-'}</p>
    <p><strong>Type de projet: </strong> ${projectType || '-'}</p>
    <pre style="white-space:pre-wrap; font-family:inherit;">${sanitize(description)}</pre>
  `;
  return await sendEmail({ to: SUPPORT_EMAIL, subject, text: plain, html });
}

export async function sendQuoteRequestAcknowledgement({ to, fullName }) {
  const subject = 'Votre demande de devis a bien été reçue';
  const plain = `Bonjour ${sanitize(fullName)},\n\nMerci pour votre demande de devis. Notre équipe vous contactera prochainement avec une réponse.\n\nCordialement,\nDigital`;
  const html = `
    <div style="font-family:system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height:1.6;">
      <p>Bonjour ${sanitize(fullName)},</p>
      <p>Merci pour votre demande de devis. Notre équipe vous contactera prochainement avec une réponse.</p>
      <p>Cordialement,<br/><strong>Digital</strong></p>
    </div>
  `;
  return await sendEmail({ to, subject, text: plain, html });
}