import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM devis_requests ORDER BY created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM devis_requests WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    user_id = null,
    full_name,
    email,
    phone = null,
    service_id = null,
    project_type = null,
    project_description,
    attachment_url = null,
    status = "reçu",
  } = data;

  const result = await query(
    `INSERT INTO devis_requests
     (user_id, full_name, email, phone, service_id, project_type, project_description, attachment_url, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, full_name, email, phone, service_id, project_type, project_description, attachment_url, status]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "user_id", "full_name", "email", "phone", "service_id",
    "project_type", "project_description", "attachment_url", "status"
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
  await query(`UPDATE devis_requests SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM devis_requests WHERE id = ?", [id]);
  return { success: true };
};