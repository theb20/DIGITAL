import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Pencil, Trash2, X, Check, Heart, ThumbsDown } from 'lucide-react';

export default function CommentSection({ initialComments = [] }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

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

  // CREATE
  const handleAddComment = () => {
    if (newComment.trim() && authorName.trim()) {
      const comment = {
        id: Date.now(),
        author: authorName,
        text: newComment,
        date: new Date(),
        avatar: authorName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
        likes: 0,
        dislikes: 0,
        userReaction: null
      };
      setComments([...comments, comment]);
      setNewComment('');
      setAuthorName('');
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
  const handleReaction = (id, type) => {
    setComments(comments.map(comment => {
      if (comment.id === id) {
        let newLikes = comment.likes;
        let newDislikes = comment.dislikes;
        let newUserReaction = type;

        if (comment.userReaction === type) {
          if (type === 'like') newLikes--;
          else newDislikes--;
          newUserReaction = null;
        } else if (comment.userReaction === 'like' && type === 'dislike') {
          newLikes--;
          newDislikes++;
        } else if (comment.userReaction === 'dislike' && type === 'like') {
          newDislikes--;
          newLikes++;
        } else {
          if (type === 'like') newLikes++;
          else newDislikes++;
        }

        return {
          ...comment,
          likes: newLikes,
          dislikes: newDislikes,
          userReaction: newUserReaction
        };
      }
      return comment;
    }));
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
            Avis clients ({comments.length})
          </h3>
        </div>
        <p className="text-slate-300 text-sm mt-1">Partagez votre expérience avec ce service</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Add Comment Form */}
        <div className="p-4 bg-slate-50 dark:bg-gray-700 rounded-lg border border-slate-200 dark:border-white/10">
          <input
            type="text"
            placeholder="Votre nom"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            className="w-full mb-3 px-4 py-2 border border-slate-300 dark:border-white/10 dark:bg-gray-600 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            placeholder="Partagez votre avis sur ce service..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 dark:border-white/10 dark:bg-gray-600 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="3"
          />
          <button
            onClick={handleAddComment}
            className="mt-3 flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {comment.avatar}
                </div>

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
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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