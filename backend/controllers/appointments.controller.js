import * as Model from "../models/appointments.model.js";
import * as Services from "../models/services.model.js";
import { sendQuoteResponseEmail } from "../config/mail.js";
import { publishEvent } from "../config/realtime.js";

export const list = async (req, res, next) => {
  try {
    const rows = await Model.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const item = await Model.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Appointment not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const created = await Model.create(req.body);
    // Temps réel: notifier création rendez-vous
    try { publishEvent('appointments.created', created); } catch {}
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const before = await Model.findById(id);
    const updated = await Model.update(id, req.body);
    if (!updated) return res.status(404).json({ error: "Appointment not found" });
    // Temps réel: notifier mise à jour rendez-vous
    try { publishEvent('appointments.updated', updated); } catch {}
    // Si le statut a changé, notifier le client par email avec un récapitulatif
    try {
      const prevStatus = before?.status || null;
      const nextStatus = updated?.status || null;
      const to = String(updated?.email || '').trim();
      if (to && nextStatus && prevStatus !== nextStatus) {
        const serviceTitle = updated?.service_id ? (await Services.findById(updated.service_id))?.title : null;
        const dt = updated?.appointment_date ? new Date(updated.appointment_date) : null;
        const dateStr = dt ? dt.toLocaleString('fr-FR') : '';
        // Normaliser le canal: 'chat' => 'WhatsApp', 'visio' => 'video', sinon valeur en minuscules
        const rawChannel = String(updated?.channel || '').toLowerCase();
        const channelKey = rawChannel.includes('chat') ? 'whatsapp' : (rawChannel.includes('visio') ? 'video' : rawChannel);
        const channelLabel = channelKey ? (channelKey === 'whatsapp' ? 'WhatsApp' : channelKey) : '-';

        // Libellés et messages selon statut
        const nextKey = String(nextStatus).toLowerCase();
        const statusLabelMap = { pending: 'En attente', confirmed: 'Confirmé', cancelled: 'Annulé', completed: 'Terminé' };
        const statusLabel = statusLabelMap[nextKey] || nextStatus;
        let subject = 'Mise à jour de votre rendez-vous';
        let intro = 'Voici le récapitulatif de votre rendez-vous:';
        switch (nextKey) {
          case 'pending':
            subject = 'Votre demande de rendez-vous est reçue';
            intro = 'Votre demande a été enregistrée et est en attente de confirmation.';
            break;
          case 'confirmed':
            subject = 'Votre rendez-vous est confirmé';
            intro = 'Votre rendez-vous est confirmé. Voici les détails:';
            break;
          case 'cancelled':
            subject = 'Votre rendez-vous est annulé';
            intro = 'Nous sommes désolés, votre rendez-vous a été annulé.';
            break;
          case 'completed':
            subject = 'Rendez-vous terminé — merci';
            intro = 'Merci, votre rendez-vous est terminé.';
            break;
        }

        const plainText = `Bonjour ${updated?.full_name || ''},\n\n` +
          `${intro}\n\n` +
          `- Service: ${serviceTitle || updated?.service_id || '-'}\n` +
          `- Date: ${dateStr}\n` +
          `- Canal: ${channelLabel || '-'}\n` +
          `- Statut: ${statusLabel}\n` +
          `${updated?.notes ? `\nNotes:\n${updated.notes}` : ''}\n\n` +
          `Cordialement,\nL'équipe Digital`;
        const html = `
          <div style="font-family:Inter,Arial,sans-serif;max-width:640px;margin:auto;background:#fff;border:1px solid #eee;border-radius:10px;overflow:hidden">
            <div style="background:#1f2937;color:#fff;padding:16px 20px">
              <h2 style="margin:0;font-size:18px">${subject}</h2>
              <div style="opacity:.9;font-size:13px">Statut: ${statusLabel}</div>
            </div>
            <div style="padding:20px;color:#111827">
              <p>Bonjour <strong>${updated?.full_name || ''}</strong>,</p>
              <p>${intro}</p>
              <div style="border:1px solid #e5e7eb;border-radius:8px;padding:12px">
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Service</span><strong>${serviceTitle || updated?.service_id || '-'}</strong></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Date</span><strong>${dateStr}</strong></div>
                <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Canal</span><strong>${channelLabel || '-'}</strong></div>
                <div style="display:flex;justify-content:space-between"><span>Statut</span><strong>${statusLabel}</strong></div>
              </div>
              ${updated?.notes ? `<div style="margin-top:12px"><div style="font-weight:600;margin-bottom:4px">Notes</div><div style="white-space:pre-wrap">${String(updated.notes).replace(/</g,'&lt;').replace(/>/g,'&gt;')}</div></div>` : ''}
              <p style="margin-top:16px">Nous restons à votre disposition pour toute question.</p>
              <p>Cordialement,<br/><strong>Digital</strong></p>
            </div>
          </div>`;
        await sendQuoteResponseEmail({ to, subject, text: plainText, html });
      }
    } catch (mailErr) {
      console.warn('Email rendez-vous: échec envoi', mailErr?.message || mailErr);
    }
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Model.remove(Number(req.params.id));
    // Temps réel: notifier suppression rendez-vous
    try { publishEvent('appointments.removed', { id: Number(req.params.id) }); } catch {}
    res.status(204).send();
  } catch (e) { next(e); }
};