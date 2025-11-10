import crypto from "crypto";
import { PaymentModel } from "../models/pay.model.js";
import { Invoices } from "../models/invoices.model.js";
import * as RequestsModel from "../models/devisRequests.model.js";
import * as SubmissionsModel from "../models/devisSubmissions.model.js";
import * as ServicesModel from "../models/services.model.js";
import * as UsersModel from "../models/users.model.js";
import { uploadPublicFile } from "../config/googleDrive.js";
import { sendEmail } from "../config/mail.js";
import { generateInvoicePDF } from "../utils/invoicePdf.js";

export const PaymentController = {
  async createPayment(req, res) {
    try {
      const { user_id, service_id = null, id_devis_submissions = null } = req.body;

      if (!user_id) return res.status(400).json({ error: "user_id requis" });
      if (!service_id && !id_devis_submissions) {
        return res.status(400).json({ error: "Fournir soit service_id, soit id_devis_submissions" });
      }

      const uniqueId = crypto.randomBytes(16).toString("hex");
      const BASE_URL = process.env.APP_BASE_URL || "https://digital-company.web.app";
      const payment_link = `${BASE_URL}/pay/${uniqueId}`;

      const result = await PaymentModel.create({
        user_id,
        service_id,
        id_devis_submissions,
        payment_link,
      });

      res.status(201).json({
        success: true,
        paymentLink: payment_link,
        id: result.insertId,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async verifyPayment(req, res) {
    try {
      const link = req.params.link;

      // Recherche par jeton, indépendante du domaine
      let rows = await PaymentModel.getByToken(link);
      if (!rows || rows.length === 0) {
        // Fallback compatibilité anciens liens codés en dur
        const fallback1 = await PaymentModel.getByLink(`https://tonsite.com/pay/${link}`);
        const fallback2 = await PaymentModel.getByLink(`${process.env.APP_BASE_URL || "https://digital-company.web.app"}/pay/${link}`);
        rows = fallback1?.length ? fallback1 : fallback2;
      }

      // Fallback ultime: si aucune entrée paiement, tenter via la facture
      if (!rows || rows.length === 0) {
        const invoice = await Invoices.getByPaymentToken(link);
        if (invoice && invoice.payment_link) {
          // Vérifier si un paiement existe déjà pour ce lien
          const existing = await PaymentModel.getByLink(invoice.payment_link);
          if (!existing || existing.length === 0) {
            try {
              await PaymentModel.create({
                user_id: 0, // inconnu ici
                service_id: null,
                id_devis_submissions: invoice.devis_submission_id || null,
                payment_link: invoice.payment_link,
              });
            } catch (e) {
              // Ne pas interrompre: si la création échoue, on retourne 404 plus bas
            }
            // Relire après éventuelle création
            rows = await PaymentModel.getByLink(invoice.payment_link);
          } else {
            rows = existing;
          }
        }
      }

      if (!rows || rows.length === 0) {
        return res.status(404).json({ message: "Lien non trouvé" });
      }

      // Enrichissement des informations pour l'affichage frontend
      const payment = rows[0];
      const paymentLink = payment?.payment_link || `${process.env.APP_BASE_URL || "https://digital-company.web.app"}/pay/${link}`;

      // Charger facture liée si disponible
      let invoice = null;
      try {
        invoice = paymentLink ? await Invoices.getByPaymentLink(paymentLink) : await Invoices.getByPaymentToken(link);
      } catch {}

      // Charger submission & request liées via la facture
      let submission = null;
      let request = null;
      try {
        const submissionId = payment?.id_devis_submissions || invoice?.devis_submission_id || null;
        if (submissionId) {
          submission = await SubmissionsModel.findById(Number(submissionId));
        }
        const requestId = submission?.request_id || null;
        if (requestId) {
          request = await RequestsModel.findById(Number(requestId));
        }
      } catch {}

      // Déterminer service et utilisateur
      const serviceId = payment?.service_id || request?.service_id || null;
      let service = null;
      if (serviceId) {
        try { service = await ServicesModel.findById(Number(serviceId)); } catch {}
      }
      let user = null;
      if (payment?.user_id) {
        try { user = await UsersModel.findById(Number(payment.user_id)); } catch {}
      }

      const display_user_name = (
        (user && `${user.first_name || ''} ${user.last_name || ''}`.trim()) ||
        (request?.full_name) ||
        (invoice?.client_name) ||
        null
      );
      const display_user_email = (
        user?.email ||
        request?.email ||
        invoice?.requester_email ||
        null
      );
      const service_title = service?.title || null;

      res.json({
        ...payment,
        service_title,
        display_user_name,
        display_user_email,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async confirm(req, res) {
    try {
      const { id } = req.body;
      if (!id) return res.status(400).json({ error: "id requis" });
      // Vérifier existence
      const existingPayment = await PaymentModel.findById(Number(id));
      if (!existingPayment) return res.status(404).json({ error: "Payment not found" });

      // Confirmer le paiement de façon atomique: une seule requête peut réussir
      const upd = await PaymentModel.confirmPayment(id);
      if (!upd || Number(upd.affectedRows || 0) === 0) {
        // Déjà confirmé: ne rien refaire
        let invoice = null;
        try {
          if (existingPayment.payment_link) {
            invoice = await Invoices.getByPaymentLink(existingPayment.payment_link);
          }
        } catch (_) {}
        return res.json({ success: true, alreadyConfirmed: true, invoice });
      }

      // Essayer de récupérer la facture liée via le lien de paiement
      let updatedInvoice = null;
      let driveUpload = null;
      try {
        const payment = await PaymentModel.findById(Number(id));
        const paymentLink = payment?.payment_link || existingPayment?.payment_link || null;
        if (paymentLink) {
          const invoice = await Invoices.getByPaymentLink(paymentLink);
          if (invoice?.id) {
            updatedInvoice = await Invoices.setStatus(invoice.id, 'payée');
            // Notifier en temps réel si possible
            try {
              const { publishEvent } = await import('../config/realtime.js');
              publishEvent('invoices.updated', updatedInvoice);
            } catch (_) { /* noop */ }

            // Générer le PDF A5 avec logo
            try {
              const BASE_URL = process.env.APP_BASE_URL || "https://digital-company.web.app";
              const logoUrl = `${BASE_URL}/img/web-app-manifest-512x512.png`;
              const pdfBuffer = await generateInvoicePDF(updatedInvoice, { logoUrl, companyName: 'Digital' });
              const fileName = `Facture_Digital_${String(updatedInvoice.id).padStart(6, '0')}.pdf`;

              // Uploader la facture sur Google Drive (dossier défini par env)
              try {
                const targetFolder = process.env.GOOGLE_DRIVE_FOLDER_ID_INVOICES || process.env.GOOGLE_DRIVE_FOLDER_ID;
                driveUpload = await uploadPublicFile({
                  name: fileName,
                  mimeType: 'application/pdf',
                  buffer: pdfBuffer,
                  folderId: targetFolder,
                });
              } catch (e) {
                console.warn('[Drive] Upload facture échoué:', e?.message || e);
              }

              // Envoyer l'email avec facture en pièce jointe
              try {
                const to = String(updatedInvoice.requester_email || '').trim();
                if (to) {
                  const subject = 'Votre facture payée – Digital';
                  const plain = [
                    `Bonjour ${updatedInvoice.client_name || ''},`,
                    '',
                    `Merci pour votre paiement. Vous trouverez ci-joint votre facture (${fileName}).`,
                    `Montant: ${Number(updatedInvoice.amount || 0).toFixed(2)} FCFA`,
                    `Date d'émission: ${updatedInvoice.issued_date || ''}`,
                    `Échéance: ${updatedInvoice.due_date || '-'}`,
                    driveUpload?.webViewLink ? `Lien Drive: ${driveUpload.webViewLink}` : '',
                    '',
                    'Cordialement,',
                    'Digital'
                  ].filter(Boolean).join('\n');

                  const html = `
                    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;color:#111">
                      <p>Bonjour ${updatedInvoice.client_name || ''},</p>
                      <p>Merci pour votre paiement. Vous trouverez ci-joint votre facture.</p>
                      <p><strong>Montant:</strong> ${Number(updatedInvoice.amount || 0).toFixed(2)} FCFA<br/>
                      <strong>Date d'émission:</strong> ${updatedInvoice.issued_date || '-'}<br/>
                      <strong>Échéance:</strong> ${updatedInvoice.due_date || '-'}</p>
                      ${driveUpload?.webViewLink ? `<p><a href="${driveUpload.webViewLink}" style="display:inline-block;background:#2563eb;color:#fff;padding:10px 16px;border-radius:6px;text-decoration:none">Voir la facture sur Drive</a></p>` : ''}
                      <p>Cordialement,<br/><strong>Digital</strong></p>
                    </div>
                  `;

                  await sendEmail({
                    to,
                    subject,
                    text: plain,
                    html,
                    attachments: [
                      { filename: fileName, content: pdfBuffer, contentType: 'application/pdf' }
                    ],
                  });
                }
              } catch (e) {
                console.warn('[Mail] Envoi facture échoué:', e?.message || e);
              }
            } catch (e) {
              console.warn('[PDF] Génération facture échouée:', e?.message || e);
            }
          }
        }
      } catch (_) { /* noop */ }

      res.json({ success: true, invoice: updatedInvoice, drive: driveUpload });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },

  async list(req, res, next) {
    try {
      const rows = await PaymentModel.findAll();
      res.json(rows);
    } catch (e) { next(e); }
  },

  async get(req, res, next) {
    try {
      const id = Number(req.params.id);
      const item = await PaymentModel.findById(id);
      if (!item) return res.status(404).json({ error: "Payment not found" });
      res.json(item);
    } catch (e) { next(e); }
  },

  async update(req, res, next) {
    try {
      const id = Number(req.params.id);
      const updated = await PaymentModel.update(id, req.body || {});
      if (!updated) return res.status(404).json({ error: "Payment not found" });
      res.json(updated);
    } catch (e) { next(e); }
  },

  async remove(req, res, next) {
    try {
      const id = Number(req.params.id);
      await PaymentModel.remove(id);
      res.status(204).send();
    } catch (e) { next(e); }
  }
};
