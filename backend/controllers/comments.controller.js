import * as Model from "../models/comments.model.js";
import { query } from "../config/db.js";

export const list = async (req, res, next) => {
  try {
    if (Model.ensureBlogLink) await Model.ensureBlogLink();
    const rows = await Model.findAll();
    res.json(rows);
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const item = await Model.findById(Number(req.params.id));
    if (!item) return res.status(404).json({ error: "Comment not found" });
    res.json(item);
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    if (Model.ensureBlogLink) await Model.ensureBlogLink();
    const created = await Model.create(req.body);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const updated = await Model.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "Comment not found" });
    res.json(updated);
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Model.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};

// Liste des commentaires d'un blog donné
export const listForBlog = async (req, res, next) => {
  try {
    if (Model.ensureBlogLink) await Model.ensureBlogLink();
    const blogId = Number(req.params.id);
    const rows = await Model.findByBlogId(blogId);
    res.json(rows);
  } catch (e) { next(e); }
};

// Crée un commentaire associé à un blog (et incrémente le compteur du blog)
export const createForBlog = async (req, res, next) => {
  try {
    if (Model.ensureBlogLink) await Model.ensureBlogLink();
    const blogId = Number(req.params.id);
    // Exiger que l'utilisateur soit connecté (user_id fourni)
    const userId = req.body && Number(req.body.user_id);
    if (!userId) {
      return res.status(401).json({ error: "auth_required", message: "Vous devez être connecté pour publier un commentaire." });
    }
    const payload = { ...req.body, blog_id: blogId, service_id: null, user_id: userId };
    const created = await Model.create(payload);
    // Incrémente le compteur côté blog
    await query("UPDATE blogs SET comment_count = COALESCE(comment_count, 0) + 1 WHERE id = ?", [blogId]);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

// Liste des commentaires d'un service donné
export const listForService = async (req, res, next) => {
  try {
    const serviceId = Number(req.params.id);
    const rows = await Model.findByServiceId(serviceId);
    res.json(rows);
  } catch (e) { next(e); }
};

// Crée un commentaire associé à un service
export const createForService = async (req, res, next) => {
  try {
    const serviceId = Number(req.params.id);
    const userId = req.body && Number(req.body.user_id);
    if (!userId) {
      return res.status(401).json({ error: "auth_required", message: "Vous devez être connecté pour publier un commentaire." });
    }
    const payload = { ...req.body, service_id: serviceId, blog_id: null, user_id: userId };
    const created = await Model.create(payload);
    res.status(201).json(created);
  } catch (e) { next(e); }
};

// Réactions: like/dislike sur un commentaire
export const like = async (req, res, next) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.body && Number(req.body.user_id);
    if (!userId) return res.status(401).json({ error: "auth_required" });
    const updated = await Model.react(commentId, userId, 'like');
    res.json(updated);
  } catch (e) { next(e); }
};

export const dislike = async (req, res, next) => {
  try {
    const commentId = Number(req.params.id);
    const userId = req.body && Number(req.body.user_id);
    if (!userId) return res.status(401).json({ error: "auth_required" });
    const updated = await Model.react(commentId, userId, 'dislike');
    res.json(updated);
  } catch (e) { next(e); }
};