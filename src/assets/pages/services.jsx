import { useState, useEffect } from 'react';
import { Search, Building2, ChevronRight, Check, ArrowRight, Briefcase, Lightbulb, Cog, FileText, Send, CheckCircle, MessageSquare, Calendar, Code, Palette, Zap, CheckSquare, Printer, Camera, Mail, Eye  } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import servicesApi from '../configurations/services/services.js';
import serviceCategoriesApi from '../configurations/services/serviceCategories.js';

export default function ServicesPage() {
  useEffect(()=>{
      document.title = "Nos services - Digital";
    })
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [services, setServices] = useState([]);
  const [categoryById, setCategoryById] = useState({});
  const [categoryIconById, setCategoryIconById] = useState({});
  const [, setShowProposalForm] = useState(false);
  const iconMap = {
    FileText, Building2, Code, Palette, Zap, CheckSquare, Printer, Camera, Search, Mail, Briefcase
  };

  const [categories, setCategories] = useState([
    { name: 'Tous', icon: FileText },
    { name: 'Pack PME', icon: Building2 },
    { name: 'Développement Web', icon: Code },
    { name: 'Design Graphique', icon: Palette },
    { name: 'Identité Visuelle', icon: Zap },
    { name: 'Gestion de Projet', icon: CheckSquare },
    { name: 'Conception de Documents', icon: FileText },
    { name: 'Print & Impression', icon: Printer },
    { name: 'Photographie & Vidéo', icon: Camera },
    { name: 'SEO & Référencement', icon: Search },
    { name: 'Email Marketing', icon: Mail },
  ]);

  // Initialiser depuis paramètres d'URL (cat, q)
  useEffect(() => {
    const params = new URLSearchParams(location.search || '');
    const cat = params.get('cat');
    const q = params.get('q');
    if (cat) setSelectedCategory(cat);
    if (q) setSearchQuery(q);
  }, [location.search]);

  useEffect(() => {
    // Charger catégories depuis l'API et construire les mappings
    (async () => {
      try {
        const rows = await serviceCategoriesApi.list();
        if (Array.isArray(rows)) {
          const idToName = {};
          const idToIcon = {};
          const dynCats = [{ name: 'Tous', icon: FileText }];
          rows.forEach((r) => {
            idToName[r.id] = r.name;
            idToIcon[r.id] = r.icon;
            const IconComp = iconMap[r.icon] || FileText;
            dynCats.push({ name: r.name, icon: IconComp });
          });
          setCategoryById(idToName);
          setCategoryIconById(idToIcon);
          setCategories(dynCats);
        }
      } catch (e) {
        console.warn('Chargement catégories échoué, fallback catégories statiques.', e?.message || e);
      }
    })();
  }, []);

  useEffect(() => {
    // Charger services via GET
    (async () => {
      try {
        const rows = await servicesApi.list();
        setServices(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error('Erreur chargement services:', e?.message || e);
      }
    })();
  }, []);

const getServiceIcon = (service) => {
  const iconName = categoryIconById[service.category_id];
  return iconMap[iconName] || Briefcase;
};

const getServiceCategoryLabel = (service) => {
  return categoryById[service.category_id] || service.category || 'Autres';
};

const handleServiceClick = async (service) => {
  // Incrémenter le compteur d'avis/consultations côté serveur puis naviguer
  const current = Number(service.review_count);
  const baseCount = Number.isFinite(current) ? current : 0;
  const nextCount = baseCount + 1;

  try {
    if (service.id != null) {
      await servicesApi.update(service.id, { review_count: nextCount });
      // Mise à jour optimiste locale
      setServices((prev) => (prev || []).map((s) => s.id === service.id ? { ...s, review_count: nextCount } : s));
    }
  } catch (e) {
    console.warn('Impossible d’incrémenter review_count:', e?.message || e);
  }

  // Exclut l'icône (nous recalculerons côté /card si nécessaire) et transmet le compteur mis à jour
  const updatedService = { ...service, review_count: nextCount };
  delete updatedService.icon;

  navigate('/card', {
    state: {
      service: updatedService,
      iconName: categoryIconById[service.category_id] || 'Briefcase'
    }
  });
};

  const filteredServices = (services || []).filter((service) => {
    const catLabel = getServiceCategoryLabel(service);
    const matchesCategory = selectedCategory === 'Tous' || catLabel === selectedCategory;
    const title = (service.title || '').toLowerCase();
    const desc = (service.description || '').toLowerCase();
    const q = searchQuery.toLowerCase();
    const matchesSearch = title.includes(q) || desc.includes(q);
    return matchesCategory && matchesSearch;
  });

  const featuredServices = filteredServices.filter(s => s.featured);
  const regularServices = filteredServices.filter(s => !s.featured);

  const toNumberOrNull = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const formatPrice = (svc) => {
    const priceType = (svc.price_type || '').toLowerCase();
    const n = toNumberOrNull(svc.price);
    if (priceType === 'sur_devis' || n === 0) return 'Sur devis';
  if (n !== null) return `${Math.round(Number(n)).toLocaleString('fr-FR')} FCFA`;
  if (typeof svc.price === 'string' && svc.price.trim()) return `${Math.round(Number(svc.price)).toLocaleString('fr-FR')} FCFA`;
    return 'Sur devis';
  };

  return (
    <div className="min-h-screen bg-dark">

      {/* Hero Section */}
     <div className="relative lg:pt-30 bg-[url('/img/background/service.jpg')] bg-cover bg-center border-b border-gray-200 dark:border-gray-600 
    before:content-[''] before:absolute before:inset-0 before:bg-black/50 before:z-1 z-10">

        <div className="max-w-7xl z-10  relative mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="mb-10 max-w-3xl">
            <div className="inline-flex items-center bg-dark gap-2 px-4 py-1.5 text-dark text-xs font-semibold rounded-full mb-6">
              <Cog className="w-3.5 h-3.5" />
              NOS EXPERTISES
            </div>
            <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
              Des solutions sur-mesure pour accélérer votre transformation
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              Accompagnement stratégique et opérationnel de bout en bout, de la définition de votre vision à la mise en œuvre concrète de vos projets de transformation.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => navigate('/submission')}
                className="px-6 py-3 bg-dark text-dark font-semibold rounded hover:bg-dark/90 transition-colors inline-flex items-center gap-2"
              >
                Soumettre un projet
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/rendezvous')}
              className="px-6 py-3 border-2 border-gray-300 text-white font-semibold rounded hover:border-white/30 hover:text-black hover:bg-white transition-colors inline-flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Prendre rendez-vous
              </button>
            </div>
          </div>
           <div className="relative block lg:hidden">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un service..."
                className="pl-10 pr-4 py-4 bg-dark text-dark border border-gray-300 dark:border-gray-600 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent w-full"
              />
            </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-dark border-b border-gray-200 dark:border-gray-600 top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 text-sm font-medium rounded whitespace-nowrap transition-colors inline-flex items-center gap-2 ${
                      selectedCategory === cat.name
                        ? 'dark:bg-white bg-black/90 text-white dark:text-slate-900'
                        : 'text-dark hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {cat.name}
                  </button>
                );
              })}
            </div>
            <div className="relative hidden lg:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un service..."
                className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent w-64"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className=" bg-dark max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Featured Services */}
        {featuredServices.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-dark">Services phares</h2>
                <p className="text-sub mt-1">Nos expertises les plus demandées</p>
              </div>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              {featuredServices.map((service) => {
                const Icon = getServiceIcon(service);
                return (
                  <article
                    key={service.id}
                    className="group dark:bg-black/40 border-2 border-slate-100 dark:border-slate-800 rounded-lg p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-dark rounded-lg gap-2 flex items-center justify-center">
                        <Icon className="w-7 h-7 text-dark" />
                        
                        <span className="text-xs flex items-center text-gray-600 ml-1"><Eye className="w-4 h-4 text-dark pe-1" />{service.review_count}</span>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-full">
                        PREMIUM
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-dark mb-3">
                      {service.title}
                    </h3>

                    <p className="text-sub mb-6 leading-relaxed">
                      {service.description?.length > 120
                        ? `${service.description.slice(0, 120)}…`
                        : service.description}
                    </p>

                    {Array.isArray(service.features) && (
                      <div className="mb-6">
                        <h4 className="text-sm font-bold text-dark mb-3">Ce qui est inclus :</h4>
                        <ul className="space-y-2">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sub">
                              <Check className="w-4 h-4 text-dark mt-0.5 flex-shrink-0" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 mb-6">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Durée estimée</div>
                        <div className="text-sm font-bold text-dark">{service.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Tarif</div>
                        <div className="text-sm font-bold text-dark">{formatPrice(service)}</div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleServiceClick(service)}                      
                      className="w-full px-6 py-3 bg-dark text-dark dark:border dark:border-white/30 border border-black/30 font-semibold rounded hover:bg-black transition-colors inline-flex items-center justify-center gap-2"
                    >
                      En savoir plus
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Regular Services */}
        {regularServices.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-dark">Autres services</h2>
                <p className="text-sub mt-1">Solutions complémentaires pour votre entreprise</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularServices.map((service) => {
                const Icon = getServiceIcon(service);
                return (
                  <article
                    key={service.id}
                    className="group dark:bg-black/40 border border-gray-200 dark:border-slate-800 rounded-lg p-6 hover:border-black/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center group-hover:bg-black/90 transition-colors">
                        <Icon className="w-6 h-6 text-gray-700 group-hover:text-white transition-colors" />
                        
                      </div>
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 dark:text-white text-gray-700 text-xs font-semibold rounded">
                        {getServiceCategoryLabel(service)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-blue-900 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-sm text-sub leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

                    {Array.isArray(service.features) && (
                      <div className="mb-4">
                        <ul className="space-y-1.5">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-gray-600">
                              <Check className="w-3 h-3 text-dark mt-0.5 flex-shrink-0" />
                              <span className="text-sub">{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                             

                      <div className="text-xs text-gray-600">
                        <span className="text-xs flex items-center text-gray-600 ml-1"><Eye className="w-4 h-4 text-dark pe-1" />{service.review_count}</span>
                        <span className="font-semibold text-sub ">{service.duration}</span>
                      </div>
                      <button 
                        onClick={() => handleServiceClick(service)}
                        className="text-sub font-semibold text-sm hover:gap-2 inline-flex items-center gap-1 transition-all"
                      >
                        Découvrir
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        {/* Service Ideas Section */}
        <div className="mb-16">
          <div className="bg-white rounded-lg border border-gray-200 dark:border-slate-800 p-8 md:p-12 dark:bg-black/40">
            <div className="max-w-4xl mx-auto text-center">
              <Lightbulb className="w-12 h-12 text-black dark:text-white mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Vous avez un besoin spécifique ?
              </h2>
              <p className="text-lg text-sub  mb-8">
                Chaque entreprise est unique. Nous construisons des solutions sur-mesure adaptées à vos enjeux particuliers. Partagez-nous votre projet et nos experts vous proposeront une approche personnalisée.
              </p>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white dark:bg-black/10 rounded-lg p-6 border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-black dark:text-white mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Échange initial</h3>
                  <p className="text-sm text-gray-600 dark:text-sub">Discussion pour comprendre vos besoins</p>
                </div>
                <div className="bg-white dark:bg-black/10 rounded-lg p-6 border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center">
                  <FileText className="w-8 h-8 text-black dark:text-white mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Proposition détaillée</h3>
                  <p className="text-sm text-gray-600 dark:text-sub">Solution sur-mesure sous 48h</p>
                </div>
                <div className="bg-white dark:bg-black/10 rounded-lg p-6 border border-gray-200 dark:border-slate-800 flex flex-col items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-black dark:text-white mb-3" />
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">Démarrage projet</h3>
                  <p className="text-sm text-gray-600 dark:text-sub">Mise en œuvre rapide et efficace</p>
                </div>
              </div>
              <button 
                onClick={() => navigate('/submission')}
                className="px-8 py-4 border border-dark dark:border-none bg-dark dark:bg-slate-800 text-dark font-semibold rounded hover:bg-blue-800 transition-colors inline-flex items-center gap-2 text-lg"
              >
                Soumettre ma demande
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      

      {/* CTA Section */}
      <div className="bg-dark dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-dark mb-4">
              Prêt à démarrer votre projet ?
            </h2>
            <p className="text-lg text-sub mb-8">
              Échangeons sur vos enjeux et construisons ensemble la solution adaptée à vos besoins.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => navigate('/submission')}
                className="px-8 py-4 bg-black/80 dark:bg-slate-700 text-white font-semibold rounded hover:bg-blue-800 transition-colors inline-flex items-center justify-center gap-2"
              >
                Démarrer un projet
                <ArrowRight className="w-5 h-5" />
              </button>
              <button 
              onclick={()=> navigate('/rendezvous')}
              className="px-8 py-4 border-2 border-gray-300 text-dark font-semibold rounded hover:border-blue-900 hover:text-blue-900 transition-colors inline-flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Planifier un appel
              </button>
            </div>
            <p className="text-sm text-sub mt-6">
              Réponse sous 24h • Sans engagement • Devis gratuit
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}