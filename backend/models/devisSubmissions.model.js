import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM devis_submissions ORDER BY created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM devis_submissions WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    request_id,
    provider_id,
    estimation_amount,
    delivery_time = null,
    message = null,
    pdf_url = null,
    status = "envoyé",
  } = data;

  const result = await query(
    `INSERT INTO devis_submissions
     (request_id, provider_id, estimation_amount, delivery_time, message, pdf_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [request_id, provider_id, estimation_amount, delivery_time, message, pdf_url, status]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "request_id", "provider_id", "estimation_amount", "delivery_time",
    "message", "pdf_url", "status"
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
  await query(`UPDATE devis_submissions SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM devis_submissions WHERE id = ?", [id]);
  return { success: true };
};