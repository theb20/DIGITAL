import React, { useState, useEffect } from 'react';
import { 
  X, 
  Clock, 
  Calendar,
  Tag,
  Share2,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  MessageCircle,
  Eye,
  Facebook,
  Twitter,
  Linkedin,
  Link2,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  Maximize2,
  Minimize2
} from 'lucide-react';
import CommentSection from './comment.jsx';
import commentsApi from '../configurations/services/comments.js';
import usersApi from '../configurations/services/user.js';

const ArticleReaderPage = ({ article, onClose, darkMode = false, relatedArticles = [] }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(article?.likes || 0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  // Gestion du scroll pour la barre de progression
  useEffect(() => {
    const handleScroll = () => {
      const scrollableElement = document.getElementById('article-content');
      if (scrollableElement) {
        const scrollTop = scrollableElement.scrollTop;
        const scrollHeight = scrollableElement.scrollHeight - scrollableElement.clientHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
        setScrollProgress(progress);

        // Détection du heading actif
        const headings = scrollableElement.querySelectorAll('h2, h3');
        let currentHeading = '';
        headings.forEach((heading) => {
          const rect = heading.getBoundingClientRect();
          if (rect.top < 200) {
            currentHeading = heading.textContent || '';
          }
        });
        setActiveHeading(currentHeading);
      }
    };

    const scrollableElement = document.getElementById('article-content');
    scrollableElement?.addEventListener('scroll', handleScroll);
    return () => scrollableElement?.removeEventListener('scroll', handleScroll);
  }, []);

  // Gestion de la touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (showShareMenu) {
          setShowShareMenu(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose, showShareMenu]);

  // Récupération utilisateur courant (si connecté)
  useEffect(() => {
    (async () => {
      try {
        const user = await usersApi.getCurrentUser();
        if (user && user.id) setCurrentUser(user);
      } catch {
        // Non connecté ou erreur; ignorer
      }
    })();
  }, []);

  // Extraction de la table des matières depuis le contenu
  const extractTableOfContents = () => {
    if (!article?.content) return [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = article.content;
    const headings = tempDiv.querySelectorAll('h2, h3');
    return Array.from(headings).map((heading, index) => ({
      id: `heading-${index}`,
      text: heading.textContent || '',
      level: heading.tagName.toLowerCase()
    }));
  };

  const tableOfContents = extractTableOfContents();

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
  };

  const handleShare = (platform) => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(article?.title || '');
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    };

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
    setShowShareMenu(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sanitizeHtml = (html) => {
    if (!html || typeof html !== 'string') return '';
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');
  };

  const scrollToHeading = (headingId) => {
    const element = document.getElementById(headingId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const formatReadTime = (time) => {
    if (!time) return '';
    return time.toString().replace('min', 'min de lecture');
  };

  if (!article) return null;

  return (
    <div className={`fixed inset-0 z-[100] overflow-hidden ${isFullscreen ? 'p-0' : ''}`}>
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Container principal */}
      <div className="absolute inset-0 flex items-center justify-center p-0 sm:p-4">
        <div 
          className={`relative w-full h-full ${
            isFullscreen 
              ? 'max-w-full' 
              : 'sm:h-[95vh] sm:max-w-6xl'
          } sm:rounded-2xl shadow-2xl overflow-hidden transition-all ${
            darkMode ? 'bg-gray-900 text-gray-100' : 'bg-white text-gray-900'
          }`}
        >
          {/* Barre de progression */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 z-20">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 transition-all duration-150"
              style={{ width: `${scrollProgress}%` }}
            />
          </div>

          {/* Header fixe avec glassmorphism */}
          <div className={`sticky top-0 z-10 border-b ${
            darkMode ? 'bg-gray-900/95 border-gray-800' : 'bg-white/95 border-gray-200'
          } backdrop-blur-md`}>
            <div className="flex items-center justify-between px-3 sm:px-6 py-3">
              {/* Bouton retour mobile */}
              <button 
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                aria-label="Fermer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Titre de l'article (visible sur desktop) */}
              <div className="hidden md:block flex-1 mx-4 truncate">
                <h2 className={`text-sm font-semibold truncate ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {article.title}
                </h2>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-2">
                {/* Table des matières (desktop) */}
                {tableOfContents.length > 0 && (
                  <button
                    onClick={() => setShowTableOfContents(!showTableOfContents)}
                    className={`hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      showTableOfContents
                        ? 'bg-blue-600 text-white'
                        : darkMode
                        ? 'hover:bg-gray-800 text-gray-300'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-sm font-medium">Sommaire</span>
                  </button>
                )}

                {/* Fullscreen toggle */}
                <button
                  onClick={() => setIsFullscreen(!isFullscreen)}
                  className={`hidden sm:flex p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                  aria-label={isFullscreen ? "Quitter plein écran" : "Plein écran"}
                >
                  {isFullscreen ? (
                    <Minimize2 className="w-5 h-5" />
                  ) : (
                    <Maximize2 className="w-5 h-5" />
                  )}
                </button>

                {/* Bookmark */}
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-lg transition-colors ${
                    darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                  aria-label={isBookmarked ? "Retirer des favoris" : "Ajouter aux favoris"}
                >
                  {isBookmarked ? (
                    <BookmarkCheck className="w-5 h-5 text-blue-600 fill-blue-600" />
                  ) : (
                    <Bookmark className="w-5 h-5" />
                  )}
                </button>

                {/* Share */}
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    }`}
                    aria-label="Partager"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>

                  {showShareMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-10"
                        onClick={() => setShowShareMenu(false)}
                      />
                      <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border z-20 overflow-hidden ${
                        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                      }`}>
                        <div className="py-2">
                          <button
                            onClick={() => handleShare('facebook')}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                            }`}
                          >
                            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                              <Facebook className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">Facebook</span>
                          </button>
                          <button
                            onClick={() => handleShare('twitter')}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                            }`}
                          >
                            <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                              <Twitter className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">Twitter</span>
                          </button>
                          <button
                            onClick={() => handleShare('linkedin')}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-blue-50'
                            }`}
                          >
                            <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
                              <Linkedin className="w-4 h-4 text-white" />
                            </div>
                            <span className="font-medium">LinkedIn</span>
                          </button>
                          <div className={`border-t my-2 ${darkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                          <button
                            onClick={copyLink}
                            className={`w-full px-4 py-3 text-left flex items-center gap-3 transition-colors ${
                              darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                            }`}
                          >
                            {copied ? (
                              <>
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-green-500 font-medium">Lien copié !</span>
                              </>
                            ) : (
                              <>
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                  darkMode ? 'bg-gray-700' : 'bg-gray-100'
                                }`}>
                                  <Link2 className="w-4 h-4" />
                                </div>
                                <span className="font-medium">Copier le lien</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Layout principal avec sidebar */}
          <div className="flex h-full" style={{ height: 'calc(100% - 57px)' }}>
            {/* Sidebar Table des matières (desktop) */}
            {showTableOfContents && tableOfContents.length > 0 && (
              <div className={`hidden lg:block w-64 border-r overflow-y-auto ${
                darkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-50 border-gray-200'
              }`}>
                <div className="p-4">
                  <h3 className={`text-sm font-bold uppercase tracking-wide mb-4 ${
                    darkMode ? 'text-gray-400' : 'text-gray-600'
                  }`}>
                    Table des matières
                  </h3>
                  <nav className="space-y-1">
                    {tableOfContents.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => scrollToHeading(item.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          item.level === 'h3' ? 'pl-6' : ''
                        } ${
                          activeHeading === item.text
                            ? 'bg-blue-600 text-white font-medium'
                            : darkMode
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {item.text}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            )}

            {/* Contenu scrollable */}
            <div 
              id="article-content"
              className="flex-1 overflow-y-auto"
            >
              {/* Image de couverture */}
              {article.image && (
                <div className="w-full h-56 sm:h-72 md:h-96 lg:h-[32rem] overflow-hidden relative group">
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Overlay avec titre sur l'image (mobile) */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:hidden">
                    <h1 className="text-2xl font-bold text-white leading-tight mb-2">
                      {article.title}
                    </h1>
                  </div>
                </div>
              )}

                {/* Contenu principal */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Titre (desktop uniquement si image présente) */}
                {(!article.image || window.innerWidth >= 768) && (
                  <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {article.title}
                  </h1>
                )}

                {/* Meta informations */}
                <div className="flex flex-wrap items-center gap-4 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800">
                  {/* Auteur */}
                  {(article.author?.name || article.author_name) && (
                    <div className="flex items-center gap-3">
                      <img 
                        src={article.author?.avatar || article.author_avatar || 'https://i.pravatar.cc/150?img=12'} 
                        alt="auteur" 
                        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-gray-200 dark:border-gray-700"
                      />
                      <div>
                        <div className={`text-sm sm:text-base font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                          {article.author?.name || article.author_name}
                        </div>
                        {(article.author?.role || article.author_role) && (
                          <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {article.author?.role || article.author_role}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Date et stats */}
                  <div className={`flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {article.date && (
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {article.date}
                      </span>
                    )}
                    {article.readTime && (
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {formatReadTime(article.readTime)}
                      </span>
                    )}
                    {article.views && (
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        {article.views} vues
                      </span>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {Array.isArray(article.tags) && article.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {article.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                          darkMode 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Contenu de l'article */}
                <article className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-12 ${
                  darkMode 
                    ? 'prose-invert prose-headings:text-white prose-p:text-gray-300 prose-a:text-blue-400 prose-strong:text-white prose-code:text-gray-300 prose-li:text-gray-300 prose-blockquote:text-gray-400' 
                    : 'prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-li:text-gray-700 prose-blockquote:border-gray-300'
                }`}>
                  {article.content ? (
                    <div className="article-content" dangerouslySetInnerHTML={{ __html: sanitizeHtml(article.content) }} />
                  ) : article.excerpt ? (
                    <p className="leading-relaxed text-base sm:text-lg">{article.excerpt}</p>
                  ) : (
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                      Contenu non disponible.
                    </p>
                  )}
                </article>

                {/* Lien externe */}
                {article.link && article.link !== '#' && (
                  <div className={`mb-8 p-4 sm:p-6 rounded-xl border-2 transition-all hover:shadow-lg ${
                    darkMode ? 'bg-gray-800 border-gray-700 hover:border-blue-600' : 'bg-blue-50 border-blue-200 hover:border-blue-400'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <ExternalLink className="w-5 h-5 text-blue-600" />
                      <span className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                        Source originale
                      </span>
                    </div>
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:text-blue-700 font-medium hover:underline break-all"
                    >
                      {article.link}
                    </a>
                  </div>
                )}

                {/* Actions engagement */}
                <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 py-6 border-t border-b ${
                  darkMode ? 'border-gray-800' : 'border-gray-200'
                }`}>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleLike}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                        isLiked
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                          : darkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                      <span>{likesCount}</span>
                    </button>

                    {article.comments !== undefined && (
                      <button className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-colors ${
                        darkMode
                          ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}>
                        <MessageCircle className="w-5 h-5" />
                        <span>{article.comments}</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className={`px-6 py-2.5 rounded-xl flex items-center justify-center gap-2 font-semibold transition-colors ${
                      darkMode
                        ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Partager l'article</span>
                  </button>
                </div>

                {/* Commentaires (Blog) */}
                {(() => {
                  const blogDbId = article?.dbId ?? (article?.id && String(article.id).startsWith('db-') ? Number(String(article.id).split('-')[1]) : null);
                  if (!blogDbId) return null;
                  const load = async () => {
                    try {
                      const rows = await commentsApi.listByBlog(blogDbId);
                      const arr = Array.isArray(rows) ? rows : [];
                      const ids = [...new Set(arr.map(r => r.user_id).filter(Boolean))];
                      const userEntries = await Promise.all(ids.map(async (id) => {
                        try {
                          const u = await usersApi.get(id);
                          return { id, u };
                        } catch {
                          return { id, u: null };
                        }
                      }));
                      const userMap = new Map(userEntries.map(({ id, u }) => [id, u]));
                      const nameOf = (u) => {
                        if (!u) return 'Utilisateur';
                        const full = `${u.first_name || ''} ${u.last_name || ''}`.trim();
                        return full || u.name || u.email || 'Utilisateur';
                      };
                      return arr.map(r => {
                        const u = userMap.get(r.user_id);
                        return {
                          ...r,
                          author: r.author || nameOf(u),
                          avatarUrl: (u && u.avatar) ? u.avatar : null,
                        };
                      });
                    } catch (e) {
                      console.warn('[Reading] Chargement commentaires échoué:', e?.message || e);
                      return [];
                    }
                  };
                  const onAdd = async ({ author, text }) => {
                    // Exige un utilisateur connecté pour créer
                    if (!currentUser || !currentUser.id) {
                      throw new Error('AUTH_REQUIRED');
                    }
                    const payload = {
                      user_id: currentUser.id,
                      rating: null,
                      review: text,
                      likes: 0,
                      dislikes: 0,
                    };
                    const created = await commentsApi.createForBlog(blogDbId, payload);
                    return {
                      id: created.id,
                      author: `${currentUser.first_name || ''} ${currentUser.last_name || ''}`.trim() || currentUser.name || currentUser.email || author,
                      review: created.review,
                      created_at: created.created_at,
                      likes: created.likes,
                      dislikes: created.dislikes,
                      user_id: currentUser.id,
                      avatarUrl: currentUser.avatar || null,
                    };
                  };
                  const onReact = async (commentId, type) => {
                    if (!currentUser || !currentUser.id) throw new Error('AUTH_REQUIRED');
                    const updated = type === 'like'
                      ? await commentsApi.like(commentId, currentUser.id)
                      : await commentsApi.dislike(commentId, currentUser.id);
                    return updated;
                  };
                  return (
                    <div className="mt-12">
                      <CommentSection 
                        title="Commentaires"
                        subtitle="Partagez votre avis sur cet article"
                        loadComments={load}
                        onAddComment={onAdd}
                        requireAuth={true}
                        currentUser={currentUser}
                        onReact={onReact}
                      />
                    </div>
                  );
                })()}

                {/* Articles similaires */}
                {relatedArticles && relatedArticles.length > 0 && (
                  <div className="mt-12 pt-12 border-t border-gray-200 dark:border-gray-800">
                    <h3 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                      Articles similaires
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-6">
                      {relatedArticles.slice(0, 2).map((related, idx) => (
                        <div 
                          key={idx}
                          className={`group cursor-pointer rounded-xl overflow-hidden border transition-all hover:shadow-xl ${
                            darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                          }`}
                        >
                          {related.image && (
                            <div className="h-48 overflow-hidden">
                              <img 
                                src={related.image} 
                                alt={related.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                              />
                            </div>
                          )}
                          <div className="p-4">
                            <h4 className={`font-semibold mb-2 group-hover:text-blue-600 transition-colors line-clamp-2 ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {related.title}
                            </h4>
                            <p className={`text-sm line-clamp-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                              {related.excerpt}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bouton fermer */}
                <div className="flex justify-center pt-8">
                  <button 
                    onClick={onClose}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                      darkMode 
                        ? 'bg-gray-800 text-gray-100 hover:bg-gray-700' 
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    Retour aux articles
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleReaderPage;