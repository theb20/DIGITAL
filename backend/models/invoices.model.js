import { query } from "../config/db.js";

export const Invoices = {
  async findAll() {
    return await query("SELECT * FROM invoices ORDER BY created_at DESC");
  },

  async findById(id) {
    const rows = await query("SELECT * FROM invoices WHERE id = ?", [id]);
    return rows?.[0] || null;
  },

  async create(data) {
    const {
      devis_submission_id = null,
      requester_email,
      client_name = null,
      amount,
      status = 'en_attente',
      issued_date = null,
      due_date = null,
      payment_link = null,
    } = data;

    const result = await query(
      `INSERT INTO invoices 
       (devis_submission_id, requester_email, client_name, amount, status, issued_date, due_date, payment_link)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [devis_submission_id, requester_email, client_name, amount, status, issued_date, due_date, payment_link]
    );
    return await this.findById(result.insertId);
  },

  async update(id, data) {
    const allowed = [
      'devis_submission_id','requester_email','client_name','amount','status','issued_date','due_date','sent_at','payment_link'
    ];
    const fields = [];
    const params = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return await this.findById(id);
    await query(`UPDATE invoices SET ${fields.join(', ')} WHERE id = ?`, [...params, id]);
    return await this.findById(id);
  },

  async remove(id) {
    await query(`DELETE FROM invoices WHERE id = ?`, [id]);
    return { success: true };
  },

  async setStatus(id, status) {
    await query(`UPDATE invoices SET status = ? WHERE id = ?`, [status, id]);
    return await this.findById(id);
  },

  async markSent(id, payment_link, sent_at = new Date()) {
    await query(`UPDATE invoices SET status = 'envoyée', payment_link = ?, sent_at = ? WHERE id = ?`, [payment_link, sent_at, id]);
    return await this.findById(id);
  }
  ,
  // Recherche par lien exact
  async getByPaymentLink(link) {
    const rows = await query(`SELECT * FROM invoices WHERE payment_link = ? LIMIT 1`, [link]);
    return rows?.[0] || null;
  },

  // Recherche par jeton: correspond aux liens se terminant par '/pay/<token>'
  async getByPaymentToken(token) {
    const like = `%/pay/${token}`;
    const rows = await query(`SELECT * FROM invoices WHERE payment_link LIKE ? LIMIT 1`, [like]);
    return rows?.[0] || null;
  }
};