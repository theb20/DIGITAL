import * as Users from "../models/users.model.js";

export const list = async (req, res, next) => {
  try {
    const rows = await Users.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const user = await Users.findById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const created = await Users.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const updated = await Users.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Users.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};