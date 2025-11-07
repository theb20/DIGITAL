import * as Model from "../models/devisSubmissions.model.js";
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
  } catch (e) { next(e); }
};