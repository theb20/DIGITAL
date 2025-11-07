import { Search, Building2, ChevronRight, Check, ArrowRight, Briefcase, Target, Lightbulb, BarChart, Shield, Cog, FileText, Send, CheckCircle, MessageSquare, Calendar, Code, Palette, Zap, CheckSquare, Printer, Camera, Mail, X  } from 'lucide-react';

export const services = [
  // ═══════════════════════════════════════════════════════════
  // DÉVELOPPEMENT WEB (4 services)
  // ═══════════════════════════════════════════════════════════

  {
    id: 2,
    title: "Site E-commerce",
    category: "Développement Web",
    icon: Code,
    description: "Boutique en ligne complète avec système de paiement sécurisé pour vendre vos produits 24h/24.",
    features: [
      "Catalogue produits illimité avec recherche et filtres",
      "Panier d'achat et gestion des commandes",
      "Intégration paiement mobile (Orange Money, Wave, MTN, Moov)",
      "Espace client et suivi de commandes",
      "Tableau de bord vendeur complet"
    ],
    deliverables: [
      "Boutique en ligne fonctionnelle",
      "Configuration des moyens de paiement",
      "Formation complète à la gestion",
      "1 mois de support gratuit"
    ],
    duration: "4-6 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 3,
    title: "Application Web sur Mesure",
    category: "Développement Web",
    icon: Code,
    description: "Développement d'une application web personnalisée adaptée à vos besoins métier spécifiques.",
    features: [
      "Analyse approfondie de vos besoins et spécifications",
      "Développement sur mesure (React, Node.js, etc.)",
      "Interface utilisateur intuitive et ergonomique",
      "Base de données sécurisée",
      "API et intégrations avec systèmes tiers"
    ],
    deliverables: [
      "Application web complète et déployée",
      "Documentation technique détaillée",
      "Code source commenté",
      "3 mois de maintenance incluse"
    ],
    duration: "8-12 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 4,
    title: "Landing Page Optimisée",
    category: "Développement Web",
    icon: Code,
    description: "Page de conversion unique conçue pour maximiser les inscriptions, ventes ou téléchargements lors d'une campagne marketing.",
    features: [
      "Design percutant axé sur la conversion",
      "Call-to-action stratégiquement placés",
      "Formulaire de capture de leads performant",
      "Intégration Google Analytics et tracking",
      "Optimisation mobile et vitesse de chargement"
    ],
    deliverables: [
      "Landing page en ligne",
      "Configuration analytics complète",
      "Configuration A/B testing",
      "Guide d'optimisation des conversions"
    ],
    duration: "1-2 semaines",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // DESIGN GRAPHIQUE (3 services)
  // ═══════════════════════════════════════════════════════════
  {
    id: 5,
    title: "Flyers & Affiches Publicitaires",
    category: "Design Graphique",
    icon: Palette,
    description: "Création de supports publicitaires impactants pour promouvoir vos événements, produits ou services.",
    features: [
      "Design créatif et accrocheur sur mesure",
      "Formats standards (A4, A5, A6) ou personnalisés",
      "3 propositions de concepts différents",
      "2 séries de révisions incluses",
      "Fichiers prêts pour l'impression professionnelle"
    ],
    deliverables: [
      "Fichiers haute définition (PDF, PNG, JPEG)",
      "Version print (CMJN) et version web (RVB)",
      "Recommandations d'imprimeurs",
      "Fichiers sources modifiables (AI, PSD)"
    ],
    duration: "3-5 jours",
    price: "Sur devis",
    featured: false
  },
  {
    id: 6,
    title: "Visuels pour Réseaux Sociaux",
    category: "Design Graphique",
    icon: Palette,
    description: "Pack de visuels cohérents et professionnels pour dynamiser votre communication sur les réseaux sociaux.",
    features: [
      "Pack de 10 à 20 visuels personnalisés",
      "Formats adaptés (Facebook, Instagram, LinkedIn, Twitter)",
      "Templates réutilisables pour vos futures publications",
      "Respect de votre charte graphique",
      "Optimisation pour chaque plateforme"
    ],
    deliverables: [
      "Pack complet de visuels en haute qualité",
      "Templates Canva ou Photoshop modifiables",
      "Guide d'utilisation et bonnes pratiques",
      "Versions dans tous les formats nécessaires"
    ],
    duration: "1 semaine",
    price: "Sur devis",
    featured: false
  },
  {
    id: 7,
    title: "Infographies & Data Visualization",
    category: "Design Graphique",
    icon: Palette,
    description: "Transformation de vos données et informations complexes en visuels attractifs et faciles à comprendre.",
    features: [
      "Design informatif et visuellement attrayant",
      "Mise en forme claire de vos données et statistiques",
      "Storytelling visuel pour capter l'attention",
      "Icônes et illustrations personnalisées",
      "Versions web et print"
    ],
    deliverables: [
      "Infographie complète en haute définition",
      "Version web optimisée pour le partage",
      "Version print haute résolution",
      "Fichiers sources modifiables"
    ],
    duration: "5-7 jours",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // IDENTITÉ VISUELLE (3 services)
  // ═══════════════════════════════════════════════════════════
  {
    id: 8,
    title: "Création de Logo Professionnel",
    category: "Identité Visuelle",
    icon: Zap,
    description: "Conception d'un logo unique, mémorable et intemporel qui représente parfaitement l'essence de votre marque.",
    features: [
      "Recherche approfondie et analyse de votre secteur",
      "3 à 5 propositions de concepts originaux",
      "3 séries de révisions majeures incluses",
      "Déclinaisons couleurs, noir & blanc et monochrome",
      "Tous les formats pour web et print"
    ],
    deliverables: [
      "Logo en haute résolution (PNG, JPEG, SVG)",
      "Versions couleur, noir & blanc, monochrome",
      "Fichiers sources vectoriels (AI, EPS)",
      "Guide d'utilisation du logo (mini charte)"
    ],
    duration: "1-2 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 9,
    title: "Charte Graphique Complète",
    category: "Identité Visuelle",
    icon: Zap,
    description: "Création d'une identité visuelle cohérente et professionnelle pour garantir une communication uniforme sur tous vos supports.",
    features: [
      "Logo principal et toutes ses variantes",
      "Palette de couleurs (primaires et secondaires)",
      "Choix des typographies officielles",
      "Règles d'utilisation détaillées et exemples",
      "Applications sur différents supports"
    ],
    deliverables: [
      "Brandbook complet (PDF de 20-30 pages)",
      "Tous les fichiers logo dans tous les formats",
      "Templates de documents (papier à en-tête, signature email)",
      "Guide des bonnes pratiques d'utilisation"
    ],
    duration: "2-3 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 10,
    title: "Refonte d'Identité Visuelle",
    category: "Identité Visuelle",
    icon: Zap,
    description: "Modernisation et actualisation de votre identité de marque pour rester pertinent et attractif.",
    features: [
      "Audit complet de votre identité actuelle",
      "Modernisation ou redesign du logo",
      "Mise à jour complète de la charte graphique",
      "Stratégie de transition en douceur",
      "Déclinaisons sur tous vos supports existants"
    ],
    deliverables: [
      "Nouvelle identité visuelle complète",
      "Comparatif avant/après détaillé",
      "Plan de déploiement progressif",
      "Tous les fichiers actualisés et nouveaux"
    ],
    duration: "3-4 semaines",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // GESTION DE PROJET (2 services)
  // ═══════════════════════════════════════════════════════════
  {
    id: 11,
    title: "Accompagnement Projet Digital",
    category: "Gestion de Projet",
    icon: CheckSquare,
    description: "Pilotage complet de votre projet digital de A à Z avec méthodologie agile pour garantir le succès.",
    features: [
      "Cadrage précis et définition du périmètre",
      "Planning détaillé avec jalons et livrables",
      "Coordination des équipes et prestataires",
      "Reporting hebdomadaire de l'avancement",
      "Gestion proactive des risques et changements"
    ],
    deliverables: [
      "Plan de projet complet et détaillé",
      "Tableaux de bord de suivi en temps réel",
      "Comptes-rendus de toutes les réunions",
      "Documentation projet exhaustive"
    ],
    duration: "Selon la durée du projet",
    price: "Sur devis",
    featured: true
  },
  {
    id: 12,
    title: "Audit & Consulting Digital",
    category: "Gestion de Projet",
    icon: CheckSquare,
    description: "Analyse approfondie de votre écosystème digital avec recommandations stratégiques actionnables.",
    features: [
      "Audit 360° de votre présence digitale",
      "Analyse comparative de la concurrence",
      "Identification des opportunités de croissance",
      "Plan d'action priorisé et chiffré",
      "Session de présentation et questions-réponses"
    ],
    deliverables: [
      "Rapport d'audit détaillé (30+ pages)",
      "Matrice d'opportunités et quick wins",
      "Roadmap stratégique sur 6-12 mois",
      "Présentation PowerPoint exécutive"
    ],
    duration: "2-3 semaines",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // CONCEPTION DE DOCUMENTS (4 services)
  // ═══════════════════════════════════════════════════════════
  {
    id: 13,
    title: "Business Plan Professionnel",
    category: "Conception de Documents",
    icon: FileText,
    description: "Rédaction et mise en page d'un business plan complet et convaincant pour séduire investisseurs et partenaires.",
    features: [
      "Analyse de marché approfondie et documentée",
      "Projections financières réalistes sur 3-5 ans",
      "Stratégie commerciale et plan marketing détaillés",
      "Design professionnel et moderne",
      "Versions française et anglaise disponibles"
    ],
    deliverables: [
      "Business plan complet (40-60 pages)",
      "Version PDF haute qualité pour impression",
      "Fichiers sources modifiables (Word/PowerPoint)",
      "Présentation PowerPoint executive summary"
    ],
    duration: "2-3 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 14,
    title: "Présentation PowerPoint Professionnelle",
    category: "Conception de Documents",
    icon: FileText,
    description: "Création de présentations visuellement impactantes pour vos pitchs, réunions et conférences.",
    features: [
      "Design moderne et professionnel sur mesure",
      "20 à 30 slides personnalisées",
      "Animations et transitions fluides",
      "Infographies et visualisation de données",
      "Cohérence avec votre identité visuelle"
    ],
    deliverables: [
      "Fichier PowerPoint entièrement éditable",
      "Version PDF pour envoi et partage",
      "Template réutilisable pour futures présentations",
      "Guide de présentation avec conseils"
    ],
    duration: "5-7 jours",
    price: "Sur devis",
    featured: false
  },
  {
    id: 15,
    title: "Rapports & Documents Corporate",
    category: "Conception de Documents",
    icon: FileText,
    description: "Mise en page professionnelle de vos rapports annuels, études de cas et documents officiels.",
    features: [
      "Mise en page sophistiquée et élégante",
      "Intégration harmonieuse de graphiques et tableaux",
      "Respect strict de votre identité visuelle",
      "Sommaire interactif et navigation optimisée",
      "Formats print et digital optimisés"
    ],
    deliverables: [
      "Document finalisé (PDF et Word)",
      "Version imprimable haute définition",
      "Version web optimisée et légère",
      "Template pour vos futurs documents"
    ],
    duration: "1-2 semaines",
    price: "Sur devis",
    featured: false
  },
  {
    id: 16,
    title: "CV & Lettre de Motivation Premium",
    category: "Conception de Documents",
    icon: FileText,
    description: "Création d'un CV design et d'une lettre de motivation percutante pour vous démarquer auprès des recruteurs.",
    features: [
      "Design unique et moderne qui attire l'œil",
      "Mise en valeur stratégique de votre parcours",
      "Versions courte (1-2 pages) et détaillée",
      "Format digital interactif (option)",
      "Lettre de motivation personnalisée assortie"
    ],
    deliverables: [
      "CV aux formats PDF et Word éditable",
      "Portfolio digital (si applicable)",
      "Template lettre de motivation personnalisable",
      "Optimisation profil LinkedIn"
    ],
    duration: "3-5 jours",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // PRINT & IMPRESSION (3 services)
  // ═══════════════════════════════════════════════════════════
  {
    id: 17,
    title: "Cartes de Visite Professionnelles",
    category: "Print & Impression",
    icon: Printer,
    description: "Conception et impression de cartes de visite élégantes qui laissent une impression mémorable.",
    features: [
      "Design recto-verso personnalisé et professionnel",
      "Plusieurs propositions de concepts créatifs",
      "Choix du papier et des finitions premium",
      "Impression haute qualité incluse",
      "Quantité de 100 à 500 exemplaires"
    ],
    deliverables: [
      "Fichiers de design finalisés pour réimpression",
      "Cartes imprimées et livrées",
      "BAT (Bon à tirer) pour validation avant impression",
      "Fichiers sources pour futures modifications"
    ],
    duration: "1 semaine",
    price: "Sur devis",
    featured: false
  },
  {
    id: 18,
    title: "Brochures & Catalogues Produits",
    category: "Print & Impression",
    icon: Printer,
    description: "Conception de brochures et catalogues attractifs pour présenter efficacement votre offre de produits ou services.",
    features: [
      "Design multi-pages (8 à 32 pages)",
      "Mise en page professionnelle et aérée",
      "Intégration harmonieuse des photos produits",
      "Version print et PDF interactif",
      "Impression haute qualité disponible"
    ],
    deliverables: [
      "Brochure ou catalogue finalisé",
      "Version PDF interactive avec liens cliquables",
      "Fichiers print haute définition",
      "Devis impression détaillé selon quantités"
    ],
    duration: "2-3 semaines",
    price: "Sur devis",
    featured: false
  },
  {
    id: 19,
    title: "Signalétique & Kakémonos",
    category: "Print & Impression",
    icon: Printer,
    description: "Création de supports grand format impactants pour événements, salons professionnels et points de vente.",
    features: [
      "Design impactant spécial grand format",
      "Roll-up, bannières, kakémonos, totems",
      "Bâches et panneaux publicitaires extérieurs",
      "Adaptation à tous formats standards",
      "Coordination avec imprimeurs partenaires"
    ],
    deliverables: [
      "Fichiers haute résolution optimisés pour impression",
      "BAT pour validation avant production",
      "Recommandations techniques d'impression",
      "Suivi de l'impression si souhaité"
    ],
    duration: "1-2 semaines",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // PHOTOGRAPHIE & VIDÉO (3 services)
  // ═══════════════════════════════════════════════════════════
  {
    id: 20,
    title: "Shooting Photo Produits Professionnel",
    category: "Photographie & Vidéo",
    icon: Camera,
    description: "Séance photo professionnelle de vos produits pour valoriser votre e-commerce et communication visuelle.",
    features: [
      "Studio photo professionnel avec équipement premium",
      "20 à 50 produits photographiés",
      "Plusieurs angles par produit pour variété",
      "Retouche professionnelle et détourage inclus",
      "Fond blanc neutre et mise en situation lifestyle"
    ],
    deliverables: [
      "Photos haute définition retouchées (JPEG)",
      "Images détourées sur fond transparent (PNG)",
      "Versions web optimisées pour chargement rapide",
      "Droits d'utilisation complets et illimités"
    ],
    duration: "1-2 jours",
    price: "Sur devis",
    featured: true
  },
  {
    id: 21,
    title: "Vidéo Promotionnelle & Publicité",
    category: "Photographie & Vidéo",
    icon: Camera,
    description: "Réalisation de vidéos courtes et percutantes pour booster votre visibilité sur les réseaux sociaux et en publicité.",
    features: [
      "Vidéo de 30 secondes à 2 minutes",
      "Tournage professionnel avec équipe qualifiée",
      "Montage dynamique avec effets visuels",
      "Musique libre de droits et voix-off professionnelle",
      "Sous-titres pour accessibilité"
    ],
    deliverables: [
      "Vidéo finale en haute définition (MP4)",
      "Versions adaptées pour chaque réseau social",
      "Miniatures attractives et teasers courts",
      "Fichiers sources (en option avec supplément)"
    ],
    duration: "1-2 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 22,
    title: "Reportage Photo Événement",
    category: "Photographie & Vidéo",
    icon: Camera,
    description: "Couverture photographique complète et professionnelle de vos événements d'entreprise, séminaires et conférences.",
    features: [
      "Couverture complète de l'événement du début à la fin",
      "Photographe professionnel dédié sur place",
      "Photos naturelles et photos posées",
      "Retouche professionnelle et sélection des meilleures",
      "100 à 300 photos livrées selon durée"
    ],
    deliverables: [
      "Galerie photo en ligne privée sécurisée",
      "Photos haute définition retouchées",
      "Versions web optimisées pour réseaux sociaux",
      "Album photo numérique consultable"
    ],
    duration: "Jour de l'événement + 1 semaine traitement",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // SEO & RÉFÉRENCEMENT (3 services)
  // ═══════════════════════════════════════════════════════════
  {
    id: 23,
    title: "Audit SEO Complet",
    category: "SEO & Référencement",
    icon: Search,
    description: "Analyse approfondie de votre site web avec plan d'action concret pour améliorer votre visibilité sur Google.",
    features: [
      "Audit technique SEO (vitesse, mobile, indexation)",
      "Analyse approfondie des mots-clés et contenu",
      "Étude comparative de la concurrence",
      "Audit du profil de backlinks",
      "Recommandations priorisées et actionnables"
    ],
    deliverables: [
      "Rapport d'audit détaillé et complet (40+ pages)",
      "Liste de mots-clés stratégiques ciblés",
      "Plan d'action SEO priorisé sur 6-12 mois",
      "Session de présentation et formation"
    ],
    duration: "2-3 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 24,
    title: "Optimisation SEO On-Page",
    category: "SEO & Référencement",
    icon: "Search",
    description: "Optimisation technique et de contenu de votre site pour améliorer significativement votre classement sur Google.",
    features: [
      "Optimisation complète des balises (title, meta, H1-H6)",
      "Amélioration de la structure des URLs",
      "Optimisation des images et médias (compression, alt)",
      "Amélioration significative de la vitesse de chargement",
      "Création et optimisation du sitemap XML"
    ],
    deliverables: [
      "Site optimisé techniquement selon standards SEO",
      "Rapport détaillé des optimisations effectuées",
      "Guide des bonnes pratiques SEO pour l'avenir",
      "Suivi des performances pendant 3 mois"
    ],
    duration: "2-4 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 25,
    title: "Rédaction SEO & Content Marketing",
    category: "SEO & Référencement",
    icon: Search,
    description: "Création régulière de contenus optimisés SEO pour attirer du trafic qualifié et engager votre audience.",
    features: [
      "Recherche approfondie de mots-clés ciblés",
      "Rédaction d'articles de blog optimisés (800-1500 mots)",
      "Optimisation SEO complète de chaque article",
      "Pack de 5 à 10 articles par mois",
      "Intégration directe sur votre site web"
    ],
    deliverables: [
      "Articles publiés directement sur votre site",
      "Calendrier éditorial stratégique mensuel",
      "Rapport mensuel de performance SEO",
      "Images et visuels inclus pour chaque article"
    ],
    duration: "Abonnement mensuel",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // EMAIL MARKETING (3 services)
  // ═══════════════════════════════════════════════════════════
  {
    id: 26,
    title: "Campagne Email Marketing",
    category: "Email Marketing",
    icon: Mail,
    description: "Conception et envoi de campagnes emails professionnelles pour engager vos clients et booster vos conversions.",
    features: [
      "Design d'email responsive et attractif",
      "Rédaction de contenu persuasif et engageant",
      "Segmentation intelligente de votre base de contacts",
      "Envoi via plateforme professionnelle",
      "Analyse détaillée des performances (ouverture, clics, conversion)"
    ],
    deliverables: [
      "Email(s) designé(s) et testé(s) sur tous supports",
      "Rapport de performance détaillé post-campagne",
      "Liste des bonnes pratiques email marketing",
      "Templates réutilisables pour futures campagnes"
    ],
    duration: "1 semaine",
    price: "Sur devis",
    featured: false
  },
  {
    id: 27,
    title: "Automatisation Email Marketing",
    category: "Email Marketing",
    icon: Mail,
    description: "Mise en place de séquences d'emails automatisées pour nourrir vos prospects et clients en autopilote.",
    features: [
      "Configuration plateforme email (Mailchimp, Sendinblue, Brevo)",
      "Création de workflows automatisés intelligents",
      "Séquences de bienvenue, nurturing, panier abandonné",
      "Design de 5 à 10 templates d'emails professionnels",
      "Formation complète à la gestion de la plateforme"
    ],
    deliverables: [
      "Workflows configurés et actifs immédiatement",
      "Templates d'emails prêts à l'emploi",
      "Documentation complète d'utilisation",
      "2 mois de suivi et ajustements inclus"
    ],
    duration: "2-3 semaines",
    price: "Sur devis",
    featured: true
  },
  {
    id: 28,
    title: "Newsletter Mensuelle Professionnelle",
    category: "Email Marketing",
    icon: Mail,
    description: "Service récurrent de création et envoi de votre newsletter pour maintenir le lien avec votre audience.",
    features: [
      "Design mensuel personnalisé et cohérent",
      "Rédaction du contenu (actualités, offres, conseils)",
      "Intégration d'images et liens pertinents",
      "Envoi programmé à votre base de contacts",
      "Rapport mensuel détaillé de performance"
    ],
    deliverables: [
      "Newsletter créée et envoyée chaque mois",
      "Archive web consultable de chaque édition",
      "Rapport analytics mensuel complet",
      "Optimisation continue basée sur les performances"
    ],
    duration: "Abonnement mensuel récurrent",
    price: "Sur devis",
    featured: false
  },

  // ═══════════════════════════════════════════════════════════
  // PACK PME (1 service)
  // ═══════════════════════════════════════════════════════════
  {
    id: 29,
    title: "Pack Startup - Lancement Express",
    category: "Pack PME",
    icon: Briefcase,
    description: "Pack tout-en-un pour lancer votre startup rapidement avec tous les essentiels : identité, présence web et supports de communication.",
    features: [
      "Création de logo professionnel avec 3 révisions",
      "Charte graphique simplifiée (couleurs + typographies)",
      "Site web vitrine 5 pages responsive et moderne",
      "Cartes de visite (design + impression 100 exemplaires)",
      "Pack de 10 visuels pour réseaux sociaux",
      "1 mois d'accompagnement et support post-lancement"
    ],
    deliverables: [
      "Identité visuelle complète et cohérente",
      "Site web en ligne, fonctionnel et optimisé",
      "Cartes de visite imprimées et livrées",
      "Kit digital complet pour réseaux sociaux",
      "Tous les fichiers sources pour modifications futures",
      "Formation complète à la gestion du site"
    ],
    duration: "4-8 semaines",
    price: "Sur devis",
    featured: true
  }
]