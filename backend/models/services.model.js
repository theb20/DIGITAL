import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM services ORDER BY created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM services WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    category_id,
    title,
    description = null,
    duration = null,
    price = null,
    price_type = "sur_devis",
    image_url = null,
    is_active = true,
  } = data;

  const result = await query(
    `INSERT INTO services 
     (category_id, title, description, duration, price, price_type, image_url, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [category_id, title, description, duration, price, price_type, image_url, is_active]
  );

  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "category_id", "title", "description", "duration",
    "price", "price_type", "image_url", "is_active"
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

  await query(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM services WHERE id = ?", [id]);
  return { success: true };
};