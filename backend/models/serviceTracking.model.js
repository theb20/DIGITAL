import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM service_tracking ORDER BY created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM service_tracking WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    tracking_code,
    request_id,
    user_id,
    provider_id,
    progress_percent = 0,
    current_status = "demande_validee",
  } = data;

  const result = await query(
    `INSERT INTO service_tracking
     (tracking_code, request_id, user_id, provider_id, progress_percent, current_status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [tracking_code, request_id, user_id, provider_id, progress_percent, current_status]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = ["tracking_code", "request_id", "user_id", "provider_id", "progress_percent", "current_status"];
  const fields = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (fields.length === 0) return await findById(id);
  await query(`UPDATE service_tracking SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM service_tracking WHERE id = ?", [id]);
  return { success: true };
};