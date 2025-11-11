import { query, testConnection } from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();

// Crée la table plannings si elle n'existe pas
const createTableSQL = `
CREATE TABLE IF NOT EXISTS plannings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  week_key VARCHAR(20) NOT NULL,
  week_start DATE NULL,
  data LONGTEXT NOT NULL,
  recipients TEXT NULL,
  created_by INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_plannings_week (week_key)
);
`;

export async function up() {
  await testConnection();
  await query(createTableSQL);
  return { message: "Table plannings créée (ou déjà existante)." };
}

// Exécution directe via `node backend/scripts/add_plannings_table.js`
if (process.argv[1] && process.argv[1].includes('add_plannings_table.js')) {
  (async () => {
    try {
      await up();
      console.log('✅ Table plannings prête');
      process.exit(0);
    } catch (e) {
      console.error('❌ Erreur création table plannings:', e?.message || e);
      process.exit(1);
    }
  })();
}