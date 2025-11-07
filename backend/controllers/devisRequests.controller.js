import * as Model from "../models/devisRequests.model.js";
import { uploadPublicFile } from "../config/googleDrive.js";
import { Buffer } from "buffer";

export const list = async (req, res, next) => {
  try {
    const rows = await Model.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const item = await Model.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Request not found" });
    res.json(item);
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
    if (!updated) return res.status(404).json({ error: "Request not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Model.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};

// Create request with base64 file uploaded to Google Drive
export const createWithFile = async (req, res, next) => {
  try {
    const {
      full_name,
      email,
      phone = null,
      service_id = null,
      project_type = null,
      project_description,
      file_name = null,
      file_base64 = null,
      mime_type = "application/pdf",
    } = req.body;

    let attachment_url = null;
    if (file_base64 && file_name) {
      const buffer = Buffer.from(String(file_base64), 'base64');
      const up = await uploadPublicFile({ name: file_name, mimeType: mime_type, buffer });
      // Prefer webViewLink
      attachment_url = up.webViewLink || up.webContentLink || null;
    }

    const created = await Model.create({
      full_name,
      email,
      phone,
      service_id,
      project_type,
      project_description,
      attachment_url,
      status: "reçu"
    });

    res.status(201).json(created);
  } catch (e) { next(e); }
};