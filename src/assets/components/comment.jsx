import React, { useState, useEffect } from 'react';
import sessionService from '../configurations/services/session.js';
import { MessageSquare, Send, Pencil, Trash2, X, Check, Heart, ThumbsDown } from 'lucide-react';

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
  const isAuth = typeof isAuthenticated === 'function' ? Boolean(isAuthenticated()) : sessionService.isAuthenticated();
  const displayNameFromUser = (user) => {
    if (!user) return '';
    const first = user.first_name || '';
    const last = user.last_name || '';
    const fallback = user.name || user.email || '';
    const full = `${first} ${last}`.trim();
    return full || fallback;
  };
  const avatarFromName = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Initialiser les commentaires depuis les props
  useEffect(() => {
    if (initialComments && initialComments.length > 0) {
      const formattedComments = initialComments.map(comment => ({
        id: comment.id || Date.now() + Math.random(),
        author: comment.author || comment.name || 'Utilisateur',
        text: comment.text || comment.comment || comment.content || comment.review || '',
        date: comment.date ? new Date(comment.date) : new Date(),
        avatar: (comment.author || comment.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        likes: comment.likes || 0,
        dislikes: comment.dislikes || 0,
        userReaction: comment.userReaction || null,
        rating: comment.rating || null
      }));
      setComments(formattedComments);
    }
  }, [initialComments]);

  // Pré-remplir le nom si utilisateur connecté fourni
  useEffect(() => {
    if (currentUser) {
      const name = displayNameFromUser(currentUser);
      setAuthorName(name);
    }
  }, [currentUser]);

  // Chargement depuis backend si fourni
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (typeof loadComments === 'function') {
        try {
          const rows = await loadComments();
          if (!mounted) return;
          const formattedComments = (rows || []).map(comment => ({
            id: comment.id || Date.now() + Math.random(),
            author: comment.author || comment.name || 'Utilisateur',
            text: comment.text || comment.comment || comment.content || comment.review || '',
            date: comment.created_at ? new Date(comment.created_at) : (comment.date ? new Date(comment.date) : new Date()),
            avatar: (comment.author || comment.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            avatarUrl: comment.avatarUrl || comment.avatar_url || comment.avatar || null,
            user_id: comment.user_id || null,
            likes: comment.likes || 0,
            dislikes: comment.dislikes || 0,
            userReaction: comment.userReaction || null,
            rating: comment.rating || null
          }));
          setComments(formattedComments);
        } catch (e) {
          console.warn('[Comments] Chargement échoué:', e?.message || e);
        }
      }
    })();
    return () => { mounted = false; };
  }, [loadComments]);

  // CREATE
  const handleAddComment = async () => {
    const isAuthNow = typeof isAuthenticated === 'function' ? Boolean(isAuthenticated()) : sessionService.isAuthenticated();
    if (requireAuth && !isAuthNow) {
      console.warn('[Comments] Auth requis pour publier');
      return;
    }
    if (newComment.trim() && authorName.trim()) {
      try {
        if (typeof onAddComment === 'function') {
          const created = await onAddComment({ author: authorName, text: newComment });
          const normalized = {
            id: created?.id || Date.now(),
            author: created?.author || authorName,
            text: created?.text || created?.review || newComment,
            date: created?.created_at ? new Date(created.created_at) : new Date(),
            avatar: (created?.author || authorName).split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            avatarUrl: created?.avatarUrl || (currentUser?.avatar || null),
            user_id: currentUser?.id || null,
            likes: created?.likes || 0,
            dislikes: created?.dislikes || 0,
            userReaction: null
          };
          setComments([...comments, normalized]);
        } else {
          const comment = {
            id: Date.now(),
            author: authorName,
            text: newComment,
            date: new Date(),
            avatar: authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
            avatarUrl: null,
            user_id: null,
            likes: 0,
            dislikes: 0,
            userReaction: null
          };
          setComments([...comments, comment]);
        }
      } catch (e) {
        console.warn('[Comments] Création échouée:', e?.message || e);
      }
      setNewComment('');
      if (!currentUser) setAuthorName('');
    }
  };

  // UPDATE
  const handleEditComment = (id) => {
    const comment = comments.find(c => c.id === id);
    setEditingId(id);
    setEditText(comment.text);
  };

  const handleSaveEdit = (id) => {
    setComments(comments.map(c => 
      c.id === id ? { ...c, text: editText } : c
    ));
    setEditingId(null);
    setEditText('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  // DELETE
  const handleDeleteComment = (id) => {
    setComments(comments.filter(c => c.id !== id));
  };

  // REACTIONS (Like/Dislike)
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
      setComments(comments.map(comment => {
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

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-slate-200 dark:border-white/10 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-900 dark:bg-gray-900 text-white p-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          <h3 className="text-lg font-bold">
            {title} ({comments.length})
          </h3>
        </div>
        <p className="text-slate-300 text-sm mt-1">{subtitle}</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Comment Form */}
        <div className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-white/10">
          {requireAuth && !(typeof isAuthenticated === 'function' ? Boolean(isAuthenticated()) : sessionService.isAuthenticated()) && (
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
                  {avatarFromName(displayNameFromUser(currentUser))}
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
            disabled={requireAuth && !(typeof isAuthenticated === 'function' ? Boolean(isAuthenticated()) : sessionService.isAuthenticated())}
          />
          <button
            onClick={handleAddComment}
            className="mt-3 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            disabled={requireAuth && !(typeof isAuthenticated === 'function' ? Boolean(isAuthenticated()) : sessionService.isAuthenticated())}
          >
            <Send className="w-4 h-4" />
            Publier mon avis
          </button>
        </div>

        {/* Comments List */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="p-4 bg-slate-50 dark:bg-gray-700 border border-slate-200 dark:border-white/10 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                {comment.avatarUrl ? (
                  <img src={comment.avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {comment.avatar}
                  </div>
                )}

                <div className="flex-1">
                  {/* Author and Date */}
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {comment.author}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400">
                        {formatDate(comment.date)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    {editingId !== comment.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditComment(comment.id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        {currentUser && comment.user_id && currentUser.id === comment.user_id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Comment Text or Edit Form */}
                  {editingId === comment.id ? (
                    <div>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 dark:border-white/10 dark:bg-gray-600 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        rows="3"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleSaveEdit(comment.id)}
                          className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                        >
                          <Check className="w-4 h-4" />
                          Sauvegarder
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex items-center gap-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                        {comment.text}
                      </p>

                      {/* Reactions (Like/Dislike) */}
                      <div className="flex items-center gap-4">
                        {/* Like Button */}
                        <button
                          onClick={() => handleReaction(comment.id, 'like')}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                            comment.userReaction === 'like'
                              ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600'
                              : 'bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-slate-300 hover:bg-pink-50 dark:hover:bg-pink-900/20'
                          }`}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              comment.userReaction === 'like' ? 'fill-pink-600' : ''
                            }`}
                          />
                          <span className="font-semibold text-sm">
                            {formatCount(comment.likes)}
                          </span>
                        </button>

                        {/* Dislike Button */}
                        <button
                          onClick={() => handleReaction(comment.id, 'dislike')}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${
                            comment.userReaction === 'dislike'
                              ? 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                              : 'bg-slate-100 dark:bg-gray-600 text-slate-600 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                          }`}
                        >
                          <ThumbsDown
                            className={`w-5 h-5 ${
                              comment.userReaction === 'dislike' ? 'fill-gray-700 dark:fill-gray-300' : ''
                            }`}
                          />
                          <span className="font-semibold text-sm">
                            {formatCount(comment.dislikes)}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}

          {comments.length === 0 && (
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