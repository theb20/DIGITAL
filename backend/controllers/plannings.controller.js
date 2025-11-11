import * as Plannings from "../models/plannings.model.js";
import { query } from "../config/db.js";
import { sendEmail } from "../config/mail.js";

const sanitizeStr = (s) => String(s || '').trim();

function computeSubject(weekKey) {
  return `Planning hebdomadaire – ${weekKey}`;
}

function renderPlanningHtml({ week_key, week_start, data }) {
  const employees = Array.isArray(data?.employees) ? data.employees : [];
  const days = Array.isArray(data?.days) ? data.days : [];
  const assignments = data?.assignments || {}; // { employeeName: { dayIndex: shift } }

  const headerCells = days.map((d) => `<th style="padding:8px;border:1px solid #ddd;">${d}</th>`).join("");
  const rowsHtml = employees.map((emp) => {
    const empAssign = assignments[emp] || {};
    const cells = days.map((_, idx) => {
      const v = sanitizeStr(empAssign[idx]);
      return `<td style="padding:8px;border:1px solid #ddd;">${v || ""}</td>`;
    }).join("");
    return `<tr><td style="padding:8px;border:1px solid #ddd;"><strong>${emp}</strong></td>${cells}</tr>`;
  }).join("");

  return `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.5;">
      <h2 style="margin:0 0 12px;">Planning semaine ${sanitizeStr(week_key)}</h2>
      ${week_start ? `<p style="margin:0 0 16px;">Début: ${sanitizeStr(week_start)}</p>` : ''}
      <table style="border-collapse:collapse; width:100%;">
        <thead><tr><th style="padding:8px;border:1px solid #ddd;">Employé</th>${headerCells}</tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>
    </div>
  `;
}

export const list = async (req, res, next) => {
  try {
    const rows = await Plannings.list();
    res.json(rows);
  } catch (e) { next(e); }
};

export const getByWeek = async (req, res, next) => {
  try {
    const weekKey = sanitizeStr(req.params.weekKey);
    const planning = await Plannings.findByWeekKey(weekKey);
    if (!planning) return res.status(404).json({ error: "Planning introuvable pour cette semaine" });
    res.json(planning);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const { week_key, week_start = null, data, recipients = null, created_by = null, sendEmail: shouldSend = false } = req.body || {};
    if (!week_key) return res.status(400).json({ error: "week_key requis" });
    if (!data) return res.status(400).json({ error: "payload data requis" });

    const created = await Plannings.create({ week_key, week_start, data, recipients, created_by });

    // Détermination des destinataires
    let dests = [];
    if (Array.isArray(recipients) && recipients.length > 0) {
      dests = recipients.filter(Boolean).map(String);
    } else {
      // fallback: admins et managers
      const rows = await query("SELECT email FROM users WHERE role IN ('admin','manager') AND email IS NOT NULL");
      dests = rows.map(r => sanitizeStr(r.email)).filter(Boolean);
    }

    if (shouldSend && dests.length > 0) {
      const subject = computeSubject(week_key);
      const html = renderPlanningHtml({ week_key, week_start, data });
      const text = `Planning semaine ${week_key}`;
      // Envoi groupé via bcc pour éviter divulgation des adresses
      await sendEmail({ to: dests[0], bcc: dests.slice(1), subject, text, html });
    }

    res.status(201).json({ success: true, planning: created, emailed: Boolean(shouldSend && dests.length) });
  } catch (e) { next(e); }
};