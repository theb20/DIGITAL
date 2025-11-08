import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM users ORDER BY created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM users WHERE id = ?", [id]);
  return rows[0] || null;
};

export const findByEmail = async (email) => {
  const rows = await query("SELECT * FROM users WHERE email = ?", [email]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    first_name,
    last_name,
    position = null,
    email,
    provider,
    provider_id,
    role = "user",
    avatar = null,
    is_active = true,
    session_status = "disconnected",
    last_login = null
  } = data;

  const result = await query(
    `INSERT INTO users 
    (first_name, last_name, position, email, provider, provider_id, role, avatar, is_active, session_status, last_login)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [first_name, last_name, position, email, provider, provider_id, role, avatar, is_active, session_status, last_login]
  );

  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "first_name", "last_name", "position", "email", "provider", "provider_id",
    "role", "avatar", "is_active", "session_status", "last_login"
  ];

  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return await findById(id);

  await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM users WHERE id = ?", [id]);
  return { success: true };
};