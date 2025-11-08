import { query } from "../config/db.js";

const allowedChannels = new Set(["call", "video", "onsite", "chat", "email"]);

const normalizeChannel = (val) => {
  if (!val) return null;
  const v = String(val).toLowerCase().trim();
  const map = {
    phone: "call",
    telephone: "call",
    tel: "call",
    call: "call",
    visio: "video",
    video: "video",
    visioconference: "video",
    whatsapp: "chat",
    sms: "chat",
    chat: "chat",
    onsite: "onsite",
    sursite: "onsite",
    presentiel: "onsite",
    "présentiel": "onsite",
    email: "email",
    mail: "email",
  };
  const normalized = map[v] || (allowedChannels.has(v) ? v : null);
  return normalized;
};

export const findAll = async () => {
  return await query("SELECT * FROM appointments ORDER BY appointment_date DESC, created_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM appointments WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    user_id = null,
    full_name,
    email,
    phone = null,
    service_id = null,
    appointment_date,
    channel = null,
    notes = null,
    status = "pending",
  } = data;

  const safeChannel = normalizeChannel(channel);

  const result = await query(
    `INSERT INTO appointments
     (user_id, full_name, email, phone, service_id, appointment_date, channel, notes, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [user_id, full_name, email, phone, service_id, appointment_date, safeChannel, notes, status]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "user_id", "full_name", "email", "phone", "service_id",
    "appointment_date", "channel", "notes", "status"
  ];
  const fields = [];
  const params = [];
  const sanitized = { ...data };
  if (sanitized.channel !== undefined) {
    sanitized.channel = normalizeChannel(sanitized.channel);
  }
  for (const key of allowed) {
    if (sanitized[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(sanitized[key]);
    }
  }
  if (fields.length === 0) return await findById(id);
  await query(`UPDATE appointments SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM appointments WHERE id = ?", [id]);
  return { success: true };
};