import { query, testConnection } from "../config/db.js";

const createTableSQL = `
CREATE TABLE IF NOT EXISTS profiles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NULL,
  subtitle TEXT NULL,
  banner_url VARCHAR(512) NULL,
  stats_json JSON NOT NULL,
  services_json JSON NOT NULL,
  values_json JSON NOT NULL,
  team_json JSON NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

export async function up() {
  await testConnection();
  await query(createTableSQL);
  return { message: "Table profiles créée (ou déjà existante)." };
}

export async function seedExample() {
  const example = {
    title: 'À propos de Digital',
    subtitle: 'Nous accélérons l’innovation des startups et PME',
    banner_url: 'https://example.com/images/about/banner.jpg',
    stats_json: JSON.stringify([
      { label: 'Clients', value: 120 },
      { label: 'Projets', value: 240 },
      { label: 'Taux de satisfaction', value: '98%' }
    ]),
    services_json: JSON.stringify([
      { icon: 'Cpu', title: 'Développement', desc: 'Web, mobile, cloud' },
      { icon: 'Shield', title: 'Sécurité', desc: 'Audit, RGPD, ISO' },
      { icon: 'BarChart3', title: 'Data/IA', desc: 'BI, ML, IA' }
    ]),
    values_json: JSON.stringify([
      { icon: 'Heart', title: 'Empathie', desc: 'Comprendre avant d’agir' },
      { icon: 'Lightbulb', title: 'Créativité', desc: 'Innover utilement' },
      { icon: 'Handshake', title: 'Confiance', desc: 'Transparence totale' }
    ]),
    team_json: JSON.stringify([
      { name: 'Alice', role: 'CEO', avatar: '/img/team/alice.jpg' },
      { name: 'Bob', role: 'CTO', avatar: '/img/team/bob.jpg' }
    ]),
    is_active: 1,
  };

  const sql = `INSERT INTO profiles (title, subtitle, banner_url, stats_json, services_json, values_json, team_json, is_active)
               VALUES (?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), ?)`;
  await query(sql, [
    example.title,
    example.subtitle,
    example.banner_url,
    example.stats_json,
    example.services_json,
    example.values_json,
    example.team_json,
    example.is_active
  ]);
  return { message: "Exemple de profil inséré." };
}

if (process.argv[1] && process.argv[1].includes('add_profiles_table.js')) {
  (async () => {
    try {
      await up();
      console.log('✅ Table profiles prête');
      console.log('ℹ️ Pour insérer un exemple: importez et appelez seedExample()');
      process.exit(0);
    } catch (e) {
      console.error('❌ Erreur création table profiles:', e?.message || e);
      process.exit(1);
    }
  })();
}