import React, { useState, useEffect } from "react";
import * as Icons from "lucide-react";
import { useNavigate } from "react-router-dom";
import privacyService from "../configurations/services/privacy.js";

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
            {badge ? (
              <span
                className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-md border ${
                  colorClasses[badgeColor] || "bg-gray-50 text-gray-700 border-gray-200"
                }`}
              >
                {badge}
              </span>
            ) : null}
          </div>
        </div>
        <div className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>
          <Icons.ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
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

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const [expandedSection, setExpandedSection] = useState(null);

  // États API pour sections (sommaire) et contenus d'une section
  const [sectionsApi, setSectionsApi] = useState([]);
  const [loadingSections, setLoadingSections] = useState(false);
  const [errorSections, setErrorSections] = useState(null);

  const [sectionEntries, setSectionEntries] = useState({});
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [errorEntries, setErrorEntries] = useState(null);

  // Registry d'icônes basé sur la valeur renvoyée par le back (section_icon)
  const iconRegistry = {
    database: Icons.Database,
    eye: Icons.Eye,
    globe: Icons.Globe,
    lock: Icons.Lock,
    shield: Icons.Shield,
    cookie: Icons.Cookie,
    calendar: Icons.Calendar,
    mail: Icons.Mail,
    filetext: Icons.FileText,
    file_text: Icons.FileText,
  };
  const getIconByName = (name) => {
    if (!name) return Icons.FileText;
    const key = String(name).toLowerCase().replace(/\s+/g, '').replace(/-/g, '_');
    return iconRegistry[key] || Icons.FileText;
  };

  // Charger le sommaire des sections depuis l'API
  // (supprimé: doublon) — consolidation réalisée plus bas

  // Charger le contenu d'une section lorsqu'elle est ouverte
  // (supprimé: doublon) — consolidation réalisée plus bas

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    document.title = "Transparence & Sécurité - Digital";
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // (supprimé: fonction inutilisée)

  // Charger le sommaire des sections depuis l'API
  useEffect(() => {
    const loadSections = async () => {
      setLoadingSections(true);
      setErrorSections(null);
      try {
        const data = await privacyService.getSections();
        const sectionsRaw = Array.isArray(data) ? data : (data?.sections || []);
        // Déduplication basée sur section_number (fallback sur id/titre)
        const seen = new Set();
        const uniqueSections = [];
        for (const s of sectionsRaw) {
          const key = s?.section_number ?? s?.id ?? `${s?.section_title ?? ''}`;
          if (!seen.has(key)) {
            seen.add(key);
            uniqueSections.push(s);
          }
        }
        setSectionsApi(uniqueSections);

        const metaUpdated = data?.meta?.last_updated || data?.last_updated;
        if (metaUpdated) setLastUpdated(metaUpdated);
        else if (privacyService.getLastUpdated) {
          try {
            const lu = await privacyService.getLastUpdated();
            if (lu) setLastUpdated(lu);
          } catch (_) {}
        }
      } catch (e) {
        setErrorSections(e.message || 'Erreur de chargement des sections');
      } finally {
        setLoadingSections(false);
      }
    };
    loadSections();
  }, []);

  // Charger le contenu d'une section lorsqu'elle est ouverte
  useEffect(() => {
    if (!expandedSection) return;
    const loadEntries = async () => {
      setLoadingEntries(true);
      setErrorEntries(null);
      try {
        const data = await privacyService.getPrivacySection(expandedSection);
        const entries = Array.isArray(data) ? data : (data?.entries || []);
        setSectionEntries(prev => ({ ...prev, [expandedSection]: entries }));
      } catch (e) {
        setErrorEntries(e.message || 'Erreur de chargement du contenu de la section');
      } finally {
        setLoadingEntries(false);
      }
    };
    loadEntries();
  }, [expandedSection]);

  useEffect(() => {
    const handleHashChange = () => {
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
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
      <header className="bg-dark  border-gray-200 sticky top-0 z-50 backdrop-blur-sm bg-white/95 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                {sidebarOpen ? <Icons.X className="text-dark w-6 h-6" /> : <Icons.Menu className="text-dark w-6 h-6" />}
              </button>
              <div 
                onClick={() => navigate('/')} 
                className="w-12 h-12 rounded-xl shadow-lg"
              >
                <img src={"/img/web-app-manifest-512x512.png"} className="w-full" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-dark">Transparence & Sécurité</h1>
                <p className="text-xs sm:text-sm text-sub flex items-center gap-2 mt-0.5">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  Digital
                </p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Icons.Calendar className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-sub">Mis à jour le</span>
              <span className="px-3 py-1.5 backdrop-blur-sm bg-white/10 text-green-700 text-xs font-semibold rounded-lg border border-green-200">
                {lastUpdated || '—'}
              </span>
              <button
                onClick={toggleDarkMode}
                className={`p-2 flex items-center justify-center rounded-lg transition-all ${
                  darkMode ? ' text-yellow-400 hover:bg-gray-200' : ' text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex max-w-7xl mx-auto">
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
                darkMode ? ' text-yellow-400 hover:bg-gray-200' : ' text-gray-700 hover:bg-gray-200'
              }`}
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {loadingSections && (
              <p className="text-sm text-sub px-3">Chargement du sommaire…</p>
            )}
            {errorSections && (
              <p className="text-sm text-red-600 px-3">{errorSections}</p>
            )}
            {sectionsApi.map((section) => {
              const id = section.section_number;
              const title = section.section_title;
              const badge = section.section_badge;
              const Icon = getIconByName(section.section_icon);
              const isActive = activeSection === id;
              
              return (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                    ${isActive 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-dark hover:bg-blue-50 hover:text-blue-600'
                    }
                  `}
                >
                  <div className={`
                    p-2 rounded-lg transition-colors
                    ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600 group-hover:bg-blue-100 group-hover:text-blue-600'}
                  `}>
                    <Icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1">
                    <div className={`text-sm font-semibold transition-colors ${isActive ? 'text-white' : 'text-dark group-hover:text-blue-600'}`}>
                      {id}. {title}
                    </div>
                    {badge && (
                      <div className={`text-xs transition-colors ${isActive ? 'text-white/80' : 'text-gray-500 group-hover:text-blue-500'}`}>
                        {badge}
                      </div>
                    )}
                  </div>
                  
                  <Icons.ChevronRight className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-blue-600'}`} />
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
              <Icons.Info className="w-5 h-5 text-amber-600 mb-2" />
              <h4 className="font-semibold text-amber-900 text-sm mb-1">Besoin d'aide ?</h4>
              <p className="text-xs text-amber-800 mb-3">
                Notre équipe est disponible pour répondre à vos questions
              </p>
              <a
                href="mailto:privacy@filterfinder.com"
                className="text-xs text-amber-700 font-semibold hover:text-amber-800 flex items-center gap-1"
              >
                Nous contacter
                <Icons.ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`p-2 flex lg:hidden  items-center justify-center rounded-lg transition-all ${
              darkMode ? ' text-yellow-400 hover:bg-gray-200' : ' text-gray-700 hover:bg-gray-200'
            }`}
            aria-label="Toggle dark mode"
          >
            {darkMode ? <Icons.Sun className="w-5 h-5" /> : <Icons.Moon className="w-5 h-5" />}
          </button>
        </aside>

        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-4">
            {sectionsApi.map((s) => {
              const IconComp = getIconByName(s.section_icon);
              const id = s.section_number;
          
              return (
                <PolicySection
                  key={id}
                  id={id}
                  icon={<IconComp className="w-5 h-5" />}
                  title={`${id}. ${s.section_title}`}
                  badge={s.section_badge}
                  badgeColor="blue"
                  expanded={expandedSection === id}
                  onToggle={() => toggleSection(id)}
                >
                  {expandedSection === id && loadingEntries && (
                    <p className="text-sm text-sub mb-4">Chargement du contenu…</p>
                  )}
                  {expandedSection === id && errorEntries && (
                    <p className="text-sm text-red-600 mb-4">{errorEntries}</p>
                  )}
                  {sectionEntries[id]?.length > 0 && (
                    <div className="space-y-6">
                      {sectionEntries[id].map((item) => (
                        <section key={item.id} className="space-y-2">
                          {item.content_title && (
                            <h4 className="text-lg font-semibold text-dark">{item.content_title}</h4>
                          )}
                          {item.content_text && (
                            <p className="text-dark">{item.content_text}</p>
                          )}
                        </section>
                      ))}
                    </div>
                  )}
                </PolicySection>
              );
            })}
          </div>

          {/* Appel à l'action */}
          <div className="mt-12 relative rounded-xl overflow-hidden p-8 text-center text-white">
            <div className="absolute inset-0 z-0 bg-[url('/img/background/blog.webp')] bg-cover bg-center"></div>
            <div className="absolute inset-0 z-10 bg-black/50"></div>
            <div className="relative z-20 flex flex-col items-center">
              <Icons.Shield className="w-12 h-12 mb-4" />
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