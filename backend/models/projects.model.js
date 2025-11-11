import { query } from "../config/db.js";

// Helpers pour champs JSON/texte
const parseTags = (val) => {
  if (val === null || val === undefined) return null;
  if (typeof val === "string") {
    try { return JSON.parse(val); } catch { return val; }
  }
  return val;
};

const normalizeTags = (tags) => {
  if (tags === null || tags === undefined) return null;
  if (typeof tags === "string") return tags;
  return JSON.stringify(tags);
};

const sanitizeRow = (row) => ({
  ...row,
  tags: parseTags(row.tags)
});

// Vérifications d'existence colonnes/index (compat MySQL 5.7)
async function columnExists(table, column) {
  const rows = await query(
    `SELECT COUNT(*) as cnt
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );
  return (rows?.[0]?.cnt || 0) > 0;
}

async function ensureColumn(table, column, alterSql) {
  const exists = await columnExists(table, column);
  if (!exists) {
    await query(alterSql);
  }
}

export const ensureTable = async () => {
  await query(`
    CREATE TABLE IF NOT EXISTS projects (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      category VARCHAR(100) NOT NULL,
      description TEXT,
      image_url VARCHAR(255) DEFAULT NULL,
      client VARCHAR(150) DEFAULT NULL,
      year VARCHAR(10) DEFAULT NULL,
      tags TEXT DEFAULT NULL,
      deliverable_url TEXT DEFAULT NULL,
      deliverable_message TEXT DEFAULT NULL,
      deliverable_sent_at TIMESTAMP NULL DEFAULT NULL,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  await ensureColumn(
    "projects",
    "is_active",
    "ALTER TABLE projects ADD COLUMN is_active TINYINT(1) DEFAULT 1"
  );
  await ensureColumn(
    "projects",
    "updated_at",
    "ALTER TABLE projects ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );
  await ensureColumn(
    "projects",
    "deliverable_url",
    "ALTER TABLE projects ADD COLUMN deliverable_url TEXT DEFAULT NULL"
  );
  await ensureColumn(
    "projects",
    "deliverable_message",
    "ALTER TABLE projects ADD COLUMN deliverable_message TEXT DEFAULT NULL"
  );
  await ensureColumn(
    "projects",
    "deliverable_sent_at",
    "ALTER TABLE projects ADD COLUMN deliverable_sent_at TIMESTAMP NULL DEFAULT NULL"
  );
};

export const findAll = async () => {
  const rows = await query("SELECT * FROM projects WHERE is_active = 1 ORDER BY created_at DESC");
  return rows.map(sanitizeRow);
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM projects WHERE id = ?", [id]);
  return rows[0] ? sanitizeRow(rows[0]) : null;
};

export const create = async (data) => {
  const {
    title,
    category,
    description = null,
    image_url = null,
    client = null,
    year = null,
    tags = null,
    deliverable_url = null,
    deliverable_message = null,
    deliverable_sent_at = null,
    is_active = true,
  } = data;

  const result = await query(
    `INSERT INTO projects (title, category, description, image_url, client, year, tags, deliverable_url, deliverable_message, deliverable_sent_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, category, description, image_url, client, year, normalizeTags(tags), deliverable_url, deliverable_message, deliverable_sent_at, is_active]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "title", "category", "description", "image_url", "client", "year", "tags", "deliverable_url", "deliverable_message", "deliverable_sent_at", "is_active"
  ];
  const fields = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      const value = key === "tags" ? normalizeTags(data[key]) : data[key];
      fields.push(`${key} = ?`);
      params.push(value);
    }
  }
  if (fields.length === 0) return await findById(id);
  await query(`UPDATE projects SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM projects WHERE id = ?", [id]);
  return { success: true };
};