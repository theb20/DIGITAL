import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM contact ORDER BY created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM contact WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    full_name,
    email,
    phone = null,
    startup = null,
    subject = null,
    message
  } = data;

  const result = await query(
    `INSERT INTO contact 
    (full_name, email, phone, startup, subject, message)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [full_name, email, phone, startup, subject, message]
  );

  return await findById(result.insertId);
};

export const remove = async (id) => {
  await query("DELETE FROM contact WHERE id = ?", [id]);
  return { success: true };
};