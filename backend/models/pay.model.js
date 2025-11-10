import { query } from "../config/db.js";

export const PaymentModel = {
  async getColumns() {
    try {
      const rows = await query(`SHOW COLUMNS FROM payments`);
      // rows: [{ Field, Type, Null, Key, Default, Extra }]
      return Array.isArray(rows) ? rows : [];
    } catch {
      return [];
    }
  },

  async create({ user_id, service_id = null, id_devis_submissions = null, payment_link }) {
    // Construire dynamiquement l'INSERT selon les colonnes disponibles et leurs contraintes
    const cols = await this.getColumns();
    const has = (name) => cols.some(c => c.Field === name);
    const allowsNull = (name) => cols.some(c => c.Field === name && String(c.Null).toUpperCase() === 'YES');

    const fields = [];
    const params = [];

    if (has('user_id')) {
      fields.push('user_id');
      params.push(user_id ?? 0);
    }

    if (has('service_id')) {
      // Si NOT NULL et valeur absente, fournir une valeur par défaut (0)
      const val = service_id !== undefined && service_id !== null
        ? service_id
        : (allowsNull('service_id') ? null : 0);
      // Si la colonne n'autorise pas NULL, éviter de passer null
      if (val !== null) {
        fields.push('service_id');
        params.push(val);
      }
    }

    if (has('id_devis_submissions')) {
      const val = id_devis_submissions !== undefined ? id_devis_submissions : null;
      if (val !== null || allowsNull('id_devis_submissions')) {
        fields.push('id_devis_submissions');
        params.push(val);
      }
    }

    if (has('payment')) {
      fields.push('payment');
      params.push(false);
    }

    if (has('payment_link')) {
      fields.push('payment_link');
      params.push(payment_link);
    }

    if (fields.length === 0) {
      throw new Error('La table payments ne contient pas les colonnes nécessaires');
    }

    const placeholders = fields.map(() => '?').join(', ');
    const sql = `INSERT INTO payments (${fields.join(', ')}) VALUES (${placeholders})`;
    return await query(sql, params);
  },

  async getByLink(link) {
    return await query(
      `SELECT * FROM payments WHERE payment_link = ? LIMIT 1`,
      [link]
    );
  },

  // Recherche robuste par jeton: peu importe le domaine base, correspond à '/pay/<token>'
  async getByToken(token) {
    // Cherche les liens se terminant par '/pay/<token>'
    const like = `%/pay/${token}`;
    return await query(
      `SELECT * FROM payments WHERE payment_link LIKE ? LIMIT 1`,
      [like]
    );
  },

  async confirmPayment(id) {
    // Mise à jour atomique: ne confirme que si non-confirmé
    return await query(
      `UPDATE payments SET payment = true WHERE id = ? AND (payment IS NULL OR payment = false)`,
      [id]
    );
  },

  async findAll() {
    return await query(`SELECT * FROM payments ORDER BY created_at DESC`);
  },

  async findById(id) {
    const rows = await query(`SELECT * FROM payments WHERE id = ?`, [id]);
    return rows?.[0] || null;
  },

  async update(id, data) {
    const allowed = ["user_id", "service_id", "id_devis_submissions", "payment", "payment_link"];
    const fields = [];
    const params = [];
    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        params.push(data[key]);
      }
    }
    if (fields.length === 0) return await this.findById(id);
    await query(`UPDATE payments SET ${fields.join(", ")} WHERE id = ?`, [...params, id]);
    return await this.findById(id);
  },

  async remove(id) {
    await query(`DELETE FROM payments WHERE id = ?`, [id]);
    return { success: true };
  }
};
