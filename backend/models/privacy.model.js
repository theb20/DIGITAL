import { query } from "../config/db.js";

export const findAll = async () => {
  return await query("SELECT * FROM privacy_page ORDER BY display_order");
};

export const findSections = async () => {
  return await query(
    `SELECT DISTINCT section_number, section_title, section_icon, section_badge
     FROM privacy_page
     ORDER BY section_number`
  );
};

export const findBySection = async (sectionNumber) => {
  return await query(
    `SELECT * FROM privacy_page
     WHERE section_number = ?
     ORDER BY display_order`,
    [sectionNumber]
  );
};

export const findById = async (id) => {
  const rows = await query("SELECT * FROM privacy_page WHERE id = ?", [id]);
  return rows[0] || null;
};

export const create = async (data) => {
  const {
    section_number,
    section_title,
    section_icon = null,
    section_badge = null,
    content_title = null,
    content_text = null,
    display_order
  } = data;

  const result = await query(
    `INSERT INTO privacy_page 
    (section_number, section_title, section_icon, section_badge, content_title, content_text, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [section_number, section_title, section_icon, section_badge, content_title, content_text, display_order]
  );

  return await findById(result.insertId);
};

export const update = async (id, data) => {
  const allowed = [
    "section_number", "section_title", "section_icon", "section_badge",
    "content_title", "content_text", "display_order"
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

  await query(`UPDATE privacy_page SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
  return await findById(id);
};

export const remove = async (id) => {
  await query("DELETE FROM privacy_page WHERE id = ?", [id]);
  return { success: true };
};