import * as Services from "../models/services.model.js";

export const list = async (req, res, next) => {
  try {
    if (Services.ensureTable) await Services.ensureTable();
    const rows = await Services.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    if (Services.ensureTable) await Services.ensureTable();
    const item = await Services.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Service not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    if (Services.ensureTable) await Services.ensureTable();
    const data = req.body || {};
    // Validation minimale pour éviter 500 quand payload est vide
    if (!data.title) {
      return res.status(400).json({ error: "Missing required field: title" });
    }
    if (!data.category_id) {
      return res.status(400).json({ error: "Missing required field: category_id" });
    }
    const created = await Services.create(data);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const bulkCreate = async (req, res, next) => {
  try {
    const payload = req.body;
    if (!Array.isArray(payload)) {
      return res.status(400).json({ error: "Payload must be an array of services" });
    }
    if (Services.ensureTable) await Services.ensureTable();

    const results = [];
    const errors = [];
    for (let i = 0; i < payload.length; i++) {
      const item = payload[i];
      try {
        // Validation minimale
        if (!item || typeof item !== 'object') throw new Error('Invalid service object');
        if (!item.title) throw new Error('Missing title');
        if (!item.category_id) throw new Error('Missing category_id');
        const created = await Services.create(item);
        results.push(created);
      } catch (err) {
        errors.push({ index: i, error: err.message });
      }
    }

    res.status(201).json({ created_count: results.length, error_count: errors.length, results, errors });
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    if (Services.ensureTable) await Services.ensureTable();
    const updated = await Services.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Service not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    if (Services.ensureTable) await Services.ensureTable();
    await Services.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};