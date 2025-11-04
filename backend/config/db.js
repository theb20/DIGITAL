import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Pool de connexions simple et robuste
export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT ,
  
  // Gestion des connexions
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  
  // Sécurité & Performance
  timezone: '+00:00',
  charset: 'utf8mb4',
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Helper pour exécuter des requêtes avec retry automatique
export const query = async (sql, params = []) => {
  const maxRetries = 3;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      const [results] = await pool.execute(sql, params);
      return results;
    } catch (error) {
      console.error(`Tentative ${i + 1}/${maxRetries} échouée:`, error.message);
      
      if (i === maxRetries - 1) throw error;
      
      // Attendre avant de réessayer (1s, 2s, 4s)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
};

// Test de connexion au démarrage
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Connecté à la base de données');
    connection.release();
  } catch (error) {
    console.error('❌ Erreur de connexion DB:', error.message);
    process.exit(1);
  }
};

// Fermeture propre
export const closePool = async () => {
  try {
    await pool.end();
    console.log('👋 Pool de connexions fermé');
  } catch (error) {
    console.error('Erreur lors de la fermeture:', error);
  }
};
