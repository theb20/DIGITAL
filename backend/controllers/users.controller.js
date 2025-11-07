import * as Users from "../models/users.model.js";

// Normalisation d'encodage: corrige les chaînes mal interprétées (ex: "FrÃ©dÃ©rick" → "Frédérick")
function fixMisencodedUtf8(str) {
  if (typeof str !== 'string') return str;
  // Heuristique: si la chaîne contient des artefacts d'encodage courants, on tente une conversion latin1→utf8
  if (/Ã|Â|¢|€||||||||||||||/.test(str)) {
    try {
      return Buffer.from(str, 'latin1').toString('utf8');
    } catch (_) {
      return str;
    }
  }
  return str;
}

function normalizeUtf8(obj) {
  if (obj == null) return obj;
  if (Array.isArray(obj)) return obj.map(normalizeUtf8);
  if (typeof obj === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = normalizeUtf8(v);
    }
    return out;
  }
  return fixMisencodedUtf8(obj);
}

export const list = async (req, res, next) => {
  try {
    const rows = await Users.findAll();
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(normalizeUtf8(rows));
  } catch (e) { next(e); }
};

export const get = async (req, res, next) => {
  try {
    const user = await Users.findById(Number(req.params.id));
    if (!user) return res.status(404).json({ error: "User not found" });
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(normalizeUtf8(user));
  } catch (e) { next(e); }
};

export const getByEmail = async (req, res, next) => {
  try {
    const user = await Users.findByEmail(req.params.email);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(normalizeUtf8(user));
  } catch (e) { next(e); }
};

export const create = async (req, res, next) => {
  try {
    const created = await Users.create(req.body);
    // Poser un cookie HttpOnly pour le token si fourni
    const idToken = req.body?.idToken || req.body?.id_token;
    if (idToken) {
      res.cookie('token', String(idToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.status(201).json(normalizeUtf8(created));
  } catch (e) { next(e); }
};

export const update = async (req, res, next) => {
  try {
    const updated = await Users.update(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ error: "User not found" });
    // Poser/renouveler le cookie HttpOnly pour le token si fourni
    const idToken = req.body?.idToken || req.body?.id_token;
    if (idToken) {
      res.cookie('token', String(idToken), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/',
      });
    }
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(normalizeUtf8(updated));
  } catch (e) { next(e); }
};

export const remove = async (req, res, next) => {
  try {
    await Users.remove(Number(req.params.id));
    res.status(204).send();
  } catch (e) { next(e); }
};

export const logout = async (req, res, next) => {
  try {
    const { email, id } = req.body || {};

    let user = null;
    if (id) {
      user = await Users.findById(Number(id));
    } else if (email) {
      user = await Users.findByEmail(email);
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    const updated = await Users.update(user.id, { session_status: "disconnected" });
    // Supprimer le cookie HttpOnly de session
    res.clearCookie('token', { path: '/' });
    res.set('Content-Type', 'application/json; charset=utf-8');
    res.json(normalizeUtf8({ success: true, user: updated }));
  } catch (e) { next(e); }
};