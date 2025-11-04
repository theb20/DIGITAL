import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM service_categories ORDER BY created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM service_categories WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const { name, description = null, icon = null } = data;
  const result = await query(
    "INSERT INTO service_categories (name, description, icon) VALUES (?, ?, ?)",
    [name, description, icon]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = ["name", "description", "icon"];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }

  if (fields.length === 0) return await findById(id);

  await query(`UPDATE service_categories SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM service_categories WHERE id = ?", [id]);
  return { success: true };
};