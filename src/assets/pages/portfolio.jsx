import React, { useState, useEffect } from 'react';
import { FileText, Building2, Code, Palette, Zap, CheckSquare, Printer, Camera, Search, Mail, ExternalLink, Eye, Filter, Grid3x3, LayoutGrid, X, Calendar, User, Tag, Table } from 'lucide-react';
import projectsApi from '../configurations/services/projects.js';

export default function DigitalPortfolio() {
  useEffect(()=>{
        document.title = "Portfolio - Digital";
    })
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [viewMode, setViewMode] = useState('grid');
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectsData, setProjectsData] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [errorProjects, setErrorProjects] = useState(null);

  const openModal = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => setSelectedProject(null), 300);
  };

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

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

  const projects = [
    {
      id: 1,
      title: 'Site E-commerce Mode',
      category: 'Développement Web',
      description: 'Plateforme e-commerce complète avec panier, paiement en ligne et gestion de stock',
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      tags: ['React', 'Node.js', 'Stripe'],
      client: 'Fashion Corp',
      year: '2024'
    },
    {
      id: 2,
      title: 'Identité Visuelle Restaurant',
      category: 'Identité Visuelle',
      description: 'Création complète d\'identité de marque : logo, charte graphique, supports de communication',
      image: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
      tags: ['Branding', 'Logo', 'Print'],
      client: 'Le Gourmet',
      year: '2024'
    },
    {
      id: 3,
      title: 'Campagne Email Marketing',
      category: 'Email Marketing',
      description: 'Stratégie d\'email marketing complète avec templates personnalisés et automatisation',
      image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80',
      tags: ['Mailchimp', 'Design', 'Automation'],
      client: 'Tech Solutions',
      year: '2024'
    },
    {
      id: 4,
      title: 'Application Mobile Fitness',
      category: 'Développement Web',
      description: 'Application mobile cross-platform pour le suivi d\'activités sportives',
      image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&q=80',
      tags: ['React Native', 'Firebase', 'UI/UX'],
      client: 'FitPro',
      year: '2024'
    },
    {
      id: 5,
      title: 'Pack PME Startup Tech',
      category: 'Pack PME',
      description: 'Solution complète pour startup : site web, identité visuelle, supports marketing',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&q=80',
      tags: ['All-in-one', 'Branding', 'Web'],
      client: 'InnovateCo',
      year: '2024'
    },
    {
      id: 6,
      title: 'Flyers & Brochures',
      category: 'Print & Impression',
      description: 'Conception et impression de supports publicitaires pour événement corporate',
      image: 'https://images.unsplash.com/photo-1565373679615-c26c0dd08e47?w=800&q=80',
      tags: ['Print', 'Design', 'InDesign'],
      client: 'Event Pro',
      year: '2024'
    },
    {
      id: 7,
      title: 'Optimisation SEO Site Vitrine',
      category: 'SEO & Référencement',
      description: 'Audit SEO complet et optimisation pour améliorer le référencement naturel',
      image: 'https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80',
      tags: ['SEO', 'Analytics', 'Performance'],
      client: 'Local Business',
      year: '2024'
    },
    {
      id: 8,
      title: 'Shooting Photo Produits',
      category: 'Photographie & Vidéo',
      description: 'Séance photo professionnelle de produits pour catalogue en ligne',
      image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80',
      tags: ['Photo', 'Retouche', 'Studio'],
      client: 'Boutique Luxe',
      year: '2024'
    },
    {
      id: 9,
      title: 'Dashboard Analytics',
      category: 'Design Graphique',
      description: 'Interface de tableau de bord pour visualisation de données en temps réel',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
      tags: ['UI/UX', 'Data Viz', 'Figma'],
      client: 'DataCorp',
      year: '2024'
    },
    {
      id: 10,
      title: 'Templates Documents Corporate',
      category: 'Conception de Documents',
      description: 'Création de templates professionnels : rapports, présentations, factures',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80',
      tags: ['Word', 'PowerPoint', 'Templates'],
      client: 'Consulting Group',
      year: '2024'
    },
    {
      id: 11,
      title: 'Gestion Projet Agile',
      category: 'Gestion de Projet',
      description: 'Mise en place de méthodologie Agile et outils de gestion de projet',
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&q=80',
      tags: ['Scrum', 'Jira', 'Management'],
      client: 'Dev Team',
      year: '2024'
    },
    {
      id: 12,
      title: 'Logo & Charte Graphique',
      category: 'Identité Visuelle',
      description: 'Design de logo moderne et création de charte graphique complète',
      image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80',
      tags: ['Logo', 'Brand Guidelines', 'Colors'],
      client: 'New Brand',
      year: '2024'
    }
  ];

  // Charger les projets via API (GET)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingProjects(true);
        const items = await projectsApi.list();
        if (mounted) setProjectsData(Array.isArray(items) ? items : []);
      } catch (e) {
        if (mounted) setErrorProjects(e?.message || 'Erreur lors du chargement des projets');
        // Fallback: données statiques
        if (mounted) setProjectsData(projects);
      } finally {
        if (mounted) setLoadingProjects(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const sourceProjects = projectsData.length ? projectsData : projects;
  const filteredProjects = activeCategory === 'Tous' 
    ? sourceProjects 
    : sourceProjects.filter(p => p.category === activeCategory);

  const stats = [
    { label: 'Projets Réalisés', value: '250+', icon: CheckSquare },
    { label: 'Clients Satisfaits', value: '180+', icon: Building2 },
    { label: 'Années d\'Expérience', value: '8+', icon: Zap },
    { label: 'Taux de Satisfaction', value: '98%', icon: Eye }
  ];

  return (
    <div className="min-h-screen bg-dark">
      {/* Hero Section */}
      <div className="lg:bg-[url('/img/background/card.webp')] bg-[url('/img/background/portfolio.jpg')] bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-black/30 relative text-white">
        <div className="max-w-7xl relative z-1 mx-auto px-6 lg:pt-56 pt-26 pb-16">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-4">Notre Portfolio</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Découvrez nos réalisations en marketing digital, développement web, design graphique et bien plus
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center border border-white/20">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-blue-200" />
                  <div className="text-3xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm text-blue-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Filters */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-sub   " />
              <h2 className="text-xl font-semibold text-dark">Filtrer par catégorie</h2>
            </div>
            <div className=" hidden lg:flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'table' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Table className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.name}
                  onClick={() => setActiveCategory(category.name)}
                  className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                    activeCategory === category.name
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'bg-dark dark:border-0 text-sub hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Projects Count */}
        <div className="mb-6">
          <p className="text-sub">
            <span className="font-semibold text-dark">{filteredProjects.length}</span> projet{filteredProjects.length > 1 ? 's' : ''} trouvé{filteredProjects.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Projects Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-black/10 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-transparent"
              >
                <div className="relative overflow-hidden aspect-video">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button 
                      onClick={() => openModal(project)}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Voir le projet
                    </button>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {project.category}
                    </span>
                    <span className="text-xs text-sub">{project.year}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-dark mb-2 group-hover:text-blue-600 transition-colors">
                    {project.title}
                  </h3>
                  
                  <p className="text-sm text-sub mb-4 line-clamp-2">
                    {project.description}
                  </p>

                  <div className="flex items-center justify-between pt-4 dark:border-t-0 border-t border-slate-100">
                    <div className="text-sm">
                      <span className="text-sub">Client: </span>
                      <span className="font-medium text-dark">{project.client}</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
                  </div>

                  <div className="flex flex-wrap gap-2 mt-4">
                    {project.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="text-xs px-2 py-1 bg-dark text-sub rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="group bg-white dark:bg-black/10 rounded-xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-transparent"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="relative overflow-hidden md:w-80 aspect-video md:aspect-auto">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                  
                  <div className="flex-1 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-black/90 rounded-full">
                        {project.category}
                      </span>
                      <span className="text-xs text-sub">{project.year}</span>
                      <span className="text-sm text-sub ml-auto">Client: <span className="font-medium text-sub">{project.client}</span></span>
                    </div>
                    
                    <h3 className="text-xl font-bold text-dark mb-3 group-hover:text-blue-600 transition-colors">
                      {project.title}
                    </h3>
                    
                    <p className="text-sm text-sub mb-4 line-clamp-2"> 
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="text-xs px-3 py-1 bg-slate-100 text-slate-700 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <button 
                      onClick={() => openModal(project)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Voir le projet complet
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {viewMode === 'table' && (
          <div className="overflow-x-auto bg-white rounded-xl border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Image</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Titre</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Catégorie</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Client</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Année</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600">Tags</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <img src={p.image || p.image_url} alt={p.title} className="w-16 h-10 object-cover rounded" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{p.title}</div>
                      <div className="text-xs text-slate-500 line-clamp-1">{p.description}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{p.client}</td>
                    <td className="px-4 py-3 text-slate-700">{p.year}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(Array.isArray(p.tags) ? p.tags : []).map((t, i) => (
                          <span key={i} className="text-xs px-2 py-1 bg-slate-100 text-slate-700 rounded">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loadingProjects && (
              <div className="px-4 py-3 text-sm text-slate-500">Chargement des projets…</div>
            )}
            {errorProjects && (
              <div className="px-4 py-3 text-sm text-red-600">{errorProjects}</div>
            )}
          </div>
        )}

        {filteredProjects.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <FileText className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              Aucun projet trouvé
            </h3>
            <p className="text-slate-600">
              Aucun projet ne correspond à cette catégorie pour le moment.
            </p>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-[url('/img/background/card.webp')] bg-cover bg-center text-white py-16 mt-12 before:content-[''] before:absolute before:inset-0 before:bg-black/60 relative ">
        <div className="max-w-4xl relative z-1 mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Prêt à démarrer votre projet ?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Contactez-nous dès aujourd'hui pour discuter de vos besoins et transformer vos idées en réalité
          </p>
           <button 
                  className="
                    px-8 py-3 
                    backdrop-blur-md 
                    bg-purple-500/20
                    border border-purple-500
                    hover:bg-purple-600/90
                    text-white 
                    rounded-full 
                    font-medium 
                    transition-colors 
                    shadow-lg
                  "
                >
                  Demander un devis
                </button>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div 
            className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl transform transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedProject && (
              <>
                {/* Modal Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                      {selectedProject.category}
                    </span>
                    <span className="text-sm text-slate-500">{selectedProject.year}</span>
                  </div>
                  <button 
                    onClick={closeModal}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5 text-slate-600" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  {/* Project Image */}
                  <div className="relative rounded-xl overflow-hidden mb-6 shadow-lg">
                    <img
                      src={selectedProject.image}
                      alt={selectedProject.title}
                      className="w-full h-96 object-cover"
                    />
                  </div>

                  {/* Project Info */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900 mb-3">
                        {selectedProject.title}
                      </h2>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        {selectedProject.description}
                      </p>
                    </div>

                    {/* Project Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-6 border-y border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-medium">Client</p>
                          <p className="font-semibold text-slate-900">{selectedProject.client}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-medium">Année</p>
                          <p className="font-semibold text-slate-900">{selectedProject.year}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                          <Tag className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 uppercase font-medium">Catégorie</p>
                          <p className="font-semibold text-slate-900">{selectedProject.category}</p>
                        </div>
                      </div>
                    </div>

                    {/* Technologies/Tags */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">Technologies utilisées</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedProject.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Project Description Extended */}
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900 mb-3">À propos du projet</h3>
                      <div className="prose prose-slate max-w-none">
                        <p className="text-slate-600 leading-relaxed">
                          Ce projet a été réalisé dans le cadre d'une collaboration étroite avec {selectedProject.client}. 
                          L'objectif principal était de créer une solution sur-mesure répondant parfaitement aux besoins 
                          spécifiques du client tout en respectant les dernières normes et standards du secteur.
                        </p>
                        <p className="text-slate-600 leading-relaxed mt-4">
                          Notre équipe a mis en œuvre les meilleures pratiques en matière de {selectedProject.category.toLowerCase()} 
                          pour garantir un résultat de haute qualité, performant et évolutif.
                        </p>
                      </div>
                    </div>

                    {/* CTA Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                        Voir le projet en ligne
                      </button>
                      <button className="px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-semibold hover:bg-slate-200 transition-colors">
                        Projet similaire
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}