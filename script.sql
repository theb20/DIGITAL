-- ============================================================
-- 🧱 SCRIPT SQL COMPLET - Plateforme de Services & Devis
-- ============================================================

-- 🧩 TABLE UTILISATEURS
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    provider ENUM('google', 'microsoft') NOT NULL,
    provider_id VARCHAR(255) NOT NULL,
    role ENUM('user', 'admin', 'manager') NOT NULL DEFAULT 'user',
    avatar VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    session_status ENUM('connected', 'disconnected') DEFAULT 'disconnected',
    last_login DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email(email),
    INDEX idx_provider(provider),
    INDEX idx_provider_id(provider_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 🗂️ TABLE CATEGORIES DE SERVICES
CREATE TABLE service_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT DEFAULT NULL,
    icon VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 💼 TABLE SERVICES
CREATE TABLE services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT,
    duration VARCHAR(50) DEFAULT NULL,
    price DECIMAL(10,2) DEFAULT NULL,
    price_type ENUM('fixe', 'sur_devis') DEFAULT 'sur_devis',
    image_url VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
    INDEX idx_category(category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 📋 TABLE DEMANDES DE DEVIS
CREATE TABLE devis_requests (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    service_id BIGINT UNSIGNED NULL,
    project_type VARCHAR(100) DEFAULT NULL,
    project_description TEXT NOT NULL,
    attachment_url VARCHAR(255) DEFAULT NULL,
    status ENUM('reçu', 'en_analyse', 'envoyé', 'approuvé', 'refusé') DEFAULT 'reçu',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_user(user_id),
    INDEX idx_service(service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 📑 TABLE SOUMISSIONS DE DEVIS
CREATE TABLE devis_submissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    request_id BIGINT UNSIGNED NOT NULL,
    provider_id BIGINT UNSIGNED NOT NULL,
    estimation_amount DECIMAL(10,2) NOT NULL,
    delivery_time VARCHAR(50) DEFAULT NULL,
    message TEXT DEFAULT NULL,
    pdf_url VARCHAR(255) DEFAULT NULL,
    status ENUM('envoyé', 'accepté', 'refusé', 'expiré') DEFAULT 'envoyé',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES devis_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_request(request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 📊 TABLE DE SUIVI DES SERVICES
CREATE TABLE service_tracking (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    tracking_code VARCHAR(50) NOT NULL UNIQUE,
    request_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    provider_id BIGINT UNSIGNED NOT NULL,
    progress_percent INT DEFAULT 0,
    current_status ENUM(
        'demande_validee',
        'analyse_en_cours',
        'production_en_cours',
        'validation_finale',
        'termine'
    ) DEFAULT 'demande_validee',
    last_update DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (request_id) REFERENCES devis_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_request(request_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 💬 TABLE COMMENTAIRES / AVIS
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    rating TINYINT CHECK (rating BETWEEN 1 AND 5),
    review TEXT NOT NULL,
    likes INT DEFAULT 0,
    dislikes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_service(service_id),
    INDEX idx_user(user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 📞 TABLE CONTACT
CREATE TABLE contact (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    startup VARCHAR(100) DEFAULT NULL,
    subject VARCHAR(100) DEFAULT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 📰 TABLE BLOGS / ARTICLES
CREATE TABLE blogs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    category_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT NOT NULL,
    content LONGTEXT DEFAULT NULL,
    author_name VARCHAR(100) NOT NULL,
    author_role VARCHAR(100) DEFAULT NULL,
    author_avatar VARCHAR(255) DEFAULT NULL,
    image_url VARCHAR(255) DEFAULT NULL,
    published_date DATE DEFAULT (CURRENT_DATE),
    read_time VARCHAR(50) DEFAULT NULL,
    views INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    featured BOOLEAN DEFAULT FALSE,
    trending BOOLEAN DEFAULT FALSE,
    tags JSON DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE,
    INDEX idx_category(category_id),
    INDEX idx_featured(featured),
    INDEX idx_trending(trending)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 🗓️ TABLE RENDEZ-VOUS
CREATE TABLE appointments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(30) DEFAULT NULL,
    service_id BIGINT UNSIGNED NULL,
    appointment_date DATETIME NOT NULL,
    channel VARCHAR(50) DEFAULT NULL, -- ex: visio, telephone, en_personne
    notes TEXT DEFAULT NULL,
    status ENUM('pending','confirmed','cancelled','completed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    INDEX idx_user(user_id),
    INDEX idx_service(service_id),
    INDEX idx_date(appointment_date),
    INDEX idx_status(status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- 🔒 TABLE POLITIQUE DE CONFIDENTIALITÉ
CREATE TABLE privacy_page (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    section_number INT NOT NULL,
    section_title VARCHAR(255) NOT NULL,
    section_icon VARCHAR(50),
    section_badge VARCHAR(100),
    content_title VARCHAR(255),
    content_text TEXT,
    display_order INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_section(section_number),
    INDEX idx_order(display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================
-- 📥 DONNÉES POLITIQUE DE CONFIDENTIALITÉ
-- ============================================

INSERT INTO privacy_page (section_number, section_title, section_icon, section_badge, content_title, content_text, display_order) VALUES

-- Section 1
(1, 'Protection des données', 'Database', 'Priorité n°1', 'Informations personnelles', 'Nom, prénom, email, téléphone, identifiants de connexion', 1),
(1, 'Protection des données', 'Database', 'Priorité n°1', 'Données techniques', 'Adresse IP, appareil, navigateur, pages consultées, cookies', 2),
(1, 'Protection des données', 'Database', 'Priorité n°1', 'Données transactions', 'Historique achats, montants, dates, statut paiement', 3),

-- Section 2
(2, 'Transparence totale', 'Eye', 'Sans détour', 'Gestion services', 'Création compte, accès fonctionnalités, traitement demandes', 4),
(2, 'Transparence totale', 'Eye', 'Sans détour', 'Amélioration', 'Analyse performances, tests, personnalisation, optimisation', 5),
(2, 'Transparence totale', 'Eye', 'Sans détour', 'Communication', 'Notifications compte, support, alertes, newsletters', 6),

-- Section 3
(3, 'Ouverture au monde', 'Globe', 'Vision', 'Prestataires', 'Hébergeurs, paiement (Stripe, PayPal), analytics, support', 7),
(3, 'Ouverture au monde', 'Globe', 'Vision', 'Partage légal', 'Autorités publiques, obligations fiscales, prévention fraudes', 8),

-- Section 4
(4, 'Sécurité avancée', 'Lock', 'Confiance', 'Chiffrement', 'TLS/HTTPS, chiffrement au repos, hachage mots de passe', 9),
(4, 'Sécurité avancée', 'Lock', 'Confiance', 'Contrôle accès', 'Accès restreint, authentification multi-facteur, revue droits', 10),

-- Section 5
(5, 'Respect et Conformité', 'Shield', 'RGPD', 'Vos droits', 'Accès, rectification, effacement, limitation, opposition, portabilité', 11),
(5, 'Respect et Conformité', 'Shield', 'RGPD', 'Contact DPO', 'dpo@tonentreprise.com - +33 1 23 45 67 89', 12),

-- Section 6
(6, 'Personnalisation contrôlée', 'Cookie', 'Mesure', 'Types cookies', 'Essentiels, performance, fonctionnalité, marketing', 13),
(6, 'Personnalisation contrôlée', 'Cookie', 'Mesure', 'Gestion', 'Configuration dans navigateur, accepter/refuser', 14),

-- Section 7
(7, 'Gestion responsable', 'Calendar', 'Durabilité', 'Conservation', 'Compte actif, transactions 10 ans, support durée traitement', 15),

-- Section 8
(8, 'Support humain', 'Mail', 'Proximité', 'Contact', 'support@tonentreprise.com - +33 1 23 45 67 89', 16),

-- Section 9
(9, 'Mentions légales', 'FileText', 'Obligatoire', 'Entreprise', 'DIGITAL COMPANY - SAS - 10 000€ - SIRET: 123 456 789 00012', 17),
(9, 'Mentions légales', 'FileText', 'Obligatoire', 'Adresse', '12 rue Exemple, 94000 Champigny-sur-Marne, France', 18),

-- Section 10
(10, 'CGV', 'FileText', 'Vente', 'Conditions', 'Commandes, prix, paiement, livraison, rétractation, garanties', 19),

-- Section 11
(11, 'CGU', 'FileText', 'Utilisation', 'Règles', 'Création compte, obligations, propriété intellectuelle, responsabilité', 20),

-- Section 12
(12, 'Politique de confidentialité', 'FileText', 'Vie privée', 'Protection', 'Collecte, utilisation, partage, sécurité, conservation, droits', 21),

-- Section 13
(13, 'FAQ', 'HelpCircle', 'Questions', 'Questions fréquentes', 'Création compte, modification données, suppression, paiements, support', 22),

-- Section 14
(14, 'Garanties', 'HelpCircle', 'Assurance', 'Nos engagements', 'Technologie avancée, couverture globale, lancement rapide, satisfaction garantie', 23);


-- ============================================================
-- 📊 REQUÊTES UTILES
-- ============================================================

-- Récupérer toutes les sections de la politique
SELECT DISTINCT section_number, section_title, section_icon, section_badge 
FROM privacy_page 
ORDER BY section_number;

-- Récupérer le contenu d'une section spécifique
SELECT content_title, content_text 
FROM privacy_page 
WHERE section_number = 1 
ORDER BY display_order;

-- Récupérer tout le contenu ordonné
SELECT * FROM privacy_page ORDER BY display_order;


-- ============================================================
-- ✅ FIN DU SCRIPT - Tout est correct !
-- ============================================================