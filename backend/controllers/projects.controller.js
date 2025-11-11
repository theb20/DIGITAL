import * as Projects from "../models/projects.model.js";
import { uploadPublicFile } from "../config/googleDrive.js";
import { sendEmail } from "../config/mail.js";
const PROJECTS_DRIVE_FOLDER = process.env.GOOGLE_DRIVE_FOLDER_ID_PROJECTS ;

export const list = async (req, res, next) => {
  try {
    if (Projects.ensureTable) await Projects.ensureTable();
    const rows = await Projects.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    if (Projects.ensureTable) await Projects.ensureTable();
    const item = await Projects.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Project not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    if (Projects.ensureTable) await Projects.ensureTable();
    const data = req.body || {};
    if (!data.title) return res.status(400).json({ error: "Missing required field: title" });
    if (!data.category) return res.status(400).json({ error: "Missing required field: category" });
    const created = await Projects.create(data);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    if (Projects.ensureTable) await Projects.ensureTable();
    const updated = await Projects.update(Number(req.params.id), req.body || {});
    if (!updated) return res.status(404).json({ error: "Project not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    if (Projects.ensureTable) await Projects.ensureTable();
    await Projects.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};

// Upload d'un livrable pour un projet et envoi d'email au client avec le lien
export const uploadDeliverable = async (req, res, next) => {
  try {
    if (Projects.ensureTable) await Projects.ensureTable();
    const id = Number(req.params.id);
    const project = await Projects.findById(id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const { filename, mimeType, file_base64, to, message } = req.body || {};
    const name = String(filename || project.title || `deliverable-${id}`).trim();
    const type = String(mimeType || '').trim() || 'application/octet-stream';
    const base64 = String(file_base64 || '').trim();
    if (!base64) return res.status(400).json({ error: "file_base64 requis" });

    let buffer;
    try {
      buffer = Buffer.from(base64, 'base64');
    } catch (err) {
      return res.status(400).json({ error: "file_base64 invalide" });
    }

    // Upload sur Drive et récupérer lien public (dossier spécifique aux projets)
    const uploaded = await uploadPublicFile({ name, mimeType: type, buffer, folderId: PROJECTS_DRIVE_FOLDER });

    // Mettre à jour le projet avec le lien et le message
    const updated = await Projects.update(id, {
      deliverable_url: uploaded.webViewLink,
      deliverable_message: message || null,
    });

    // Envoi email si 'to' fourni
    let emailed = false;
    if (String(to || '').trim()) {
      const recipient = String(to).trim();
      const subj = `Livrable: ${project.title}`;
      const plain = `${message || ''}\n\nLien du livrable: ${uploaded.webViewLink}`.trim();
      const html = `
        <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;line-height:1.6;">
          ${message ? `<p>${message.replace(/</g,'&lt;').replace(/>/g,'&gt;')}</p>` : ''}
          <p>Voici votre livrable&nbsp;:</p>
          <p><a href="${uploaded.webViewLink}" target="_blank" rel="noopener">Ouvrir le livrable</a></p>
        </div>
      `;
      try {
        await sendEmail({ to: recipient, subject: subj, text: plain, html });
        emailed = true;
      } catch (err) {
        // Ne pas échouer l'upload si l'email tombe en erreur
        console.warn('Email livrable échoué:', err?.message || err);
      }
    }

    res.status(201).json({ success: true, project: updated, deliverable_url: uploaded.webViewLink, emailed });
  } catch (e) { next(e); }
};