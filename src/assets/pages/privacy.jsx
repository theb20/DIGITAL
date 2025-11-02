import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import {
  Shield,
  Cookie,
  Lock,
  Eye,
  FileText,
  CheckCircle,
  Mail,
  Calendar,
  Database,
  Globe,
  AlertTriangle,
  Users,
  Moon,
  Bell,
  Trash2,
  Download,
  Sun,
  MapPin,
  Cpu,
  Rocket,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Info,
  Menu,
  Sparkles,
  HelpCircle,
  TrendingUp,
  Clock,
  Award,
Target,
  Zap,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
const PolicySection = ({
  id,
  icon,
  title,
  badge,
  badgeColor,
  expanded,
  onToggle,
  children,

}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
    indigo: "bg-indigo-50 text-indigo-700 border-indigo-200",
  };


  return (
    <div id={`section-${id}`} className="bg-dark border border-gray-50 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm hover:shadow-md  transition-all duration-300 scroll-mt-24">
      <button
        onClick={onToggle}
        className="w-full flex justify-between items-center p-6 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors group"
      >
        <div className="flex items-center gap-4 flex-1 text-left">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg text-white shadow-sm group-hover:shadow-md transition-shadow">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-dark text-lg mb-1.5">{title}</h3>
            <span
              className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${
                colorClasses[badgeColor] || "bg-gray-50 text-gray-700 border-gray-200"
              }`}
            >
              {badge}
            </span>
          </div>
        </div>
        <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
        </div>
      </button>
      {expanded && (
        <div className="px-6 pb-6 pt-2 border-t border-gray-100 animate-fadeIn">
          {children}
        </div>
      )}
    </div>
  );
};

const InfoCard = ({id, icon, title, description }) => (
  <div id={`section-${id}`} className="bg-blue-50 dark:bg-slate-900  rounded-xl p-6 mb-8 shadow-md transition-shadow">
    <div className="flex items-start gap-3">
      <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
        {icon}
      </div>
      <div>
        <h4 className="font-semibold text-dark mb-1">{title}</h4>
        <p className="text-sm text-sub leading-relaxed">{description}</p>
      </div>
    </div>
  </div>
);

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [darkMode, setDarkMode] = useState(() => {
    // Récupérer la préférence depuis localStorage au chargement
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
     // Sauvegarder la préférence du mode sombre dans localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Ajouter ou retirer la classe 'dark' sur le body pour une transition globale
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    const hash = location.hash.replace('#', '');
    if (hash.startsWith('section-')) {
      const sectionId = parseInt(hash.split('-')[1]);
      setActiveSection(sectionId);
      setExpandedSection(sectionId);
      
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [location.hash]);

  const lastUpdated = "17 octobre 2025";

  const sections = [
    { id: 1, icon: Database, title: "Protection des données", badge: "Priorité n°1", color: "blue" },
    { id: 2, icon: Eye, title: "Transparence totale", badge: "Sans détour", color: "green" },
    { id: 3, icon: Globe, title: "Ouverture au monde", badge: "Vision", color: "purple" },
    { id: 4, icon: Lock, title: "Sécurité avancée", badge: "Confiance", color: "red" },
    { id: 5, icon: Shield, title: "Respect et Conformité", badge: "RGPD", color: "indigo" },
    { id: 6, icon: Cookie, title: "Personnalisation contrôlée", badge: "Mesure", color: "blue" },
    { id: 7, icon: Calendar, title: "Gestion responsable", badge: "Durabilité", color: "purple" },
    { id: 8, icon: Mail, title: "Support humain", badge: "Proximité", color: "green" },
    { id: 9, icon: FileText, title: "Mentions légales", badge: "Obligatoire", color: "gray" },
    { id: 10, icon: FileText, title: "CGV", badge: "Vente", color: "gray" },
    { id: 11, icon: FileText, title: "CGU", badge: "Utilisation", color: "gray" },
    { id: 12, icon: FileText, title: "Politique de confidentialité", badge: "Vie privée", color: "gray" },
    { id: 13, icon: HelpCircle, title: "FAQ", badge: "Questions", color: "amber" },
    { id: 14, icon: HelpCircle, title: "Garanties", badge: "Assurance", color: "amber" },
  ];


  const toggleSection = (id) => {
    setExpandedSection(expandedSection === id ? null : id);
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(`section-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setExpandedSection(id);
      setSidebarOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('[id^="section-"]');
      let current = 1;
      
      sections.forEach((section) => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= 150) {
          current = parseInt(section.id.split('-')[1]);
        }
      });
      
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

 
  return (
    <div className="min-h-screen  bg-dark">
      {/* Header Sticky */}
      <header className="bg-dark  border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <X className="text-dark w-6 h-6" /> : <Menu className="text-dark w-6 h-6" />}
              </button>
              <div 
              onClick={() => navigate('/')}
              className="w-12 h-12 rounded-xl shadow-lg">
                <img src={"/img/web-app-manifest-512x512.png"} className="w-full" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-dark">
                  Transparence & Sécurité
                </h1>
                <p className="text-xs sm:text-sm text-sub flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Digital
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-sub">Mis à jour le</span>
              <span className="px-3 py-1.5 backdrop-blur-sm bg-white/10 text-green-700 text-xs font-semibold rounded-lg border border-green-200">
                {lastUpdated}
              </span>

               <button
                  onClick={toggleDarkMode}
                  className={`p-2 flex items-center justify-center rounded-lg transition-all ${
                    darkMode
                      ? ' text-yellow-400 hover:bg-gray-200'
                      : ' text-gray-700 hover:bg-gray-200'
                    }`}
                      aria-label="Toggle dark mode"
                    >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 lg:top-20 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)]
          w-80 bg-dark z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          overflow-y-auto
        `}>
          <div className="p-6 sticky flex justify-between top-0 bg-dark lg:border-b dark:border-0 border-gray-200">
            <div className="">
              <h2 className="font-bold text-dark mb-2 ">Sommaire</h2>
            <p className="text-sm text-sub">Cliquez pour naviguer</p>
            </div>

            <button
                  onClick={toggleDarkMode}
                  className={`p-2 flex lg:hidden  items-center justify-center rounded-lg transition-all ${
                    darkMode
                      ? ' text-yellow-400 hover:bg-gray-200'
                      : ' text-gray-700 hover:bg-gray-200'
                    }`}
                      aria-label="Toggle dark mode"
                    >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            
          </div>
          
          <nav className="p-4 space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              const isActive = activeSection === section.id;
              
              return (
                <button
  key={section.id}
  onClick={() => scrollToSection(section.id)}
  className={`
    w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
    ${isActive 
      ? 'bg-blue-600 text-white shadow-lg'   // état actif
      : 'bg-dark hover:bg-blue-50 hover:text-blue-600' // état normal + hover
    }
  `}
>
  {/* Icon */}
  <div className={`
    p-2 rounded-lg transition-colors
    ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'}
  `}>
    <Icon className="w-4 h-4" />
  </div>

  {/* Texte */}
  <div className="flex-1">
    <div className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-dark group-hover:text-blue-600'}`}>
      {section.id}. {section.title}
    </div>
    <div className={`text-xs transition-colors ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-blue-500'}`}>
      {section.badge}
    </div>
  </div>

  {/* Chevron */}
  <ChevronRight className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
                </button>


              );
            })}
          </nav>

          <nav className="px-4 pb-4">
            <ul className="space-y-2">
              <li>
                <a
                  href="/"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  Accueil
                </a>
              </li>
              <li>
                <a
                  href="/contact"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  Contact
                </a>
              </li>
              <li>
                <a
                  href="/blog"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Blog
                </a>
              </li>
            </ul>
          </nav>

          <div className="p-4 mt-4 border-t border-gray-200">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <Info className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="font-semibold text-amber-900 text-sm mb-1">Besoin d'aide ?</h4>
              <p className="text-xs text-amber-800 mb-3">
                Notre équipe est disponible pour répondre à vos questions
              </p>
              <a
                href="mailto:privacy@filterfinder.com"
                className="text-xs text-amber-700 font-semibold hover:text-amber-800 flex items-center gap-1"
              >
                Nous contacter
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
                  onClick={toggleDarkMode}
                  className={`p-2 flex lg:hidden  items-center justify-center rounded-lg transition-all ${
                    darkMode
                      ? ' text-yellow-400 hover:bg-gray-200'
                      : ' text-gray-700 hover:bg-gray-200'
                    }`}
                      aria-label="Toggle dark mode"
                    >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </aside>

        {/* Overlay pour mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          {/* Hero Section */}
          <section className="relative bg-gradient-to-br from-blue-500 via-blue-500 to-blue-600 text-white overflow-hidden rounded-3xl mb-12">
            <div className="absolute inset-0 bg-grid-white/10"></div>
            <div className="relative px-6 sm:px-8 py-12 sm:py-16">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Conforme RGPD & ePrivacy</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                  Votre vie privée est<br />notre priorité absolue
                </h2>
                <p className="text-base sm:text-lg text-orange-50 leading-relaxed mb-8">
                  Nous nous engageons à protéger vos données personnelles avec les plus hauts 
                  standards de sécurité, de transparence et de conformité réglementaire.
                </p>
                <div className="flex flex-wrap gap-4">
                  <button
                  onClick={()=>navigate('/contact')}
                  className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg">
                    Contactez-nous
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Overview */}
          <div className="bg-blue-100 border border-blue-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Résumé en bref</h3>
                <p className="text-sm text-blue-800 leading-relaxed">
                  Cette politique explique comment Digital collecte, utilise et protège vos données personnelles. 
                  Nous respectons strictement le RGPD et ne partageons jamais vos informations sans votre consentement explicite.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <InfoCard
              icon={<Lock className="w-5 h-5" />}
              title="Sécurité maximale"
              description="Chiffrement SSL/TLS et conformité aux normes ISO 27001"
            />
            <InfoCard
              icon={<Shield className="w-5 h-5" />}
              title="RGPD compliant"
              description="Respect total de vos droits et de la réglementation européenne"
            />
            <InfoCard
              icon={<Users className="w-5 h-5" />}
              title="Transparence totale"
              description="Vous savez exactement quelles données nous collectons et pourquoi"
            />
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <PolicySection
              id={1}
              icon={<Database className="w-5 h-5" />}
              title="1. Données que nous collectons"
              badge="Essentiel"
              badgeColor="blue"
              expanded={expandedSection === 1}
              onToggle={() => toggleSection(1)}
            >
              <div className="space-y-8">

                {/* Catégorie 1 : Informations personnelles fournies directement */}
                <section className="space-y-3">
                  <h4 className="text-lg font-semibold text-dark">1.1. Informations personnelles fournies directement</h4>
                  <p className="text-dark">
                    Nous collectons les informations que vous nous fournissez volontairement lors de la création d’un compte, 
                    de la demande d’un service ou lors d’un contact direct. Cela inclut :
                  </p>
                  <ul className="list-disc ml-6 text-dark space-y-1">
                    <li>Nom, prénom</li>
                    <li>Adresse e-mail et numéro de téléphone</li>
                    <li>Identifiants de connexion (si applicable)</li>
                    <li>Contenu soumis volontairement (messages, formulaires, demandes)</li>
                  </ul>
                </section>

                {/* Catégorie 2 : Données techniques et de navigation */}
                <section className="space-y-3">
                  <h4 className="text-lg font-semibold text-dark">1.2. Données techniques et de navigation</h4>
                  <p className="text-dark">
                    Lors de l’utilisation de nos services, des informations techniques sont automatiquement enregistrées afin 
                    de garantir le bon fonctionnement, la sécurité et l’optimisation de notre plateforme :
                  </p>
                  <ul className="list-disc ml-6 text-dark space-y-1">
                    <li>Adresse IP et localisation approximative</li>
                    <li>Type d’appareil utilisé</li>
                    <li>Système d’exploitation et navigateur</li>
                    <li>Pages consultées et durée de navigation</li>
                    <li>Cookies, identifiants uniques et données analytiques</li>
                  </ul>
                </section>

                {/* Catégorie 3 : Données liées aux transactions */}
                <section className="space-y-3">
                  <h4 className="text-lg font-semibold text-dark">1.3. Données liées aux transactions</h4>
                  <p className="text-dark">
                    Lorsqu’un paiement ou une souscription est effectuée, certaines informations sont enregistrées 
                    à des fins de facturation et de suivi :
                  </p>
                  <ul className="list-disc ml-6 text-dark space-y-1">
                    <li>Historique des achats ou commandes</li>
                    <li>Montant des transactions</li>
                    <li>Date et statut du paiement</li>
                    <li>Méthode de paiement</li>
                  </ul>
                  <p className="text-dark italic">
                    Les données bancaires ne sont jamais stockées par notre entreprise et sont gérées exclusivement 
                    par des prestataires sécurisés.
                  </p>
                </section>

                {/* Catégorie 4 : Données issues des interactions */}
                <section className="space-y-3">
                  <h4 className="text-lg font-semibold text-dark">1.4. Données issues de vos interactions avec nous</h4>
                  <p className="text-dark">
                    Nous collectons également toutes les données liées à vos échanges avec nos services :
                  </p>
                  <ul className="list-disc ml-6 text-dark space-y-1">
                    <li>Messages envoyés au support client</li>
                    <li>Avis, commentaires, publications ou retours</li>
                    <li>Fichiers ou pièces jointes partagés</li>
                  </ul>
                </section>

                {/* Catégorie 5 : Données reçues via des services tiers */}
                <section className="space-y-3">
                  <h4 className="text-lg font-semibold text-dark">1.5. Données provenant de services tiers</h4>
                  <p className="text-dark">
                    Certains outils que vous utilisez avec nos services peuvent nous transmettre des informations complémentaires :
                  </p>
                  <ul className="list-disc ml-6 text-dark space-y-1">
                    <li>Outils d’analyse (ex. : Google Analytics)</li>
                    <li>Outils publicitaires ou réseaux sociaux (ex. : Facebook Pixel)</li>
                    <li>Prestataires de paiement</li>
                    <li>Services d’intégration ou d’authentification</li>
                  </ul>
                  <p className="text-gray-700 italic">
                    Chaque service tiers dispose de sa propre politique de confidentialité.
                  </p>
                </section>

                {/* Catégorie 6 : Données de sécurité */}
                <section className="space-y-3">
                  <h4 className="text-lg font-semibold text-dark">1.6. Données liées à la sécurité et à la prévention</h4>
                  <p className="text-dark"> 
                    Dans le cadre de la protection de nos utilisateurs, nous pouvons enregistrer certaines données destinées 
                    à détecter, prévenir et gérer les comportements non autorisés ou malveillants :
                  </p>
                  <ul className="list-disc ml-6 text-dark space-y-1">
                    <li>Logs de connexion</li>
                    <li>Tentatives d’accès non autorisées</li>
                    <li>Alertes et informations relatives à la sécurité</li>
                  </ul>
                </section>

              </div>


            </PolicySection>
            
            <PolicySection
              id={2}
              icon={<Eye className="w-5 h-5" />}
              title="2. Comment nous utilisons vos données"
              badge="Important"
              badgeColor="green"
              expanded={expandedSection === 2}
              onToggle={() => toggleSection(2)}
            >
              <div className="space-y-8">

              {/* Utilisation 1 : Fourniture et gestion des services */}
              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-dark">2.1. Fournir et gérer nos services</h4>
                <p className="text-dark">
                  Nous utilisons vos informations afin de garantir le fonctionnement optimal de nos services :
                </p>
                <ul className="list-disc ml-6 text-dark space-y-1">
                  <li>Création et gestion de votre compte utilisateur</li>
                  <li>Accès à nos fonctionnalités et contenu</li>
                  <li>Traitement de vos demandes, commandes ou réservations</li>
                  <li>Suivi et historique de vos interactions avec notre plateforme</li>
                </ul>
              </section>

              {/* Utilisation 2 : Amélioration continue */}
              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-dark">2.2. Améliorer nos services et l’expérience utilisateur</h4>
                <p className="text-dark">
                  Les données collectées sont essentielles pour optimiser nos outils et comprendre vos besoins :
                </p>
                <ul className="list-disc ml-6 text-dark space-y-1">
                  <li>Analyse des performances et du comportement utilisateur</li>
                  <li>Tests, développement et amélioration des fonctionnalités</li>
                  <li>Personnalisation du contenu affiché</li>
                  <li>Correction de bugs et optimisation technique</li>
                </ul>
              </section>

              {/* Utilisation 3 : Communication */}
              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-dark">2.3. Communiquer avec vous</h4>
                <p className="text-dark">
                  Nous pouvons utiliser vos informations pour vous envoyer des messages utiles ou nécessaires :
                </p>
                <ul className="list-disc ml-6 text-dark space-y-1">
                  <li>Notifications sur votre compte ou vos activités</li>
                  <li>Réponses à vos demandes au support</li>
                  <li>Envoi d’alertes importantes (sécurité, modifications de services...)</li>
                  <li>Informations commerciales ou newsletters (avec votre consentement)</li>
                </ul>
              </section>

              {/* Utilisation 4 : Sécurité et prévention */}
              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-dark">2.4. Sécuriser la plateforme et prévenir les abus</h4>
                <p className="text-dark">
                  Vos données sont également utilisées pour garantir un environnement sûr :
                </p>
                <ul className="list-disc ml-6 text-dark space-y-1">
                  <li>Détection des comportements suspects ou frauduleux</li>
                  <li>Protection contre les failles de sécurité</li>
                  <li>Vérifications techniques (logs, diagnostics, alertes)</li>
                  <li>Application de nos conditions d’utilisation</li>
                </ul>
              </section>

              {/* Utilisation 5 : Obligations légales */}
              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-dark">2.5. Conformité aux obligations légales</h4>
                <p className="text-dark">
                  Certaines informations peuvent être utilisées pour répondre à nos obligations administratives ou légales :
                </p>
                <ul className="list-disc ml-6 text-dark space-y-1">
                  <li>Facturation et comptabilité</li>
                  <li>Demandes officielles des autorités</li>
                  <li>Respect du cadre juridique (RGPD, lutte contre la fraude, etc.)</li>
                </ul>
              </section>

              {/* Utilisation 6 : Statistiques et analyses globales */}
              <section className="space-y-3">
                <h4 className="text-lg font-semibold text-dark">2.6. Analyse statistique et rapports internes</h4>
                <p className="text-dark">
                  Nous utilisons certaines données de manière anonymisée ou agrégée afin de produire des analyses utiles :
                </p>
                <ul className="list-disc ml-6 text-dark space-y-1">
                  <li>Rapports de performance</li>
                  <li>Suivi des tendances générales</li>
                  <li>Amélioration de nos décisions stratégiques</li>
                </ul>
              </section>

            </div>

            </PolicySection>

           <PolicySection
  id={3}
  icon={<Globe className="w-5 h-5" />}
  title="3. Partage et transfert de données"
  badge="Transparence"
  badgeColor="purple"
  expanded={expandedSection === 3}
  onToggle={() => toggleSection(3)}
