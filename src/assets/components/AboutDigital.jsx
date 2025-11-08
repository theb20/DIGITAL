import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, List, ChevronRight, Award, Users, Lightbulb, Target, Zap, TrendingUp, Sparkles } from 'lucide-react';
import appSettingsApi from '../configurations/services/appSettings.js';
import profilesApi from '../configurations/services/profiles.js';

export default function AboutDigitalCompany() {
  const [viewMode, setViewMode] = useState('grid');
  const navigate = useNavigate();

  // Mapping d'icônes depuis les noms (Paramètres)
  const iconMap = { Zap, Lightbulb, Target, Award, Users, TrendingUp, Sparkles };
  const resolveIcon = (name, className = 'w-5 h-5') => {
    const Icon = iconMap[name];
    return Icon ? <Icon className={className} /> : null;
  };

  // États dynamiques (valeurs par défaut)
  const [headerTitle, setHeaderTitle] = useState('Votre partenaire digital de confiance');
  const [headerParagraph1, setHeaderParagraph1] = useState(
    "Digital transforme vos ambitions digitales en réalité. Nous accompagnons entreprises et créateurs dans la conception de solutions web modernes, le design professionnel, le branding impactant et les stratégies marketing performantes."
  );
  const [headerParagraph2, setHeaderParagraph2] = useState(
    "Notre approche allie créativité, expertise technique et compréhension approfondie de vos objectifs pour créer des expériences digitales qui captivent, convertissent et se démarquent."
  );
  const [headerImageDesktop, setHeaderImageDesktop] = useState('/img/background/about.webp');
  const [headerImageMobile, setHeaderImageMobile] = useState('/img/background/about-mobile.webp');

  const [stats, setStats] = useState([
    { value: '150+', label: 'Projets réalisés', icon: <Target className="w-5 h-5" /> },
    { value: '98%', label: 'Clients satisfaits', icon: <Award className="w-5 h-5" /> },
    { value: '5+', label: "Ans d'expertise", icon: <TrendingUp className="w-5 h-5" /> },
    { value: '24/7', label: 'Support dédié', icon: <Users className="w-5 h-5" /> }
  ]);

  const [services, setServices] = useState([
    {
      icon: <Zap className="text-yellow-300 w-6 h-6" />,
      title: 'Solutions Web Sur Mesure',
      description: 'Création de sites web modernes, performants et adaptés à vos besoins spécifiques.',
      image: '/img/services/solution_web.webp'
    },
    {
      icon: <Lightbulb className="text-red-300 w-6 h-6" />,
      title: 'Design & Branding',
      description: "Identité visuelle unique qui reflète l'essence de votre marque et capte l'attention.",
      image: '/img/services/design__branding.webp'
    },
    {
      icon: <Target className="text-blue-300 w-6 h-6" />,
      title: 'Management SEO Google',
      description: 'Optimisation complète pour améliorer votre positionnement sur Google : Search Console, mots-clés, vitesse, indexation et performance SEO.',
      image: '/img/services/design_branding.webp'
    }
  ]);

  const [values, setValues] = useState([
    { title: 'Créativité', description: 'Des concepts innovants qui se démarquent', image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80' },
    { title: 'Excellence', description: 'Qualité premium dans chaque détail', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80' },
    { title: 'Agilité', description: 'Adaptation rapide à vos besoins évolutifs', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
    { title: 'Transparence', description: 'Communication claire à chaque étape', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80' }
  ]);

  const [team, setTeam] = useState([
    { name: 'Équipe Design', description: "Créateurs d'expériences visuelles exceptionnelles", image: 'https://i.pinimg.com/1200x/73/6d/a1/736da1499a4d299ef2500a5ef4152a27.jpg' },
    { name: 'Équipe Développement', description: 'Experts en solutions techniques innovantes', image: 'https://i.pinimg.com/736x/d2/90/6f/d2906f1535403c1865254c67ae31c0d1.jpg' },
    { name: 'Équipe Marketing', description: 'Stratèges digitaux orientés résultats', image: 'https://i.pinimg.com/736x/09/01/61/09016148f38fe33fa016e97b64fb98a7.jpg' }
  ]);

  // Charger le Profil (nouvelle table) avec fallback Paramètres
  useEffect(() => {
    let mounted = true;
    const toArray = (raw) => {
      if (!raw) return [];
      if (Array.isArray(raw)) return raw;
      try { const v = typeof raw === 'string' ? JSON.parse(raw) : raw; return Array.isArray(v) ? v : []; } catch { return []; }
    };

    const loadFromAppSettings = async () => {
      try {
        const [
          kTitle,
          kP1,
          kP2,
          kImgDesktop,
          kImgMobile,
          kStats,
          kServices,
          kValues,
          kTeam,
        ] = await Promise.all([
          appSettingsApi.getByKey('about_header_title'),
          appSettingsApi.getByKey('about_header_paragraph1'),
          appSettingsApi.getByKey('about_header_paragraph2'),
          appSettingsApi.getByKey('about_header_image_desktop_url'),
          appSettingsApi.getByKey('about_header_image_mobile_url'),
          appSettingsApi.getByKey('about_stats_json'),
          appSettingsApi.getByKey('about_services_json'),
          appSettingsApi.getByKey('about_values_json'),
          appSettingsApi.getByKey('about_team_json'),
        ]);
        if (!mounted) return;
        if (kTitle?.setting_value) setHeaderTitle(String(kTitle.setting_value));
        if (kP1?.setting_value) setHeaderParagraph1(String(kP1.setting_value));
        if (kP2?.setting_value) setHeaderParagraph2(String(kP2.setting_value));
        if (kImgDesktop?.setting_value) setHeaderImageDesktop(String(kImgDesktop.setting_value));
        if (kImgMobile?.setting_value) setHeaderImageMobile(String(kImgMobile.setting_value));

        const statsJson = toArray(kStats?.setting_value);
        if (statsJson.length) {
          setStats(statsJson.map((s) => ({
            value: s?.value ?? '',
            label: s?.label ?? '',
            icon: s?.icon_name ? resolveIcon(s.icon_name, 'w-5 h-5') : null,
          })));
        }

        const servicesJson = toArray(kServices?.setting_value);
        if (servicesJson.length) {
          setServices(servicesJson.map((srv) => ({
            title: srv?.title ?? '',
            description: srv?.description ?? '',
            image: srv?.image ?? '',
            icon: srv?.icon_name ? resolveIcon(srv.icon_name, srv?.icon_class || 'w-6 h-6') : null,
          })));
        }

        const valuesJson = toArray(kValues?.setting_value);
        if (valuesJson.length) setValues(valuesJson.map((v) => ({ title: v?.title ?? '', description: v?.description ?? '', image: v?.image ?? '' })));

        const teamJson = toArray(kTeam?.setting_value);
        if (teamJson.length) setTeam(teamJson.map((t) => ({ name: t?.name ?? '', description: t?.description ?? '', image: t?.image ?? '' })));
      } catch (e) {
        console.warn('[About] Fallback Paramètres échoué:', e?.message || e);
      }
    };

    (async () => {
      try {
        const p = await profilesApi.getActive();
        if (!mounted) return;
        if (p) {
          if (p.title) setHeaderTitle(String(p.title));
          if (p.subtitle) setHeaderParagraph1(String(p.subtitle));
          if (p.banner_url) { setHeaderImageDesktop(String(p.banner_url)); setHeaderImageMobile(String(p.banner_url)); }

          const statsJson = toArray(p.stats_json);
          if (statsJson.length) setStats(statsJson.map((s) => ({
            value: s?.value ?? '',
            label: s?.label ?? '',
            icon: s?.icon_name ? resolveIcon(s.icon_name, 'w-5 h-5') : null,
          })));

          const servicesJson = toArray(p.services_json);
          if (servicesJson.length) setServices(servicesJson.map((srv) => ({
            title: srv?.title ?? '',
            description: srv?.description ?? '',
            image: srv?.image ?? '',
            icon: srv?.icon_name ? resolveIcon(srv.icon_name, srv?.icon_class || 'w-6 h-6') : null,
          })));

          const valuesJson = toArray(p.values_json);
          if (valuesJson.length) setValues(valuesJson.map((v) => ({ title: v?.title ?? '', description: v?.description ?? '', image: v?.image ?? '' })));

          const teamJson = toArray(p.team_json);
          if (teamJson.length) setTeam(teamJson.map((t) => ({ name: t?.name ?? '', description: t?.description ?? '', image: t?.image ?? '' })));
          return; // Profil chargé, ne pas fallback
        }
      } catch (e) {
        console.warn('[About] Échec chargement profil actif:', e?.message || e);
      }
      // Fallback Paramètres
      await loadFromAppSettings();
    })();

    return () => { mounted = false; };
  }, []);

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Content Grid */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
          
          {/* Image Column */}
          <div className="relative mb-8 lg:mb-0">
            <div className="relative overflow-hidden rounded-3xl">
              <img 
                src={headerImageDesktop} 
                className="hidden lg:block w-full h-[600px] object-cover shadow-2xl" 
                alt="Digital Company - Solutions digitales modernes" 
              />
              <img 
                src={headerImageMobile} 
                className="lg:hidden w-full h-full object-cover rounded-2xl shadow-xl" 
                alt="Digital Company - Solutions digitales modernes" 
              />
              
              {/* Floating Badge */}
              <div className="absolute top-3 right-3 lg:top-6 lg:right-6 bg-white/5 lg:bg-white/5 backdrop-blur-sm rounded-2xl px-6 py-4 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Award className="w-5 h-5 text-yellow-600" />
                  <span className="text-2xl font-bold text-gray-100 hidden lg:inline-block">150+</span>
                </div>
                <p className="text-sm text-gray-400 font-medium hidden lg:block">Projets réussis</p>
              </div>
            </div>
          </div>

          {/* Content Column */}
          <div>
            {/* Header */}
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 bg-green-50 text-green-600 px-4 py-2 rounded-full mb-4">
                <span className="w-2 h-2 bg-green-600 animate-ping rounded-full"></span>
                <span className="text-sm font-semibold">À propos</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                {headerTitle}
              </h2>
              
              <p className="text-lg text-gray-600 leading-relaxed mb-6">
                {headerParagraph1}
              </p>
              
              <p className="text-gray-600 leading-relaxed">
                {headerParagraph2}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-4 border border-gray-100 hover:border-black/10 hover:shadow-md transition-all">
                  <div className="text-purple-900 mb-2">
                    {stat.icon}
                  </div>
                  <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                  <div className="text-xs text-gray-600 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-4">
              <button 
              onClick={() => navigate('/services')}
              className="flex items-center gap-2 px-6 py-3 bg-black hover:bg-black/80 text-white rounded-xl font-semibold shadow-lg shadow-black/30 transition-all hover:shadow-xl hover:scale-105">
                Découvrir nos services
                <ChevronRight className="w-5 h-5" />
              </button>
              <button 
              onClick={() => navigate('/portfolio')}
              className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 hover:border-black/50 rounded-xl font-semibold text-gray-400 hover:text-black/50 transition-all">
                Voir notre portfolio
              </button>
            </div>
          </div>
        </div>

        {/* Services Section with Images */}
        <div className="mt-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Notre expertise
              </h3>
              <p className="text-gray-600">Des services complets pour votre réussite digitale</p>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <List className="w-5 h-5" />
              </button>
              <button 
                onClick={() => navigate('/services')}
                className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-black text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <div className="grid sm:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all group">
                  <div className="relative h-48 overflow-hidden">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 w-12 h-12 backdrop-blur-sm rounded-xl flex items-center justify-center  shadow-lg">
                      {service.icon}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{service.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{service.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-black/10 hover:shadow-lg transition-all flex flex-col sm:flex-row">
                  <div className="relative w-full sm:w-48 sm:h-auto overflow-hidden flex-shrink-0">
                    <img 
                      src={service.image} 
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent"></div>
                  </div>
                  <div className="p-6 flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center  backdrop-blur-sm flex-shrink-0">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h4>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0 hidden sm:block" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team Section */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full mb-4">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-semibold">NOTRE ÉQUIPE</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Des talents passionnés à votre service
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Une équipe multidisciplinaire d'experts dédiés à votre réussite
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {team.map((member, index) => (
              <div key={index} className="group relative before:absolute before:backdrop-blur-sm before:inset-0 before:bg-black/10 overflow-hidden rounded-2xl h-80">
                <img 
                  src={member.image} 
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h4 className="text-xl font-bold mb-2">{member.name}</h4>
                  <p className="text-gray-200 text-sm">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Values Section with Images */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Nos valeurs fondamentales
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Les principes qui guident chacune de nos actions
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="group relative overflow-hidden rounded-2xl h-72 hover:shadow-2xl transition-all">
                <img 
                  src={value.image} 
                  alt={value.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent"></div>
                <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-4">
                    <span className="text-2xl font-bold">{index + 1}</span>
                  </div>
                  <h4 className="text-xl font-bold mb-2">{value.title}</h4>
                  <p className="text-gray-200 text-sm">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>


      </div>
    </section>
  );
}