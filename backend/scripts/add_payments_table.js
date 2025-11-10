import { query, testConnection } from "../config/db.js";

const createTableSQL = `
CREATE TABLE IF NOT EXISTS payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  service_id INT NULL,
  id_devis_submissions INT NULL,
  payment BOOLEAN DEFAULT FALSE,
  payment_link VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;

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

export async function up() {
  await testConnection();
  await query(createTableSQL);

  // Assurer que service_id est nullable (lien soit service, soit devis)
  try {
    await query(`ALTER TABLE payments MODIFY COLUMN service_id INT NULL`);
  } catch (_) { /* ignore */ }

  // Ajouter colonne id_devis_submissions si manquante
  const hasDevisCol = await columnExists('payments', 'id_devis_submissions');
  if (!hasDevisCol) {
    try {
      await query(`ALTER TABLE payments ADD COLUMN id_devis_submissions INT NULL`);
    } catch (e) {
      console.warn('⚠️ Impossible d\'ajouter id_devis_submissions:', e?.message || e);
    }
  }

  // Index pour requêtes
  try { await query(`CREATE INDEX IF NOT EXISTS idx_pay_devis ON payments(id_devis_submissions)`); } catch (_) { /* MySQL <8 ignore */ }
  try { await query(`CREATE INDEX IF NOT EXISTS idx_pay_service ON payments(service_id)`); } catch (_) { /* MySQL <8 ignore */ }

  return { message: "Table payments migrée/assurée (colonnes et index)." };
}

if (process.argv[1] && process.argv[1].includes('add_payments_table.js')) {
  (async () => {
    try {
      await up();
      console.log('✅ Table payments prête');
      process.exit(0);
    } catch (e) {
      console.error('❌ Erreur création table payments:', e?.message || e);
      process.exit(1);
    }
  })();
}