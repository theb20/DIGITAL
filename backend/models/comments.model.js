import { query } from "../config/db.js";

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

async function fkExists(table, column) {
  const rows = await query(
    `SELECT COUNT(*) as cnt
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
       AND REFERENCED_TABLE_NAME IS NOT NULL`,
    [table, column]
  );
  return (rows?.[0]?.cnt || 0) > 0;
}

async function isColumnNullable(table, column) {
  const rows = await query(
    `SELECT IS_NULLABLE as is_null
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );
  const val = rows?.[0]?.is_null;
  return String(val).toUpperCase() === 'YES';
}

export const ensureBlogLink = async () => {
  // Ajoute la colonne blog_id et la contrainte si manquantes
  const hasColumn = await columnExists("comments", "blog_id");
  if (!hasColumn) {
    await query("ALTER TABLE comments ADD COLUMN blog_id BIGINT UNSIGNED NULL AFTER service_id");
    await query("ALTER TABLE comments ADD INDEX idx_comments_blog_id (blog_id)");
  }
  const hasFk = await fkExists("comments", "blog_id");
  if (!hasFk) {
    // Crée la clé étrangère sur blogs(id)
    await query(
      "ALTER TABLE comments ADD CONSTRAINT fk_comments_blog_id FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE SET NULL ON UPDATE CASCADE"
    );
  }

  // S'assurer que service_id est nullable (pour les commentaires de blog)
  const serviceIdExists = await columnExists("comments", "service_id");
  if (serviceIdExists) {
    const nullable = await isColumnNullable("comments", "service_id");
    if (!nullable) {
      await query("ALTER TABLE comments MODIFY COLUMN service_id BIGINT UNSIGNED NULL");
    }
  }
};

// Table des réactions (likes/dislikes) par utilisateur
async function tableExists(table) {
  const rows = await query(
    `SELECT COUNT(*) as cnt FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [table]
  );
  return (rows?.[0]?.cnt || 0) > 0;
}

