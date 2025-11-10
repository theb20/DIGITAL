import * as Contact from "../models/contact.model.js";
import { notifySupportAboutContact, sendContactAcknowledgement } from "../config/mail.js";
import { sendEmail } from "../config/mail.js";
import { publishEvent } from "../config/realtime.js";

export const list = async (req, res, next) => {
  try {
    const rows = await Contact.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const item = await Contact.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Message not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const created = await Contact.create(req.body);
    // Temps réel: notifier création contact
    try { publishEvent('contacts.created', created); } catch {}

    // Envoi d'emails (non bloquant): notification support + accusé utilisateur
    try {
      const { full_name, email, phone, startup, subject, message } = req.body || {};
      if (email) {
        // notifier le support
        await notifySupportAboutContact({
          fullName: full_name,
          email,
          phone,
          startup,
          subject,
          message,
        });
        // accusé de réception
        await sendContactAcknowledgement({ to: email, fullName: full_name || '' });
      }
    } catch (mailErr) {
      // Journaliser mais ne pas bloquer la création
      console.warn('Contact: échec envoi email', mailErr?.message || mailErr);
    }

    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Contact.remove(Number(req.params.id));
    // Temps réel: notifier suppression contact
    try { publishEvent('contacts.removed', { id: Number(req.params.id) }); } catch {}
    res.status(204).send();
  } catch (e) { next(e); }
};

// Répondre à un message de contact par email (admin/manager)
export const reply = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await Contact.findById(id);
    if (!item) return res.status(404).json({ error: "Message not found" });

    const to = String(item.email || '').trim();
    if (!to) return res.status(400).json({ error: "Le message de contact n'a pas d'email" });

    const { subject, text, html, replyTo } = req.body || {};
    const subj = subject && String(subject).trim() ? String(subject).trim() : (item.subject ? `Re: ${item.subject}` : 'Réponse à votre message');
    const plain = text && String(text).trim() ? String(text).trim() : 'Bonjour,\n\nMerci pour votre message. Voici notre réponse.\n\nCordialement,\nDigital';
    const contentHtml = html && String(html).trim() ? String(html).trim() : `<div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6"><p>Bonjour ${String(item.full_name || '').trim() || ''},</p><p>${plain.replace(/\n/g,'<br/>')}</p><p>Cordialement,<br/><strong>Digital</strong></p></div>`;

    const info = await sendEmail({ to, subject: subj, text: plain, html: contentHtml, replyTo });
    // Option: notifier en temps réel qu'une réponse a été envoyée
    try { publishEvent('contacts.replied', { id, to, subject: subj }); } catch {}
    res.json({ success: true, messageId: info?.messageId, to, subject: subj });
  } catch (e) { next(e); }
};