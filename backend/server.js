import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import os from "os";
import dotenv from "dotenv";
import { pool, testConnection, closePool } from "./config/db.js"; 

import usersRoutes from "./routes/users.routes.js";
import categoriesRoutes from "./routes/serviceCategories.routes.js";
import servicesRoutes from "./routes/services.routes.js";
import devisRequestsRoutes from "./routes/devisRequests.routes.js";
import authRoutes from "./routes/auth.routes.js";
import messagesRoutes from "./routes/messages.routes.js";
import devisSubmissionsRoutes from "./routes/devisSubmissions.routes.js";
import serviceTrackingRoutes from "./routes/serviceTracking.routes.js";
import commentsRoutes from "./routes/comments.routes.js";
import privacyRoutes from "./routes/privacy.routes.js";
import contactRoutes from "./routes/contact.routes.js";
import blogsRoutes from "./routes/blogs.routes.js";
import promosRoutes from "./routes/promos.routes.js";
import appSettingsRoutes from "./routes/appSettings.routes.js";
import profilesRoutes from "./routes/profiles.routes.js";
import scraperRoutes from "./routes/scraper.routes.js";
import projectsRoutes from "./routes/projects.routes.js";
import appointmentsRoutes from "./routes/appointments.routes.js";
import payRoutes from "./routes/pay.routes.js";
import mailRoutes from "./routes/mail.routes.js";
import invoicesRoutes from "./routes/invoices.routes.js";
import planningsRoutes from "./routes/plannings.routes.js";
import { up as migrateAppointments } from "./scripts/add_appointments_table.js";
import { up as migrateInvoices } from "./scripts/add_invoices_table.js";
import { up as migratePlannings } from "./scripts/add_plannings_table.js";
import { initRealtimeServer } from "./config/realtime.js";
import { ensureDefaultContactSettings } from "./config/seedAppSettings.js";


// ============================================
// Configuration
// ============================================
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";
const TZ = process.env.TZ || "Europe/Paris";

// Configuration du fuseau horaire
process.env.TZ = TZ;

// ============================================
// Fonction pour obtenir l'IP locale
// ============================================
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Ignorer les adresses non-IPv4 et loopback
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();

// ============================================
// Configuration CORS sécurisée
// ============================================
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://192.168.1.195:3001",
  "https://digital-company.web.app",
  "http://127.0.0.1:3001",
  `http://${LOCAL_IP}:3000`,
  `http://${LOCAL_IP}:3001`,
  // Ajoutez vos domaines de production ici
  process.env.FRONTEND_URL,
  process.env.APP_BASE_URL,
].filter(Boolean); // Enlève les valeurs undefined

const corsOptions = {
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origin (Postman, mobile apps, curl)
    if (!origin) {
      return callback(null, true);
    }
    
    // En développement, autoriser toutes les IPs du réseau local
    if (NODE_ENV !== "production") {
      if (
        origin.startsWith('http://192.168.') || 
        origin.startsWith('http://10.') || 
        origin.startsWith('http://172.') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1')
      ) {
        return callback(null, true);
      }
    }
    
    // Vérifier si l'origine est dans la liste autorisée
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log(`❌ CORS bloqué pour: ${origin}`);
      
      // En dev, autoriser quand même mais logger
      if (NODE_ENV !== "production") {
        console.log(`⚠️  Origine non listée mais autorisée en mode dev`);
        return callback(null, true);
      }
      
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
  maxAge: 86400, // 24 heures
};

// ============================================
// Middlewares de sécurité
// ============================================
app.use(helmet({
  contentSecurityPolicy: NODE_ENV === "production" ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors(corsOptions));

// Body parsers avec limite de taille
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb", parameterLimit: 100000 }));

// Logger HTTP
app.use(morgan(NODE_ENV === "production" ? "combined" : "dev"));

// Fichiers statiques
app.use(express.static('public'));

// ============================================
// Middleware de gestion du preflight OPTIONS
// ============================================
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,PATCH,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return res.sendStatus(204);
  }
  next();
});

// ============================================
// Middleware de logging des requêtes
// ============================================
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path} - IP: ${req.ip}`);
  next();
});

// ============================================
// Health Check endpoint
// ============================================
app.get("/health", async (req, res) => {
  try {
    const start = Date.now();
    await pool.query("SELECT 1");
    const dbLatency = Date.now() - start;

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      database: {
        status: "connected",
        latency: `${dbLatency}ms`
      },
      network: {
        localIP: LOCAL_IP,
        port: PORT
      },
      environment: NODE_ENV,
      timezone: TZ,
      memory: {
        used: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
        total: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`
      }
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);
    res.status(503).json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      database: {
        status: "disconnected",
        error: error.message
      }
    });
  }
});

// ============================================
// Route racine
// ============================================
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Server is running",
    version: "1.0.0",
    endpoints: {
      health: "/health",
      api: "/api/*"
    },
    timestamp: new Date().toISOString()
  });
});



