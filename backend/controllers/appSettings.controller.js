import * as Model from "../models/appSettings.model.js";

export const list = async (req, res, next) => {
  try {
    if (Model.ensureTable) await Model.ensureTable();
    const rows = await Model.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    if (Model.ensureTable) await Model.ensureTable();
    const item = await Model.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Setting not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const getByKey = async (req, res, next) => {
  try {
    if (Model.ensureTable) await Model.ensureTable();
    const item = await Model.findByKey(String(req.params.key));
    if (!item) return res.status(404).json({ error: "Setting not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    if (Model.ensureTable) await Model.ensureTable();
    const created = await Model.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    if (Model.ensureTable) await Model.ensureTable();
    const updated = await Model.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Setting not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    if (Model.ensureTable) await Model.ensureTable();
    await Model.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};