export const ensureReactionsTable = async () => {
  const exists = await tableExists("comment_reactions");
  if (!exists) {
    await query(`
      CREATE TABLE comment_reactions (
        id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        comment_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        reaction ENUM('like','dislike') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uniq_comment_user (comment_id, user_id),
        KEY idx_comment (comment_id),
        KEY idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
    // Liaisons FK (best-effort)
    try { await query(`ALTER TABLE comment_reactions ADD CONSTRAINT fk_react_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE ON UPDATE CASCADE`); } catch {}
    try { await query(`ALTER TABLE comment_reactions ADD CONSTRAINT fk_react_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE`); } catch {}
  }
};

export const findAll = async () => {
  return await query(
    `SELECT c.*, 
            COALESCE(
              NULLIF(CONCAT_WS(' ', NULLIF(TRIM(u.first_name), ''), NULLIF(TRIM(u.last_name), '')), ''),
              NULLIF(TRIM(u.name), ''),
              NULLIF(TRIM(u.first_name), ''),
              NULLIF(TRIM(u.email), '')
            ) AS author_name,
            u.avatar AS avatar_url
     FROM comments c
     LEFT JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC`
  );
};

export const findById = async (id) => {
  const rows = await query(
    `SELECT c.*, 
            COALESCE(
              NULLIF(CONCAT_WS(' ', NULLIF(TRIM(u.first_name), ''), NULLIF(TRIM(u.last_name), '')), ''),
              NULLIF(TRIM(u.name), ''),
              NULLIF(TRIM(u.email), '')
            ) AS author_name,
            u.avatar AS avatar_url
     FROM comments c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.id = ?`,
    [id]
  );
  return rows[0] || null;
};

export const findByBlogId = async (blogId) => {
  return await query(
    `SELECT c.*, 
            COALESCE(
              NULLIF(CONCAT_WS(' ', NULLIF(TRIM(u.first_name), ''), NULLIF(TRIM(u.last_name), '')), ''),
              NULLIF(TRIM(u.name), ''),
              NULLIF(TRIM(u.email), '')
            ) AS author_name,
            u.avatar AS avatar_url
     FROM comments c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.blog_id = ?
     ORDER BY c.created_at DESC`,
    [blogId]
  );
};

export const findByServiceId = async (serviceId) => {
  return await query(
    `SELECT c.*, 
            COALESCE(
              NULLIF(CONCAT_WS(' ', NULLIF(TRIM(u.first_name), ''), NULLIF(TRIM(u.last_name), '')), ''),
              NULLIF(TRIM(u.name), ''),
              NULLIF(TRIM(u.email), '')
            ) AS author_name,
            u.avatar AS avatar_url
     FROM comments c
     LEFT JOIN users u ON u.id = c.user_id
     WHERE c.service_id = ?
     ORDER BY c.created_at DESC`,
    [serviceId]
  );
};

export const create = async (data) => {
  const {
    service_id,
    blog_id = null,
    user_id,
    rating,
    review,
    likes = 0,
    dislikes = 0
  } = data;

  const result = await query(
    `INSERT INTO comments
     (service_id, blog_id, user_id, rating, review, likes, dislikes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [service_id, blog_id, user_id, rating, review, likes, dislikes]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = ["service_id", "blog_id", "user_id", "rating", "review", "likes", "dislikes"];
  const fields = [];
  const params = [];
  for (const key of allowed) {
    if (data[key] !== undefined) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (fields.length === 0) return await findById(id);
  await query(`UPDATE comments SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM comments WHERE id = ?", [id]);
  return { success: true };
};

// Applique une réaction like/dislike pour un utilisateur donné, avec bascule et mise à jour des compteurs
export const react = async (commentId, userId, reaction) => {
  await ensureReactionsTable();
  const rows = await query("SELECT reaction FROM comment_reactions WHERE comment_id = ? AND user_id = ?", [commentId, userId]);
  const existing = rows[0]?.reaction || null;

  if (existing === reaction) {
    // Retirer la réaction (toggle off)
    await query("DELETE FROM comment_reactions WHERE comment_id = ? AND user_id = ?", [commentId, userId]);
    if (reaction === 'like') {
      await query("UPDATE comments SET likes = GREATEST(COALESCE(likes,0) - 1, 0) WHERE id = ?", [commentId]);
    } else {
      await query("UPDATE comments SET dislikes = GREATEST(COALESCE(dislikes,0) - 1, 0) WHERE id = ?", [commentId]);
    }
    const updated = await findById(commentId);
    return { ...updated, userReaction: null };
  }

  if (!existing) {
    // Nouvelle réaction
    await query("INSERT INTO comment_reactions (comment_id, user_id, reaction) VALUES (?, ?, ?)", [commentId, userId, reaction]);
    if (reaction === 'like') {
      await query("UPDATE comments SET likes = COALESCE(likes,0) + 1 WHERE id = ?", [commentId]);
    } else {
      await query("UPDATE comments SET dislikes = COALESCE(dislikes,0) + 1 WHERE id = ?", [commentId]);
    }
    const updated = await findById(commentId);
    return { ...updated, userReaction: reaction };
  }

  // Changement de réaction
  await query("UPDATE comment_reactions SET reaction = ? WHERE comment_id = ? AND user_id = ?", [reaction, commentId, userId]);
  if (existing === 'like') {
    await query("UPDATE comments SET likes = GREATEST(COALESCE(likes,0) - 1, 0) WHERE id = ?", [commentId]);
  } else {
    await query("UPDATE comments SET dislikes = GREATEST(COALESCE(dislikes,0) - 1, 0) WHERE id = ?", [commentId]);
  }
  if (reaction === 'like') {
    await query("UPDATE comments SET likes = COALESCE(likes,0) + 1 WHERE id = ?", [commentId]);
  } else {
    await query("UPDATE comments SET dislikes = COALESCE(dislikes,0) + 1 WHERE id = ?", [commentId]);
  }
  const updated = await findById(commentId);
  return { ...updated, userReaction: reaction };
};