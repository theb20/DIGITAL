import * as Contact from "../models/contact.model.js";

export const list = async (req, res, next) => {
  try {
    const rows = await Contact.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const item = await Contact.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Message not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const created = await Contact.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Contact.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};