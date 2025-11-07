import { useEffect, useState } from 'react';
import { Mail, Search, Plus, Edit, Trash2, Send, X, ChevronDown, Filter, Sparkles } from 'lucide-react';
import messagesApi from '../configurations/messages/messages.js';
import session from '../configurations/services/session.js';

export default function InboxPage() {
  useEffect(() => { document.title = 'Boîte de réception - Digital'; }, []);
  const currentEmail = session.getSessionEmail();
  const role = session.getSessionRole();
  const isUser = String(role||'').toLowerCase() === 'user';
  const STANDARD_EMAIL = import.meta.env.VITE_STANDARD_EMAIL || 'support@digital.tld';
  const [groupMode, setGroupMode] = useState('none');
  const [selectedMessage, setSelectedMessage] = useState(null);
  
  const normalizeSubject = (s) => (s || '').trim().replace(/^(re:|fwd:|fw:)\s*/i, '').toLowerCase();
  const participantsKey = (m) => [String(m.sender_email||'').toLowerCase(), String(m.recipient_email||'').toLowerCase()].sort().join(' <> ');
  
  const buildGroups = (list, mode) => {
    if (mode === 'none') return [{ header: null, items: list }];
    const map = new Map();
    for (const m of list) {
      const key = mode === 'subject' ? normalizeSubject(m.subject) : participantsKey(m);
      if (!map.has(key)) map.set(key, { key, items: [], lastDate: null, subject: m.subject || '', participants: [m.sender_email, m.recipient_email] });
      const g = map.get(key);
      g.items.push(m);
      const d = m.created_at ? new Date(m.created_at) : null;
      if (d && (!g.lastDate || d > g.lastDate)) g.lastDate = d;
    }
    const groups = Array.from(map.values()).sort((a,b)=> (b.lastDate?.getTime()||0) - (a.lastDate?.getTime()||0));
    return groups.map(g => ({ header: g, items: g.items }));
  };

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    id: null, subject: '', body: '', sender_name: '', sender_email: currentEmail || '',
    recipient_name: '', recipient_email: '', status: 'new'
  });

  const load = async () => {
    try {
      setLoading(true);
      const rows = await messagesApi.list({ participant: currentEmail, q: query });
      setMessages(Array.isArray(rows) ? rows : (rows?.rows || []));
    } catch (e) {
      alert(e?.message || 'Erreur chargement de la boîte de réception');
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [query]);

  const openNew = () => {
    setFormData({ id: null, subject: '', body: '', sender_name: '', sender_email: currentEmail, recipient_name: 'Standard', recipient_email: STANDARD_EMAIL, status: 'new' });
    setFormOpen(true);
  };

  const openEdit = (m) => {
    setFormData({ ...m, sender_email: m.sender_email || currentEmail });
    setSelectedMessage(m);
    setFormOpen(true);
  };
  
  const openReply = (m) => {
    setFormData({
      id: null,
      subject: m?.subject ? `Re: ${m.subject}` : 'Re: (Sans objet)',
      body: '',
      sender_name: '',
      sender_email: currentEmail || '',
      recipient_name: 'Standard',
      recipient_email: STANDARD_EMAIL,
      status: 'new',
    });
    setFormOpen(true);
  };

  const save = async () => {
    try {
      setSaving(true);
      if (formData.id) await messagesApi.update(formData.id, formData);
      else await messagesApi.create(formData);
      setFormOpen(false);
      setSelectedMessage(null);
      load();
    } catch (e) { alert(e?.message || 'Erreur d\'envoi/édition du message'); }
    finally { setSaving(false); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    try { 
      await messagesApi.remove(id); 
      setMessages(prev => prev.filter(m => m.id !== id));
      setSelectedMessage(null);
    }
    catch (e) { alert(e?.message || 'Erreur suppression'); }
  };

  const closeModal = () => {
    setFormOpen(false);
    setSelectedMessage(null);
  };

  return (
    <div className="min-h-screen bg-dark text-white">
      <div className="max-w-7xl mx-auto p-6 pt-24">
        {/* Header avec animation */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <div>
                <h1 className="text-xl lg:text-3xl font-bold text-dark">Messagerie privée</h1>
                <p className="text-sm text-sub mt-1">{messages.length} message{messages.length > 1 ? 's' : ''}</p>
              </div>
            </div>
            <button 
              onClick={openNew} 
              className="group px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-sm lg:block hidden">Nouveau message</span>
            </button>
          </div>
        </div>

        {/* Barre de recherche et filtres */}
        <div className="mb-6 space-y-4">
          <div className="relative group">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-600 transition-colors" />
            <input
              type="text"
              placeholder="Rechercher dans vos messages..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-700 lg:border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all shadow-sm hover:shadow-md text-dark placeholder-slate-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-sub" />
            <select 
              value={groupMode} 
              onChange={(e)=>setGroupMode(e.target.value)} 
              className="px-4 py-2 bg-dark lg:border border-slate-200 rounded-xl lg:focus:outline-none lg:focus:ring-2 focus:ring-slate-900 text-sm font-medium text-sub hover:bg-slate-50 transition-all cursor-pointer"
            >
              <option value="none">Tous les messages</option>
              <option value="subject">Grouper par sujet</option>
              <option value="participants">Grouper par participants</option>
            </select>
          </div>
        </div>

        {/* Liste des messages */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-600 font-medium">Chargement de vos messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="bg-white dark:bg-slate-700 lg:border border-slate-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-dark mb-2">Aucun message</h3>
              <p className="text-sub">Votre boîte de réception est vide</p>
            </div>
          ) : (
            buildGroups(messages || [], groupMode).map((g, groupIdx) => (
              <div 
                key={(g.header?.key)||'all'} 
                className="bg-white dark:bg-slate-700 lg:border border-slate-200 rounded-2xl shadow-sm hover:shadow-md dark:border-slate-600 transition-all overflow-hidden"
                style={{ animationDelay: `${groupIdx * 50}ms` }}
              >
                {g.header && (
                  <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-700 dark:to-slate-800 border-b border-slate-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-4 h-4 text-dark" />
                        {groupMode === 'subject' ? (
                          <span className="font-semibold text-dark">{g.header.subject || '(Sans objet)'}</span>
                        ) : (
                          <span className="font-semibold text-dark">{(g.header.participants || []).filter(Boolean).join(' ↔ ')}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                        <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">{g.items.length}</span>
                        {g.header.lastDate && (
                          <span className="text-xs text-sub">{g.header.lastDate.toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-slate-100">
                  {g.items.map((m, idx) => (
                    <div 
                      key={m.id} 
                      className="p-6 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all cursor-pointer group"
                      onClick={() => setSelectedMessage(m)}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              m.status==='new' ? 'bg-blue-50 dark:bg-slate-600 text-dark lg:border border-blue-200' : 
                              m.status==='read' ? 'bg-green-50 text-green-700 border border-green-200' : 
                              'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}>
                              {m.status}
                            </span>
                            <span className="text-xs text-slate-500">
                              {m.created_at ? new Date(m.created_at).toLocaleString('fr-FR', { 
                                day: 'numeric', 
                                month: 'short', 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              }) : '—'}
                            </span>
                          </div>
                          
                          <h3 className="font-semibold text-dark mb-1 group-hover:text-blue-600 transition-colors">
                            {m.subject || '(Sans objet)'}
                          </h3>
                          
                          <p className="text-sm text-sub line-clamp-2 mb-2">{m.body}</p>
                          
                          <div className="flex items-center gap-2 text-xs text-sub">
                            <span className="font-medium">{m.sender_email}</span>
                            <span>→</span>
                            <span>{m.recipient_email}</span>
                          </div>
                        </div>

                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUser ? (
                            <button 
                              onClick={(e) => { e.stopPropagation(); openReply(m); }}
                              className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium"
                            >
                              <Send className="w-4 h-4" />
                              Répondre
                            </button>
                          ) : (
                            <>
                              <button 
                                onClick={(e) => { e.stopPropagation(); openEdit(m); }}
                                className="px-3 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); remove(m.id); }}
                                className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors flex items-center gap-2 text-sm"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal avec animation */}
        {formOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in"
            onClick={closeModal}
          >
            <div 
              className="bg-dark rounded-3xl shadow-2xl w-full max-w-2xl transform transition-all animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header du modal */}
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-dark rounded-xl">
                    <Mail className="w-5 h-5 text-sub" />
                  </div>
                  <h2 className="text-xl font-bold text-sub">
                    {formData.id ? 'Message' : 'Nouveau message'}
                  </h2>
                </div>
                <button 
                  onClick={closeModal}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-600" />
                </button>
              </div>

              {/* Contenu du modal */}
              <div className="px-8 py-6 space-y-4">
                {!formData.id && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <p className="text-sm text-blue-900">
                      <span className="font-semibold">Destinataire:</span> Standard ({STANDARD_EMAIL})
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-sub mb-2">Objet</label>
                  <input 
                    type="text"
                    placeholder="Entrez l'objet du message"
                    value={formData.subject} 
                    onChange={e=>setFormData(d=>({...d,subject:e.target.value}))} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 lg:border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sub focus:border-sub transition-all text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-sub mb-2">Message</label>  
                  <textarea 
                    placeholder="Écrivez votre message..."
                    value={formData.body} 
                    onChange={e=>setFormData(d=>({...d,body:e.target.value}))} 
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 dark:border-slate-600 lg:border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sub focus:border-sub transition-all text-dark min-h-[160px] resize-none"
                  />
                </div>
              </div>

              {/* Footer du modal */}
              <div className="flex justify-end gap-3 px-8 py-6 bg-slate-50 bg-dark border-t border-slate-200 rounded-b-3xl">
                <button 
                  onClick={closeModal}
                  className="px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-medium"
                >
                  Annuler
                </button>
                <button 
                  onClick={save} 
                  disabled={saving}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Envoyer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scale-in {
          from { 
            opacity: 0;
            transform: scale(0.95);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}