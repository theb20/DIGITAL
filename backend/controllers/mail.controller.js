import { sendEmail } from "../config/mail.js";

export const test = async (req, res, next) => {
  try {
    const { to, subject, text, html } = req.body || {};
    const recipient = String(to || '').trim();
    if (!recipient) return res.status(400).json({ error: "Champ 'to' requis pour le test" });
    const subj = subject || 'Test email Digital';
    const plain = text || 'Ceci est un email de test envoyé par le backend Digital.';
    const contentHtml = html || `<p>${plain}</p>`;
    const info = await sendEmail({ to: recipient, subject: subj, text: plain, html: contentHtml });
    res.json({ success: true, messageId: info.messageId });
  } catch (e) { next(e); }
};