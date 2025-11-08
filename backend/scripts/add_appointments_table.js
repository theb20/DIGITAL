import { query, testConnection } from "../config/db.js";
import dotenv from "dotenv";
dotenv.config();
// Crée la table appointments si elle n'existe pas
const createTableSQL = `
CREATE TABLE IF NOT EXISTS appointments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NULL,
  service_id INT NULL,
  appointment_date DATETIME NOT NULL,
  channel ENUM('call','video','onsite','chat','email') NULL,
  notes TEXT NULL,
  status ENUM('pending','confirmed','completed','cancelled') NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_appointments_date (appointment_date),
  INDEX idx_appointments_status (status),
  INDEX idx_appointments_user (user_id),
  INDEX idx_appointments_service (service_id)
);
`;

export async function up() {
  await testConnection();
  await query(createTableSQL);
  return { message: "Table appointments créée (ou déjà existante)." };
}

// Petit jeu de données d'exemple optionnel
export async function seedExample() {
  const example = {
    full_name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+33123456789',
    service_id: null,
    appointment_date: new Date(),
    channel: 'call',
    notes: 'Premier contact',
    status: 'pending'
  };

  const sql = `INSERT INTO appointments (user_id, full_name, email, phone, service_id, appointment_date, channel, notes, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  await query(sql, [
    null,
    example.full_name,
    example.email,
    example.phone,
    example.service_id,
    example.appointment_date,
    example.channel,
    example.notes,
    example.status
  ]);
  return { message: "Exemple d\u2019appointment inséré." };
}

// Exécution directe via `node backend/scripts/add_appointments_table.js`
if (process.argv[1] && process.argv[1].includes('add_appointments_table.js')) {
  (async () => {
    try {
      await up();
      console.log('✅ Table appointments prête');
      console.log('ℹ️ Pour insérer un exemple: importez et appelez seedExample()');
      process.exit(0);
    } catch (e) {
      console.error('❌ Erreur création table appointments:', e?.message || e);
      process.exit(1);
    }
  })();
}