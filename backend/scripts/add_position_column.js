import { query, testConnection } from "../config/db.js";

async function ensurePositionColumn() {
  await testConnection();
  const rows = await query("SHOW COLUMNS FROM users LIKE 'position'");
  if (Array.isArray(rows) && rows.length > 0) {
    console.log("✅ Colonne 'position' déjà présente dans la table users.");
    return;
  }
  console.log("➕ Ajout de la colonne 'position' à la table users...");
  await query("ALTER TABLE users ADD COLUMN position VARCHAR(100) DEFAULT NULL AFTER last_name");
  console.log("✅ Colonne 'position' ajoutée.");
}

ensurePositionColumn()
  .then(() => process.exit(0))
  .catch((e) => { console.error("❌ échec migration:", e?.message || e); process.exit(1); });