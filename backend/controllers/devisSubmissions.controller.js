import * as Model from "../models/devisSubmissions.model.js";
import { uploadPublicFile } from "../config/googleDrive.js";
import { Buffer } from "buffer";
import * as RequestsModel from "../models/devisRequests.model.js";
import { sendQuoteResponseEmail } from "../config/mail.js";
import crypto from "crypto";
import { Invoices } from "../models/invoices.model.js";
import { PaymentModel } from "../models/pay.model.js";

export const list = async (req, res, next) => {
  try {
    const rows = await Model.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const item = await Model.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Submission not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const listByRequestId = async (req, res, next) => {
  try {
    const requestId = Number(req.params.id);
    const rows = await Model.findByRequestId(requestId);
    res.json(rows);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const created = await Model.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const updated = await Model.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Submission not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Model.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};
// Create submission with base64 PDF uploaded to Google Drive
export const createWithPdf = async (req, res, next) => {
  try {
    const {
      request_id,
      provider_id = null,
      estimation_amount,
      delivery_time = null,
      message = null,
      status = "envoyé",
      pdf_name = null,
      pdf_base64 = null,
      mime_type = "application/pdf",
    } = req.body;

    let pdf_url = null;
    if (pdf_base64 && pdf_name) {
      const buffer = Buffer.from(String(pdf_base64), 'base64');
      const up = await uploadPublicFile({ name: pdf_name, mimeType: mime_type, buffer });
      pdf_url = up.webViewLink || up.webContentLink || null;
    }

    const created = await Model.create({
      request_id,
      provider_id,
      estimation_amount,
      delivery_time,
      message,
      pdf_url,
      status,
    });

    res.status(201).json(created);
  } catch (e) { 
    next(e); 
  }
};
// Send email to client for a submission (admin response)
export const sendEmail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const submission = await Model.findById(id);
    if (!submission) return res.status(404).json({ error: "Submission not found" });

    const request = await RequestsModel.findById(Number(submission.request_id));
    if (!request) return res.status(404).json({ error: "Request not found" });

    const to = String(request.email || '').trim();
    if (!to) return res.status(400).json({ error: "Recipient email is missing on request" });

    // Générer un lien de paiement et enregistrer dans payments + invoices
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const BASE_URL = process.env.APP_BASE_URL || "https://digital-company.web.app";
    const payment_link = `${BASE_URL}/pay/${uniqueId}`;
    try {
      await PaymentModel.create({
        user_id: null,
        service_id: request.service_id || null,
        id_devis_submissions: submission.id,
        payment_link,
      });
    } catch (_) {}
    // Créer une facture liée au devis (avec échéance auto)
    let invoice = null;
    try {
      const TERMS_DAYS = Number(process.env.INVOICE_DUE_DAYS || 14);
      const issued = new Date();
      const dueDate = new Date(issued);
      dueDate.setDate(dueDate.getDate() + TERMS_DAYS);
      invoice = await Invoices.create({
        devis_submission_id: submission.id,
        requester_email: to,
        client_name: request.full_name || null,
        amount: submission.estimation_amount ?? 0,
        status: 'en_attente',
        issued_date: issued,
        due_date: dueDate,
        payment_link,
      });
    } catch (e) {
      // Continuer l'envoi même si la création de facture échoue
      console.error('[Invoices] create failed:', e?.message || e);
    }

    const subject = `Votre devis Digital`;

    const makeSafeUrl = (url) => {
      if (!url) return null;
      const raw = String(url).trim();
      try {
        // Tente de parser pour forcer un format absolu
        const u = new URL(raw);
        return u.toString();
      } catch {
        // Fallback: encode les caractères spéciaux et espaces
        return encodeURI(raw);
      }
    };
    const safePdfUrl = makeSafeUrl(submission.pdf_url);
    const plainText = [
      `Bonjour ${request.full_name || ''},`,
      '',
      `Nous vous envoyons la réponse à votre demande de devis.`,
      `Montant estimé: ${submission.estimation_amount ?? '-'} FCFA`,
      invoice?.issued_date ? `Date d'émission: ${invoice.issued_date}` : '',
      invoice?.due_date ? `Échéance: ${invoice.due_date}` : '',
      submission.delivery_time ? `Délai de livraison: ${submission.delivery_time}` : '',
      '',
      submission.message ? `Message: ${submission.message}` : '',
      safePdfUrl ? `Voir le devis PDF: ${safePdfUrl}` : '',
      payment_link ? `Payer en ligne: ${payment_link}` : '',
      '',
      `Cordialement,`,
      `Digital`
    ].filter(Boolean).join('\n');

    const html = 
    `
    <!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body {
    margin:0; padding:0;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    color:#e2e8f0;
  }
  a { text-decoration:none; transition:color 0.2s; }
  .container { width:100%; padding:40px 20px; }
  .card {
    max-width:600px;
    margin:0 auto;
    background-color:#1e293b;
    border-radius:12px;
    overflow:hidden;
    box-shadow:0 8px 16px rgba(0,0,0,0.4);
  }
  .header {
    background: linear-gradient(135deg,#0f172a 0%,#1e293b 100%);
    text-align:center;
    padding:20px 30px;
    border-bottom:2px solid #334155;
  }
  .header img { width:70px; height:70px; vertical-align:middle; }
  .header h1 {
    display:inline-block;
    margin:0 0 0 0px;
    font-size:32px; font-weight:900; color:#ffffff;
    letter-spacing:-0.5px; vertical-align:middle;
  }
  .header p { margin:15px 0 0; font-size:14px; color:#94a3b8; font-weight:500; }

  .body { padding:40px 30px; line-height:1.6; color:#e2e8f0; }
  .body p { margin:0 0 20px; font-size:16px; }
  .highlight { color:#60a5fa; font-weight:700; }

  .info-card {
    background-color:#0f172a;
    border-radius:8px;
    border:1px solid #334155;
    padding:25px;
    margin-bottom:30px;
  }
  .info-row { display:flex; justify-content:space-between; padding:8px 0; font-size:14px; color:#94a3b8; }
  .info-value { color:#60a5fa; font-weight:700; font-size:16px; }

  .message-box {
    background-color:#1e293b;
    border-left:4px solid #60a5fa;
    padding:20px;
    border-radius:0 8px 8px 0;
    margin-bottom:30px;
    border:1px solid #334155;
  }
  .message-box p.title { margin:0 0 10px; font-size:14px; font-weight:600; color:#60a5fa; }
  .message-box p.content { margin:0; font-size:14px; color:#cbd5e1; line-height:1.6; }

  .btn-download {
    display:inline-block;
      background:linear-gradient(135deg,#1b232e 0%,#050608 100%);
    color:#ffffff;
    padding:14px 32px;
    border-radius:8px;
    font-weight:600;
    font-size:15px;
    box-shadow:0 4px 12px rgba(96,165,250,0.3);
    margin:20px 0;
    text-align:center;
  }

  .footer {
    background: linear-gradient(135deg,#1e293b 0%,#0f172a 100%);
    padding:30px;
    text-align:center;
    border-top:2px solid #334155;
  }
  .footer p { margin:0 0 15px; color:#cbd5e1; font-size:14px; font-weight:600; }
  .footer p.sub { margin:0 0 20px; color:#94a3b8; font-size:13px; line-height:1.5; }
  .footer a { color:#94a3b8; font-size:12px; margin:0 6px; }
  .footer .copyright { margin-top:20px; color:#64748b; font-size:11px; }
</style>
</head>
<body>
  <div class="containr">
    <div class="card">
      <!-- Header -->
      <div class="header">
        <img src="https://digital-company.web.app/img/web-app-manifest-192x192.png" alt="Digital Logo"/>
        <h1>Digital</h1>
        <p>Votre devis est prêt</p>
      </div>

      <!-- Body -->
      <div class="body">
        <p>Bonjour <span class="highlight">${request.full_name || ''}</span>,</p>
        <p>Nous vous remercions pour votre demande. Voici les détails de votre devis :</p>

        <div class="info-card">
          <div class="info-row">
            <span>💰 Montant estimé</span>
            <span class="info-value">${submission.estimation_amount ?? '-'} FCFA</span>
          </div>
          ${invoice?.issued_date ? `<div class="info-row"><span>📅 Date d'émission</span><span class="info-value">${new Date(invoice.issued_date).toISOString().slice(0,10)}</span></div>` : ''}
          ${invoice?.due_date ? `<div class="info-row"><span>⏳ Échéance</span><span class="info-value">${new Date(invoice.due_date).toISOString().slice(0,10)}</span></div>` : ''}
          ${submission.delivery_time ? `<div class="info-row"><span>⏱️ Délai de livraison</span><span class="info-value">${submission.delivery_time}</span></div>` : ''}
        </div>

        ${submission.message ? `<div class="message-box"><p class="title">📝 Message personnalisé</p><p class="content">${String(submission.message).replace(/\n/g,'<br/>')}</p></div>` : ''}

        ${safePdfUrl ? `<a href="${safePdfUrl}" class="btn-download" target="_blank" rel="noopener">📄 Télécharger le devis (PDF)</a>` : ''}

        ${payment_link ? `<a href="${payment_link}" class="btn-download" target="_blank" rel="noopener" style="background:linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%); box-shadow:0 4px 12px rgba(37,99,235,0.35)">💳 Payer maintenant</a>` : ''}

        <p>Nous restons à votre disposition pour toute question.</p>
        <p>Cordialement,<br/><strong style="color:#60a5fa;">L'équipe Digital</strong></p>
      </div>

      <!-- Footer -->
      <div class="footer">
        <p>Digital - Solutions Numériques</p>
        <p class="sub">Votre partenaire pour la transformation digitale<br/>contact@digital.com | +225 --</p>
        <p>
          <a href="#">Instagram</a> | <a href="https://digital-company.web.app/">Site Web</a>
        </p>
        <p class="copyright">© ${new Date().getFullYear()} Digital. Tous droits réservés.</p>
      </div>

    </div>
  </div>
</body>
</html>
>
    `;

    const info = await sendQuoteResponseEmail({ to, subject, text: plainText, html });
    // Marquer la facture comme envoyée après l'email
    if (invoice?.id) {
      try { invoice = await Invoices.markSent(invoice.id, payment_link, new Date()); } catch {}
    }
    res.json({ success: true, messageId: info.messageId, invoice });
  } catch (e) { next(e); }
};