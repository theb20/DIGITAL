import { query } from "../config/db.js";
import * as Categories from "./serviceCategories.model.js";

// Helpers pour compatibilité MySQL 5.7 (pas de IF NOT EXISTS sur ALTER)
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

async function indexExists(table, indexName) {
  const rows = await query(
    `SELECT COUNT(*) as cnt
     FROM information_schema.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?`,
    [table, indexName]
  );
  return (rows?.[0]?.cnt || 0) > 0;
}

async function ensureIndex(table, indexName, alterSql) {
  const exists = await indexExists(table, indexName);
  if (!exists) {
    await query(alterSql);
  }
}

// Assure la présence/évolution du schéma de la table services
export const ensureTable = async () => {
  // S'assurer que la table des catégories existe avant la FK
  if (Categories.ensureTable) {
    await Categories.ensureTable();
  }

  // Création si elle n'existe pas (schéma fourni)
  await query(`
    CREATE TABLE IF NOT EXISTS services (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      category_id BIGINT UNSIGNED NOT NULL,

      title VARCHAR(150) NOT NULL,
      description TEXT,

      duration VARCHAR(50) DEFAULT NULL,
      price DECIMAL(10,2) DEFAULT NULL,
      price_type ENUM('fixe', 'sur_devis') DEFAULT 'sur_devis',

      featured BOOLEAN DEFAULT FALSE,
      rating DECIMAL(2,1) DEFAULT NULL,
      review_count INT DEFAULT 0,
      provider VARCHAR(150) DEFAULT NULL,
      provider_rating DECIMAL(2,1) DEFAULT NULL,
      in_stock BOOLEAN DEFAULT TRUE,
      guarantee BOOLEAN DEFAULT FALSE,
      original_price DECIMAL(10,2) DEFAULT NULL,
      discount INT DEFAULT NULL,

      image_url VARCHAR(255) DEFAULT NULL,
      cover_url VARCHAR(255) DEFAULT NULL,

      is_active BOOLEAN DEFAULT TRUE,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

      FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
      INDEX idx_category(category_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
  `);

  // Ajout incrémental des colonnes manquantes (compat MySQL 5.7)
  await ensureColumn(
    "services",
    "featured",
    "ALTER TABLE services ADD COLUMN featured TINYINT(1) DEFAULT 0"
  );
  await ensureColumn(
    "services",
    "rating",
    "ALTER TABLE services ADD COLUMN rating DECIMAL(2,1) DEFAULT NULL"
  );
  await ensureColumn(
    "services",
    "review_count",
    "ALTER TABLE services ADD COLUMN review_count INT DEFAULT 0"
  );
  await ensureColumn(
    "services",
    "provider",
    "ALTER TABLE services ADD COLUMN provider VARCHAR(150) DEFAULT NULL"
  );
  await ensureColumn(
    "services",
    "provider_rating",
    "ALTER TABLE services ADD COLUMN provider_rating DECIMAL(2,1) DEFAULT NULL"
  );
  await ensureColumn(
    "services",
    "in_stock",
    "ALTER TABLE services ADD COLUMN in_stock TINYINT(1) DEFAULT 1"
  );
  await ensureColumn(
    "services",
    "guarantee",
    "ALTER TABLE services ADD COLUMN guarantee TINYINT(1) DEFAULT 0"
  );
  await ensureColumn(
    "services",
    "original_price",
    "ALTER TABLE services ADD COLUMN original_price DECIMAL(10,2) DEFAULT NULL"
  );
  await ensureColumn(
    "services",
    "discount",
    "ALTER TABLE services ADD COLUMN discount INT DEFAULT NULL"
  );
  await ensureColumn(
    "services",
    "cover_url",
    "ALTER TABLE services ADD COLUMN cover_url VARCHAR(255) DEFAULT NULL"
  );
  await ensureColumn(
    "services",
    "updated_at",
    "ALTER TABLE services ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );

  // Champs de contenu structurés pour la fiche service
  await ensureColumn(
    "services",
    "features",
    "ALTER TABLE services ADD COLUMN features TEXT DEFAULT NULL"
  );
  await ensureColumn(
    "services",
    "deliverables",
    "ALTER TABLE services ADD COLUMN deliverables TEXT DEFAULT NULL"
  );

  // Index
  await ensureIndex(
    "services",
    "idx_category",
    "ALTER TABLE services ADD INDEX idx_category (category_id)"
  );
};

// Helper: parse JSON safe en tableau
function parseJsonArray(raw) {
  try {
    if (raw == null) return [];
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(v) ? v : [];
  } catch { return []; }
}

export const findAll = async () => {
  const rows = await query("SELECT * FROM services ORDER BY created_at DESC");
  return (rows || []).map(r => ({
    ...r,
    features: parseJsonArray(r.features),
    deliverables: parseJsonArray(r.deliverables),
  }));
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM services WHERE id = ?", [id]);
  const r = rows[0] || null;
  if (!r) return null;
  return {
    ...r,
    features: parseJsonArray(r.features),
    deliverables: parseJsonArray(r.deliverables),
  };
};

export const create = async (data) => {
  const {
    category_id,
    title,
    description = null,
    duration = null,
    price = null,
    price_type = "sur_devis",
    featured = false,
    rating = null,
    review_count = 0,
    provider = null,
    provider_rating = null,
    in_stock = true,
    guarantee = false,
    original_price = null,
    discount = null,
    image_url = null,
    cover_url = null,
    is_active = true,
    features = [],
    deliverables = [],
  } = data;

  const result = await query(
    `INSERT INTO services 
     (category_id, title, description, duration, price, price_type,
      featured, rating, review_count, provider, provider_rating, in_stock, guarantee, original_price, discount,
      image_url, cover_url, is_active, features, deliverables)
     VALUES (?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?)`,
    [category_id, title, description, duration, price, price_type,
     featured, rating, review_count, provider, provider_rating, in_stock, guarantee, original_price, discount,
     image_url, cover_url, is_active,
     (Array.isArray(features) ? JSON.stringify(features) : (features ?? null)),
     (Array.isArray(deliverables) ? JSON.stringify(deliverables) : (deliverables ?? null))]
  );

  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "category_id", "title", "description", "duration",
    "price", "price_type",
    "featured", "rating", "review_count", "provider", "provider_rating", "in_stock", "guarantee", "original_price", "discount",
    "image_url", "cover_url", "is_active", "features", "deliverables"
  ];
  const fields = [];
  const params = [];

  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      let value = data[key];
      if (key === 'features' || key === 'deliverables') {
        value = Array.isArray(value) || typeof value === 'object' ? JSON.stringify(value) : (value ?? null);
      }
      params.push(value);
    }
  }
  if (fields.length === 0) return await findById(id);

  await query(`UPDATE services SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM services WHERE id = ?", [id]);
  return { success: true };
};

export const bulkCreate = async (items) => {
  const results = [];
  const errors = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    try {
      const created = await create(item);
      results.push(created);
    } catch (err) {
      errors.push({ index: i, error: err.message });
    }
  }
  return { results, errors };
};