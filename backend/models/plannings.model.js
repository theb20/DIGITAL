import { query } from "../config/db.js";

export const list = async () => {
  return await query("SELECT id, week_key, week_start, created_by, created_at FROM plannings ORDER BY created_at DESC");
};

export const findByWeekKey = async (weekKey) => {
  const rows = await query("SELECT * FROM plannings WHERE week_key = ? ORDER BY created_at DESC LIMIT 1", [weekKey]);
  return rows[0] || null;
};

export const create = async ({ week_key, week_start = null, data, recipients = null, created_by = null }) => {
  const result = await query(
    `INSERT INTO plannings (week_key, week_start, data, recipients, created_by)
     VALUES (?, ?, ?, ?, ?)`,
    [week_key, week_start, JSON.stringify(data), recipients ? JSON.stringify(recipients) : null, created_by]
  );
  const rows = await query("SELECT * FROM plannings WHERE id = ?", [result.insertId]);
  return rows[0] || null;
};