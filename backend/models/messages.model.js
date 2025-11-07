import { query } from "../config/db.js";

const TABLE = "messages";

async function ensureTable() {
  await query(
    `CREATE TABLE IF NOT EXISTS ${TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      subject VARCHAR(255) NOT NULL,
      body TEXT NOT NULL,
      sender_name VARCHAR(255) NULL,
      sender_email VARCHAR(255) NULL,
      recipient_name VARCHAR(255) NULL,
      recipient_email VARCHAR(255) NULL,
      status VARCHAR(32) NOT NULL DEFAULT 'non_lu',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
  );
}

export async function list(filters = {}) {
  await ensureTable();
  const sqlParts = [
    `SELECT * FROM ${TABLE} WHERE 1=1`
  ];
  const params = [];

  if (filters.q) {
    sqlParts.push("AND (subject LIKE ? OR body LIKE ?)");
    const like = `%${filters.q}%`;
    params.push(like, like);
  }
  if (filters.status) {
    sqlParts.push("AND status = ?");
    params.push(filters.status);
  }
  if (filters.participant) {
    sqlParts.push("AND (sender_email LIKE ? OR recipient_email LIKE ?)");
    const like = `%${filters.participant}%`;
    params.push(like, like);
  }
  if (filters.from_date) {
    sqlParts.push("AND created_at >= ?");
    params.push(filters.from_date);
  }
  if (filters.to_date) {
    sqlParts.push("AND created_at <= ?");
    params.push(filters.to_date);
  }

  sqlParts.push("ORDER BY created_at DESC");
  // MySQL 5.7 server-side prepared statements can error on LIMIT/OFFSET bind.
  // To avoid 'Incorrect arguments to mysqld_stmt_execute', inline validated integers.
  const hasLimit = Number.isFinite(Number(filters.limit)) && Number(filters.limit) > 0;
  const hasOffset = Number.isFinite(Number(filters.offset)) && Number(filters.offset) > 0;
  if (hasLimit && hasOffset) {
    sqlParts.push(`LIMIT ${Number(filters.limit)} OFFSET ${Number(filters.offset)}`);
  } else if (hasLimit) {
    sqlParts.push(`LIMIT ${Number(filters.limit)}`);
  } else if (hasOffset) {
    // Provide a large default limit when only offset is set, to keep syntax valid
    sqlParts.push(`LIMIT 18446744073709551615 OFFSET ${Number(filters.offset)}`);
  }

  const rows = await query(sqlParts.join(" "), params);
  return rows;
}

export async function get(id) {
  await ensureTable();
  const rows = await query(`SELECT * FROM ${TABLE} WHERE id = ?`, [id]);
  return rows[0] || null;
}

export async function create(data) {
  await ensureTable();
  const {
    subject,
    body,
    sender_name = null,
    sender_email = null,
    recipient_name = null,
    recipient_email = null,
    status = "non_lu",
  } = data;
  const result = await query(
    `INSERT INTO ${TABLE} (subject, body, sender_name, sender_email, recipient_name, recipient_email, status)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [subject, body, sender_name, sender_email, recipient_name, recipient_email, status]
  );
  return await get(result.insertId);
}

export async function update(id, data) {
  await ensureTable();
  const fields = [];
  const params = [];
  const allowed = [
    "subject","body","sender_name","sender_email","recipient_name","recipient_email","status"
  ];
  for (const k of allowed) {
    if (data[k] !== undefined) {
      fields.push(`${k} = ?`);
      params.push(data[k]);
    }
  }
  if (fields.length === 0) return await get(id);
  params.push(id);
  await query(`UPDATE ${TABLE} SET ${fields.join(", ")} WHERE id = ?`, params);
  return await get(id);
}

export async function remove(id) {
  await ensureTable();
  await query(`DELETE FROM ${TABLE} WHERE id = ?`, [id]);
  return true;
}