app.use("/api/users", usersRoutes);
app.use("/api/service-categories", categoriesRoutes);
app.use("/api/services", servicesRoutes);
app.use("/api/devis/requests", devisRequestsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/devis/submissions", devisSubmissionsRoutes);
app.use("/api/service-tracking", serviceTrackingRoutes);
app.use("/api/comments", commentsRoutes);
app.use("/api/privacy", privacyRoutes);
app.use("/api/contact", contactRoutes);
app.use("/api/blogs", blogsRoutes);
app.use("/api/promos", promosRoutes);
app.use("/api/app-settings", appSettingsRoutes);
app.use("/api/scrape", scraperRoutes);
app.use("/api/projects", projectsRoutes);
app.use("/api/profiles", profilesRoutes);
app.use("/api/appointments", appointmentsRoutes);
app.use("/api/pay", payRoutes);
app.use("/api/mail", mailRoutes);
app.use("/api/invoices", invoicesRoutes);
app.use("/api/plannings", planningsRoutes);
// ============================================
// Gestion des routes non trouvées (404)
// ============================================
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Middleware de gestion des erreurs globale
// ============================================
app.use((err, req, res, next) => {
  console.error("❌ Erreur serveur:", err);

  // Erreur CORS
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      error: "CORS Error",
      message: "Origin not allowed",
      origin: req.headers.origin
    });
  }

  // Erreur de parsing JSON
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: "Invalid JSON",
      message: "Request body contains invalid JSON"
    });
  }

  // Erreur générique
  res.status(err.status || 500).json({
    error: NODE_ENV === "production" ? "Internal Server Error" : err.message,
    ...(NODE_ENV !== "production" && { stack: err.stack }),
    timestamp: new Date().toISOString()
  });
});

// ============================================
// Gestion des signaux de fermeture gracieuse
// ============================================
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Signal ${signal} reçu, fermeture gracieuse...`);
  
  global.server.close(async () => {
    console.log("🔌 Serveur HTTP fermé");
    
    try {
      // Fermer la connexion DB
      await closePool();
      
      console.log("✅ Arrêt propre terminé");
      process.exit(0);
    } catch (error) {
      console.error("❌ Erreur lors de la fermeture:", error);
      process.exit(1);
    }
  });

  // Forcer la fermeture après 10 secondes
  setTimeout(() => {
    console.error("⏱️  Timeout: fermeture forcée");
    process.exit(1);
  }, 10000);
};

// Écouter les signaux de fermeture
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ============================================
// Démarrage du serveur
// ============================================
const startServer = async () => {
  try {
    // Test de connexion à la DB
    console.log("🔄 Test de connexion à la base de données...");
    await testConnection();
    console.log("✅ Base de données connectée");

    // Migration légère: assurer la table appointments
    try {
      console.log("🔧 Vérification/Création de la table appointments...");
      await migrateAppointments();
      console.log("✅ Table appointments OK");
    } catch (migErr) {
      console.error("⚠️  Migration appointments non exécutée:", migErr?.message || migErr);
    }

    // Migration légère: assurer la table invoices
    try {
      console.log("🔧 Vérification/Création de la table invoices...");
      await migrateInvoices();
      console.log("✅ Table invoices OK");
    } catch (migErr) {
      console.error("⚠️  Migration invoices non exécutée:", migErr?.message || migErr);
    }

    // Migration légère: assurer la table plannings
    try {
      console.log("🔧 Vérification/Création de la table plannings...");
      await migratePlannings();
      console.log("✅ Table plannings OK");
    } catch (migErr) {
      console.error("⚠️  Migration plannings non exécutée:", migErr?.message || migErr);
    }

    // Seed des paramètres système (contact)
    try {
      console.log("🔧 Vérification/Seed des paramètres de contact...");
      await ensureDefaultContactSettings();
      console.log("✅ Paramètres de contact par défaut OK");
    } catch (seedErr) {
      console.error("⚠️  Seed app_settings échoué:", seedErr?.message || seedErr);
    }

    // Démarrer le serveur
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log("\n" + "=".repeat(50));
      console.log("🚀 SERVEUR DÉMARRÉ AVEC SUCCÈS");
      console.log("=".repeat(50));
      console.log(`📍 Environnement: ${NODE_ENV}`);
      console.log(`🌐 URL locale: http://localhost:${PORT}`);
      console.log(`🌐 URL réseau: http://${LOCAL_IP}:${PORT}`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
      console.log(`🕐 Timezone: ${TZ}`);
      console.log(`⏱️  Démarré à: ${new Date().toLocaleString('fr-FR')}`);
      console.log("=".repeat(50) + "\n");
    });

    // Définir server dans le scope global pour gracefulShutdown
    global.server = server;

    // Initialiser Socket.IO pour le temps réel
    try {
      const origins = allowedOrigins;
      initRealtimeServer(server, origins);
      console.log("🔁 Temps réel Socket.IO initialisé");
    } catch (rtErr) {
      console.error("⚠️  Échec initialisation temps réel:", rtErr?.message || rtErr);
    }

    return server;
  } catch (error) {
    console.error("❌ Impossible de démarrer le serveur:", error);
    process.exit(1);
  }
};

// Démarrer le serveur
startServer();

// Export pour les tests
export default app;