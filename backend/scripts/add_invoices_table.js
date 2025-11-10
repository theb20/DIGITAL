import { query, testConnection } from "../config/db.js";

const createTableSQL = `
CREATE TABLE IF NOT EXISTS invoices (
  id INT AUTO_INCREMENT PRIMARY KEY,
  devis_submission_id INT NULL,
  requester_email VARCHAR(255) NOT NULL,
  client_name VARCHAR(255) NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('en_attente','envoyée','payée','refusée') DEFAULT 'en_attente',
  issued_date DATE NULL,
  due_date DATE NULL,
  sent_at DATETIME NULL,
  payment_link VARCHAR(255) NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
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

  // Indexes pour la performance
  try { await query(`CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status)`); } catch (_) {}
  try { await query(`CREATE INDEX IF NOT EXISTS idx_invoices_devis ON invoices(devis_submission_id)`); } catch (_) {}

  return { message: "Table invoices prête" };
}

if (process.argv[1] && process.argv[1].includes('add_invoices_table.js')) {
  (async () => {
    try {
      await up();
      console.log('✅ Table invoices prête');
      process.exit(0);
    } catch (e) {
      console.error('❌ Erreur création table invoices:', e?.message || e);
      process.exit(1);
    }
  })();
}