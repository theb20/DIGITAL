import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM comments ORDER BY created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM comments WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    service_id,
    user_id,
    rating,
    review,
    likes = 0,
    dislikes = 0
  } = data;

  const result = await query(
    `INSERT INTO comments
     (service_id, user_id, rating, review, likes, dislikes)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [service_id, user_id, rating, review, likes, dislikes]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = ["service_id", "user_id", "rating", "review", "likes", "dislikes"];
  const fields = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (fields.length === 0) return await findById(id);
  await query(`UPDATE comments SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM comments WHERE id = ?", [id]);
  return { success: true };
};