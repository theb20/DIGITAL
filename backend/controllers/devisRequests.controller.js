import * as Model from "../models/devisRequests.model.js";

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