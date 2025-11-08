import { query } from "../config/db.js";

export const ensureTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS profiles (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NULL,
      subtitle TEXT NULL,
      banner_url VARCHAR(512) NULL,
      stats_json JSON NOT NULL,
      services_json JSON NOT NULL,
      values_json JSON NOT NULL,
      team_json JSON NOT NULL,
      is_active TINYINT(1) NOT NULL DEFAULT 1,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
};

export const findAll = async () => {
  return await query("SELECT * FROM profiles ORDER BY updated_at DESC");
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM profiles WHERE id = ?", [Number(id)]);
  return rows[0] || null;
};

export const findActive = async () => {
  const rows = await query(
    "SELECT * FROM profiles WHERE is_active = 1 ORDER BY updated_at DESC, id DESC LIMIT 1"
  );
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    title = '',
    subtitle = '',
    banner_url = '',
    stats_json = [],
    services_json = [],
    values_json = [],
    team_json = [],
    is_active = 1,
  } = data;

  const sql = `INSERT INTO profiles (title, subtitle, banner_url, stats_json, services_json, values_json, team_json, is_active)
               VALUES (?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), ?)`;
  const result = await query(sql, [
    title,
    subtitle,
    banner_url,
    JSON.stringify(stats_json ?? []),
    JSON.stringify(services_json ?? []),
    JSON.stringify(values_json ?? []),
    JSON.stringify(team_json ?? []),
    Number(is_active) ? 1 : 0,
  ]);
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "title","subtitle","banner_url","stats_json","services_json","values_json","team_json","is_active"
  ];
  const fields = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      if (["stats_json","services_json","values_json","team_json"].includes(key)) {
        fields.push(`${key} = CAST(? AS JSON)`);
        params.push(JSON.stringify(data[key] ?? []));
      } else {
        fields.push(`${key} = ?`);
        params.push(key === 'is_active' ? (Number(data[key]) ? 1 : 0) : data[key]);
      }
    }
  }
  if (fields.length === 0) return await findById(id);
  await query(`UPDATE profiles SET ${fields.join(", ")} WHERE id = ?`, [...params, Number(id)]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM profiles WHERE id = ?", [Number(id)]);
  return { success: true };
};