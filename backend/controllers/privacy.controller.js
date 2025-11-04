import * as Privacy from "../models/privacy.model.js";

export const list = async (req, res, next) => {
  try {
    const rows = await Privacy.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const sections = async (req, res, next) => {
  try {
    const rows = await Privacy.findSections();
    res.json(rows);
  } catch (e) { next(e); }
};

export const bySection = async (req, res, next) => {
  try {
    const rows = await Privacy.findBySection(Number(req.params.sectionNumber));
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const item = await Privacy.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Entry not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const created = await Privacy.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const updated = await Privacy.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Entry not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Privacy.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};