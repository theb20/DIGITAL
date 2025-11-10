import crypto from "crypto";
import { Invoices } from "../models/invoices.model.js";
import { PaymentModel } from "../models/pay.model.js";
import { sendEmail } from "../config/mail.js";
import { publishEvent } from "../config/realtime.js";


export const list = async (req, res, next) => {
  try {
    const rows = await Invoices.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const item = await Invoices.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Invoice not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const data = req.body || {};
    if (!data.requester_email) return res.status(400).json({ error: "Champ requis: requester_email" });
    if (data.amount === undefined) return res.status(400).json({ error: "Champ requis: amount" });
    const created = await Invoices.create(data);
    // Temps réel: notifier création facture
    try { publishEvent('invoices.created', created); } catch {}
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const updated = await Invoices.update(id, req.body || {});
    if (!updated) return res.status(404).json({ error: "Invoice not found" });
    // Temps réel: notifier mise à jour facture
    try { publishEvent('invoices.updated', updated); } catch {}
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await Invoices.remove(id);
    // Temps réel: notifier suppression facture
    try { publishEvent('invoices.removed', { id }); } catch {}
    res.status(204).send();
  } catch (e) { next(e); }
};

  // Envoi d'une facture par email avec un lien de paiement
export const sendEmailForInvoice = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const invoice = await Invoices.findById(id);
    if (!invoice) return res.status(404).json({ error: "Invoice not found" });

    const to = String(invoice.requester_email || '').trim();
    if (!to) return res.status(400).json({ error: "L'email du demandeur est manquant" });

    // Créer un lien de paiement via le module payments (si submission/service renseigné)
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const BASE_URL = process.env.APP_BASE_URL || "https://digital-company.web.app";
    const payment_link = `${BASE_URL}/pay/${uniqueId}`;
    try {
      await PaymentModel.create({
        user_id: 0, // optionnel si inconnu ici
        service_id: null,
        id_devis_submissions: invoice.devis_submission_id || null,
        payment_link,
      });
    } catch (_) {}

    // Auto-calcul de l'échéance si absente
    try {
      const TERMS_DAYS = Number(process.env.INVOICE_DUE_DAYS || 14);
      if (!invoice.due_date) {
        const base = invoice.issued_date ? new Date(invoice.issued_date) : new Date();
        const dueDate = new Date(base);
        dueDate.setDate(dueDate.getDate() + TERMS_DAYS);
        const updatedInvoice = await Invoices.update(id, { due_date: dueDate });
        if (updatedInvoice) {
          Object.assign(invoice, updatedInvoice);
          try { publishEvent('invoices.updated', updatedInvoice); } catch {}
        }
      }
    } catch (_) {}

    const subject = 'Votre facture Digital';
    const plain = `Bonjour,\n\nVeuillez trouver votre facture d'un montant de ${invoice.amount} Fcfa.\n\nPayer en ligne: ${payment_link}\n\nDate d'émission: ${invoice.issued_date || ''}\nÉchéance: ${invoice.due_date || ''}\n\nCordialement,\nDigital`;
    const html = `
      <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6">
        <p>Bonjour,</p>
        <p>Veuillez trouver votre facture d'un montant de <strong>${invoice.amount} Fcfa</strong>.</p>
        <p><a href="${payment_link}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Payer la facture</a></p>
        <p>Date d'émission: ${invoice.issued_date || '-'}<br/>Échéance: ${invoice.due_date || '-'}</p>
        <p>Cordialement,<br/><strong>Digital</strong></p>
      </div>
    `;
    await sendEmail({ to, subject, text: plain, html });

    const updated = await Invoices.markSent(id, payment_link, new Date());
    // Temps réel: notifier facture envoyée (mise à jour)
    try { publishEvent('invoices.sent', updated); } catch {}
    res.json({ success: true, invoice: updated });
  } catch (e) { next(e); }
};

// Mettre à jour uniquement le statut (Payé ou Refusée)
export const updateStatus = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const allowed = ['payée', 'refusée', 'envoyée', 'en_attente'];
    if (!allowed.includes(String(status))) {
      return res.status(400).json({ error: "Statut invalide" });
    }
    const updated = await Invoices.setStatus(id, String(status));
    // Temps réel: notifier mise à jour de statut
    try { publishEvent('invoices.updated', updated); } catch {}
    res.json(updated);
  } catch (e) { next(e); }
};