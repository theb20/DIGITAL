import { query, testConnection } from "../config/db.js";

// Ce script crée la table `promos` qui stocke tout le contenu de la page Promo.
// Il utilise des colonnes JSON pour les structures complexes (plans, comparaison, features).
// Si votre version de MySQL ne supporte pas JSON, remplacez JSON par TEXT.

const createTableSQL = `
CREATE TABLE IF NOT EXISTS promos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NULL,
  subtitle TEXT NULL,
  billing_cycle_default ENUM('annual','monthly') NOT NULL DEFAULT 'annual',
  timer_end_at DATETIME NULL,
  plans_json JSON NOT NULL,
  comparison_json JSON NOT NULL,
  enterprise_features_json JSON NOT NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
`;

export async function up() {
  await testConnection();
  await query(createTableSQL);
  return { message: "Table promos créée (ou déjà existante)." };
}

// Exemple de seed minimal facultatif
export async function seedExample() {
  const example = {
    title: "Choisissez votre solution",
    subtitle: "Des forfaits transparents conçus pour accompagner votre croissance.",
    billing_cycle_default: "annual",
    timer_end_at: null,
    plans_json: JSON.stringify([
      {
        id: 'starter', name: 'Starter', tagline: 'Pour les startups et projets pilotes',
        monthlyPrice: 899, annualPrice: 8990, annualMonthly: 749, setupFee: 500, savings: 1288,
        color: 'from-cyan-600 to-blue-600',
        features: [
          { text: "Site web jusqu'à 10 pages", included: true },
          { text: "Design moderne et responsive", included: true },
          { text: "Optimisation SEO de base", included: true },
          { text: "Hébergement sécurisé (SSL)", included: true },
          { text: "Tableau de bord analytics", included: true },
          { text: "Support email (48h)", included: true },
          { text: "Mises à jour sécurité", included: true },
          { text: "Intégration CRM/ERP", included: false },
          { text: "Support téléphonique prioritaire", included: false }
        ],
        metrics: { pages: '10', users: '5K/mois', storage: '10 GB' }
      },
      {
        id: 'business', name: 'Business', tagline: 'Solution complète pour PME/ETI',
        monthlyPrice: 1990, annualPrice: 19900, annualMonthly: 1658, setupFee: 1000, savings: 3880,
        color: 'from-violet-600 to-purple-600', recommended: true,
        features: [
          { text: 'Site web illimité (pages)', included: true },
          { text: 'Design premium sur-mesure', included: true },
          { text: 'SEO avancé + campagnes Google Ads', included: true },
          { text: 'Hébergement haute performance', included: true },
          { text: 'Dashboard BI et reporting', included: true },
          { text: 'Espace client sécurisé', included: true },
          { text: 'Intégration CRM/ERP', included: true },
          { text: 'Support téléphonique prioritaire', included: true },
          { text: 'Maintenance et mises à jour', included: true }
        ],
        metrics: { pages: 'Illimité', users: '50K/mois', storage: '100 GB' }
      },
      {
        id: 'enterprise', name: 'Enterprise', tagline: 'Infrastructure sur-mesure',
        monthlyPrice: null, annualPrice: null, setupFee: null,
        color: 'from-slate-700 to-slate-900', custom: true,
        features: [
          { text: 'Architecture cloud évolutive', included: true },
          { text: 'Design système et UX research', included: true },
          { text: 'SEO international multi-langues', included: true },
          { text: 'Infrastructure dédiée (bare metal)', included: true },
          { text: 'BI avancé avec IA prédictive', included: true },
          { text: 'API & webhooks personnalisés', included: true },
          { text: 'Intégrations entreprise complètes', included: true },
          { text: 'Account manager dédié 24/7', included: true },
          { text: 'SLA 99.99% avec pénalités', included: true }
        ],
        metrics: { pages: 'Illimité', users: 'Illimité', storage: 'Personnalisé' }
      }
    ]),
    comparison_json: JSON.stringify([
      { feature: 'Pages web', starter: '10', business: 'Illimité', enterprise: 'Illimité' },
      { feature: 'Trafic mensuel', starter: '5K visites', business: '50K visites', enterprise: 'Illimité' },
      { feature: 'Stockage', starter: '10 GB', business: '100 GB', enterprise: 'Personnalisé' },
      { feature: 'Support', starter: 'Email 48h', business: 'Tel 24h', enterprise: '24/7 dédié' },
      { feature: 'SLA', starter: '-', business: '99.9%', enterprise: '99.99%' }
    ]),
    enterprise_features_json: JSON.stringify([
      { icon: 'Globe', title: 'Multi-sites', desc: 'Gestion centralisée de plusieurs sites' },
      { icon: 'Server', title: 'Cloud privé', desc: 'Infrastructure dédiée et sécurisée' },
      { icon: 'Lock', title: 'Conformité', desc: 'RGPD, ISO27001, HDS' },
      { icon: 'BarChart3', title: 'Analytics', desc: 'Tableaux de bord personnalisés' }
    ]),
    is_active: 1,
  };

  const sql = `INSERT INTO promos (title, subtitle, billing_cycle_default, timer_end_at, plans_json, comparison_json, enterprise_features_json, is_active)
               VALUES (?, ?, ?, ?, CAST(? AS JSON), CAST(? AS JSON), CAST(? AS JSON), ?)`;
  await query(sql, [
    example.title,
    example.subtitle,
    example.billing_cycle_default,
    example.timer_end_at,
    example.plans_json,
    example.comparison_json,
    example.enterprise_features_json,
    example.is_active
  ]);
  return { message: "Exemple de promo inséré." };
}

// Permet d'exécuter directement ce script avec node
if (process.argv[1] && process.argv[1].includes('add_promos_table.js')) {
  (async () => {
    try {
      await up();
      console.log('✅ Table promos prête');
      console.log('ℹ️ Pour insérer un exemple: importez et appelez seedExample()');
      process.exit(0);
    } catch (e) {
      console.error('❌ Erreur création table promos:', e?.message || e);
      process.exit(1);
    }
  })();
}