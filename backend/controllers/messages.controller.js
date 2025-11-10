import * as Model from "../models/messages.model.js";
import * as Users from "../models/users.model.js";
import { publishEvent } from "../config/realtime.js";

export const list = async (req, res, next) => {
  try {
    const filters = {
      q: req.query.q,
      status: req.query.status,
      participant: req.query.participant,
      from_date: req.query.from_date,
      to_date: req.query.to_date,
      limit: req.query.limit ? Number(req.query.limit) : undefined,
      offset: req.query.offset ? Number(req.query.offset) : undefined,
    };
    const rows = await Model.list(filters);
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const row = await Model.get(Number(req.params.id));
    if (!row) return res.status(404).json({ error: "Message not found" });
    res.json(row);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const standardEmail = process.env.STANDARD_EMAIL || process.env.SUPPORT_EMAIL || 'support@digital.tld';
    const senderEmail = payload.sender_email;
    const recipientEmail = payload.recipient_email;

    if (!senderEmail || !recipientEmail) {
      return res.status(400).json({ error: "sender_email et recipient_email sont requis" });
    }

    // Règle: un utilisateur (role 'user') ne peut écrire qu'au Standard
    try {
      const sender = await Users.findByEmail(String(senderEmail));
      const role = sender?.role || 'user';
      if (role === 'user') {
        const to = String(recipientEmail).toLowerCase();
        const std = String(standardEmail).toLowerCase();
        if (to !== std) {
          return res.status(403).json({ error: "Un utilisateur ne peut envoyer un message qu'au Standard" });
        }
      }
    } catch (err) {
      // Si la vérification du rôle échoue, par prudence on applique la règle utilisateur
      const to = String(recipientEmail || '').toLowerCase();
      const std = String(standardEmail).toLowerCase();
      if (!to || to !== std) {
        return res.status(403).json({ error: "Un utilisateur ne peut envoyer un message qu'au Standard" });
      }
    }

    const created = await Model.create(payload);
    try { publishEvent('messages.created', created); } catch {}
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    // Vérifier le rôle de l'acteur: seuls admin/manager peuvent modifier
    const actorEmail = (req.headers['x-user-email'] || req.body?.actor_email || '').toString();
    let role = (req.headers['x-user-role'] || '').toString();
    try {
      if (!role && actorEmail) {
        const actor = await Users.findByEmail(actorEmail);
        role = actor?.role || '';
      }
    } catch {}
    if (!['admin','manager'].includes(role)) {
      return res.status(403).json({ error: "Seuls admin/manager peuvent modifier un message" });
    }

    const updated = await Model.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Message not found" });
    try { publishEvent('messages.updated', updated); } catch {}
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    // Vérifier le rôle de l'acteur: seuls admin/manager peuvent supprimer
    const actorEmail = (req.headers['x-user-email'] || req.body?.actor_email || '').toString();
    let role = (req.headers['x-user-role'] || '').toString();
    try {
      if (!role && actorEmail) {
        const actor = await Users.findByEmail(actorEmail);
        role = actor?.role || '';
      }
    } catch {}
    if (!['admin','manager'].includes(role)) {
      return res.status(403).json({ error: "Seuls admin/manager peuvent supprimer un message" });
    }

    await Model.remove(Number(req.params.id));
    try { publishEvent('messages.removed', { id: Number(req.params.id) }); } catch {}
    res.status(204).send();
  } catch (e) { next(e); }
};