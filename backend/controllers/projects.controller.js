import * as Projects from "../models/projects.model.js";

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