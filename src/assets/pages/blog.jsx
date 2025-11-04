import { useState, useEffect } from 'react';
import { Search, Calendar, Clock, ArrowRight, TrendingUp, Bookmark, User, Share2, Eye, MessageCircle, Filter, ChevronRight, Sparkles, Award, GalleryHorizontalEnd, Cpu, Handshake, StickyNote, Wallpaper, Brain, Instagram, Twitter, Youtube, Moon, Sun } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BlogPage() {
  useEffect(()=>{
      document.title = "Blog - Digital";
    })
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [savedArticles, setSavedArticles] = useState([]);
  const [scrolled, setScrolled] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Récupérer la préférence depuis localStorage au chargement
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const size = 14;
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  const categories = [
    { name: 'Tous', icon: <GalleryHorizontalEnd size={size} />, count: 24 },
    { name: 'Technologie', icon: <Cpu size={size} />, count: 8 },
    { name: 'Business', icon: <Handshake size={size} />, count: 6 },
    { name: 'Innovation', icon: <StickyNote size={size} />, count: 5 },
    { name: 'Design', icon: <Wallpaper size={size} />, count: 3 },
    { name: 'IA', icon: <Brain size={size} />, count: 2 },
  ];

  const articles = [
    {
      id: 1,
      title: "L'avenir de l'IA générative dans l'entreprise : révolution ou évolution ?",
      excerpt: "Une analyse approfondie des impacts transformationnels de l'intelligence artificielle sur les processus métier et la productivité organisationnelle.",
      category: "IA",
      author: { name: "Sophie Durand", role: "Chief AI Officer", avatar: "https://i.pravatar.cc/150?img=1" },
      date: "15 Jan 2025",
      readTime: "12 min",
      views: "12.4K",
      comments: 47,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&q=80",
      featured: true,
      trending: true,
      tags: ["IA", "Machine Learning", "Automatisation"]
    },
    {
      id: 2,
      title: "Architecture microservices : guide complet pour les entreprises modernes",
      excerpt: "Comment structurer vos applications pour une scalabilité optimale, une maintenance simplifiée et une agilité maximale.",
      category: "Technologie",
      author: { name: "Marc Leblanc", role: "Lead Architect", avatar: "https://i.pravatar.cc/150?img=2" },
      date: "12 Jan 2025",
      readTime: "18 min",
      views: "8.7K",
      comments: 32,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
      featured: true,
      trending: true,
      tags: ["Architecture", "Cloud", "DevOps"]
    },
    {
      id: 3,
      title: "Design System : créer une expérience cohérente à grande échelle",
      excerpt: "Les meilleures pratiques pour construire, maintenir et faire évoluer un design system qui unifie vos produits digitaux.",
      category: "Design",
      author: { name: "Julie Martin", role: "Head of Design", avatar: "https://i.pravatar.cc/150?img=3" },
      date: "10 Jan 2025",
      readTime: "15 min",
      views: "6.2K",
      comments: 28,
      image: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=1200&q=80",
      featured: false,
      trending: true,
      tags: ["UX/UI", "Design System", "Figma"]
    },
    {
      id: 4,
      title: "ROI du digital : méthodes avancées de mesure et d'optimisation",
      excerpt: "Au-delà des KPIs classiques, découvrez comment quantifier précisément la valeur créée par vos initiatives digitales.",
      category: "Business",
      author: { name: "Thomas Dubois", role: "Digital Strategy Lead", avatar: "https://i.pravatar.cc/150?img=4" },
      date: "8 Jan 2025",
      readTime: "10 min",
      views: "9.1K",
      comments: 19,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80",
      featured: false,
      trending: true,
      tags: ["Analytics", "ROI", "Strategy"]
    },
    {
      id: 5,
      title: "Cybersécurité : les nouvelles menaces et comment les contrer",
      excerpt: "État des lieux des cybermenaces 2025 et stratégies de défense pour protéger efficacement votre infrastructure.",
      category: "Technologie",
      author: { name: "Alice Bernard", role: "Security Expert", avatar: "https://i.pravatar.cc/150?img=5" },
      date: "5 Jan 2025",
      readTime: "14 min",
      views: "11.3K",
      comments: 41,
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80",
      featured: false,
      trending: true,
      tags: ["Sécurité", "Cloud", "Compliance"]
    },
    {
      id: 6,
      title: "Web3 et blockchain : opportunités réelles pour les entreprises",
      excerpt: "Décryptage des cas d'usage concrets de la blockchain en entreprise, au-delà du buzz marketing.",
      category: "Innovation",
      author: { name: "Pierre Rousseau", role: "Innovation Director", avatar: "https://i.pravatar.cc/150?img=6" },
      date: "3 Jan 2025",
      readTime: "11 min",
      views: "5.8K",
      comments: 15,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
      featured: false,
      trending: false,
      tags: ["Blockchain", "Web3", "NFT"]
    },
    {
      id: 7,
      title: "Web3 et blockchain : opportunités réelles pour les entreprises",
      excerpt: "Décryptage des cas d'usage concrets de la blockchain en entreprise, au-delà du buzz marketing.",
      category: "Innovation",
      author: { name: "Pierre Rousseau", role: "Innovation Director", avatar: "https://i.pravatar.cc/150?img=6" },
      date: "3 Jan 2025",
      readTime: "11 min",
      views: "5.8K",
      comments: 15,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
      featured: false,
      trending: false,
      tags: ["Blockchain", "Web3", "NFT"]
    },
    {
      id: 8,
      title: "Web3 et blockchain : opportunités réelles pour les entreprises",
      excerpt: "Décryptage des cas d'usage concrets de la blockchain en entreprise, au-delà du buzz marketing.",
      category: "Innovation",
      author: { name: "Pierre Rousseau", role: "Innovation Director", avatar: "https://i.pravatar.cc/150?img=6" },
      date: "3 Jan 2025",
      readTime: "11 min",
      views: "5.8K",
      comments: 15,
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&q=80",
      featured: false,
      trending: false,
      tags: ["Blockchain", "Web3", "NFT"]
    }
  ];

  const toggleSave = (id) => {
    setSavedArticles(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const filteredArticles = articles.filter(article => {
    const matchesCategory = selectedCategory === 'Tous' || article.category === selectedCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         article.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticles = filteredArticles.filter(a => a.featured);
  const trendingArticles = filteredArticles.filter(a => a.trending && !a.featured);
  const regularArticles = filteredArticles.filter(a => !a.featured && !a.trending);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-gray-50 via-white to-blue-50'}`}>
      
      {/* Sticky Navigation */}
      <div className={`sticky top-0 z-50  transition-all duration-300 ${
        scrolled 
          ? darkMode 
            ? 'bg-gray-800/95 backdrop-blur-xl shadow-lg' 
            : 'bg-white/95 backdrop-blur-xl shadow-lg'
          : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <h2
                onClick={() => navigate('/')}
                className={`text-xl font-bold cursor-pointer ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                <img src="/img/web-app-manifest-192x192.png" alt="Logo digital" className='w-9 sm:w-10 md:w-12 lg:w-14 xl:w-16' />
              </h2>

              <div className="hidden md:flex items-center gap-3">
                {categories.slice(0, 7).map((cat) => (
                  <button
                    key={cat.name}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`px-4 py-2 rounded-lg flex items-center gap-1 text-sm font-medium transition-all ${
                      selectedCategory === cat.name
                        ? 'bg-blue-600 text-white shadow-lg'
                        : darkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {cat.icon} {cat.name}
                  </button>
                ))}
              </div>

            </div>
            <div className="flex items-center gap-3">
              

              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-400'}`} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher..."
                  className={`pl-10 pr-4 py-2 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-colors ${
                    darkMode
                      ? 'bg-gray-700 text-white placeholder-gray-400 focus:bg-gray-600'
                      : 'bg-gray-100 focus:bg-white'
                  }`}
                />
              </div>
              {/* Dark Mode Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-lg transition-all ${
                  darkMode
                    ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-label="Toggle dark mode"
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-700 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="absolute inset-0 bg-[url('/img/background/blog.webp')] object-cover opacity-30"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6" />
              <span className="px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold border border-white/30">
                Insights & Expertise
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black mb-6 leading-tight">
              Le blog qui inspire
              <span className="block mt-2">les leaders digitaux</span>
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 leading-relaxed max-w-3xl">
              Analyses approfondies, tendances émergentes et stratégies éprouvées 
              par nos experts du digital et de la tech.
            </p>
            <div className="flex flex-wrap gap-6 mt-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">50K+</div>
                  <div className="text-sm text-white/80">Lecteurs/mois</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-2xl font-bold">200+</div>
                  <div className="text-sm text-white/80">Articles publiés</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-15 relative z-20">
        
        {/* Featured Articles - Hero Cards */}
        {featuredArticles.length > 0 && (
          <div className="mb-20">
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredArticles.map((article, idx) => (
                <article
                  key={article.id}
                  className={`group relative rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-2 ${
                    darkMode ? 'bg-gray-800' : 'bg-white'
                  }`}
                >
                  <div className="relative h-80 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    
                    {/* Badges */}
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                      <span className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-2">
                        <Sparkles className="w-3 h-3" />
                        FEATURED
                      </span>
                      <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 text-xs font-semibold rounded-full">
                        {article.category}
                      </span>
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => toggleSave(article.id)}
                      className="absolute top-6 right-6 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-lg"
                    >
                      <Bookmark className={`w-5 h-5 ${savedArticles.includes(article.id) ? 'fill-blue-600 text-blue-600' : 'text-gray-700'}`} />
                    </button>

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                      <h2 className="text-xl font-bold mb-4 group-hover:text-blue-300 transition-colors leading-tight">
                        {article.title}
                      </h2>
                      <p className="text-white/90 mb-6 line-clamp-2 text-lg">
                        {article.excerpt}
                      </p>
                      
                      {/* Meta info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={article.author.avatar}
                            alt={article.author.name}
                            className="w-12 h-12 rounded-full border-2 border-white/50"
                          />
                          <div>
                            <div className="font-semibold">{article.author.name}</div>
                            <div className="text-sm text-white/70">{article.author.role}</div>
                          </div>
                        </div>
                        <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors flex items-center gap-2">
                          Lire
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Trending Section */}
        {trendingArticles.length > 0 && (
          <div className="mb-16">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Tendances</h2>
                  <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Les plus lus cette semaine</p>
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {trendingArticles.map((article) => (
                <article
                  key={article.id}
                  className={`group rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Stats overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                        <span className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                          <MessageCircle className="w-3 h-3" />
                          {article.comments}
                        </span>
                      </div>
                      <button
                        onClick={() => toggleSave(article.id)}
                        className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors"
                      >
                        <Bookmark className={`w-4 h-4 ${savedArticles.includes(article.id) ? 'fill-blue-600 text-blue-600' : 'text-gray-700'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">
                        🔥 TRENDING
                      </span>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {article.category}
                      </span>
                    </div>

                    <h3 className={`text-xl font-bold mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {article.title}
                    </h3>

                    <p className={`text-sm mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {article.excerpt}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {article.tags.slice(0, 2).map((tag, idx) => (
                        <span key={idx} className={`px-2 py-1 text-xs rounded ${
                          darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                        }`}>
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Author & CTA */}
                    <div className={`flex items-center justify-between pt-4 border-t ${
                      darkMode ? 'border-gray-700' : 'border-gray-100'
                    }`}>
                      <div className="flex items-center gap-2">
                        <img
                          src={article.author.avatar}
                          alt={article.author.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div className="text-xs">
                          <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{article.author.name}</div>
                          <div className={darkMode ? 'text-gray-500' : 'text-gray-500'}>{article.readTime}</div>
                        </div>
                      </div>
                      <button className="text-blue-600 font-semibold text-sm hover:gap-2 inline-flex items-center gap-1 transition-all">
                        Lire
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Regular Articles */}
        {regularArticles.length > 0 && (
          <div className="mb-16">
            <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Derniers articles</h2>
            <div className="space-y-6">
              {regularArticles.map((article) => (
                <article
                  key={article.id}
                  className={`group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border ${
                    darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
                  }`}
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="relative h-[205px] md:h-auto overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    <div className="md:col-span-2 p-6 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                            {article.category}
                          </span>
                          <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Clock className="w-3 h-3" />
                            {article.readTime}
                          </span>
                          <span className={`text-xs flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            <Eye className="w-3 h-3" />
                            {article.views}
                          </span>
                        </div>

                        <h3 className={`text-2xl font-bold mb-3 group-hover:text-blue-600 transition-colors ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {article.title}
                        </h3>

                        <p className={`mb-4 line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                          {article.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {article.tags.map((tag, idx) => (
                            <span key={idx} className={`px-3 py-1 text-xs rounded-full ${
                              darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-600'
                            }`}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <img
                            src={article.author.avatar}
                            alt={article.author.name}
                            className="w-10 h-10 rounded-full"
                          />
                          <div className="text-sm">
                            <div className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{article.author.name}</div>
                            <div className={darkMode ? 'text-gray-500' : 'text-gray-500'}>{article.date}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => toggleSave(article.id)}
                            className={`w-10 h-10 border-2 rounded-full flex items-center justify-center hover:border-blue-600 hover:bg-blue-50 transition-colors ${
                              darkMode ? 'border-gray-600 hover:bg-gray-700' : 'border-gray-200'
                            }`}
                          >
                            <Bookmark className={`w-4 h-4 ${savedArticles.includes(article.id) ? 'fill-blue-600 text-blue-600' : darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                          </button>
                          <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
                            Lire l'article
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Premium Newsletter Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden mt-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-100"></div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 border border-white/20">
            <span className="text-sm font-semibold">Newsletter Premium</span>
          </div>
          
          <h2 className="text-4xl sm:text-5xl font-black mb-6">
            Rejoignez 50,000+ leaders digitaux
          </h2>
          
          <p className="text-xl text-white/80 mb-10 max-w-2xl mx-auto">
            Recevez chaque semaine nos analyses exclusives, études de cas et insights stratégiques directement dans votre inbox.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-8">
            <input
              type="email"
              placeholder="votre@email.pro"
              className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/20 rounded-xl focus:border-white focus:outline-none text-white placeholder-white/60"
            />
            <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-100 transition-colors whitespace-nowrap shadow-2xl flex items-center justify-center gap-2">
              S'abonner gratuitement
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70">
            <span className="flex items-center gap-2">✓ Aucun spam</span>
            <span className="flex items-center gap-2">✓ Désabonnement en 1 clic</span>
            <span className="flex items-center gap-2">✓ 100% gratuit</span>
          </div>
        </div>
      </div>
    </div>
  );
}