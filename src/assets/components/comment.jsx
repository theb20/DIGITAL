import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import sessionService from '../configurations/services/session.js';
import { MessageSquare, Send, Pencil, Trash2, X, Check, Heart, ThumbsDown } from 'lucide-react';

function sanitizeUrl(raw) {
  if (!raw) return null;
  try { return String(raw).replace(/`/g, '').trim(); } catch { return null; }
}

function displayNameFromUser(user) {
  if (!user) return '';
  const first = user.first_name || '';
  const last = user.last_name || '';
  const name = user.name || '';
  const email = user.email || '';
  const full = `${first} ${last}`.trim();
  return full || name || email || '';
}

function initials(name) {
  return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

function candidateAuthor(row) {
  const first = (row?.first_name || row?.user_first_name || row?.user?.first_name || '').trim();
  const last = (row?.last_name || row?.user_last_name || row?.user?.last_name || '').trim();
  const full = `${first} ${last}`.trim();
  const nameCandidates = [
    row?.author_name,
    row?.author,
    full,
    row?.name,
    row?.user_name,
    row?.username,
    row?.user?.name,
  ];
  const emailCandidates = [
    row?.email,
    row?.user_email,
    row?.user?.email,
  ];
  for (const c of nameCandidates) {
    const s = String(c || '').trim();
    if (s) return s;
  }
  for (const e of emailCandidates) {
    const s = String(e || '').trim();
    if (s) return s;
  }
  return '';
}

function displayAuthor(row, currentUser) {
  // Priorité stricte aux données jointes du backend
  const backend = String(row?.author_name || '').trim();
  if (backend) return backend;
  // Ensuite, autres champs candidats (author, name, username, etc.)
  const primary = candidateAuthor(row);
  if (primary) return String(primary).trim();
  // Si c’est le commentaire de l’utilisateur courant, afficher son nom
  if (row && currentUser && String(row.user_id) === String(currentUser.id)) {
    const me = displayNameFromUser(currentUser);
    if (me && me.trim()) return me.trim();
  }
  // Fallback lisible si aucune donnée n’est disponible
  return ;
}

function normalizeComment(row, currentUser) {
  const authorDisplay = displayAuthor(row, currentUser);
  return {
    id: row?.id ?? (Date.now() + Math.random()),
    text: row?.text ?? row?.review ?? row?.comment ?? row?.content ?? '',
    date: (() => {
      const d = row?.created_at ?? row?.date ?? Date.now();
      try { return new Date(d); } catch { return new Date(); }
    })(),
    author_name: authorDisplay,
    author: authorDisplay,
    avatarUrl: sanitizeUrl(row?.avatar_url ?? row?.avatarUrl ?? row?.avatar ?? null),
    avatar: initials(authorDisplay),
    user_id: row?.user_id ?? null,
    likes: row?.likes ?? 0,
    dislikes: row?.dislikes ?? 0,
    userReaction: row?.userReaction ?? null,
    rating: row?.rating ?? null,
  };
}

function extractRowsArray(resp) {
  // Unwrap common envelopes
  let arr = Array.isArray(resp)
    ? resp
    : Array.isArray(resp?.data)
      ? resp.data
      : Array.isArray(resp?.comments)
        ? resp.comments
        : Array.isArray(resp?.items)
          ? resp.items
          : Array.isArray(resp?.result)
            ? resp.result
            : Array.isArray(resp?.rows)
              ? resp.rows
              : [];
  // Flatten nested arrays like [[{...}], [{...}]]
  try {
    if (Array.isArray(arr)) {
      arr = arr.flat ? arr.flat(Infinity) : ([]).concat(...arr);
    }
  } catch {
    // Fallback to a safe array if flattening fails
    arr = Array.isArray(arr) ? arr : [];
  }
  // Keep only object-like entries
  arr = (arr || []).filter(x => x && typeof x === 'object');
  return arr;
}

export default function CommentSection({
  initialComments = [],
  title = 'Commentaires',
  subtitle = 'Partagez votre avis',
  loadComments = null,
  onAddComment = null,
  requireAuth = false,
  isAuthenticated = null,
  onRequireAuth = null,
  currentUser = null,
  onReact = null,
}) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuth = typeof isAuthenticated === 'function' ? Boolean(isAuthenticated()) : sessionService.isAuthenticated();

  useEffect(() => {
    if (currentUser) setAuthorName(displayNameFromUser(currentUser));
  }, [currentUser]);

  useEffect(() => {
    if (Array.isArray(initialComments) && initialComments.length > 0) {
      const formatted = initialComments.map(c => normalizeComment(c, currentUser));
      setComments(formatted);
    }
  }, [initialComments, currentUser]);
  console.log('[Comments] Initial Comments:', initialComments);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof loadComments === 'function') {
        setLoading(true); setError(null);
        try {
          const rows = await loadComments();
          if (!mounted) return;
          console.log('[Comments] Backend rows raw:', rows);
          const rowsArray = extractRowsArray(rows);
          console.log('[Comments] Backend rows unwrapped length:', rowsArray.length);
          if (import.meta?.env?.DEV) {
            console.table((rowsArray || []).map(r => ({
              id: r?.id,
              author_name: r?.author_name,
              author: r?.author,
              name: r?.name,
              first_name: r?.first_name,
              last_name: r?.last_name,
              email: r?.email,
              user_email: r?.user_email,
              user_id: r?.user_id,
              avatar_url: r?.avatar_url,
            })));
          }
          const formatted = (rowsArray || []).map(c => normalizeComment(c, currentUser));
          console.log('[Comments] Backend rows mapped:', formatted);
          setComments(formatted);
        } catch (e) {
          console.warn('[Comments] Chargement échoué:', e?.message || e);
          setError(e?.message || 'Erreur de chargement');
        } finally {
          setLoading(false);
        }
      }
    })();
    return () => { mounted = false; };
  }, [loadComments, currentUser]);

  const handleAddComment = async () => {
    const isAuthNow = typeof isAuthenticated === 'function' ? Boolean(isAuthenticated()) : sessionService.isAuthenticated();
    if (requireAuth && !isAuthNow) {
      console.warn('[Comments] Auth requis pour publier');
      if (typeof onRequireAuth === 'function') onRequireAuth();
      return;
    }
    if (!newComment.trim()) return;
    const authorLocal = (currentUser ? displayNameFromUser(currentUser) : authorName).trim();
    if (!authorLocal) return;
    try {
      if (typeof onAddComment === 'function') {
        const created = await onAddComment({ author: authorLocal, text: newComment });
        const normalized = normalizeComment({
          ...created,
          author_name: created?.author_name || created?.author || authorLocal,
          user_id: currentUser?.id ?? created?.user_id ?? null,
        }, currentUser);
        setComments(prev => [...prev, normalized]);
      } else {
        const local = normalizeComment({
          id: Date.now(),
          text: newComment,
          author_name: authorLocal,
          user_id: currentUser?.id ?? null,
        }, currentUser);
        setComments(prev => [...prev, local]);
      }
    } catch (e) {
      console.warn('[Comments] Création échouée:', e?.message || e);
    } finally {
      setNewComment('');
      if (!currentUser) setAuthorName('');
    }
  };

  const handleEditComment = (id) => {
    const comment = comments.find(c => c.id === id);
    if (!comment) return;
    setEditingId(id);
    setEditText(comment.text);
  };

  const handleSaveEdit = (id) => {
    setComments(prev => prev.map(c => (c.id === id ? { ...c, text: editText } : c)));
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const handleDeleteComment = (id) => {
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const handleReaction = async (id, type) => {
    const isAuthNow = typeof isAuthenticated === 'function' ? Boolean(isAuthenticated()) : sessionService.isAuthenticated();
    if (requireAuth && !isAuthNow) {
      if (typeof onRequireAuth === 'function') onRequireAuth();
      return;
    }
    try {
      let updated;
      if (typeof onReact === 'function') {
        updated = await onReact(id, type);
      }
      setComments(prev => prev.map(comment => {
        if (comment.id === id) {
          const serverLikes = updated?.likes ?? comment.likes;
          const serverDislikes = updated?.dislikes ?? comment.dislikes;
          const serverReaction = updated?.userReaction ?? (comment.userReaction === type ? null : type);
          return { ...comment, likes: serverLikes, dislikes: serverDislikes, userReaction: serverReaction };
        }
        return comment;
      }));
    } catch (e) {
      console.warn('[Comments] Réaction échouée:', e?.message || e);
    }
  };

  const formatDate = (date) => new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
  }).format(date);

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  const isCard = useLocation().pathname.includes('/card');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
      .
      <div className="bg-slate-900 flex justify-between items-center dark:bg-gray-900 text-white p-6">
        <div className="w-full">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            <h3 className="text-lg font-bold">{title} ({comments.length})</h3>
          </div>
          <p className="text-slate-300 text-sm mt-1">{subtitle}</p>
        </div>
        <div className="w-full">
          {isCard && (
            <span className="text-slate-300 bg-red-700/50 p-1 rounded-md w-full text-[10px] lg:text-nowrap">
              Les commentaires sont affichés de manière anonyme afin de garantir la confidentialité des utilisateurs.
            </span>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-white/10">
          {requireAuth && !isAuth && (
            <div className="mb-3 p-3 rounded-lg bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200 text-sm flex items-center justify-between">
              <span>Vous devez être connecté pour publier un commentaire.</span>
              {typeof onRequireAuth === 'function' && (
                <button onClick={onRequireAuth} className="px-3 py-1 bg-blue-600 text-white rounded-md text-xs">Se connecter</button>
              )}
            </div>
          )}

          {currentUser && (
            <div className="flex items-center gap-3 mb-3">
              {currentUser.avatar ? (
                <img src={currentUser.avatar} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                  {initials(displayNameFromUser(currentUser))}
                </div>
              )}
              <div className="text-sm">
                <div className="font-semibold">{displayNameFromUser(currentUser)}</div>
                {currentUser.email && (
                  <div className="text-slate-500 dark:text-slate-400">{currentUser.email}</div>
                )}
              </div>
            </div>
          )}

          <input
            type="text"
            placeholder="Votre nom"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full mb-3 px-4 py-2 border border-slate-300 dark:border-white/10 dark:bg-gray-600 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={(requireAuth && !isAuth) || Boolean(currentUser)}
          />

          <textarea
            placeholder="Partagez votre avis..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-white/10 dark:bg-gray-600 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
            disabled={requireAuth && !isAuth}
          />

          <button
            onClick={handleAddComment}
            className="mt-3 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={requireAuth && !isAuth}
          >
            <Send className="w-4 h-4" />
            Publier mon avis
          </button>
        </div>

        <div className="space-y-4">
          {loading && (
            <div className="text-sm text-slate-500 dark:text-slate-400">Chargement des avis…</div>
          )}
          {error && (
            <div className="text-sm text-red-600">{error}</div>
          )}

          {import.meta?.env?.DEV && comments.length > 0 && (
            <div className="text-xs p-3 rounded border border-dashed border-slate-300 dark:border-white/20 bg-slate-50 dark:bg-gray-800 text-slate-600 dark:text-slate-300">
              <div className="font-semibold mb-2">Debug noms (dev):</div>
              <pre className="overflow-auto max-h-48">{JSON.stringify(comments.map(c => ({ id: c.id, author_name: c.author_name, user_id: c.user_id, avatarUrl: c.avatarUrl })), null, 2)}</pre>
            </div>
          )}

          {comments.map((comment) => (
            <div key={comment.id} className="p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-white/10 rounded-lg hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3">
                {comment.avatarUrl ? (
                  <img src={comment.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {comment.avatar}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">{comment.author_name}</h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{formatDate(comment.date)}</p>
                    </div>

                    {editingId !== comment.id && (
                      <div className="flex gap-2">
                        {currentUser && comment.user_id && String(currentUser.id) === String(comment.user_id) && (
                          <>
                            <button onClick={() => handleEditComment(comment.id)} className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="Modifier">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteComment(comment.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" title="Supprimer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  {editingId === comment.id ? (
                    <div>
                      <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 dark:bg-gray-600 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" rows="3" />
                      <div className="flex gap-2 mt-2">
                        <button onClick={() => handleSaveEdit(comment.id)} className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm">
                          <Check className="w-4 h-4" />
                          Sauvegarder
                        </button>
                        <button onClick={handleCancelEdit} className="flex items-center gap-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm">
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">{comment.text}</p>

                      <div className="flex items-center gap-4">
                        <button onClick={() => handleReaction(comment.id, 'like')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${comment.userReaction === 'like' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600' : 'bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-900/20'}`}>
                          <Heart className={`w-5 h-5 ${comment.userReaction === 'like' ? 'fill-pink-600' : ''}`} />
                          <span className="font-semibold text-sm">{formatCount(comment.likes)}</span>
                        </button>

                        <button onClick={() => handleReaction(comment.id, 'dislike')} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${comment.userReaction === 'dislike' ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300' : 'bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-500'}`}>
                          <ThumbsDown className={`w-5 h-5 ${comment.userReaction === 'dislike' ? 'fill-gray-700 dark:fill-gray-300' : ''}`} />
                          <span className="font-semibold text-sm">{formatCount(comment.dislikes)}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {!loading && comments.length === 0 && (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun avis pour le moment. Soyez le premier à partager votre expérience !</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}