>
  <div className="space-y-8">

{/* Partage 1 : Prestataires de services */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">3.1. Partage avec nos prestataires</h4>
  <p className="text-dark">
    Nous pouvons partager certaines données avec des prestataires qui nous aident à fournir nos services :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Hébergeurs et fournisseurs de cloud</li>
    <li>Prestataires de paiement sécurisés (Stripe, PayPal, etc.)</li>
    <li>Outils d'analytics et marketing (Google Analytics, etc.)</li>
    <li>Services de support et de maintenance technique</li>
  </ul>
  <p className="text-dark italic">
    Tous les prestataires sont contractuellement tenus à la confidentialité et à la sécurité des données.
  </p>
</section>

{/* Partage 2 : Partage légal */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">3.2. Partage légal et réglementaire</h4>
  <p className="text-dark">
    Dans certains cas, nous devons divulguer vos données pour respecter la loi ou protéger nos droits :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Demandes des autorités publiques ou judiciaires</li>
    <li>Application des obligations fiscales et comptables</li>
    <li>Prévention de fraudes ou de comportements illégaux</li>
  </ul>
</section>

{/* Partage 3 : Transferts internationaux */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">3.3. Transferts internationaux</h4>
  <p className="text-dark">
    Certaines données peuvent être transférées vers des prestataires situés hors de l'Union européenne, notamment pour :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Hébergement cloud ou services techniques</li>
    <li>Traitement de paiements ou services d'analytics</li>
  </ul>
  <p className="text-dark italic">
    Ces transferts respectent les exigences légales et sont sécurisés par des clauses contractuelles standard ou d'autres garanties reconnues.
  </p>
</section>

{/* Partage 4 : Partage volontaire */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">3.4. Partage volontaire par l'utilisateur</h4>
  <p className="text-dark">
    Vous pouvez choisir de partager certaines informations publiquement ou avec d'autres utilisateurs, par exemple :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Commentaires, avis ou contributions sur notre plateforme</li>
    <li>Partage via des réseaux sociaux ou intégrations tierces</li>
  </ul>
</section>

</div>
</PolicySection>

<PolicySection
  id={4}
  icon={<Lock className="w-5 h-5" />}
  title="4. Sécurité de vos données"
  badge="Critique"
  badgeColor="red"
  expanded={expandedSection === 4}
  onToggle={() => toggleSection(4)}
>
  <div className="space-y-8">

{/* Sécurité 1 : Chiffrement */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">4.1. Chiffrement des données</h4>
  <p className="text-dark">
    Vos informations sensibles sont protégées grâce à des techniques de chiffrement modernes :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Chiffrement des données en transit (TLS/HTTPS)</li>
    <li>Chiffrement des données au repos lorsque cela est possible</li>
    <li>Gestion sécurisée des mots de passe (hachage et salage)</li>
  </ul>
</section>

{/* Sécurité 2 : Accès et authentification */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">4.2. Contrôle des accès et authentification</h4>
  <p className="text-dark">
    L'accès aux données est strictement limité aux personnes autorisées :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Accès restreint et journalisé pour les employés et prestataires</li>
    <li>Authentification multi-facteur pour les comptes administrateurs</li>
    <li>Revue régulière des droits d'accès</li>
  </ul>
</section>

{/* Sécurité 3 : Sauvegardes et disponibilité */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">4.3. Sauvegardes et disponibilité</h4>
  <p className="text-dark">
    Nous mettons en place des procédures pour garantir la disponibilité et l'intégrité de vos données :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Sauvegardes régulières et tests de restauration</li>
    <li>Redondance des serveurs et stockage sécurisé</li>
    <li>Surveillance proactive pour prévenir les incidents</li>
  </ul>
</section>

{/* Sécurité 4 : Protection contre les menaces */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">4.4. Protection contre les menaces</h4>
  <p className="text-dark">
    Nous surveillons et protégeons notre plateforme contre les risques potentiels :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Détection et prévention des intrusions</li>
    <li>Analyse et blocage des comportements suspects ou frauduleux</li>
    <li>Mises à jour régulières des systèmes et correctifs de sécurité</li>
  </ul>
</section>

{/* Sécurité 5 : Sensibilisation et audit */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">4.5. Sensibilisation et audits internes</h4>
  <p className="text-dark">
    La sécurité des données est une priorité pour notre équipe :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Formation régulière du personnel aux bonnes pratiques de sécurité</li>
    <li>Audits périodiques de sécurité et conformité</li>
    <li>Plan de réponse aux incidents documenté et testé</li>
  </ul>
</section>

</div>
</PolicySection>

<PolicySection
  id={5}
  icon={<Shield className="w-5 h-5" />}
  title="5. Vos droits RGPD"
  badge="Vos droits"
  badgeColor="indigo"
  expanded={expandedSection === 5}
  onToggle={() => toggleSection(5)}
>
  <div className="space-y-8">

{/* Droit 1 : Accès aux données */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.1. Droit d'accès</h4>
  <p className="text-dark">
    Vous avez le droit de savoir quelles données nous détenons à votre sujet et d'obtenir une copie de celles-ci.
  </p>
</section>

{/* Droit 2 : Rectification */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.2. Droit de rectification</h4>
  <p className="text-dark">
    Vous pouvez demander la correction de toute donnée inexacte ou incomplète vous concernant.
  </p>
</section>

{/* Droit 3 : Effacement */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.3. Droit à l'effacement</h4>
  <p className="text-dark">
    Aussi appelé "droit à l'oubli", il vous permet de demander la suppression de vos données personnelles, 
    sous réserve des obligations légales de conservation.
  </p>
</section>

{/* Droit 4 : Limitation du traitement */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.4. Droit à la limitation du traitement</h4>
  <p className="text-dark">
    Vous pouvez demander que le traitement de vos données soit restreint dans certaines situations, 
    par exemple lorsque vous contestez l'exactitude des données.
  </p>
</section>

{/* Droit 5 : Droit d'opposition */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.5. Droit d'opposition</h4>
  <p className="text-dark">
    Vous pouvez vous opposer au traitement de vos données à des fins de marketing ou dans d'autres circonstances, 
    sauf lorsque le traitement est légalement nécessaire.
  </p>
</section>

{/* Droit 6 : Portabilité des données */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.6. Droit à la portabilité</h4>
  <p className="text-dark">
    Vous pouvez recevoir vos données dans un format structuré, couramment utilisé et lisible par machine, 
    et les transmettre à un autre responsable de traitement si vous le souhaitez.
  </p>
</section>

{/* Droit 7 : Retrait du consentement */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.7. Retrait du consentement</h4>
  <p className="text-dark">
    Lorsque le traitement repose sur votre consentement, vous pouvez le retirer à tout moment sans 
    affecter la licéité du traitement antérieur à ce retrait.
  </p>
</section>

{/* Droit 8 : Réclamation auprès d'une autorité */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.8. Réclamation</h4>
  <p className="text-dark">
    Vous pouvez introduire une réclamation auprès de la CNIL ou de toute autre autorité compétente 
    si vous estimez que vos droits ne sont pas respectés.
  </p>
</section>

{/* Contact pour exercer vos droits */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">5.9. Comment exercer vos droits</h4>
  <p className="text-dark">
    Pour toute demande concernant vos données personnelles, contactez notre délégué à la protection des données :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Email : dpo@tonentreprise.com</li>
    <li>Téléphone : +33 1 23 45 67 89</li>
    <li>Adresse postale : 12 rue Exemple, 94000 Champigny-sur-Marne, France</li>
  </ul>
</section>

</div>
</PolicySection>

<PolicySection
  id={6}
  icon={<Cookie className="w-5 h-5" />}
  title="6. Cookies et technologies similaires"
  badge="Personnalisation"
  badgeColor="blue"
  expanded={expandedSection === 6}
  onToggle={() => toggleSection(6)}
>
  <div className="space-y-8">

{/* 6.1. Qu'est-ce qu'un cookie ? */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">6.1. Qu'est-ce qu'un cookie ?</h4>
  <p className="text-dark">
    Un cookie est un petit fichier stocké sur votre appareil lorsque vous visitez notre site. 
    Il permet de mémoriser certaines informations pour améliorer votre expérience utilisateur.
  </p>
</section>

{/* 6.2. Types de cookies utilisés */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">6.2. Types de cookies utilisés</h4>
  <p className="text-dark">Nous utilisons plusieurs types de cookies :</p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li><strong>Cookies essentiels :</strong> nécessaires au fonctionnement du site (connexion, panier, sécurité).</li>
    <li><strong>Cookies de performance :</strong> collectent des informations anonymes pour améliorer le site.</li>
    <li><strong>Cookies de fonctionnalité :</strong> mémorisent vos préférences et personnalisations.</li>
    <li><strong>Cookies publicitaires et marketing :</strong> utilisés pour vous proposer des offres adaptées et mesurer l'efficacité de nos campagnes.</li>
  </ul>
</section>

{/* 6.3. Technologies similaires */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">6.3. Technologies similaires</h4>
  <p className="text-dark">
    Nous pouvons également utiliser d'autres technologies de suivi similaires aux cookies, telles que : 
    balises web, pixels ou stockage local, afin d'améliorer nos services et mesurer l'audience.
  </p>
</section>

{/* 6.4. Gestion des cookies */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">6.4. Gestion des cookies</h4>
  <p className="text-dark">
    Vous pouvez gérer vos préférences concernant les cookies directement dans votre navigateur :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Accepter ou refuser certains types de cookies</li>
    <li>Supprimer les cookies déjà stockés</li>
    <li>Configurer les alertes de cookies lors de vos visites</li>
  </ul>
  <p className="text-dark italic">
    Note : le blocage de certains cookies essentiels peut affecter le fonctionnement de certaines fonctionnalités du site.
  </p>
</section>

{/* 6.5. Consentement */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">6.5. Consentement</h4>
  <p className="text-dark">
    En continuant à naviguer sur notre site, vous consentez à l'utilisation des cookies conformément à cette politique. 
    Vous pouvez retirer votre consentement à tout moment via les paramètres de votre navigateur ou notre bandeau cookies.
  </p>
</section>

</div>
</PolicySection>

<PolicySection
  id={7}
  icon={<Calendar className="w-5 h-5" />}
  title="7. Conservation des données"
  badge="Durées"
  badgeColor="purple"
  expanded={expandedSection === 7}
  onToggle={() => toggleSection(7)}
>
  <div className="space-y-8">

{/* 7.1. Durée de conservation */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">7.1. Durée de conservation</h4>
  <p className="text-dark">
    Nous conservons vos données uniquement pour la durée nécessaire aux finalités pour lesquelles elles ont été collectées :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Données de compte et profil : conservées tant que le compte est actif</li>
    <li>Données de transactions et facturation : conservées selon les obligations légales (ex. : 10 ans pour la comptabilité en France)</li>
    <li>Données collectées à des fins de support ou communication : conservées le temps nécessaire pour traiter la demande</li>
    <li>Données anonymisées ou agrégées peuvent être conservées indéfiniment pour des analyses statistiques</li>
  </ul>
</section>

{/* 7.2. Suppression et anonymisation */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">7.2. Suppression et anonymisation</h4>
  <p className="text-dark">
    À l'issue des durées de conservation, vos données sont soit supprimées, soit rendues anonymes afin de préserver votre vie privée.
  </p>
</section>

</div>
</PolicySection>

<PolicySection
  id={8}
  icon={<Mail className="w-5 h-5" />}
  title="8. Contact et réclamations"
  badge="Support"
  badgeColor="green"
  expanded={expandedSection === 8}
  onToggle={() => toggleSection(8)}
>
  <div className="space-y-8">

{/* 8.1. Contact pour les questions sur les données */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">8.1. Contact pour vos questions ou demandes</h4>
  <p className="text-dark">
    Pour toute question sur vos données personnelles ou pour exercer vos droits RGPD, vous pouvez nous contacter :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Email : dpo@tonentreprise.com</li>
    <li>Téléphone : +33 1 23 45 67 89</li>
    <li>Adresse postale : 12 rue Exemple, 94000 Champigny-sur-Marne, France</li>
  </ul>
</section>

{/* 8.2. Réclamations */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">8.2. Réclamations auprès d'une autorité</h4>
  <p className="text-dark">
    Si vous estimez que vos droits ne sont pas respectés, vous pouvez déposer une réclamation auprès de l'autorité compétente (ex. : CNIL en France). 
    Nous vous encourageons également à nous contacter directement afin de résoudre votre demande dans les meilleurs délais.
  </p>
</section>

{/* 8.3. Support technique */}
<section className="space-y-3">
  <h4 className="text-lg font-semibold text-dark">8.3. Support technique</h4>
  <p className="text-dark">
    Pour toute assistance technique ou problème rencontré sur la plateforme, notre équipe support est disponible :
  </p>
  <ul className="list-disc ml-6 text-dark space-y-1">
    <li>Via le formulaire de contact sur le site</li>
    <li>Par email : support@tonentreprise.com</li>
    <li>Par téléphone : +33 1 23 45 67 89</li>
  </ul>
</section>

</div>
</PolicySection>

<PolicySection
  id={9}
  icon={<Mail className="w-5 h-5" />}
  title="9. Mentions légales"
  badge="Support"
  badgeColor="green"
  expanded={expandedSection === 9}
  onToggle={() => toggleSection(9)}
>
  <div className="space-y-6">
<p className="text-dark">
  Conformément à la loi, voici les informations légales de notre entreprise :
</p>
<ul className="list-disc ml-6 text-dark space-y-1">
  <li>Raison sociale : DIGITAL COMPANY</li>
  <li>Siège social : 12 rue Exemple, 94000 Champigny-sur-Marne, France</li>
  <li>Forme juridique : SAS</li>
  <li>Capital social : 10 000 €</li>
  <li>Numéro SIRET : 123 456 789 00012</li>
  <li>Directeur de la publication : Frédérick Ahobaut</li>
  <li>Hébergeur du site : OVH, 2 rue Kellermann, 59100 Roubaix</li>
  <li>Contact : contact@digitalcompany.com</li>
</ul>
</div>
</PolicySection>

<PolicySection
  id={10}
  icon={<FileText className="w-5 h-5" />}
  title="10. Conditions générales de vente"
  badge="Vente"
  badgeColor="gray"
  expanded={expandedSection === 10}
  onToggle={() => toggleSection(10)}
>
  <div className="space-y-6">
<p className="text-dark">
  Les présentes Conditions Générales de Vente régissent la vente de nos produits et services en ligne :
</p>
<ul className="list-disc ml-6 text-dark space-y-1">
  <li>Commandes : modalités, confirmation et acceptation</li>
  <li>Prix et modalités de paiement</li>
  <li>Livraison et délais</li>
  <li>Rétractation et droit de retour</li>
  <li>Garanties légales et service après-vente</li>
  <li>Responsabilité de l'entreprise</li>
  <li>Modification des CGV et loi applicable</li>
</ul>
</div>
</PolicySection>

<PolicySection
  id={11}
  icon={<FileText className="w-5 h-5" />}
  title="11. Conditions générales d'utilisation"
  badge="Utilisation"
  badgeColor="gray"
  expanded={expandedSection === 11}
  onToggle={() => toggleSection(11)}
>
  <div className="space-y-6">
<p className="text-dark">
  Les présentes Conditions Générales d'Utilisation définissent les règles d'accès et d'utilisation de notre plateforme :
</p>
<ul className="list-disc ml-6 text-dark space-y-1">
  <li>Création et utilisation d'un compte utilisateur</li>
  <li>Obligations et interdictions pour les utilisateurs</li>
  <li>Propriété intellectuelle et contenus protégés</li>
  <li>Responsabilité de l'entreprise et de l'utilisateur</li>
  <li>Modification du site et des services</li>
  <li>Litiges et loi applicable</li>
</ul>
</div>
</PolicySection>

<PolicySection
  id={12}
  icon={<FileText className="w-5 h-5" />}
  title="12. Politique de confidentialité"
  badge="Vie privée"
  badgeColor="gray"
  expanded={expandedSection === 12}
  onToggle={() => toggleSection(12)}
>
  <div className="space-y-6">
<p className="text-dark">
  Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles :
</p>
<ul className="list-disc ml-6 text-dark space-y-1">
  <li>Données collectées : informations personnelles, navigation, cookies</li>
  <li>Finalités : gestion de compte, support, marketing, statistiques</li>
  <li>Partage et transferts : prestataires, obligations légales</li>
  <li>Sécurité et conservation : mesures techniques et durée de conservation</li>
  <li>Vos droits : accès, rectification, suppression, portabilité, opposition</li>
  <li>Contact : dpo@digitalcompany.com pour exercer vos droits</li>
</ul>
</div>
</PolicySection>

<PolicySection
id={13}
icon={<HelpCircle className="w-5 h-5" />}
title="13. Foire aux questions"
badge="Questions"
badgeColor="amber"
expanded={expandedSection === 13}
onToggle={() => toggleSection(13)}
>
{(() => {
  const features = [
    { icon: Zap, title: 'Performance Optimale', description: "Des solutions rapides et efficaces qui boostent votre productivité et améliorent l'expérience utilisateur." },
    { icon: Shield, title: 'Sécurité Renforcée', description: 'Protection maximale de vos données avec les dernières technologies de cryptage et protocoles de sécurité.' },
    { icon: TrendingUp, title: 'Croissance Garantie', description: "Stratégies éprouvées pour développer votre présence digitale et augmenter votre chiffre d'affaires." },
    { icon: Users, title: 'Support Dédié', description: "Une équipe d'experts disponible 24/7 pour vous accompagner à chaque étape de votre projet." },
    { icon: Clock, title: 'Livraison Rapide', description: "Respect des délais avec une méthodologie agile pour des résultats concrets en un temps record." },
    { icon: Award, title: 'Qualité Premium', description: "Standards d'excellence et attention aux détails pour des produits qui dépassent vos attentes." },
    { icon: Sparkles, title: 'Innovation Continue', description: 'Technologies de pointe et veille constante pour rester à la pointe des tendances digitales.' },
    { icon: Target, title: 'ROI Mesurable', description: "Analytics détaillés et KPIs précis pour mesurer l'impact réel de votre investissement digital." },
  ];

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <h4 className="text-lg font-semibold text-dark">FAQ - Questions fréquentes</h4>
        <ul className="list-disc ml-6 text-dark space-y-1">
          <li><strong>Comment créer un compte ?</strong> Cliquez sur "S'inscrire" et remplissez le formulaire.</li>
          <li><strong>Comment modifier mes informations personnelles ?</strong> Accédez à votre profil et éditez vos données.</li>
          <li><strong>Comment demander la suppression de mes données ?</strong> Contactez notre DPO à dpo@digitalcompany.com.</li>
          <li><strong>Quels modes de paiement sont acceptés ?</strong> Carte bancaire, PayPal et autres moyens sécurisés disponibles sur le site.</li>
          <li><strong>Comment contacter le support ?</strong> Via le formulaire de contact ou par email à support@digitalcompany.com.</li>
          <li><strong>Comment gérer les cookies ?</strong> Vous pouvez modifier vos préférences directement dans votre navigateur ou via notre bandeau cookies.</li>
        </ul>
      </section>

      <section className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
              <div className="text-amber-500 mb-2">
                <feature.icon className="w-6 h-6" />
              </div>
              <h5 className="font-semibold text-dark mb-1">{feature.title}</h5>
              <p className="text-dark text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
})()}
</PolicySection>

 {/* Section 14 - Garantie */}
       <PolicySection
          id={14}
          icon={<Shield className="w-5 h-5" />}
          title="14. Garantie & Avantages Exclusifs"
          badge="Garantie"
          badgeColor="green"
          expanded={expandedSection === 14}
          onToggle={() => toggleSection(14)}
        >
          {(() => {
            const features = [
              { icon: Cpu, title: 'Technologie Avancée', description: "Tous nos services utilisent des technologies de pointe pour assurer des résultats fiables et rapides." },
              { icon: Globe, title: 'Couverture Globale', description: 'Nos solutions sont adaptées pour vos besoins locaux et internationaux avec la même qualité.' },
              { icon: Rocket, title: 'Lancement Rapide', description: "Nos équipes mettent en place votre projet en un temps record, sans compromis sur la qualité." },
              { icon: Award, title: 'Satisfaction Garantie', description: "Nous nous engageons sur un haut niveau de satisfaction et offrons des corrections immédiates si nécessaire." },
              { icon: Users, title: 'Support Premium', description: "Un service client dédié avec assistance personnalisée pour chaque client." },
              { icon: Sparkles, title: 'Innovation Permanente', description: 'Améliorations continues et adoption des meilleures pratiques pour rester au top.' },
              { icon: Target, title: 'Résultats Mesurables', description: "Des indicateurs précis pour suivre l’efficacité et l’impact de nos services." },
              { icon: Shield, title: 'Protection Complète', description: "Toutes vos données et votre projet sont sécurisés avec des protocoles stricts." },
            ];

            return (
              <div className="space-y-6">
                <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                  Nos services sont garantis avec un engagement sur la performance, la sécurité et l’innovation. Vous bénéficiez d’avantages exclusifs pour assurer la réussite et la tranquillité d’esprit sur vos projets.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {features.map((feature, index) => (
                    <div key={index} className="border p-4 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="text-green-500 mb-2">
                        <feature.icon className="w-6 h-6" />
                      </div>
                      <h5 className="font-semibold text-dark mb-1">{feature.title}</h5>
                      <p className="text-dark text-sm">{feature.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </PolicySection>
      
          </div>

          {/* Call to Action */}
          <div className="mt-12 relative rounded-xl overflow-hidden p-8 text-center text-white">
  {/* Background image */}
  <div className="absolute inset-0 z-0 bg-[url('/img/background/blog.webp')] bg-cover bg-center"></div>

  {/* Overlay sombre */}
  <div className="absolute inset-0 z-10 bg-black/50"></div>

  {/* Contenu */}
  <div className="relative z-20 flex flex-col items-center">
    <Shield className="w-12 h-12 mb-4" />
    <h3 className="text-2xl font-bold mb-3">Des questions sur vos données ?</h3>
    <p className="text-amber-50 mb-6 max-w-2xl">
      Notre équipe dédiée à la protection des données est à votre disposition pour répondre 
      à toutes vos questions et vous accompagner dans l'exercice de vos droits.
    </p>

    <div className="flex flex-wrap justify-center gap-4">
      <button
        onClick={() => navigate('/contact')}
        className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-blue-50 transition-colors shadow-lg"
      >
        Nous contacter
      </button>
    </div>
  </div>
</div>

        </main>
      </div>
    </div>
  );
}