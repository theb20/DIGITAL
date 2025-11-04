import { query } from "../config/db.js";

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

const sanitizeBlogRow = (row) => ({
  ...row,
  tags: parseTags(row.tags)
});

export const findAll = async () => {
  const rows = await query("SELECT * FROM blogs ORDER BY published_date DESC, created_at DESC");
  return rows.map(sanitizeBlogRow);
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM blogs WHERE id = ?", [id]);
  return rows[0] ? sanitizeBlogRow(rows[0]) : null;
};

export const create = async (data) => {
  const {
    title,
    excerpt,
    content = null,
    author_name,
    author_role = null,
    author_avatar = null,
    image_url = null,
    published_date = null,
    read_time = null,
    views = 0,
    comment_count = 0,
    featured = false,
    trending = false,
    tags = null,
    category_id = null
  } = data;

  const result = await query(
    `INSERT INTO blogs
     (title, excerpt, content, author_name, author_role, author_avatar, image_url, published_date, read_time, views, comment_count, featured, trending, tags, category_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, excerpt, content, author_name, author_role, author_avatar, image_url, published_date, read_time, views, comment_count, featured, trending, normalizeTags(tags), category_id]
  );
  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "title","excerpt","content","author_name","author_role","author_avatar",
    "image_url","published_date","read_time","views","comment_count",
    "featured","trending","tags","category_id"
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
  await query(`UPDATE blogs SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM blogs WHERE id = ?", [id]);
  return { success: true };
};