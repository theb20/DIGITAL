import { useState } from 'react';
import { Search, Building2, ChevronRight, Check, ArrowRight, Briefcase, Target, Lightbulb, BarChart, Shield, Cog, FileText, Send, CheckCircle, MessageSquare, Calendar, Code, Palette, Zap, CheckSquare, Printer, Camera, Mail, X  } from 'lucide-react';
  import {useNavigate} from 'react-router-dom';
  import { services } from '../constant/servicesData.js';

export default function ServicesPage() {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    serviceType: '',
    description: '',
    budget: '',
    timeline: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const categories = [
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
  
];


  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setShowProposalForm(false);
      setFormSubmitted(false);
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        serviceType: '',
        description: '',
        budget: '',
        timeline: ''
      });
    }, 3000);
  };


const handleServiceClick = (service) => {
  // On exclut l'icône
  const { icon, ...serviceWithoutIcon } = service;

  navigate('/card', { 
    state: { 
      service: serviceWithoutIcon, 
      iconName: service.icon.name  
    } 
  });
};

  const filteredServices = services.filter(service => {
    const matchesCategory = selectedCategory === 'Tous' || service.category === selectedCategory;
    const matchesSearch = service.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredServices = filteredServices.filter(s => s.featured);
  const regularServices = filteredServices.filter(s => !s.featured);

  return (
    <div className="min-h-screen bg-white">

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
                onClick={() => setShowProposalForm(true)}
                className="px-6 py-3 bg-dark text-dark font-semibold rounded hover:bg-dark/90 transition-colors inline-flex items-center gap-2"
              >
                Soumettre un projet
                <ArrowRight className="w-4 h-4" />
              </button>
              <button className="px-6 py-3 border-2 border-gray-300 text-white font-semibold rounded hover:border-white/30 hover:text-black hover:bg-white transition-colors inline-flex items-center gap-2">
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
                const Icon = service.icon;
                return (
                  <article
                    key={service.id}
                    className="group dark:bg-black/40 border-2 border-slate-100 dark:border-slate-800 rounded-lg p-8 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-14 h-14 bg-dark rounded-lg flex items-center justify-center">
                        <Icon className="w-7 h-7 text-dark" />
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-900 text-xs font-bold rounded-full">
                        PREMIUM
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-dark mb-3">
                      {service.title}
                    </h3>

                    <p className="text-sub mb-6 leading-relaxed">
                      {service.description}
                    </p>

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

                    <div className="flex items-center justify-between pt-6 border-t border-gray-200 mb-6">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">Durée estimée</div>
                        <div className="text-sm font-bold text-dark">{service.duration}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-600 mb-1">Tarif</div>
                        <div className="text-sm font-bold text-dark">{service.price}</div>
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
                const Icon = service.icon;
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
                        {service.category}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-blue-900 transition-colors">
                      {service.title}
                    </h3>

                    <p className="text-sm text-sub leading-relaxed line-clamp-3">
                      {service.description}
                    </p>

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

                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="text-xs text-gray-600">
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
                onClick={() => setShowProposalForm(true)}
                className="px-8 py-4 border border-dark dark:border-none bg-dark dark:bg-slate-800 text-dark font-semibold rounded hover:bg-blue-800 transition-colors inline-flex items-center gap-2 text-lg"
              >
                Soumettre ma demande
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Proposal Form Modal */}
      {showProposalForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {!formSubmitted ? (
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Soumettre une demande</h2>
                    <p className="text-gray-600 mt-1">Décrivez-nous votre projet en détail</p>
                  </div>
                  <button 
                    onClick={() => setShowProposalForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Nom complet *
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        placeholder="Jean Dupont"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Entreprise *
                      </label>
                      <input
                        type="text"
                        name="company"
                        required
                        value={formData.company}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        placeholder="Nom de votre entreprise"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Email professionnel *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        placeholder="jean.dupont@entreprise.fr"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                        placeholder="+33 1 23 45 67 89"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Type de service recherché *
                    </label>
                    <select
                      name="serviceType"
                      required
                      value={formData.serviceType}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    >
                      <option value="">Sélectionnez un service</option>
                      <option value="strategie">Stratégie digitale</option>
                      <option value="transformation">Transformation organisationnelle</option>
                      <option value="architecture">Architecture d'entreprise</option>
                      <option value="innovation">Innovation & R&D</option>
                      <option value="performance">Optimisation des performances</option>
                      <option value="cybersecurite">Cybersécurité & Conformité</option>
                      <option value="autre">Autre / Sur-mesure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description du projet *
                    </label>
                    <textarea
                      name="description"
                      required
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={5}
                      className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent resize-none"
                      placeholder="Décrivez vos besoins, objectifs et contraintes..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Budget estimé
                      </label>
                      <select
                        name="budget"
                        value={formData.budget}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      >
                        <option value="">Sélectionnez une fourchette</option>
                        <option value="<50k">Moins de 50K€</option>
                        <option value="50-100k">50K€ - 100K€</option>
                        <option value="100-250k">100K€ - 250K€</option>
                        <option value="250-500k">250K€ - 500K€</option>
                        <option value=">500k">Plus de 500K€</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Délai souhaité
                      </label>
                      <select
                        name="timeline"
                        value={formData.timeline}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                      >
                        <option value="">Sélectionnez un délai</option>
                        <option value="urgent">Urgent (moins d'1 mois)</option>
                        <option value="1-3mois">1 à 3 mois</option>
                        <option value="3-6mois">3 à 6 mois</option>
                        <option value=">6mois">Plus de 6 mois</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowProposalForm(false)}
                      className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-900 font-semibold rounded hover:bg-gray-50 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-blue-900 text-white font-semibold rounded hover:bg-blue-800 transition-colors inline-flex items-center justify-center gap-2"
                    >
                      Envoyer la demande
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Demande envoyée avec succès !
                </h2>
                <p className="text-gray-600 mb-6">
                  Merci pour votre confiance. Nos experts analyseront votre demande et vous contacteront sous 24-48h avec une proposition détaillée.
                </p>
                <button
                  onClick={() => setShowProposalForm(false)}
                  className="px-6 py-3 bg-blue-900 text-white font-semibold rounded hover:bg-blue-800 transition-colors"
                >
                  Fermer
                </button>
              </div>
            )}
          </div>
        </div>
      )}

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
                onClick={() => setShowProposalForm(true)}
                className="px-8 py-4 bg-black/80 dark:bg-slate-700 text-white font-semibold rounded hover:bg-blue-800 transition-colors inline-flex items-center justify-center gap-2"
              >
                Démarrer un projet
                <ArrowRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 border-2 border-gray-300 text-dark font-semibold rounded hover:border-blue-900 hover:text-blue-900 transition-colors inline-flex items-center justify-center gap-2">
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