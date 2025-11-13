import { query } from "../config/db.js";

export const ensureTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS promos (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NULL,
      subtitle TEXT NULL,
      img_url VARCHAR(1024) NULL,
      billing_cycle_default ENUM('annual','monthly') NOT NULL DEFAULT 'annual',
      timer_end_at DATETIME NULL,
      plans_json JSON NOT NULL,
      comparison_json JSON NOT NULL,
      enterprise_features_json JSON NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  // Ajoute la colonne img_url si la table existante ne la contient pas déjà
  try {
    await query(`ALTER TABLE promos ADD COLUMN img_url VARCHAR(1024) NULL`);
  } catch (_) {
    // Ignore si la colonne existe déjà
  }
};

export const findAll = async () => {
  return await query("SELECT * FROM promos ORDER BY updated_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM promos WHERE id = ?", [id]);
  return rows[0] || null;
};

export const findActive = async () => {
  const rows = await query("SELECT * FROM promos WHERE is_active = 1 ORDER BY updated_at DESC LIMIT 1");
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    title = null,
    subtitle = null,
    img_url = null,
    billing_cycle_default = 'annual',
    timer_end_at = null,
    plans_json,
    comparison_json,
    enterprise_features_json,
    is_active = 1,
  } = data;

  const sql = `INSERT INTO promos (title, subtitle, img_url, billing_cycle_default, timer_end_at, plans_json, comparison_json, enterprise_features_json, is_active)
               VALUES (?, ?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), ?)`;
  const result = await query(sql, [
    title,
    subtitle,
    img_url,
    billing_cycle_default,
    timer_end_at,
    JSON.stringify(plans_json),
    JSON.stringify(comparison_json),
    JSON.stringify(enterprise_features_json),
    is_active,
  ]);
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const current = await findById(Number(id));
  if (!current) return null;

  const {
    title = current.title,
    subtitle = current.subtitle,
    img_url = current.img_url,
    billing_cycle_default = current.billing_cycle_default,
    timer_end_at = current.timer_end_at,
    plans_json = current.plans_json,
    comparison_json = current.comparison_json,
    enterprise_features_json = current.enterprise_features_json,
    is_active = current.is_active,
  } = data;

  const sql = `UPDATE promos SET 
    title = ?,
    subtitle = ?,
    img_url = ?,
    billing_cycle_default = ?,
    timer_end_at = ?,
    plans_json = CAST(? AS JSON),
    comparison_json = CAST(? AS JSON),
    enterprise_features_json = CAST(? AS JSON),
    is_active = ?
  WHERE id = ?`;

  await query(sql, [
    title,
    subtitle,
    img_url,
    billing_cycle_default,
    timer_end_at,
    JSON.stringify(plans_json),
    JSON.stringify(comparison_json),
    JSON.stringify(enterprise_features_json),
    is_active,
    Number(id)
  ]);
  return await findById(Number(id));
};

export const remove = async (id) => {
  await query("DELETE FROM promos WHERE id = ?", [Number(id)]);
};