import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';
import { ArrowLeft, Star, Check, Shield, Clock, Package, MessageCircle, Download, Share2, ChevronDown, ChevronUp, Mail, Phone, Award, Users, TrendingUp, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import CommentSection from '../components/comment.jsx';
import commentsApi from '../configurations/services/comments.js';
import servicesApi from '../configurations/services/services.js';
import session from '../configurations/services/session.js';
import usersApi from '../configurations/services/user.js';
import devisRequestsApi from '../configurations/services/devisRequests.js';

// Charge jsPDF de façon résiliente (local ou via CDN)
async function ensureJsPdf() {
  let jsPDF = null;
  try {
    const mod = await import('jspdf');
    jsPDF = (mod && (mod.jsPDF || mod.default)) || null;
  } catch (_ERR) { void _ERR; }
  if (!jsPDF && typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) {
    jsPDF = window.jspdf.jsPDF;
  }
  if (!jsPDF && typeof document !== 'undefined') {
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js';
      s.async = true;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
    if (window.jspdf && window.jspdf.jsPDF) {
      jsPDF = window.jspdf.jsPDF;
    }
  }
  return jsPDF;
}

// Rend le texte de description de façon structurée (paragraphes, listes, titres simples)
function renderStructuredDescription(text) {
  const src = String(text || '').trim();
  if (!src) return null;

  // Détecte une section "Livrables :" et transforme les séparateurs " + " en listes
  const livMatch = src.match(/^(.*?)(?:\bLivrables\s*:)([\s\S]*)$/i);
  let pre = src;
  let liv = '';
  if (livMatch) {
    pre = String(livMatch[1] || '').trim();
    liv = String(livMatch[2] || '').trim();
  }

  const preNormalized = pre.replace(/\s*\+\s*/g, "\n- ");
  const livNormalized = liv ? liv.replace(/\s*\+\s*/g, "\n- ") : '';
  const combined = liv ? `${preNormalized}\n## Livrables\n${livNormalized}` : preNormalized;

  const lines = combined.split(/\r?\n/);
  const blocks = [];
  let listBuffer = null;

  const flushList = () => {
    if (listBuffer && listBuffer.length) {
      blocks.push({ type: 'ul', items: listBuffer.slice() });
    }
    listBuffer = null;
  };

  for (const raw of lines) {
    const line = String(raw || '').trim();
    if (!line) { flushList(); continue; }

    // Listes: -, *, • ou numérotées "1. "
    if (/^([-*•]|\d+\.)\s+/.test(line)) {
      const item = line.replace(/^([-*•]|\d+\.)\s+/, '');
      listBuffer = listBuffer || [];
      listBuffer.push(item);
      continue;
    }

    // Titres markdown basiques: #, ##, ###
    const headingMatch = line.match(/^#{1,3}\s+(.*)$/);
    if (headingMatch) {
      flushList();
      const level = (line.match(/^#{1,3}/) || ['#'])[0].length;
      blocks.push({ type: 'h', level, content: headingMatch[1] });
      continue;
    }

    // Paragraphe
    flushList();
    blocks.push({ type: 'p', content: line });
  }

  flushList();

  return (
    <div className="space-y-3">
      {blocks.map((b, i) => {
        if (b.type === 'p') {
          return (
            <p key={i} className="text-sub leading-relaxed">{b.content}</p>
          );
        }
        if (b.type === 'ul') {
          return (
            <ul key={i} className="list-disc pl-6 text-sub">
              {b.items.map((it, j) => (
                <li key={j} className="leading-relaxed">{it}</li>
              ))}
            </ul>
          );
        }
        if (b.type === 'h') {
          const size = b.level === 1 ? 'text-2xl' : b.level === 2 ? 'text-xl' : 'text-lg';
          return (
            <div key={i} className={`font-bold ${size} text-dark`}>{b.content}</div>
          );
        }
        return null;
      })}
    </div>
  );
}

// Rend uniquement les livrables uniques (liste dédupliquée),
// accepte un tableau ou une chaîne (avec séparateurs " + ", puces ou numérotation)
function _renderUniqueDeliverables(data) {
  let items = [];
  const norm = (s) => String(s || '').trim();

  if (Array.isArray(data)) {
    items = data.map(norm);
  } else if (typeof data === 'string') {
    const src = norm(data).replace(/\bLivrables\s*:\s*/i, '');
    const normalized = src.replace(/\s*\+\s*/g, "\n- ");
    const lines = normalized.split(/\r?\n/);
    for (const raw of lines) {
      const line = norm(raw);
      if (!line) continue;
      const m = line.match(/^([-*•]|\d+\.)\s+(.*)$/);
      if (m) {
        items.push(norm(m[2]));
      }
    }
  }

  // Déduplication insensible à la casse
  const seen = new Set();
  const uniq = [];
  for (const it of items) {
    const key = it.toLowerCase();
    if (!it || seen.has(key)) continue;
    seen.add(key);
    uniq.push(it);
  }

  if (!uniq.length) return (<p className="text-sub leading-relaxed">Aucun livrable indiqué.</p>);
  return (
    <ul className="list-disc pl-6 text-sub">
      {uniq.map((it, idx) => (
        <li key={idx} className="leading-relaxed">{it}</li>
      ))}
    </ul>
  );
}

// Extrait la section Livrables/Inclut/Comprend depuis une description texte
function extractDeliverablesFromText(text) {
  const src = String(text || '');
  const srcNL = src.replace(/\\n/g, '\n');
  if (!srcNL.trim()) return [];
  // Reconnaît divers en-têtes possibles pour la section des livrables
  const re = /(?:^|\n)\s*(?:#{1,3}\s*)?(Livrables|Le\s+service\s+inclut|Ce\s+service\s+inclut|Service\s+inclut|Comprend|Inclus|Offre\s+inclut|Notre\s+offre\s+inclut)\s*:?\s*/i;
  const m = re.exec(srcNL);
  if (!m) return [];
  const tail = srcNL.slice(m.index + m[0].length);
  // Couper au prochain en-tête probable pour ne pas mélanger les sections
  const cutIdx = tail.search(/(?:^|\n)\s*(?:#{1,3}\s*)?(?:Caractéristiques|Caractéristiques|Technologies|Outils|Délai|Délai|Garanties|Engagements|Tarifs?|Prix|Processus|Méthodologie|Description|Vue d'ensemble|Vue d’ensembles?)\b|(?:^|\n)\s*#{1,3}\s+/i);
  const scope = cutIdx > -1 ? tail.slice(0, cutIdx) : tail;
  const normalized = scope.replace(/\s*\+\s*/g, "\n- ");
  const lines = normalized.split(/\r?\n/);
  const items = [];
  for (const raw of lines) {
    const line = String(raw || '').trim();
    if (!line) continue;
    const mm = line.match(/^([-*•]|\d+\.)\s+(.*)$/);
    if (mm) {
      items.push(String(mm[2] || '').trim());
      continue;
    }
    // Si la ligne n'est pas un titre markdown, la considérer comme item
    if (!/^#{1,3}\s+/.test(line)) {
      items.push(line);
    }
  }
  if (!items.length) {
    // Fallback: découper par '+' ou ','
    scope.split(/[+,]/).forEach(s => {
      const t = String(s || '').trim();
      if (t) items.push(t);
    });
  }
  // Déduplication insensible à la casse
  const seen = new Set();
  const uniq = [];
  for (const it of items) {
    const key = it.toLowerCase();
    if (!it || seen.has(key)) continue;
    seen.add(key);
    uniq.push(it);
  }
  return uniq;
}

export default function CardPage() {
  const location = useLocation();
  const { state } = location;
  const navigate = useNavigate();
  
  const [selectedOption, setSelectedOption] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [currentUser, setCurrentUser] = useState(null);
  const [serviceState, setServiceState] = useState(null);
  const [iconNameState, setIconNameState] = useState('Briefcase');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (session.isAuthenticated()) {
          const u = await usersApi.getCurrentUser();
          if (mounted) setCurrentUser(u || null);
        } else {
          if (mounted) setCurrentUser(null);
        }
      } catch {
        // Silent fail, keep currentUser null
        if (mounted) setCurrentUser(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Déstructurements avant tout return pour garantir l'ordre des hooks
  const service = state?.service || serviceState;
  const iconName = state?.iconName || iconNameState;

  // Si la page est chargée sans state (ex: lien partagé), tenter de réhydrater via ?id=...
  useEffect(() => {
    (async () => {
      if (!state?.service) {
        const params = new URLSearchParams(location.search || '');
        const idParam = params.get('id');
        if (idParam) {
          try {
            const fetched = await servicesApi.get(idParam);
            if (fetched && fetched.id != null) {
              setServiceState(fetched);
              // Icône par défaut si non fournie
              setIconNameState('Briefcase');
            }
          } catch {
            // ignore et laisser l'écran vide avec CTA retour
          }
        }
      }
    })();
  }, [state, location.search]);

  // Initialiser l'option sélectionnée hors rendu pour éviter setState pendant render
  useEffect(() => {
    if (service && Array.isArray(service.options) && !selectedOption) {
      const popularOption = service.options.find(o => o.popular);
      setSelectedOption(popularOption?.id || service.options[0]?.id);
    }
  }, [service, selectedOption]);

  if (!service) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-600 text-lg mb-6">Aucun service sélectionné.</p>
          <button
            onClick={() => navigate('/services')}
            className="px-8 py-3 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium"
          >
            Retour aux services
          </button>
        </div>
      </div>
    );
  }

  const Icon = Icons[iconName];

  // Initialiser l'option sélectionnée
  // (déplacé dans useEffect ci-dessus)

  const selectedOptionData = service.options 
    ? service.options.find(opt => opt.id === selectedOption)
    : null;

  const displayPrice = selectedOptionData?.price || (typeof service.price === 'string' ? null : service.price);
  const displayDuration = selectedOptionData?.duration || service.duration;

  const rating = service.rating || 4.8;
  const reviewCount = (() => {
    const a = Number(service.review_count);
    if (Number.isFinite(a)) return a;
    const b = Number(service.reviewCount);
    if (Number.isFinite(b)) return b;
    return 0;
  })();
  const provider = service.provider || "Prestataire Pro";
  const providerRating = service.providerRating || 4.7;
  const technologies = service.technologies || [];

  const STATS = [
    { icon: Users, label: 'Clients satisfaits', value: '500+' },
    { icon: Award, label: 'Années d\'expérience', value: '10+' },
    { icon: TrendingUp, label: 'Taux de réussite', value: '98%' }
  ];

  const handleShare = async () => {
    try {
      const base = window.location.origin;
      const url = service?.id != null ? `${base}/card?id=${encodeURIComponent(service.id)}` : window.location.href;
      const title = service.title || 'Service Digital';
      const text = `${service.title} • ${service.category || ''}`.trim();
      if (navigator.share) {
        await navigator.share({ title, text, url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Lien copié dans le presse-papier');
      }
    } catch {
      alert('Impossible de partager pour le moment');
    }
  };

  const handleDownload = () => {
    try {
      const selected = selectedOptionData || null;
      const fiche = {
        id: service.id || null,
        title: service.title || '',
        category: service.category || '',
        description: service.description || '',
        provider: provider,
        providerRating: providerRating,
        rating,
        reviewCount,
        duration: displayDuration || null,
        price: displayPrice || null,
        option: selected ? {
          id: selected.id,
          name: selected.name || selected.title || null,
          duration: selected.duration || null,
          price: selected.price || null,
          popular: !!selected.popular
        } : null,
        features: Array.isArray(service.features) ? service.features : [],
        technologies,
        cover_url: service.cover_url || null,
        image_url: service.img_url || null
      };
      const content = JSON.stringify(fiche, null, 2);
      const blob = new Blob([content], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      const safeTitle = String(service.title || 'fiche-service').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
      a.download = `${safeTitle || 'fiche-service'}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch {
      alert('Erreur lors du téléchargement de la fiche');
    }
  };

  const handleDownloadPdf = async () => {
    try {
      const jsPDF = await ensureJsPdf();
      if (!jsPDF) {
        alert('Module PDF indisponible. Merci d\'installer "jspdf" ou vérifier la connexion.');
        return;
      }
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 14;
      let y = margin;

      const addHeading = (text) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        const lines = doc.splitTextToSize(String(text || ''), pageWidth - margin * 2);
        lines.forEach((ln) => {
          if (y > pageHeight - margin) { doc.addPage(); y = margin; }
          doc.text(ln, margin, y);
          y += 8;
        });
      };

      const addText = (text) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(String(text || ''), pageWidth - margin * 2);
        lines.forEach((ln) => {
          if (y > pageHeight - margin) { doc.addPage(); y = margin; }
          doc.text(ln, margin, y);
          y += 6;
        });
      };

      const addList = (items) => {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        (items || []).forEach((it) => {
          const line = `• ${String(it || '')}`;
          const lines = doc.splitTextToSize(line, pageWidth - margin * 2);
          lines.forEach((ln, idx) => {
            if (y > pageHeight - margin) { doc.addPage(); y = margin; }
            doc.text(ln, margin, y);
            y += idx === 0 ? 6 : 5;
          });
        });
      };

      const safeTitle = String(service.title || 'Fiche Service');
      addHeading(safeTitle);
      addText(`${service.category || ''}`);
      y += 2;
      addText(`Prestataire: ${provider}`);
      addText(`Note: ${providerRating} / ${rating} (${reviewCount} avis)`);
      addText(`Durée: ${displayDuration || '—'}`);
      addText(`Prix: ${displayPrice || '—'}`);
      y += 4;

      addHeading('Description');
      addText(String(service.description || '').replace(/\\n/g, '\n'));
      y += 4;

      const inclus = extractDeliverablesFromText(String(service.description || '').replace(/\\n/g, '\n'));
      if (inclus && inclus.length) {
        addHeading('Inclus');
        addList(inclus);
      }

      if (Array.isArray(technologies) && technologies.length) {
        y += 2;
        addHeading('Technologies & Outils');
        addList(technologies);
      }

      const filename = safeTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'fiche-service';
      doc.save(`${filename}.pdf`);
    } catch (_ERR) {
      void _ERR;
      alert('Erreur lors de la génération du PDF');
    }
  };

  return (
    <div className="min-h-screen bg-dark lg:pt-24 pt-0 bg-slate-50">
      {/* Header professionnel */}
      <div className="bg-dark ">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/services')}
              className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-5 h-5 text-sub" />
              <span className='hidden lg:block text-sub'>Catalogue des services</span>
            </button>
            <div className="flex items-center gap-3">
              <button onClick={handleShare} className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                <Share2 className="w-4 h-4 text-sub text-sub" />
                <span className='hidden lg:block text-sub'>Partager</span>
              </button>
             
              <button onClick={handleDownloadPdf} className="px-4 py-2 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4 text-sub" />
                <span className='hidden lg:block text-sub'>Télécharger PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div
        className="
          relative
          bg-cover bg-center text-white
          before:content-['']
          before:absolute before:inset-0 before:bg-black/40 before:z-1
        "
        style={{
          backgroundImage: `url(${service.cover_url ? service.cover_url : '/img/background/card.webp'})`,
        }}
      >

        <div className="max-w-7xl relative z-1 mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium mb-4">
                {service.category}
              </div>
              <h1 className="text-2xl lg:text-5xl font-bold mb-4 leading-tight">{service.title}</h1>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < Math.floor(rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-600'}`} />
                    ))}
                  </div>
                  <span className="font-semibold">{rating}</span>
                  <span className="text-slate-400">({reviewCount} avis)</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' })}
                  className="
                    px-8 py-3 
                    backdrop-blur-md 
                    bg-purple-500/20
                    border border-purple-500
                    hover:bg-purple-600/90
                    text-white 
                    rounded-lg 
                    font-medium 
                    transition-colors 
                    shadow-lg
                  "
                >
                  Demander un devis
                </button>

                <button 
                  onClick={() => alert('Contact prestataire !')}
                  className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/20"
                >
                  Nous contacter
                </button>
              </div>
            </div>

            <div className="flex  justify-center">
              <div className="relative z-1 w-64 h-64 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center shadow-2xl">
                <img src={service.image_url} alt={service.title} className="w-full h-full object-cover rounded-2xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      

      <div className="max-w-7xl bg-dark mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contenu principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Navigation Tabs */}
            <div className="dark:bg-gray-800 border border-white/10 overflow-hidden rounded-xl shadow-sm shadow">
              <div className="border-b  border-slate-200">
                <div className="flex">
                  {[
                    { id: 'overview', label: 'Vue d\'ensemble', icon: FileText }
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 px-6 py-4 font-medium transition-all flex items-center justify-start gap-2  ${
                          activeTab === tab.id
                            ? 'text-dark bg-slate-100  dark:bg-slate-600'
                            : ' text-slate-500 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        <TabIcon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-8">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xl font-bold text-dark mb-4">Description détaillée</h3>
                      {renderStructuredDescription(service.description)}
                    </div>

                    {technologies.length > 0 && (
                      <div>
                        <h3 className="text-xl font-bold text-dark mb-4">Technologies & Outils</h3>
                        <div className="flex flex-wrap gap-2">
                          {technologies.map((tech, idx) => (
                            <span key={idx} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-0 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-600 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-dark mb-1">Délai de réalisation</div>
                          <div className="text-sub">{displayDuration}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


              </div>
            </div>

            {/* Garanties professionnelles */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm border border-slate-200 p-8 dark:border-0">
              <h3 className="text-xl font-bold text-dark mb-6">Nos engagements qualité</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-8 h-8 text-green-600" />
                  </div>
                  <div className="font-semibold text-dark mb-1">Garantie Qualité</div>
                  <div className="text-sm text-sub">Satisfaction garantie </div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="font-semibold text-dark mb-1">Respect des délais</div>
                  <div className="text-sm text-sub">Livraison dans les temps convenus</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-8 h-8 text-purple-600" />
                  </div>
                  <div className="font-semibold text-dark mb-1">Expertise certifiée</div>
                  <div className="text-sm text-sub">Équipe qualifiée et expérimentée</div>
                </div>
              </div>
            </div>

            <CommentSection 
              title="Commentaires"
              subtitle="Partagez votre avis sur ce service"
              initialComments={service.comments || []}
              loadComments={(() => {
                const serviceDbId = service?.id;
                return async () => {
                  try {
                    if (!serviceDbId) return [];
                    const items = await commentsApi.listByService(serviceDbId);
                    return Array.isArray(items) ? items : [];
                  } catch (err) {
                    console.warn('[Service Comments] Load failed:', err?.message || err);
                    return [];
                  }
                };
              })()}
              onAddComment={(() => {
                const serviceDbId = service?.id;
                return async ({ author, text }) => {
                  if (!currentUser || !currentUser.id) {
                    throw new Error('AUTH_REQUIRED');
                  }
                  if (!serviceDbId) {
                    throw new Error('SERVICE_ID_MISSING');
                  }
                  const payload = {
                    user_id: currentUser.id,
                    rating: null,
                    review: text,
                    likes: 0,
                    dislikes: 0,
                  };
                  const created = await commentsApi.createForService(serviceDbId, payload);
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
              })()}
              requireAuth={true}
              isAuthenticated={() => session.isAuthenticated()}
              onRequireAuth={() => navigate('/sign')}
              currentUser={currentUser}
              onReact={async (commentId, type) => {
                if (!currentUser || !currentUser.id) throw new Error('AUTH_REQUIRED');
                try {
                  const updated = type === 'like'
                    ? await commentsApi.like(commentId, currentUser.id)
                    : await commentsApi.dislike(commentId, currentUser.id);
                  return updated;
                } catch (err) {
                  console.warn('[Service Comments] Reaction failed:', err?.message || err);
                  return null;
                }
              }}
            />

          </div>

          {/* Sidebar Prix & Contact */}
          <div className="lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              {/* Card Prix */}
              <div id="pricing" className="bg-dark rounded-xl shadow-sm border dark:border-white/10 border-slate-200 overflow-hidden">
                <div className="bg-slate-900 dark:bg-gray-900 text-white p-6">
                  <h3 className="text-lg font-bold mb-1">Formules disponibles</h3>
                  <p className="text-slate-300 text-sm">Choisissez l'offre adaptée à vos besoins</p>
                </div>

                <div className="p-6">
                  {/* Options */}
                  {service.options && service.options.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {service.options.map((option) => (
                        <div
                          key={option.id}
                          onClick={() => setSelectedOption(option.id)}
                          className={`relative p-4 rounded-lg cursor-pointer transition-all border-2 ${
                            selectedOption === option.id
                              ? 'dark:border-slate-900 border-blue-900 text-blue-900 dark:bg-slate-300 bg-blue-50'
                              : 'border-white/10 hover:border-white/20 dark:text-slate-100'
                          }`}
                        >
                          {option.popular && (
                            <div className="absolute -top-2 right-4 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                              RECOMMANDÉ
                            </div>
                          )}
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold ">{option.name}</div>
                            <div className="text-right">
            <div className="font-bold text-lg ">{Math.round(Number(option.price || 0)).toLocaleString('fr-FR')} FCFA</div>
                            </div>
                          </div>
                          <div className="text-sm mb-2">{option.desc}</div>
                          <div className="flex items-center gap-2 text-xs">
                            <Clock className="w-3 h-3" />
                            {option.duration}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Prix total */}
                  {displayPrice && (
                    <div className="bg-slate-50 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center mb-2 text-sm">
                        <span className="text-slate-600">Prix HT</span>
            <span className="font-medium">{Math.round(Number(displayPrice || 0)).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="flex justify-between items-center mb-3 text-sm">
                        <span className="text-slate-600">TVA (20%)</span>
            <span className="font-medium">{Math.round(Number(displayPrice * 0.2 || 0)).toLocaleString('fr-FR')} FCFA</span>
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">Total TTC</span>
            <span className="font-bold text-2xl text-slate-900">{Math.round(Number(displayPrice * 1.2 || 0)).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {!displayPrice && service.price && (
                    <div className="bg-slate-50 rounded-lg p-6 mb-6 text-center">
                      <div className="text-xl font-bold text-slate-900 mb-2">{service.price}</div>
                      <div className="text-sm text-slate-600">Un devis personnalisé sera établi selon vos besoins</div>
                    </div>
                  )}

                  {/* CTA */}
                  <button 
                    onClick={async () => {
                      try {
                        // Exiger une session pour l'envoi direct
                        if (!session.isAuthenticated()) {
                          navigate('/sign');
                          return;
                        }

                        // Récupérer l'utilisateur courant (si non déjà chargé)
                        const user = currentUser || await usersApi.getCurrentUser();
                        const fullName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name || user?.fullname || '';
                        const email = (user?.email || '').trim();
                        const phone = user?.phone || user?.telephone || user?.mobile || null;

                        // Préparer description du projet incluant le service demandé
                        const projectDescription = [
                          `Demande de devis pour le service "${service.title}" (${service.category})`,
                          selectedOptionData ? `Option choisie: ${selectedOptionData.name}${selectedOptionData.desc ? ` - ${selectedOptionData.desc}` : ''}` : null,
                          (selectedOptionData?.duration || service.duration) ? `Durée estimée: ${selectedOptionData?.duration || service.duration}` : null,
            (selectedOptionData?.price || service.price) ? `Prix indicatif: ${selectedOptionData?.price ? `${Math.round(Number(selectedOptionData.price)).toLocaleString('fr-FR')} FCFA` : Math.round(Number(service.price || 0)).toLocaleString('fr-FR') + ' FCFA'}` : null,
                          service.features && service.features.length ? `Caractéristiques: ${service.features.slice(0,5).join(', ')}` : null,
                          '',
                          'Merci de me contacter pour affiner le cahier des charges.'
                        ].filter(Boolean).join('\n');

                        // Si info critique manquante, rediriger vers formulaire dédié avec préremplissage
                        if (!fullName || !email) {
                          navigate('/submission', { state: {
                            serviceId: service.id,
                            serviceTitle: service.title,
                            projectType: selectedOptionData?.name || null,
                            projectDescription: projectDescription,
                          } });
                          return;
                        }

                        const payload = {
                          user_id: user?.id || null,
                          full_name: fullName,
                          email,
                          phone,
                          service_id: service.id || null,
                          project_type: selectedOptionData?.name || null,
                          project_description: projectDescription,
                          status: 'reçu',
                        };

                        await devisRequestsApi.create(payload);
                        alert('Demande de devis envoyée !');
                      } catch (e) {
                        alert(e?.message || 'Erreur lors de l\'envoi de la demande de devis.');
                      }
                    }}
                    className="
                    px-8 py-3 
                    w-full
                    mb-3
                    backdrop-blur-md 
                    bg-purple-900/60
                    border border-purple-500
                    hover:bg-purple-600/90
                    text-white 
                    rounded-lg 
                    font-medium 
                    transition-colors 
                    shadow-lg
                  "
                  >
                    Demander un devis gratuit
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (!session.isAuthenticated()) {
                        navigate('/sign');
                        return;
                      }
                      navigate('/rendezvous', { state: { serviceId: service.id, serviceTitle: service.title } });
                    }}
                    className="px-8 w-full py-3 bg-dark hover:bg-white/20 text-dark rounded-lg font-medium transition-colors backdrop-blur-sm border border-white/20"
                  >
                    Planifier un rendez-vous
                  </button>
                </div>
              </div>

              {/* Card Prestataire */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Votre interlocuteur</h3>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {provider.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-900">{provider}</div>
                    <div className="flex items-center gap-1 text-sm mb-1">
                      <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <span className="font-semibold">{providerRating}</span>
                      <span className="text-slate-500">· Expert certifié</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => window.open('https://wa.me/2250714409001', '_blank')}
                    className="w-full py-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <img src="/img/icons/whatsapp.png" alt="WhatsApp" className="w-4 h-4" />
                    Envoyer un message WhatsApp
                  </button>
                </div>
              </div>

              {/* Confiance */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
                <Shield className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <div className="font-semibold text-slate-900 mb-1">Transaction sécurisée</div>
                <div className="text-sm text-slate-600">Paiement protégé et données chiffrées</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}