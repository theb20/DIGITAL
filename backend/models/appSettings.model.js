import { query } from "../config/db.js";

export const ensureTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS app_settings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      setting_key VARCHAR(255) NOT NULL UNIQUE,
      setting_value LONGTEXT NOT NULL,
      setting_type ENUM('string','number','boolean','json','date') NOT NULL DEFAULT 'string',
      description TEXT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

export const findAll = async () => {
  return await query("SELECT * FROM app_settings ORDER BY updated_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM app_settings WHERE id = ?", [Number(id)]);
  return rows[0] || null;
};

export const findByKey = async (setting_key) => {
  const rows = await query("SELECT * FROM app_settings WHERE setting_key = ?", [setting_key]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    setting_key,
    setting_value = '',
    setting_type = 'string',
    description = null,
  } = data;

  const sql = `INSERT INTO app_settings (setting_key, setting_value, setting_type, description)
               VALUES (?, ?, ?, ?)`;
  const result = await query(sql, [setting_key, String(setting_value), setting_type, description]);
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const current = await findById(Number(id));
  if (!current) return null;

  const {
    setting_key = current.setting_key,
    setting_value = current.setting_value,
    setting_type = current.setting_type,
    description = current.description,
  } = data;

  const sql = `UPDATE app_settings SET 
    setting_key = ?,
    setting_value = ?,
    setting_type = ?,
    description = ?,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = ?`;

  await query(sql, [setting_key, String(setting_value), setting_type, description, Number(id)]);
  return await findById(Number(id));
};

export const remove = async (id) => {
  await query("DELETE FROM app_settings WHERE id = ?", [Number(id)]);
};