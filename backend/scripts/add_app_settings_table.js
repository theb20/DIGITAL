import { query, testConnection } from "../config/db.js";

const createTableSQL = `
CREATE TABLE IF NOT EXISTS app_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(255) NOT NULL UNIQUE,
  setting_value LONGTEXT NOT NULL,
  setting_type ENUM('string','number','boolean','json','date') NOT NULL DEFAULT 'string',
  description TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

export async function up() {
  await testConnection();
  await query(createTableSQL);
  return { message: "Table app_settings créée (ou déjà existante)." };
}

export async function seedExample() {
  const settings = [
    {
      setting_key: 'HOMEPAGE_BANNER_URL',
      setting_value: 'https://example.com/assets/banner.jpg',
      setting_type: 'string',
      description: 'URL du bandeau d’accueil quand aucune image promo n’est définie.'
    },
    {
      setting_key: 'PROMO_DEFAULT_IMAGE_URL',
      setting_value: 'https://example.com/assets/promo-default.jpg',
      setting_type: 'string',
      description: 'Image par défaut pour les cartes Promo.'
    },
    {
      setting_key: 'FEATURE_FLAGS',
      setting_value: JSON.stringify({ enablePromos: true, enableBackoffice: true }),
      setting_type: 'json',
      description: 'Drapeaux de fonctionnalités.'
    }
  ];

  for (const s of settings) {
    const sql = `INSERT INTO app_settings (setting_key, setting_value, setting_type, description) VALUES (?, ?, ?, ?)`;
    await query(sql, [s.setting_key, String(s.setting_value), s.setting_type, s.description]);
  }
  return { message: "Exemples de paramètres insérés." };
}

if (process.argv[1] && process.argv[1].includes('add_app_settings_table.js')) {
  (async () => {
    try {
      await up();
      console.log('✅ Table app_settings prête');
      console.log('ℹ️ Pour insérer un exemple: importez et appelez seedExample()');
      process.exit(0);
    } catch (e) {
      console.error('❌ Erreur création table app_settings:', e?.message || e);
      process.exit(1);
    }
  })();
}