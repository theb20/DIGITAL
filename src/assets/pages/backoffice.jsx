import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Home, Users, ShoppingCart, FileText, Settings, LogOut, Menu, X, TrendingUp, DollarSign, Package, Search, Bell, ChevronDown, Eye, Edit, Trash2, Plus, Calendar, CreditCard, Activity, Award, Mail, Phone, MapPin, Filter, Download, Upload, ShieldCheck, Save, Send, Star, Clock, CheckCircle, XCircle, AlertCircle, Zap, Target, BarChart3, PieChart as PieChartIcon, TrendingDown, RefreshCw, Globe, Smartphone, Monitor, FileJson, FileSpreadsheet, Lock, ArrowLeft, DivideSquare, ChartGantt } from 'lucide-react';
import serviceCategoriesApi from '../configurations/services/serviceCategories.js';
import servicesApi from '../configurations/services/services.js';
import devisRequestsApi from '../configurations/services/devisRequests.js';
import messagesApi from '../configurations/messages/messages.js';
import usersApi from '../configurations/services/user.js';
import promosApi from '../configurations/services/promos.js';
import payApi from '../configurations/services/pay.js';
import appSettingsApi from '../configurations/services/appSettings.js';
import blogsApi from '../configurations/services/blogs.js';
import projectsApi from '../configurations/services/projects.js';
import profilesApi from '../configurations/services/profiles.js';
import api from '../configurations/api/api_axios.js';
import session from '../configurations/services/session.js';
import QuoteComponent from '../components/quote.jsx';
import appointmentsApi from '../configurations/services/appointments.js';
import invoicesApi from '../configurations/services/invoices.js';
import notificationsApi from '../configurations/services/notifications.js';
import contactApi from '../configurations/services/contact.js';

import PlanningComponent from '../components/planning.jsx';
import DashboardComponent from '../components/Dashboard.jsx';
import ComponentProjets from '../components/Project.jsx';
import PrivacyTerms from '../components/PrivacyTerms.jsx'
import { connectRealtime } from '../configurations/realtime.js';

const BackofficeDigital = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOpenClient, setIsOpenClient] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [allDevisRequests, setAllDevisRequests] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const toggleMobileMenu = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    setMobileMenuOpen((prev) => !prev);
  };
  const handleMobileMenuKeyDown = (e) => {
    if (!e) return;
    const key = e.key?.toLowerCase();
    if (key === 'enter' || key === ' ') {
      e.preventDefault();
      toggleMobileMenu(e);
    }
  };
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const toggleUserMenu = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    setUserMenuOpen((prev) => !prev);
  };
  const closeUserMenu = () => setUserMenuOpen(false);
  const handleUserMenuKeyDown = (e) => {
    if (!e) return;
    const key = e.key?.toLowerCase();
    if (key === 'enter' || key === ' ') {
      e.preventDefault();
      toggleUserMenu(e);
    }
    if (key === 'escape') {
      e.preventDefault();
      closeUserMenu();
    }
  };
  const [_dateRange, _setDateRange] = useState('30days');
  const [activeTab, setActiveTab] = useState("Profil");

  // Sidebar droite (panneau sortant)
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  const openRightSidebar = () => setRightSidebarOpen(true);
  const closeRightSidebar = () => setRightSidebarOpen(false);

  // Filtres cachés (Contacts)
  const [filtersOpen, setFiltersOpen] = useState(false);
 const [contactFilters, setContactFilters] = useState({ q: '', email: '', subject: '', dateFrom: '', dateTo: '' });
 const resetContactFilters = () => setContactFilters({ q: '', email: '', subject: '', dateFrom: '', dateTo: '' });
 // Filtrage global côté client, basé sur contactFilters
 const applyGlobalFilters = (rows) => {
   const list = Array.isArray(rows) ? rows.slice() : [];
   const { q, email, subject, dateFrom, dateTo } = contactFilters || {};
   const qNorm = q ? String(q).toLowerCase() : '';
   const emailNorm = email ? String(email).toLowerCase() : '';
   const subjectNorm = subject ? String(subject).toLowerCase() : '';
   return list.filter(item => {
     // Recherche libre sur champs fréquents
     if (qNorm) {
       const hay = [
         item.full_name, item.first_name, item.last_name, item.name, item.nom, item.client, item.contact,
         item.title, item.project_type, item.subject, item.message, item.body,
         item.email, item.sender_email, item.recipient_email, item.phone, item.role, item.position,
       ].map(v => String(v || '').toLowerCase());
       const matchesQ = hay.some(v => v.includes(qNorm));
       if (!matchesQ) return false;
     }
     // Email sur divers alias
     if (emailNorm) {
       const emails = [
         item.email, item.client_email, item.sender_email, item.recipient_email,
         item?.contact?.email,
       ].map(v => String(v || '').toLowerCase());
       const matchesEmail = emails.some(v => v.includes(emailNorm));
       if (!matchesEmail) return false;
     }
     // Sujet: alias subject/title/project_type
     if (subjectNorm) {
       const subs = [item.subject, item.title, item.project_type].map(v => String(v || '').toLowerCase());
       const matchesSubject = subs.some(v => v.includes(subjectNorm));
       if (!matchesSubject) return false;
     }
     // Dates: utilise le premier champ date trouvable
     if (dateFrom || dateTo) {
       const dateStr = item.created_at || item.appointment_date || item.deadline || item.date;
       const ts = dateStr ? new Date(dateStr) : null;
       if (!ts || Number.isNaN(ts.getTime())) return false;
       const fromOk = dateFrom ? ts >= new Date(dateFrom + (String(dateFrom).includes('T') ? '' : 'T00:00:00')) : true;
       const toOk = dateTo ? ts <= new Date(dateTo + (String(dateTo).includes('T') ? '' : 'T23:59:59')) : true;
       if (!(fromOk && toOk)) return false;
     }
     return true;
   });
 };

  // Contacts (CRUD simple)
  const [contacts, setContacts] = useState([]);
  const [contactsLoading, setContactsLoading] = useState(false);
  const [contactsError, setContactsError] = useState(null);

  // Réponse aux contacts (email)
  const [contactReplyOpen, setContactReplyOpen] = useState(false);
  const [contactReplySending, setContactReplySending] = useState(false);
  const [contactReplyError, setContactReplyError] = useState(null);
  const [contactReplyData, setContactReplyData] = useState({ id: null, email: '', subject: '', message: '' });

  // Voir message de contact (modale lecture)
  const [contactViewOpen, setContactViewOpen] = useState(false);
  const [contactViewData, setContactViewData] = useState(null);
  const openViewContact = (c) => {
    setContactViewData(c || null);
    setContactViewOpen(true);
  };

  const openReplyContact = (c) => {
    setContactReplyData({
      id: c?.id || null,
      email: c?.email || '',
      subject: c?.subject ? `Re: ${c.subject}` : 'Réponse à votre message',
      message: '',
    });
    setContactReplyError(null);
    setContactReplyOpen(true);
  };

  const sendContactReply = async () => {
    try {
      setContactReplySending(true);
      setContactReplyError(null);
      if (!contactReplyData.id) throw new Error('Message introuvable');
      const payload = {
        subject: contactReplyData.subject || undefined,
        text: contactReplyData.message || undefined,
      };
      await contactApi.reply(contactReplyData.id, payload);
      alert('Réponse envoyée par email');
      setContactReplyOpen(false);
    } catch (e) {
      setContactReplyError(e?.message || 'Envoi de la réponse échoué');
    } finally {
      setContactReplySending(false);
    }
  };

  const loadContacts = async () => {
    try {
      setContactsLoading(true);
      const rows = await contactApi.list();
      setContacts(Array.isArray(rows) ? rows : []);
      setContactsError(null);
    } catch (e) {
      setContacts([]);
      setContactsError(e?.message || 'Erreur chargement contacts');
    } finally {
      setContactsLoading(false);
    }
  };

  const deleteContact = async (id) => {
    if (!id) return;
    if (!confirm('Supprimer ce message de contact ?')) return;
    try {
      await contactApi.remove(id);
      await loadContacts();
    } catch (e) {
      alert(e?.message || 'Suppression échouée');
    }
  };

  // === Users CRUD ===
  const [usersTable, setUsersTable] = useState([]);
  const [usersTableLoading, setUsersTableLoading] = useState(false);
  const [usersTableError, setUsersTableError] = useState(null);
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userFormMode, setUserFormMode] = useState('create'); // 'create' | 'edit'
  const [userFormData, setUserFormData] = useState({ id: null, first_name: '', last_name: '', email: '', role: 'user', position: '', is_active: true });

  const loadUsersTable = async () => {
    try {
      setUsersTableLoading(true);
      const rows = await usersApi.list();
      setUsersTable(Array.isArray(rows) ? rows : []);
      setUsersTableError(null);
    } catch (e) {
      setUsersTable([]);
      setUsersTableError(e?.message || 'Erreur chargement utilisateurs');
    } finally {
      setUsersTableLoading(false);
    }
  };

  const openCreateUser = () => {
    setUserFormMode('create');
    setUserFormData({ id: null, first_name: '', last_name: '', email: '', role: 'user', position: '', is_active: true });
    setUserFormOpen(true);
  };

  const openEditUser = (u) => {
    setUserFormMode('edit');
    setUserFormData({
      id: u?.id || null,
      first_name: u?.first_name || '',
      last_name: u?.last_name || '',
      email: u?.email || '',
      role: u?.role || 'user',
      position: u?.position || '',
      is_active: Boolean(u?.is_active ?? true),
    });
    setUserFormOpen(true);
  };

  const saveUser = async () => {
    try {
      const payload = {
        first_name: userFormData.first_name || undefined,
        last_name: userFormData.last_name || undefined,
        email: userFormData.email || undefined,
        role: userFormData.role || undefined,
        position: userFormData.position || undefined,
        is_active: userFormData.is_active,
      };
      let saved = null;
      if (userFormMode === 'edit' && userFormData.id) {
        saved = await usersApi.update(userFormData.id, payload);
        setUsersTable(prev => prev.map(u => u.id === saved.id ? saved : u));
      } else {
        saved = await usersApi.create(payload);
        setUsersTable(prev => [saved, ...prev]);
      }
      setUserFormOpen(false);
    } catch (e) {
      alert(e?.message || 'Échec de la sauvegarde');
    }
  };

  const deleteUserRow = async (id) => {
    if (!id) return;
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try {
      await usersApi.remove(id);
      setUsersTable(prev => prev.filter(u => u.id !== id));
    } catch (e) {
      alert(e?.message || 'Erreur lors de la suppression');
    }
  };

  const renderUsers = () => {
    const rows = applyGlobalFilters(usersTable);
    return (
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-4 border-b bg-white">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Utilisateurs</h2>
            <button onClick={openCreateUser} className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              <Plus className="w-4 h-4 mr-1" /> Ajouter
            </button>
          </div>
          {usersTableError && <div className="mt-2 text-sm text-red-600">{usersTableError}</div>}
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2 text-left">Prénom</th>
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Rôle</th>
                <th className="px-3 py-2 text-left">Poste</th>
                <th className="px-3 py-2 text-left">Actif</th>
                <th className="px-3 py-2 text-left">Session</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersTableLoading ? (
                <tr><td className="px-3 py-2" colSpan={8}>Chargement...</td></tr>
              ) : Array.isArray(rows) && rows.length > 0 ? (
                rows.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-3 py-2">{u.first_name || '—'}</td>
                    <td className="px-3 py-2">{u.last_name || '—'}</td>
                    <td className="px-3 py-2">{u.email || '—'}</td>
                    <td className="px-3 py-2">{u.role || '—'}</td>
                    <td className="px-3 py-2">{u.position || '—'}</td>
                    <td className="px-3 py-2">{String(u.is_active ? 'Oui' : 'Non')}</td>
                    <td className="px-3 py-2">{u.session_status || '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => openEditUser(u)} className="inline-flex items-center px-2 py-1 text-indigo-600 hover:text-indigo-800 mr-2">
                        <Edit className="w-4 h-4 mr-1" /> Éditer
                      </button>
                      <button onClick={() => deleteUserRow(u.id)} className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-3 py-2" colSpan={8}>Aucun utilisateur</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {userFormOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setUserFormOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-xl">
              <h4 className="text-lg font-semibold mb-4">{userFormMode === 'edit' ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Prénom</label>
                    <input type="text" value={userFormData.first_name} onChange={(e)=>setUserFormData(d=>({ ...d, first_name: e.target.value }))} className="w-full border rounded px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Nom</label>
                    <input type="text" value={userFormData.last_name} onChange={(e)=>setUserFormData(d=>({ ...d, last_name: e.target.value }))} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email</label>
                  <input type="email" value={userFormData.email} onChange={(e)=>setUserFormData(d=>({ ...d, email: e.target.value }))} className="w-full border rounded px-3 py-2" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Rôle</label>
                    <select value={userFormData.role} onChange={(e)=>setUserFormData(d=>({ ...d, role: e.target.value }))} className="w-full border rounded px-3 py-2">
                      <option value="user">user</option>
                      <option value="manager">manager</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Poste</label>
                    <input type="text" value={userFormData.position} onChange={(e)=>setUserFormData(d=>({ ...d, position: e.target.value }))} className="w-full border rounded px-3 py-2" />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <input id="user-active" type="checkbox" checked={userFormData.is_active} onChange={(e)=>setUserFormData(d=>({ ...d, is_active: e.target.checked }))} />
                  <label htmlFor="user-active" className="text-sm text-gray-600">Compte actif</label>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={() => setUserFormOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Annuler</button>
                <button onClick={saveUser} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded inline-flex items-center">
                  <Save className="w-4 h-4 mr-1" /> Enregistrer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Notifications (dernières soumissions devis)
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const LS_LAST_SEEN = 'backoffice_notifications_last_seen';

  const loadNotifications = async () => {
    try {
      const items = await notificationsApi.listLatest(10);
      setNotifications(items);
      const lastSeenRaw = localStorage.getItem(LS_LAST_SEEN);
      const lastSeen = lastSeenRaw ? new Date(lastSeenRaw) : null;
      const count = items.filter(it => {
        const created = it.created_at ? new Date(it.created_at) : null;
        return created && (!lastSeen || created > lastSeen);
      }).length;
      setUnreadCount(count);
    } catch (e) {
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadNotifications();
    const id = setInterval(loadNotifications, 30000);
    return () => clearInterval(id);
  }, []);

  const toggleNotifications = () => {
    setNotificationsOpen(v => !v);
    try {
      localStorage.setItem(LS_LAST_SEEN, new Date().toISOString());
      setUnreadCount(0);
    } catch (err) {
      console.debug('Notifications: stockage indisponible ou quota dépassé', err?.message || err);
    }
  };
  // Promos (CRUD dans Paramètres)
  const [promos, setPromos] = useState([]);
  const [promoLoading, setPromoLoading] = useState(false);
const [promoError, setPromoError] = useState(null);
const [promoFormOpen, setPromoFormOpen] = useState(false);
// Aperçu image retiré: pas d'état d'erreur nécessaire
  const [promoFormData, setPromoFormData] = useState({
    id: null,
    title: '',
    subtitle: '',
    img_url: '',
    billing_cycle_default: 'annual',
    timer_end_at: '',
    plans_json: [],
    comparison_json: [],
    enterprise_features_json: [],
    is_active: 1,
  });
  // Champs JSON en mode "raw" pour une saisie libre et validation progressive
const [promoJsonRaw, setPromoJsonRaw] = useState({
  plans_json: '[]',
  comparison_json: '[]',
  enterprise_features_json: '[]',
});
const [promoJsonErrors, setPromoJsonErrors] = useState({
  plans_json: null,
  comparison_json: null,
  enterprise_features_json: null,
});
// JSON combiné pour simplification (plans, comparison, enterprise_features)
const [promoCombinedRaw, setPromoCombinedRaw] = useState('');
const [promoCombinedError, setPromoCombinedError] = useState(null);

  // App Settings (CRUD dans Paramètres)
  const [appSettings, setAppSettings] = useState([]);
  const [appSettingsLoading, setAppSettingsLoading] = useState(false);
  const [appSettingsError, setAppSettingsError] = useState(null);
  const [appSettingFormOpen, setAppSettingFormOpen] = useState(false);
  const [appSettingFormData, setAppSettingFormData] = useState({
    id: null,
    setting_key: '',
    setting_type: 'string',
    description: '',
    setting_value_raw: '',
  });

  // Profil (CRUD)
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState(null);
  const [profileFormOpen, setProfileFormOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    id: null,
    title: '',
    subtitle: '',
    banner_url: '',
    stats_json_raw: '[]',
    services_json_raw: '[]',
    values_json_raw: '[]',
    team_json_raw: '[]',
    is_active: 1,
  });

  const loadProfiles = async () => {
    setProfilesLoading(true); setProfilesError(null);
    try {
      const rows = await profilesApi.list();
      setProfiles(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setProfilesError(e?.message || 'Erreur de chargement des profils');
    } finally { setProfilesLoading(false); }
  };

  const openCreateProfile = () => {
    setProfileFormData({
      id: null,
      title: '',
      subtitle: '',
      banner_url: '',
      stats_json_raw: '[]',
      services_json_raw: '[]',
      values_json_raw: '[]',
      team_json_raw: '[]',
      is_active: 1,
    });
    setProfileFormOpen(true);
  };

  const openEditProfile = (p) => {
    setProfileFormData({
      id: p.id,
      title: p.title || '',
      subtitle: p.subtitle || '',
      banner_url: p.banner_url || '',
      stats_json_raw: JSON.stringify(p.stats_json ?? []),
      services_json_raw: JSON.stringify(p.services_json ?? []),
      values_json_raw: JSON.stringify(p.values_json ?? []),
      team_json_raw: JSON.stringify(p.team_json ?? []),
      is_active: p.is_active ? 1 : 0,
    });
    setProfileFormOpen(true);
  };

  const saveProfile = async () => {
    setProfileSaving(true);
    try {
      const payload = {
        title: profileFormData.title,
        subtitle: profileFormData.subtitle,
        banner_url: profileFormData.banner_url,
        stats_json: isValidJson(profileFormData.stats_json_raw) ? JSON.parse(profileFormData.stats_json_raw) : [],
        services_json: isValidJson(profileFormData.services_json_raw) ? JSON.parse(profileFormData.services_json_raw) : [],
        values_json: isValidJson(profileFormData.values_json_raw) ? JSON.parse(profileFormData.values_json_raw) : [],
        team_json: isValidJson(profileFormData.team_json_raw) ? JSON.parse(profileFormData.team_json_raw) : [],
        is_active: profileFormData.is_active ? 1 : 0,
      };

      if (profileFormData.id) {
        await profilesApi.update(profileFormData.id, payload);
      } else {
        await profilesApi.create(payload);
      }
      setProfileFormOpen(false);
      await loadProfiles();
    } catch (e) {
      alert(e?.message || 'Erreur enregistrement profil');
    } finally {
      setProfileSaving(false);
    }
  };

  const deleteProfile = async (id) => {
    if (!confirm('Supprimer ce profil ?')) return;
    try { await profilesApi.remove(id); await loadProfiles(); } catch (e) { alert(e?.message || 'Erreur suppression'); }
  };

  // Blogs (CRUD)
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [blogsError, setBlogsError] = useState(null);
  const [blogFormOpen, setBlogFormOpen] = useState(false);
  const [blogFormData, setBlogFormData] = useState({
    id: null,
    category_id: '',
    title: '',
    excerpt: '',
    content: '',
    author_name: '',
    author_role: '',
    author_avatar: '',
    image_url: '',
    published_date: '',
    read_time: '',
    featured: 0,
    trending: 0,
    tags_raw: '',
  });

  // Portfolio (CRUD dans Paramètres)
  const [portfolioProjects, setPortfolioProjects] = useState([]);
  const [portfolioLoading, setPortfolioLoading] = useState(false);
  const [portfolioError, setPortfolioError] = useState(null);
  const [portfolioFormOpen, setPortfolioFormOpen] = useState(false);
  const [portfolioFormData, setPortfolioFormData] = useState({
    id: null,
    title: '',
    category: '',
    client: '',
    year: '',
    description: '',
    image_url: '',
    tags_raw: '',
  });

  const isValidJsonArray = (str) => {
    try {
      const val = JSON.parse(str);
      return Array.isArray(val);
    } catch {
      return false;
    }
  };

  const isValidJson = (str) => {
    try { JSON.parse(str); return true; } catch { return false; }
  };

  // Validation légère: vérifier que les champs de prix des plans sont numériques
  const validatePlansPriceFCFA = (plans) => {
    try {
      if (!Array.isArray(plans)) return null;
      for (const p of plans) {
        const monthly = p?.monthlyPrice ?? p?.priceMonthly ?? null;
        const annual  = p?.annualPrice ?? p?.priceYearly ?? p?.annualMonthly ?? null;
        if (monthly != null && !Number.isFinite(Number(monthly))) {
          return 'Prix mensuel non numérique détecté dans Plans';
        }
        if (annual != null && !Number.isFinite(Number(annual))) {
          return 'Prix annuel non numérique détecté dans Plans';
        }
      }
      return null;
    } catch {
      return 'Erreur de validation des prix des plans';
    }
  };

  

  const loadPromos = async () => {
    setPromoLoading(true);
    setPromoError(null);
    try {
      const list = await promosApi.list();
      setPromos(Array.isArray(list) ? list : []);
    } catch (e) {
      setPromoError(e?.message || 'Erreur chargement des promos');
    } finally {
      setPromoLoading(false);
    }
  };

  useEffect(() => { loadPromos(); }, []);

  const loadAppSettings = async () => {
    setAppSettingsLoading(true);
    setAppSettingsError(null);
    try {
      const list = await appSettingsApi.list();
      setAppSettings(Array.isArray(list) ? list : []);
    } catch (e) {
      setAppSettingsError(e?.message || 'Erreur chargement des paramètres');
    } finally {
      setAppSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Paramètres Système') {
      loadAppSettings();
    }
  }, [activeTab]);

  const loadBlogs = async () => {
    setBlogsLoading(true);
    setBlogsError(null);
    try {
      const rows = await blogsApi.list();
      setBlogs(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setBlogsError(e?.message || 'Erreur chargement des articles');
    } finally {
      setBlogsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Blog') {
      loadBlogs();
    }
  }, [activeTab]);

  const loadPortfolioProjects = async () => {
    setPortfolioLoading(true);
    setPortfolioError(null);
    try {
      const rows = await projectsApi.list();
      setPortfolioProjects(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setPortfolioError(e?.message || 'Erreur chargement des projets');
    } finally {
      setPortfolioLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'Portfolio') {
      loadPortfolioProjects();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'Profil') {
      loadProfiles();
    }
  }, [activeTab]);

const openCreatePromo = () => {
  setPromoFormData({
    id: null,
    title: '',
    subtitle: '',
    img_url: '',
    billing_cycle_default: 'annual',
    timer_end_at: '',
    plans_json: [],
    comparison_json: [],
    enterprise_features_json: [],
    is_active: 1,
  });
  setPromoJsonRaw({ plans_json: '[]', comparison_json: '[]', enterprise_features_json: '[]' });
  setPromoJsonErrors({ plans_json: null, comparison_json: null, enterprise_features_json: null });
  setPromoCombinedRaw(JSON.stringify({ plans: [], comparison: [], enterprise_features: [] }, null, 2));
  setPromoCombinedError(null);
  setPromoFormOpen(true);
};

  const openCreateAppSetting = () => {
    setAppSettingFormData({
      id: null,
      setting_key: '',
      setting_type: 'string',
      description: '',
      setting_value_raw: '',
    });
    setAppSettingFormOpen(true);
  };

  const openCreateBlog = () => {
    const firstCategoryId = (serviceCategories && serviceCategories[0]?.id) || '';
    setBlogFormData({
      id: null,
      category_id: firstCategoryId,
      title: '',
      excerpt: '',
      content: '',
      author_name: '',
      author_role: '',
      author_avatar: '',
      image_url: '',
      published_date: '',
      read_time: '',
      featured: 0,
      trending: 0,
      tags_raw: '',
    });
    setBlogFormOpen(true);
  };

  const openEditAppSetting = (s) => {
    let raw = '';
    if (s?.setting_type === 'json') {
      try {
        const parsed = typeof s.setting_value === 'string' ? JSON.parse(s.setting_value) : s.setting_value;
        raw = JSON.stringify(parsed, null, 2);
      } catch {
        raw = String(s.setting_value ?? '');
      }
    } else {
      raw = String(s.setting_value ?? '');
    }
    setAppSettingFormData({
      id: s.id,
      setting_key: s.setting_key || '',
      setting_type: s.setting_type || 'string',
      description: s.description || '',
      setting_value_raw: raw,
    });
    setAppSettingFormOpen(true);
  };

  const openEditBlog = (b) => {
    setBlogFormData({
      id: b.id,
      category_id: b.category_id || '',
      title: b.title || '',
      excerpt: b.excerpt || '',
      content: typeof b.content === 'string' ? b.content : (b.content ? JSON.stringify(b.content, null, 2) : ''),
      author_name: b.author_name || '',
      author_role: b.author_role || '',
      author_avatar: b.author_avatar || '',
      image_url: b.image_url || '',
      published_date: b.published_date ? String(b.published_date).slice(0,10) : '',
      read_time: b.read_time || '',
      featured: b.featured ? 1 : 0,
      trending: b.trending ? 1 : 0,
      tags_raw: Array.isArray(b.tags) ? b.tags.join(',') : (typeof b.tags === 'string' ? b.tags : ''),
    });
    setBlogFormOpen(true);
  };

  const saveAppSetting = async () => {
    try {
      // Validation clé
      if (!appSettingFormData.setting_key?.trim()) {
        throw new Error('La clé est obligatoire');
      }
      const type = appSettingFormData.setting_type;
      const raw = appSettingFormData.setting_value_raw ?? '';
      if (type === 'json' && raw.trim() && !isValidJson(raw)) {
        throw new Error('Valeur JSON invalide');
      }
      const payload = {
        setting_key: appSettingFormData.setting_key.trim(),
        setting_type: type,
        description: appSettingFormData.description ?? '',
        // On envoie la valeur sous forme de chaîne; côté backend, elle sera stockée en LONGTEXT
        setting_value: raw,
      };
      if (appSettingFormData.id) {
        await appSettingsApi.update(appSettingFormData.id, payload);
      } else {
        await appSettingsApi.create(payload);
      }
      setAppSettingFormOpen(false);
      await loadAppSettings();
      alert('Paramètre enregistré');
    } catch (e) {
      alert(e?.message || 'Erreur enregistrement paramètre');
    }
  };

  const deleteAppSetting = async (id) => {
    if (!confirm('Supprimer ce paramètre ?')) return;
    try {
      await appSettingsApi.remove(id);
      await loadAppSettings();
    } catch (e) {
      alert(e?.message || 'Erreur suppression paramètre');
    }
  };

  const saveBlog = async () => {
    try {
      if (!blogFormData.title?.trim()) throw new Error('Le titre est obligatoire');
      const payload = {
        category_id: blogFormData.category_id ? Number(blogFormData.category_id) : null,
        title: blogFormData.title.trim(),
        excerpt: blogFormData.excerpt ?? '',
        content: blogFormData.content ?? '',
        author_name: blogFormData.author_name ?? '',
        author_role: blogFormData.author_role ?? '',
        author_avatar: blogFormData.author_avatar ?? '',
        image_url: blogFormData.image_url ?? '',
        published_date: blogFormData.published_date || null,
        read_time: blogFormData.read_time ?? '',
        featured: blogFormData.featured ? 1 : 0,
        trending: blogFormData.trending ? 1 : 0,
        tags: (blogFormData.tags_raw || '')
          .split(',')
          .map(t => t.trim())
          .filter(Boolean),
      };
      if (!payload.category_id) throw new Error('La catégorie est requise');
      if (blogFormData.id) {
        await blogsApi.update(blogFormData.id, payload);
      } else {
        await blogsApi.create(payload);
      }
      setBlogFormOpen(false);
      await loadBlogs();
      alert('Article enregistré');
    } catch (e) {
      alert(e?.message || 'Erreur enregistrement article');
    }
  };

  const deleteBlog = async (id) => {
    if (!confirm('Supprimer cet article ?')) return;
    try {
      await blogsApi.remove(id);
      await loadBlogs();
    } catch (e) {
      alert(e?.message || 'Erreur suppression article');
    }
  };

const openEditPromo = (p) => {
  const safeParse = (v) => {
    if (Array.isArray(v)) return v;
    if (typeof v === 'string') {
      try { const j = JSON.parse(v); return Array.isArray(j) ? j : []; } catch { return []; }
    }
    return [];
  };
  setPromoFormData({
      id: p.id,
      title: p.title || '',
      subtitle: p.subtitle || '',
      img_url: p.img_url || '',
      billing_cycle_default: p.billing_cycle_default || 'annual',
      timer_end_at: p.timer_end_at ? new Date(p.timer_end_at).toISOString().slice(0,16) : '',
      plans_json: safeParse(p.plans_json),
      comparison_json: safeParse(p.comparison_json),
      enterprise_features_json: safeParse(p.enterprise_features_json),
      is_active: p.is_active ? 1 : 0,
  });
  setPromoJsonRaw({
    plans_json: JSON.stringify(safeParse(p.plans_json), null, 2),
    comparison_json: JSON.stringify(safeParse(p.comparison_json), null, 2),
    enterprise_features_json: JSON.stringify(safeParse(p.enterprise_features_json), null, 2),
  });
  setPromoJsonErrors({ plans_json: null, comparison_json: null, enterprise_features_json: null });
  setPromoCombinedRaw(JSON.stringify({
    plans: safeParse(p.plans_json),
    comparison: safeParse(p.comparison_json),
    enterprise_features: safeParse(p.enterprise_features_json)
  }, null, 2));
  setPromoCombinedError(null);
  setPromoFormOpen(true);
};

  const savePromo = async () => {
    try {
      // Valider et parser les JSON "raw"
      const hasPlans = isValidJsonArray(promoJsonRaw.plans_json);
      const hasComp = isValidJsonArray(promoJsonRaw.comparison_json);
      const hasEnt  = isValidJsonArray(promoJsonRaw.enterprise_features_json);
      setPromoJsonErrors({
        plans_json: hasPlans ? null : 'JSON invalide (tableau attendu)',
        comparison_json: hasComp ? null : 'JSON invalide (tableau attendu)',
        enterprise_features_json: hasEnt ? null : 'JSON invalide (tableau attendu)'
      });
      if (!hasPlans || !hasComp || !hasEnt) {
        throw new Error('Veuillez corriger les champs JSON avant de sauvegarder.');
      }

      const parsedPlans = JSON.parse(promoJsonRaw.plans_json);
      const parsedComp  = JSON.parse(promoJsonRaw.comparison_json);
      const parsedEnt   = JSON.parse(promoJsonRaw.enterprise_features_json);

      const payload = {
        title: promoFormData.title,
        subtitle: promoFormData.subtitle,
        img_url: promoFormData.img_url,
        billing_cycle_default: promoFormData.billing_cycle_default,
        timer_end_at: promoFormData.timer_end_at ? new Date(promoFormData.timer_end_at).toISOString().slice(0,19).replace('T',' ') : null,
        plans_json: parsedPlans,
        comparison_json: parsedComp,
        enterprise_features_json: parsedEnt,
        is_active: Number(promoFormData.is_active) ? 1 : 0,
      };
      if (promoFormData.id) {
        await promosApi.update(promoFormData.id, payload);
      } else {
        await promosApi.create(payload);
      }
      setPromoFormOpen(false);
      await loadPromos();
      alert('Promo enregistrée');
    } catch (e) {
      alert(e?.message || 'Erreur enregistrement promo');
    }
  };

  const deletePromo = async (id) => {
    if (!confirm('Supprimer cette promo ?')) return;
    try {
      await promosApi.remove(id);
      await loadPromos();
    } catch (e) {
      alert(e?.message || 'Erreur suppression promo');
    }
  };
  // Devis (quotes) state and helpers
  const [devisRequests, setDevisRequests] = useState([]);
  const [devisLoading, setDevisLoading] = useState(false);
  const [devisError, setDevisError] = useState(null);
  const [updatingDevisId, setUpdatingDevisId] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedDevisRequest, setSelectedDevisRequest] = useState(null);
  const [showDevisDrawer, setShowDevisDrawer] = useState(false);
  const [devisDrawerRequest, setDevisDrawerRequest] = useState(null);

  // Édition des membres d'équipe
  const [teamEditOpen, setTeamEditOpen] = useState(false);
  const [teamEditData, setTeamEditData] = useState(null);
  const openTeamEdit = (member) => {
    setTeamEditData({ ...member });
    setTeamEditOpen(true);
  };
  const closeTeamEdit = () => { setTeamEditOpen(false); setTeamEditData(null); };
  const handleTeamEditChange = (field, value) => {
    setTeamEditData((prev) => ({ ...prev, [field]: value }));
  };
  const saveTeamEdit = async () => {
    if (!teamEditData?.id) return;
    try {
      const fullName = (teamEditData.nom || '').trim();
      const parts = fullName.split(/\s+/).filter(Boolean);
      const first_name = parts[0] || '';
      const last_name = parts.slice(1).join(' ') || '';

      // Normaliser le rôle saisi dans le sélecteur (Administrateur/Manager/Utilisateur)
      const roleRaw = String(teamEditData.role || '').trim();
      const roleNormalized = (
        ['Administrateur', 'admin'].includes(roleRaw) ? 'admin' :
        ['Manager', 'manager'].includes(roleRaw) ? 'manager' :
        ['Utilisateur', 'User', 'user'].includes(roleRaw) ? 'user' : 'user'
      );

      const payload = {
        email: teamEditData.email,
        position: teamEditData.poste,
        role: roleNormalized,
        avatar: teamEditData.avatar,
        first_name,
        last_name,
      };

      await usersApi.update(teamEditData.id, payload);
      // Recharge depuis la base pour refléter la mise à jour réelle
      await loadTeamMembers();
    } catch (e) {
      // Silencieux: échec mise à jour utilisateur
    } finally {
      closeTeamEdit();
    }
  };

  // Modale liste des utilisateurs (nouveau membre)
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [usersQuery, setUsersQuery] = useState('');
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [roleUpdateSaving, setRoleUpdateSaving] = useState(false);

  const openUsersModal = async () => {
    setUsersModalOpen(true);
    setUsersLoading(true);
    setUsersError(null);
    try {
      const users = await usersApi.list();
      setUsersList(Array.isArray(users) ? users : []);
    } catch (e) {
      setUsersError(e?.message || 'Erreur de chargement des utilisateurs');
    } finally {
      setUsersLoading(false);
    }
  };
  const closeUsersModal = () => { setUsersModalOpen(false); setSelectedUserForRole(null); };
  const canEditUserRole = (u) => String(u.role || '').toLowerCase() === 'user';
  const startEditUserRole = (u) => { if (!canEditUserRole(u)) return; setSelectedUserForRole({ ...u, nextRole: 'manager' }); };
  const handleChangeRoleSelection = (val) => { setSelectedUserForRole((prev) => ({ ...prev, nextRole: val })); };
  const saveUserRoleUpdate = async () => {
    if (!selectedUserForRole?.id || !selectedUserForRole?.nextRole) return;
    setRoleUpdateSaving(true);
    setUsersError(null);
    try {
      // Mettre à jour uniquement le rôle
      await usersApi.update(selectedUserForRole.id, { role: String(selectedUserForRole.nextRole).toLowerCase() });
      // Recharger la liste complète et l'équipe
      await openUsersModal();
      await loadTeamMembers();
      setSelectedUserForRole(null);
    } catch (e) {
      setUsersError(e?.message || 'Impossible de mettre à jour le rôle');
    } finally {
      setRoleUpdateSaving(false);
    }
  };

  // Filtres avancés pour les devis
  const [showDevisFilters, setShowDevisFilters] = useState(false);
  const [devisFilters, setDevisFilters] = useState({
    query: '',
    status: '',
    project_type: '',
    date_min: '',
    date_max: '',
    amount_min: '',
    amount_max: '',
  });

  const statusOptions = [
    { value: 'reçu', label: 'Reçu' },
    { value: 'en_analyse', label: 'En analyse' },
    { value: 'envoyé', label: 'Envoyé' },
    { value: 'approuvé', label: 'Approuvé' },
    { value: 'refusé', label: 'Refusé' },
  ];

  const normalizeStatusKey = (status) => {
    if (!status) return 'reçu';
    const s = String(status).toLowerCase();
    if (['reçu', 'recu', 'pending', 'en attente', 'attente'].includes(s)) return 'reçu';
    if (['en_analyse', 'analyse', 'en analyse', 'reviewing', 'revue', 'review'].includes(s)) return 'en_analyse';
    if (['envoyé', 'envoye', 'envoyer', 'proposal', 'proposition', 'proposal_sent'].includes(s)) return 'envoyé';
    if (['approuvé', 'approuve', 'approved', 'confirmé', 'confirmed'].includes(s)) return 'approuvé';
    if (['refusé', 'refuse', 'rejeté', 'rejected'].includes(s)) return 'refusé';
    return 'reçu';
  };

  const updateDevisStatus = async (id, nextStatus) => {
    if (!id || !nextStatus) return;
    setUpdatingDevisId(id);
    setDevisError(null);
    try {
      await devisRequestsApi.update(id, { status: nextStatus });
      setDevisRequests((prev) => prev.map((d) => (d?.id === id ? { ...d, status: nextStatus } : d)));
    } catch (e) {
      setDevisError(e?.message || 'Impossible de mettre à jour le statut du devis');
    } finally {
      setUpdatingDevisId(null);
    }
  };

  const statusProgressMap = {
    reçu: 20,
    en_analyse: 40,
    envoyé: 60,
    approuvé: 100,
    refusé: 100,
  };

  const getProgressFromStatus = (status) => {
    if (!status) return 0;
    const key = String(status).toLowerCase();
    if (statusProgressMap[key] != null) return statusProgressMap[key];
    // Compat: anciennes valeurs
    if (key.includes('analyse')) return 40;
    if (key.includes('envoy')) return 60;
    if (key.includes('approuv') || key.includes('confirm')) return 100;
    if (key.includes('refus') || key.includes('reject')) return 100;
    if (key.includes('reç') || key.includes('rec') || key.includes('attente') || key.includes('pend')) return 20;
    return 0;
  };

  const loadDevis = async () => {
    setDevisLoading(true);
    setDevisError(null);
    try {
      const rows = await devisRequestsApi.list();
      setDevisRequests(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setDevisError(e?.message || 'Erreur de chargement des devis');
    } finally {
      setDevisLoading(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'devis') {
      loadDevis();
    }
  }, [activeMenu]);

  const openQuoteModal = (req) => {
    setSelectedDevisRequest(req || null);
    setShowQuoteModal(true);
  };

  const closeQuoteModal = () => {
    setShowQuoteModal(false);
    setSelectedDevisRequest(null);
  };

  const openDevisDrawer = (req) => {
    setDevisDrawerRequest(req || null);
    setShowDevisDrawer(true);
  };
  const closeDevisDrawer = () => {
    setShowDevisDrawer(false);
    setDevisDrawerRequest(null);
  };

  // Connexion temps réel Socket.IO et abonnements
  useEffect(() => {
    const socket = connectRealtime();
    const onDevisCreated = (item) => setDevisRequests(prev => [item, ...(Array.isArray(prev) ? prev : [])]);
    const onDevisUpdated = (item) => setDevisRequests(prev => (Array.isArray(prev) ? prev.map(d => d?.id === item?.id ? item : d) : [item]));
    const onContactCreated = (item) => setContacts(prev => [item, ...(Array.isArray(prev) ? prev : [])]);
    const onContactRemoved = ({ id }) => setContacts(prev => (Array.isArray(prev) ? prev.filter(c => c?.id !== id) : []));
    const onApptCreated = (item) => setAppointments(prev => [item, ...(Array.isArray(prev) ? prev : [])]);
    const onApptUpdated = (item) => setAppointments(prev => (Array.isArray(prev) ? prev.map(a => a?.id === item?.id ? item : a) : [item]));
    const onApptRemoved = ({ id }) => setAppointments(prev => (Array.isArray(prev) ? prev.filter(a => a?.id !== id) : []));
    const onMsgCreated = (item) => setMessages(prev => [item, ...(Array.isArray(prev) ? prev : [])]);
    const onMsgUpdated = (item) => setMessages(prev => (Array.isArray(prev) ? prev.map(m => m?.id === item?.id ? item : m) : [item]));
    const onMsgRemoved = ({ id }) => setMessages(prev => (Array.isArray(prev) ? prev.filter(m => m?.id !== id) : []));

    // Événements temps réel pour les factures
    const onInvoiceCreated = (item) => setInvoices(prev => [item, ...(Array.isArray(prev) ? prev : [])]);
    const onInvoiceUpdated = (item) => setInvoices(prev => (Array.isArray(prev) ? prev.map(x => x?.id === item?.id ? item : x) : [item]));
    const onInvoiceRemoved = ({ id }) => setInvoices(prev => (Array.isArray(prev) ? prev.filter(x => x?.id !== id) : []));

    socket.on('devisRequests.created', onDevisCreated);
    socket.on('devisRequests.updated', onDevisUpdated);
    socket.on('contacts.created', onContactCreated);
    socket.on('contacts.removed', onContactRemoved);
    socket.on('appointments.created', onApptCreated);
    socket.on('appointments.updated', onApptUpdated);
    socket.on('appointments.removed', onApptRemoved);
    socket.on('messages.created', onMsgCreated);
    socket.on('messages.updated', onMsgUpdated);
    socket.on('messages.removed', onMsgRemoved);
    socket.on('invoices.created', onInvoiceCreated);
    socket.on('invoices.updated', onInvoiceUpdated);
    socket.on('invoices.removed', onInvoiceRemoved);
    socket.on('invoices.sent', onInvoiceUpdated);

    return () => {
      socket.off('devisRequests.created', onDevisCreated);
      socket.off('devisRequests.updated', onDevisUpdated);
      socket.off('contacts.created', onContactCreated);
      socket.off('contacts.removed', onContactRemoved);
      socket.off('appointments.created', onApptCreated);
      socket.off('appointments.updated', onApptUpdated);
      socket.off('appointments.removed', onApptRemoved);
      socket.off('messages.created', onMsgCreated);
      socket.off('messages.updated', onMsgUpdated);
      socket.off('messages.removed', onMsgRemoved);
      socket.off('invoices.created', onInvoiceCreated);
      socket.off('invoices.updated', onInvoiceUpdated);
      socket.off('invoices.removed', onInvoiceRemoved);
      socket.off('invoices.sent', onInvoiceUpdated);
    };
  }, []);

  // Données Analytics
  const _revenueData = [
    { month: 'Jan', revenus: 45000, depenses: 28000, profit: 17000 },
    { month: 'Fév', revenus: 52000, depenses: 31000, profit: 21000 },
    { month: 'Mar', revenus: 48000, depenses: 29000, profit: 19000 },
    { month: 'Avr', revenus: 61000, depenses: 35000, profit: 26000 },
    { month: 'Mai', revenus: 55000, depenses: 33000, profit: 22000 },
    { month: 'Jun', revenus: 67000, depenses: 38000, profit: 29000 },
    { month: 'Jul', revenus: 72000, depenses: 41000, profit: 31000 },
  ];

  // Calcul des cartes Finance à partir des factures
  const computeFinanceStats = (list) => {
    const arr = Array.isArray(list) ? list : [];
    const now = new Date();
    const thisYear = now.getFullYear();
    const lastYear = thisYear - 1;

    const normalizeStatus = (s) => String(s || '').toLowerCase();
    const isPaid = (inv) => normalizeStatus(inv?.status) === 'payée' || normalizeStatus(inv?.status) === 'paid';
    const isRefused = (inv) => normalizeStatus(inv?.status) === 'refusée' || normalizeStatus(inv?.status) === 'refused';
    const isUnpaid = (inv) => !isPaid(inv) && !isRefused(inv);

    const amountOf = (x) => {
      const n = typeof x?.amount === 'number' ? x.amount : parseFloat(String(x?.amount || '0').replace(',', '.'));
      return isNaN(n) ? 0 : n;
    };
    const yearOf = (x) => {
      const d = x?.issued_date ? new Date(x.issued_date) : null;
      return d && !isNaN(d.getTime()) ? d.getFullYear() : null;
    };
    const isOverdue = (x) => {
      if (!isUnpaid(x)) return false;
      const d = x?.due_date ? new Date(x.due_date) : null;
      if (!d || isNaN(d.getTime())) return false;
      return d < now;
    };

    const totalRevenue = arr.filter(isPaid).reduce((sum, x) => sum + amountOf(x), 0);
    const unpaidList = arr.filter(isUnpaid);
    const pendingAmount = unpaidList.reduce((sum, x) => sum + amountOf(x), 0);
    const unpaidCount = unpaidList.length;
    const overdueAmount = unpaidList.filter(isOverdue).reduce((sum, x) => sum + amountOf(x), 0);

    const thisYearRevenue = arr.filter(x => isPaid(x) && yearOf(x) === thisYear).reduce((s, x) => s + amountOf(x), 0);
    const lastYearRevenue = arr.filter(x => isPaid(x) && yearOf(x) === lastYear).reduce((s, x) => s + amountOf(x), 0);
    const yoyDeltaPct = lastYearRevenue > 0 ? ((thisYearRevenue - lastYearRevenue) / lastYearRevenue) * 100 : null;

    return { totalRevenue, pendingAmount, unpaidCount, overdueAmount, yoyDeltaPct };
  };

 
  // Helper: convert value to ISO date (YYYY-MM-DD) safely
  const toISODate = (value) => {
    if (!value) return '';
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
  };

  const [projects, setProjects] = useState([]);
  const mapUserToProject = (u) => ({
    id: u.id,
    nom: `${u.first_name || ''} ${u.last_name || ''}`.trim() || (u.email || 'Utilisateur'),
    client: u.email || '',
    statut: (u.session_status === 'connected' || u.is_active) ? 'Actif' : 'Inactif',
    progression: 0,
    budget: '—',
    deadline: toISODate(u.created_at),
    priorite: 'Moyenne',
  });
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await api.get('/users');
        const list = Array.isArray(res.data) ? res.data : [];
        setProjects(list.map(mapUserToProject));
      } catch (e) {
        // Silencieux: échec du chargement des utilisateurs
      }
    };
    loadUsers();
  }, []);

  const [clients, setClients] = useState([]);
  const mapUserToClient = (u, extra = {}) => ({
    id: u.id ?? extra.id ?? u.email ?? extra.email ?? Math.random().toString(36).slice(2),
    avatar: u.avatar || extra.avatar || '/img/icons/user.png',
    nom: `${u.first_name || ''} ${u.last_name || ''}`.trim() || extra.full_name || (u.email || 'Utilisateur'),
    contact: `${u.first_name || ''} ${u.last_name || ''}`.trim() || extra.full_name || '',
    email: u.email || extra.email || '',
    telephone: u.telephone || extra.phone || '—',
    projets: extra.requestsCount ?? '—',
    valeur: '—',
    statut: (u.session_status === 'connected' || u.is_active || (extra.requestsCount && extra.requestsCount > 0)) ? 'Actif' : 'Inactif',
    depuis: extra.lastRequestAt ? toISODate(extra.lastRequestAt) : toISODate(u.created_at),
  });
  useEffect(() => {
    const loadClients = async () => {
      try {
        const [users, requests] = await Promise.all([
          usersApi.list(),
          devisRequestsApi.list(),
        ]);
      const usersArr = Array.isArray(users) ? users : [];
      const reqArr = Array.isArray(requests) ? requests : [];
      
      // Conserver toutes les demandes de devis pour le panneau client
      setAllDevisRequests(reqArr);

        const byEmail = new Map();
        for (const r of reqArr) {
          const email = (r.email || '').trim().toLowerCase();
          if (!email) continue;
          const prev = byEmail.get(email) || { requests: [], count: 0, lastRequestAt: null, full_name: r.full_name || '', phone: r.phone || null };
          const createdAt = r.created_at || r.updated_at || null;
          const lastAt = prev.lastRequestAt && createdAt ? (new Date(prev.lastRequestAt) > new Date(createdAt) ? prev.lastRequestAt : createdAt) : (createdAt || prev.lastRequestAt);
          byEmail.set(email, {
            requests: [...prev.requests, r],
            count: prev.count + 1,
            lastRequestAt: lastAt,
            full_name: prev.full_name || r.full_name || '',
            phone: prev.phone || r.phone || null,
          });
        }

        const clientsList = [];
        for (const [email, info] of byEmail.entries()) {
          const user = usersArr.find(u => String(u.email || '').trim().toLowerCase() === email);
          if (user) {
            clientsList.push(mapUserToClient(user, { requestsCount: info.count, lastRequestAt: info.lastRequestAt }));
          } else {
            clientsList.push({
              id: email,
              avatar: info.avatar || '/img/icons/user.png',
              nom: info.full_name || email,
              contact: info.full_name || '',
              email,
              telephone: info.phone || '—',
              projets: info.count,
              valeur: '—',
              statut: 'Actif',
              depuis: toISODate(info.lastRequestAt),
            });
          }
        }
        setClients(clientsList);
      } catch (e) {
        // Silencieux: échec du chargement des clients
      }
    };
    loadClients();
  }, []);

  const [teamMembers, setTeamMembers] = useState([]);

  const loadTeamMembers = async () => {
    try {
      const users = await usersApi.list();
      const adminsManagers = (Array.isArray(users) ? users : [])
        .filter(u => {
          const r = (u.role || '').toLowerCase();
          return r === 'admin' || r === 'manager';
        })
        .map(u => {
          const first = (u.first_name || '').trim();
          const last = (u.last_name || '').trim();
          const roleLabel = (u.role || '').toLowerCase() === 'admin' ? 'Administrateur' : 'Manager';
          return {
            id: u.id,
            nom: (first || last) ? (first + (first && last ? ' ' : '') + last) : (u.email || 'Utilisateur'),
            role: roleLabel,
            email: u.email || '',
            poste: u.position || '',
            projets: 0,
            disponibilite: 80,
            avatar: u.avatar || '/img/icons/user.png',
          };
        });
      setTeamMembers(adminsManagers);
    } catch (e) {
      // Silencieux: échec du chargement des membres de l'équipe
      setTeamMembers([]);
    }
  };

  useEffect(() => { loadTeamMembers(); }, []);

  // Paiements (Finance)
  const [_paymentsTable, _setPaymentsTable] = useState([]);
  const [_paymentsLoading, _setPaymentsLoading] = useState(false);
  const [_paymentsError, _setPaymentsError] = useState('');

  const loadPaymentsTable = async () => {
    try {
      _setPaymentsLoading(true);
      _setPaymentsError('');
      const rows = await payApi.list();
      _setPaymentsTable(Array.isArray(rows) ? rows : []);
    } catch (e) {
      _setPaymentsError(e?.message || 'Erreur chargement des paiements');
    } finally {
      _setPaymentsLoading(false);
    }
  };

 

  // Factures (backend)
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [invoiceError, setInvoiceError] = useState(null);
  const [invoiceFilters, setInvoiceFilters] = useState({
    query: '',
    status: '',
    issuedFrom: '',
    issuedTo: '',
    dueFrom: '',
    dueTo: '',
    minAmount: '',
    maxAmount: ''
  });

  const loadInvoices = async () => {
    setLoadingInvoices(true); setInvoiceError(null);
    try {
      const rows = await invoicesApi.list();
      setInvoices(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setInvoiceError(e?.message || 'Échec de chargement des factures');
    } finally { setLoadingInvoices(false); }
  };

  const sendInvoiceEmail = async (id) => {
    try {
      const res = await invoicesApi.sendEmail(id);
      const updated = res?.invoice || null;
      if (updated) setInvoices(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (e) {
      alert(e?.message || 'Échec de l’envoi de la facture');
    }
  };

  const setInvoiceStatus = async (id, status) => {
    try {
      const updated = await invoicesApi.setStatus(id, status);
      setInvoices(prev => prev.map(x => x.id === updated.id ? updated : x));
    } catch (e) {
      alert(e?.message || 'Échec de la mise à jour du statut');
    }
  };

  const deleteInvoice = async (id) => {
    if (!isAdmin) return;
    if (!id) return;
    if (!confirm('Supprimer cette facture ?')) return;
    try {
      await invoicesApi.remove(id);
      setInvoices(prev => prev.filter(x => x.id !== id));
    } catch (e) {
      alert(e?.message || 'Erreur lors de la suppression de la facture');
    }
  };

  // Helpers affichage factures
  const formatEuro = (n) => {
    const num = typeof n === 'number' ? n : Number(n);
    return Number.isFinite(num)
      ? `${Math.round(num).toLocaleString('fr-FR')} FCFA`
      : (n ?? '—');
  };
  const fmtDate = (s) => {
    if (!s) return '—';
    const d = new Date(s);
    return Number.isNaN(d.getTime()) ? String(s) : d.toISOString().slice(0,10);
  };
  const labelStatus = (s) => {
    const m = String(s || '').toLowerCase();
    if (m === 'payee' || m === 'payée') return 'Payée';
    if (m === 'refusee' || m === 'refusée') return 'Refusée';
    if (m === 'envoyee' || m === 'envoyée' || m === 'sent') return 'Envoyée';
    if (m === 'en_attente' || m === 'pending') return 'En attente';
    return s || '—';
  };

  // Catégories de services (backend)
  const [serviceCategories, setServiceCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState(null);
  const [categoryFormData, setCategoryFormData] = useState({ id: null, name: '', icon: '' });

  const loadServiceCategories = async () => {
    setLoadingCategories(true);
    try {
      const rows = await serviceCategoriesApi.list();
      setServiceCategories(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setCategoryError(e?.message || 'Erreur de chargement');
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => { loadServiceCategories(); }, []);

  const openNewCategory = () => {
    setCategoryFormData({ id: null, name: '', icon: '' });
    setCategoryFormOpen(true);
  };

  const openEditCategory = (cat) => {
    setCategoryFormData({ id: cat.id, name: cat.name || '', icon: cat.icon || '' });
    setCategoryFormOpen(true);
  };

  const saveCategory = async () => {
    setCategorySaving(true);
    setCategoryError(null);
    try {
      const payload = { name: categoryFormData.name?.trim(), icon: categoryFormData.icon?.trim() || null };
      if (!payload.name) throw new Error('Le nom est requis');
      if (categoryFormData.id) {
        await serviceCategoriesApi.update(categoryFormData.id, payload);
      } else {
        await serviceCategoriesApi.create(payload);
      }
      await loadServiceCategories();
      setCategoryFormOpen(false);
    } catch (e) {
      setCategoryError(e?.message || 'Erreur de sauvegarde');
    } finally {
      setCategorySaving(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Supprimer cette catégorie ?')) return;
    try {
      await serviceCategoriesApi.remove(id);
      setServiceCategories(prev => prev.filter(c => c.id !== id));
    } catch (e) {
      alert(e?.message || 'Erreur lors de la suppression');
    }
  };

  // Services (backend)
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [serviceSaving, setServiceSaving] = useState(false);
  const [serviceError, setServiceError] = useState(null);
  const [serviceFormData, setServiceFormData] = useState({
    id: null,
    category_id: null,
    title: '',
    description: '',
    duration: '',
    price: '',
    price_type: 'sur_devis',
    image_url: '',
    cover_url: '',
    featured: false,
    rating: '',
    review_count: 0,
    provider: '',
    provider_rating: '',
    in_stock: true,
    guarantee: false,
    original_price: '',
    discount: '',
    is_active: true,
    features_raw: '',
    deliverables_raw: '',
  });

  // Filtres avancés et sélection de masse
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    category_id: '',
    price_type: '',
    featured: '',
    is_active: '',
    in_stock: '',
    guarantee: '',
    provider: '',
    min_rating: '',
    min_price: '',
    max_price: ''
  });
  const [selectedIds, setSelectedIds] = useState([]);

  const filteredServices = (services || []).filter((s) => {
    // Recherche texte
    const q = serviceSearch.trim().toLowerCase();
    if (q) {
      const hit = (s.title || '').toLowerCase().includes(q) || (s.description || '').toLowerCase().includes(q);
      if (!hit) return false;
    }
    // Filtres par champs
    if (filters.category_id && Number(filters.category_id) !== s.category_id) return false;
    if (filters.price_type && filters.price_type !== s.price_type) return false;
    if (filters.featured !== '') {
      const bool = filters.featured === 'true';
      if (!!s.featured !== bool) return false;
    }
    if (filters.is_active !== '') {
      const bool = filters.is_active === 'true';
      if (!!s.is_active !== bool) return false;
    }
    if (filters.in_stock !== '') {
      const bool = filters.in_stock === 'true';
      if (!!s.in_stock !== bool) return false;
    }
    if (filters.guarantee !== '') {
      const bool = filters.guarantee === 'true';
      if (!!s.guarantee !== bool) return false;
    }
    if (filters.provider && !(s.provider || '').toLowerCase().includes(filters.provider.toLowerCase())) return false;
    if (filters.min_rating !== '' && s.rating != null && Number(s.rating) < Number(filters.min_rating)) return false;
    if (filters.min_price !== '' && s.price != null && Number(s.price) < Number(filters.min_price)) return false;
    if (filters.max_price !== '' && s.price != null && Number(s.price) > Number(filters.max_price)) return false;
    return true;
  });

  const toggleSelectAllDisplayed = (checked) => {
    if (checked) {
      const ids = filteredServices.map(s => s.id);
      setSelectedIds(ids);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectOne = (id, checked) => {
    setSelectedIds(prev => {
      const set = new Set(prev);
      if (checked) set.add(id); else set.delete(id);
      return Array.from(set);
    });
  };

  const bulkDeleteSelected = async () => {
    if (!selectedIds || selectedIds.length === 0) return;
    if (!confirm(`Supprimer ${selectedIds.length} service(s) sélectionné(s) ?`)) return;
    try {
      await Promise.all(selectedIds.map(id => servicesApi.remove(id)));
      setServices(prev => prev.filter(s => !selectedIds.includes(s.id)));
      setSelectedIds([]);
    } catch (e) {
      alert(e?.message || 'Erreur lors de la suppression en masse');
    }
  };

  // Bulk import (Services)
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkParsing, setBulkParsing] = useState(false);
  const [bulkRows, setBulkRows] = useState([]);
  const [bulkErrors, setBulkErrors] = useState([]);
  const [bulkFileName, setBulkFileName] = useState('');

  const handleBulkImportClick = () => {
    const el = document.getElementById('bulk-file-input');
    if (el) el.click();
  };

  // Export de modèles à remplir pour import bulk
  const downloadFile = (filename, content, mime) => {
    const blob = new Blob([content], { type: mime || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportCSVTemplate = () => {
    const headers = [
      'category_id','title','description','duration','price','price_type',
      'image_url','cover_url','featured','rating','review_count','provider','provider_rating',
      'in_stock','guarantee','original_price','discount','is_active'
    ];
    const example = [
      1,
      'Nom du service',
      'Description sans virgule',
      '2h',
      150000,
      'fixe',
      'https://exemple.com/image.jpg',
      'https://exemple.com/cover.jpg',
      'true',
      4.5,
      12,
      'DigitalPro',
      4.7,
      'true',
      'false',
      180000,
      10,
      'true'
    ];
    const csv = headers.join(',') + '\n' + example.join(',');
    downloadFile('services_template.csv', csv, 'text/csv;charset=utf-8;');
  };

  const exportJSONTemplate = () => {
    const template = [{
      category_id: 1,
      title: "Nom du service",
      description: "Description sans virgule",
      duration: "2h",
      price: 150000,
      price_type: "fixe",
      image_url: "https://exemple.com/image.jpg",
      cover_url: "https://exemple.com/cover.jpg",
      featured: true,
      rating: 4.5,
      review_count: 12,
      provider: "DigitalPro",
      provider_rating: 4.7,
      in_stock: true,
      guarantee: false,
      original_price: 180000,
      discount: 10,
      is_active: true
    }];
    const json = JSON.stringify(template, null, 2);
    downloadFile('services_template.json', json, 'application/json');
  };

  const parseCSV = (text) => {
    // Supporte champs entre guillemets avec virgules et doubles quotes échappés
    const normalize = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    const rawLines = normalize.split('\n');
    const lines = rawLines.filter(l => l != null && l.trim().length > 0);
    if (lines.length === 0) return [];
    const splitCSVLine = (line) => {
      const out = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const ch = line[i];
        if (ch === '"') {
          if (inQuotes && line[i + 1] === '"') {
            // double quote échappé
            cur += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (ch === ',' && !inQuotes) {
          out.push(cur);
          cur = '';
        } else {
          cur += ch;
        }
      }
      out.push(cur);
      return out;
    };
    const headers = splitCSVLine(lines[0]).map(h => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = splitCSVLine(lines[i]).map(c => {
        const trimmed = c.trim();
        // enlève guillemets en bordure
        if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
          return trimmed.slice(1, -1);
        }
        return trimmed;
      });
      if (cols.length < headers.length) {
        // complète colonnes manquantes par chaîne vide
        while (cols.length < headers.length) cols.push('');
      }
      const obj = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = cols[j];
      }
      rows.push(obj);
    }
    return rows;
  };

  const sanitizeRow = (row) => {
    const toBool = (v, def = false) => v === true || v === 'true' || v === 1 || v === '1' ? true : (v === false || v === 'false' || v === 0 || v === '0' ? false : def);
    const toNumOrNull = (v) => v == null || v === '' ? null : Number(v);
    const toNumOrZero = (v) => v == null || v === '' ? 0 : Number(v);

    const category_id = row.category_id != null ? Number(row.category_id) : null;
    const title = (row.title ?? '').toString().trim();
    const description = row.description == null || row.description === '' ? null : row.description;
    const duration = row.duration == null || row.duration === '' ? null : row.duration;
    const price = toNumOrNull(row.price);
    const price_type = row.price_type === 'fixe' ? 'fixe' : 'sur_devis';
    const image_url = row.image_url == null || row.image_url === '' ? null : row.image_url;
    const cover_url = row.cover_url == null || row.cover_url === '' ? null : row.cover_url;
    const featured = toBool(row.featured, false);
    const rating = toNumOrNull(row.rating);
    const review_count = toNumOrZero(row.review_count);
    const provider = row.provider == null || row.provider === '' ? null : row.provider;
    const provider_rating = toNumOrNull(row.provider_rating);
    const in_stock = toBool(row.in_stock, true);
    const guarantee = toBool(row.guarantee, false);
    const original_price = toNumOrNull(row.original_price);
    const discount = toNumOrNull(row.discount);
    const is_active = toBool(row.is_active, true);

    return {
      category_id, title, description, duration, price, price_type,
      image_url, cover_url, featured, rating, review_count, provider, provider_rating,
      in_stock, guarantee, original_price, discount, is_active
    };
  };

  const handleBulkFileSelected = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setBulkParsing(true);
    setBulkErrors([]);
    setBulkRows([]);
    setBulkFileName(file.name);
    try {
      const text = await file.text();
      let rows = [];
      if (file.name.toLowerCase().endsWith('.json')) {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) throw new Error('Le JSON doit être un tableau d\'objets');
        rows = parsed;
      } else if (file.name.toLowerCase().endsWith('.csv')) {
        rows = parseCSV(text);
      } else {
        throw new Error('Format non supporté. Utilise .json ou .csv');
      }

      // Validation minimale
      const errors = [];
      const prepared = [];
      rows.forEach((r, idx) => {
        try {
          const clean = sanitizeRow(r);
          if (!clean.title) throw new Error('title manquant');
          if (!clean.category_id) throw new Error('category_id manquant');
          prepared.push(clean);
        } catch (err) {
          errors.push({ index: idx, error: err.message });
        }
      });
      setBulkRows(prepared);
      setBulkErrors(errors);
      setBulkModalOpen(true);
    } catch (err) {
      setBulkErrors([{ index: -1, error: err.message }]);
      setBulkModalOpen(true);
    } finally {
      setBulkParsing(false);
    }
  };

  const loadServices = async () => {
    setLoadingServices(true);
    try {
      const rows = await servicesApi.list();
      setServices(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setServiceError(e?.message || 'Erreur de chargement');
    } finally {
      setLoadingServices(false);
    }
  };

  useEffect(() => { loadServices(); }, []);

  const openNewService = () => {
    const firstCategoryId = (serviceCategories && serviceCategories[0]?.id) || null;
    setServiceFormData({
      id: null,
      category_id: firstCategoryId,
      title: '',
      description: '',
      duration: '',
      price: '',
      price_type: 'sur_devis',
      image_url: '',
      cover_url: '',
      featured: false,
      rating: '',
      review_count: 0,
      provider: '',
      provider_rating: '',
      in_stock: true,
      guarantee: false,
      original_price: '',
      discount: '',
      is_active: true,
      features_raw: '',
      deliverables_raw: '',
    });
    setServiceFormOpen(true);
  };

  const openEditService = (svc) => {
    setServiceFormData({
      id: svc.id,
      category_id: svc.category_id || null,
      title: svc.title || '',
      description: svc.description || '',
      duration: svc.duration || '',
      price: svc.price ?? '',
      price_type: svc.price_type || 'sur_devis',
      image_url: svc.image_url || '',
      cover_url: svc.cover_url || '',
      featured: !!svc.featured,
      rating: svc.rating ?? '',
      review_count: Number.isFinite(svc.review_count) ? svc.review_count : 0,
      provider: svc.provider || '',
      provider_rating: svc.provider_rating ?? '',
      in_stock: svc.in_stock !== undefined ? !!svc.in_stock : true,
      guarantee: svc.guarantee !== undefined ? !!svc.guarantee : false,
      original_price: svc.original_price ?? '',
      discount: svc.discount ?? '',
      is_active: Boolean(svc.is_active),
      created_at: svc.created_at || '',
      updated_at: svc.updated_at || '',
      features_raw: Array.isArray(svc.features) ? svc.features.join('\n') : '',
      deliverables_raw: Array.isArray(svc.deliverables) ? svc.deliverables.join('\n') : '',
    });
    setServiceFormOpen(true);
  };

  const saveService = async () => {
    setServiceSaving(true);
    setServiceError(null);
    try {
      const payload = {
        category_id: serviceFormData.category_id ? Number(serviceFormData.category_id) : null,
        title: serviceFormData.title?.trim(),
        description: serviceFormData.description?.trim() || null,
        duration: serviceFormData.duration?.trim() || null,
        price: serviceFormData.price === '' || serviceFormData.price === null ? null : Number(serviceFormData.price),
        price_type: serviceFormData.price_type === 'fixe' ? 'fixe' : 'sur_devis',
        image_url: serviceFormData.image_url?.trim() || null,
        cover_url: serviceFormData.cover_url?.trim() || null,
        featured: !!serviceFormData.featured,
        rating: serviceFormData.rating === '' || serviceFormData.rating === null ? null : Number(serviceFormData.rating),
        review_count: serviceFormData.review_count === '' || serviceFormData.review_count === null ? 0 : Number(serviceFormData.review_count),
        provider: serviceFormData.provider?.trim() || null,
        provider_rating: serviceFormData.provider_rating === '' || serviceFormData.provider_rating === null ? null : Number(serviceFormData.provider_rating),
        in_stock: !!serviceFormData.in_stock,
        guarantee: !!serviceFormData.guarantee,
        original_price: serviceFormData.original_price === '' || serviceFormData.original_price === null ? null : Number(serviceFormData.original_price),
        discount: serviceFormData.discount === '' || serviceFormData.discount === null ? null : Number(serviceFormData.discount),
        is_active: Boolean(serviceFormData.is_active),
      };
      const featuresArr = (serviceFormData.features_raw || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      const deliverablesArr = (serviceFormData.deliverables_raw || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);
      if (featuresArr.length > 0) payload.features = featuresArr;
      if (deliverablesArr.length > 0) payload.deliverables = deliverablesArr;
      if (!payload.title) throw new Error('Le titre est requis');
      if (!payload.category_id) throw new Error('La catégorie est requise');
      if (serviceFormData.id) {
        await servicesApi.update(serviceFormData.id, payload);
      } else {
        await servicesApi.create(payload);
      }
      await loadServices();
      setServiceFormOpen(false);
    } catch (e) {
      setServiceError(e?.message || 'Erreur de sauvegarde');
    } finally {
      setServiceSaving(false);
    }
  };

  const submitBulkImport = async () => {
    try {
      if (!bulkRows || bulkRows.length === 0) {
        setBulkErrors([{ index: -1, error: 'Aucune ligne préparée à importer' }]);
        return;
      }
      const res = await servicesApi.bulkCreate(bulkRows);
      await loadServices();
      setBulkModalOpen(false);
      // Optionnel: afficher résumé via alert simple
      alert(`Import terminé: ${res.created_count || bulkRows.length} créés, ${res.error_count || 0} erreurs`);
    } catch (e) {
      setBulkErrors([{ index: -1, error: e?.message || 'Erreur import' }]);
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Supprimer ce service ?')) return;
    try {
      await servicesApi.remove(id);
      setServices(prev => prev.filter(s => s.id !== id));
    } catch (e) {
      alert(e?.message || 'Erreur lors de la suppression');
    }
  };

  const navigate = useNavigate();
  const location = useLocation();
 const menuItems = [
    { id: 'dashboard', name: 'Tableau de bord', icon: Home, path: '/backoffice/dashboard' },
    { id: 'devis', name: 'Suivi devis', icon: FileText, path: '/backoffice/devis' },
    { id: 'appointments', name: 'Rendez-vous', icon: Calendar, path: '/backoffice/appointments' },
    { id: 'projets', name: 'Projets', icon: DivideSquare, path: '/backoffice/projets' },
    { id: 'contacts', name: 'Contacts', icon: Phone, path: '/backoffice/contacts' },
    { id: 'users', name: 'Utilisateurs', icon: Users, path: '/backoffice/users' },
    { id: 'messages', name: 'Messagerie', icon: Mail, path: '/backoffice/messages' },
    { id: 'clients', name: 'Clients', icon: Users, path: '/backoffice/clients' },
    { id: 'team', name: 'Équipe', icon: Award, path: '/backoffice/teams' },
    { id: 'finance', name: 'Finance', icon: DollarSign, path: '/backoffice/invoices' },
    { id: 'planning', name: 'Emploi du temps', icon: ChartGantt, path: '/backoffice/planning' },
    { id: 'privacy-terms', name: 'Confidentialité et termes', icon: ShieldCheck, path: '/backoffice/privacy-terms' },
    { id: 'settings', name: 'Paramètres', icon: Settings, path: '/backoffice/parametre' },
  ];

  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/backoffice/services')) setActiveMenu('projects');
    else if (p.includes('/backoffice/devis')) setActiveMenu('devis');
    else if (p.includes('/backoffice/appointments')) setActiveMenu('appointments');
    else if (p.includes('/backoffice/projets')) setActiveMenu('projets');
    else if (p.includes('/backoffice/contacts')) setActiveMenu('contacts');
    else if (p.includes('/backoffice/users')) setActiveMenu('users');
    else if (p.includes('/backoffice/parametre')) setActiveMenu('settings');
    else if (p.includes('/backoffice/messages')) setActiveMenu('messages');
    else if (p.includes('/backoffice/clients')) setActiveMenu('clients');
    else if (p.includes('/backoffice/teams')) setActiveMenu('team');
    else if (p.includes('/backoffice/invoices')) setActiveMenu('finance');
    else if (p.includes('/backoffice/privacy-terms')) setActiveMenu('privacy-terms');
    else if (p.includes('/backoffice/planning')) setActiveMenu('planning');
    else setActiveMenu('dashboard');
  }, [location.pathname]);

  // Lorsque l'on arrive sur "/backoffice/parametre", ouvrir directement l'onglet "Paramètres Système"
  useEffect(() => {
    if (activeMenu === 'settings' && activeTab !== 'Paramètres Système') {
      setActiveTab('Paramètres Système');
    }
  }, [activeMenu]);

  const getStatusColor = (statut) => {
    const colors = {
      'Actif': 'bg-green-100 text-green-800',
      'Inactif': 'bg-gray-100 text-gray-800',
      'Nouveau': 'bg-blue-100 text-blue-800',
      'En cours': 'bg-blue-100 text-blue-800',
      'Terminé': 'bg-green-100 text-green-800',
      'En révision': 'bg-yellow-100 text-yellow-800',
      'Planifié': 'bg-purple-100 text-purple-800',
      'Payée': 'bg-green-100 text-green-800', 'payée': 'bg-green-100 text-green-800',
      'No client': 'bg-blue-100 text-blue-800',
      'En attente': 'bg-yellow-100 text-yellow-800', 'en_attente': 'bg-yellow-100 text-yellow-800',
      'Envoyée': 'bg-blue-100 text-blue-800', 'envoyée': 'bg-blue-100 text-blue-800',
      'Refusée': 'bg-red-100 text-red-800', 'refusée': 'bg-red-100 text-red-800',
      'En retard': 'bg-red-100 text-red-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const _getPriorityColor = (priorite) => {
    const colors = {
      'Haute': 'text-red-600',
      'Moyenne': 'text-yellow-600',
      'Basse': 'text-green-600',
    };
    return colors[priorite] || 'text-gray-600';
  };

  // Messagerie: états
  const [messages, setMessages] = useState([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messageFormOpen, setMessageFormOpen] = useState(false);
  const [messageSaving, setMessageSaving] = useState(false);
  const [messageFormData, setMessageFormData] = useState({
    id: null,
    subject: '',
    body: '',
    sender_name: '',
    sender_email: '',
    recipient_name: '',
    recipient_email: '',
    status: 'new'
  });
  const [msgFilters, setMsgFilters] = useState({
    q: '',
    status: '',
    participant: '',
    from_date: '',
    to_date: '',
    limit: 20,
    offset: 0,
  });
  const STANDARD_EMAIL = import.meta.env.VITE_STANDARD_EMAIL || 'company.digital.noreply@gmail.com';
  const currentUserEmail = session.getSessionEmail();
  const currentUserRole = session.getSessionRole && session.getSessionRole();
  const isAdmin = String(currentUserRole || '').toLowerCase() === 'admin';
  const [groupMode, setGroupMode] = useState('none'); // none | subject | participants

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

  const loadMessages = async () => {
    try {
      setMessagesLoading(true);
      const res = await messagesApi.list({
        q: msgFilters.q || undefined,
        status: msgFilters.status || undefined,
        participant: msgFilters.participant || undefined,
        from_date: msgFilters.from_date || undefined,
        to_date: msgFilters.to_date || undefined,
        limit: msgFilters.limit || undefined,
        offset: msgFilters.offset || undefined,
      });
      setMessages(Array.isArray(res) ? res : (res?.rows || []));
    } catch (e) {
      alert(e?.message || 'Erreur chargement des messages');
    } finally {
      setMessagesLoading(false);
    }
  };

useEffect(() => { if (activeMenu === 'messages') loadMessages(); }, [activeMenu]);
useEffect(() => { if (activeMenu === 'contacts') loadContacts(); }, [activeMenu]);
useEffect(() => { if (activeMenu === 'users') loadUsersTable(); }, [activeMenu]);
useEffect(() => { if (activeMenu === 'finance') { loadPaymentsTable(); loadInvoices(); } }, [activeMenu]);

  const openNewMessage = () => {
    setMessageFormData({
      id: null,
      subject: '',
      body: '',
      sender_name: '',
      sender_email: currentUserEmail || '',
      recipient_name: '',
      recipient_email: '',
      status: 'new'
    });
    setMessageFormOpen(true);
  };

  const openEditMessage = (m) => {
    setMessageFormData({
      id: m.id,
      subject: m.subject || '',
      body: m.body || '',
      sender_name: m.sender_name || '',
      sender_email: m.sender_email || currentUserEmail || '',
      recipient_name: m.recipient_name || '',
      recipient_email: m.recipient_email || '',
      status: m.status || 'new'
    });
    setMessageFormOpen(true);
  };

  const openReplyMessage = (m) => {
    // Prépare une réponse adressée uniquement au client concerné
    setMessageFormData({
      id: null,
      subject: m.subject ? `Re: ${m.subject}` : 'Re: (Sans objet)',
      body: '',
      sender_name: '',
      sender_email: currentUserEmail || '',
      recipient_name: m.sender_name || '',
      recipient_email: m.sender_email || '',
      status: 'new'
    });
    setMessageFormOpen(true);
  };

  const saveMessage = async () => {
    try {
      setMessageSaving(true);
      const payload = { ...messageFormData };
      if (payload.id) {
        await messagesApi.update(payload.id, payload);
      } else {
        await messagesApi.create(payload);
      }
      setMessageFormOpen(false);
      await loadMessages();
    } catch (e) {
      alert(e?.message || 'Erreur enregistrement du message');
    } finally {
      setMessageSaving(false);
    }
  };

  const renderPrivacy = () => (
    <div className="space-y-6">
      <PrivacyTerms />
    </div>
  );
  const deleteMessage = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await messagesApi.remove(id);
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      alert(e?.message || 'Erreur suppression');
    }
  };

  const renderMessages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold">Messagerie</h2>
          <span className="text-xs text-gray-500">CRUD + filtrage avancé</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={openNewMessage} className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Nouveau message
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[220px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Recherche (objet ou contenu)</label>
          <input type="text" value={msgFilters.q} onChange={(e)=>setMsgFilters(f=>({...f,q:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" placeholder="Tapez pour filtrer…" />
        </div>
        <div className="min-w-[160px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
          <select value={msgFilters.status} onChange={(e)=>setMsgFilters(f=>({...f,status:e.target.value}))} className="w-full px-3 py-2 border rounded-lg">
            <option value="">Tous</option>
            <option value="new">Nouveau</option>
            <option value="read">Lu</option>
            <option value="archived">Archivé</option>
          </select>
        </div>
        <div className="min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">Participant (email)</label>
          <input type="email" value={msgFilters.participant} onChange={(e)=>setMsgFilters(f=>({...f,participant:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" placeholder="@email" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Du</label>
          <input type="date" value={msgFilters.from_date} onChange={(e)=>setMsgFilters(f=>({...f,from_date:e.target.value}))} className="px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Au</label>
          <input type="date" value={msgFilters.to_date} onChange={(e)=>setMsgFilters(f=>({...f,to_date:e.target.value}))} className="px-3 py-2 border rounded-lg" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Par page</label>
          <select value={msgFilters.limit} onChange={(e)=>setMsgFilters(f=>({...f,limit:Number(e.target.value)}))} className="px-3 py-2 border rounded-lg">
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Groupement</label>
          <select value={groupMode} onChange={(e)=>setGroupMode(e.target.value)} className="px-3 py-2 border rounded-lg">
            <option value="none">Aucun</option>
            <option value="subject">Par sujet</option>
            <option value="participants">Par participants</option>
          </select>
        </div>
        <div className="ml-auto flex gap-2">
          <button onClick={() => { setMsgFilters(f=>({...f,offset:0})); loadMessages(); }} className="px-3 py-2 border rounded-lg">Rechercher</button>
          <button onClick={() => { setMsgFilters({ q:'', status:'', participant:'', from_date:'', to_date:'', limit:20, offset:0 }); loadMessages(); }} className="px-3 py-2 border rounded-lg">Réinitialiser</button>
          <button onClick={() => { setMsgFilters({ q:'', status:'', participant: STANDARD_EMAIL, from_date:'', to_date:'', limit:20, offset:0 }); loadMessages(); }} className="px-3 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700">Boîte Standard</button>
        </div>
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-3 border-b flex items-center justify-between">
          <div className="text-sm text-gray-600">{messagesLoading ? 'Chargement…' : `${messages.length} messages`}</div>
          <div className="flex items-center gap-2">
            <button onClick={() => setMsgFilters(f=>({ ...f, offset: Math.max(0, f.offset - f.limit) })) || loadMessages()} className="px-3 py-2 border rounded-lg">Précédent</button>
            <button onClick={() => setMsgFilters(f=>({ ...f, offset: f.offset + f.limit })) || loadMessages()} className="px-3 py-2 border rounded-lg">Suivant</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {(() => {
            const source = applyGlobalFilters(messages || []);
            const groups = buildGroups(source, groupMode);
            return groups.map((g) => (
              <div key={(g.header?.key)||'all'} className="border-t overflow-x-auto">
                {g.header && (
                  <div className="bg-gray-50 px-3 py-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {groupMode === 'subject' ? (
                        <span className="text-sm font-semibold">Sujet: {g.header.subject || '(Sans objet)'}</span>
                      ) : (
                        <span className="text-sm font-semibold">Participants: {(g.header.participants || []).filter(Boolean).join(' ↔ ')}</span>
                      )}
                      <span className="text-xs text-gray-500">{g.items.length} message(s)</span>
                      {g.header.lastDate && (<span className="text-xs text-gray-500">Dernier: {g.header.lastDate.toLocaleString()}</span>)}
                    </div>
                  </div>
                )}
                <table className="w-full text-sm">
                  {!g.header && (
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Objet</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Expéditeur</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Destinataire</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Statut</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Créé</th>
                        <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">Actions</th>
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {g.items.map((m) => (
                      <tr key={m.id} className="border-t">
                        <td className="px-3 py-2">
                          <div className="font-medium">{m.subject || '(Sans objet)'}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[280px]">{m.body || ''}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm">{m.sender_name || ''}</div>
                          <div className="text-xs text-gray-500">{m.sender_email || ''}</div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-sm">{m.recipient_name || ''}</div>
                          <div className="text-xs text-gray-500">{m.recipient_email || ''}</div>
                        </td>
                        <td className="px-3 py-2">
                          <span className="px-2 py-1 rounded text-xs border">{m.status || '—'}</span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600">{m.created_at ? new Date(m.created_at).toLocaleString() : '—'}</td>
                        <td className="px-3 py-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openReplyMessage(m)} className="px-2 py-1 border rounded-lg flex items-center gap-1 text-indigo-600"><Send className="w-4 h-4" /> Répondre</button>
                            <button onClick={() => openEditMessage(m)} className="px-2 py-1 border rounded-lg flex items-center gap-1"><Edit className="w-4 h-4" /> Éditer</button>
                            <button onClick={() => deleteMessage(m.id)} className="px-2 py-1 border rounded-lg flex items-center gap-1 text-red-600"><Trash2 className="w-4 h-4" /> Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {g.items.length === 0 && !messagesLoading && (
                      <tr><td colSpan="6" className="px-3 py-6 text-center text-gray-500">Aucun message trouvé.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Modal form */}
      {messageFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMessageFormOpen(false)} />
          <div className="relative bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-2xl">
            <h4 className="text-lg font-semibold mb-4">{messageFormData.id ? 'Modifier le message' : 'Nouveau message'}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Objet</label>
                <input type="text" value={messageFormData.subject} onChange={(e)=>setMessageFormData(d=>({...d,subject:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Contenu</label>
                <textarea value={messageFormData.body} onChange={(e)=>setMessageFormData(d=>({...d,body:e.target.value}))} className="w-full px-3 py-2 border rounded-lg min-h-[120px]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom expéditeur</label>
                <input type="text" value={messageFormData.sender_name} onChange={(e)=>setMessageFormData(d=>({...d,sender_name:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email expéditeur</label>
                <input type="email" value={messageFormData.sender_email} onChange={(e)=>setMessageFormData(d=>({...d,sender_email:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom destinataire</label>
                <input type="text" value={messageFormData.recipient_name} onChange={(e)=>setMessageFormData(d=>({...d,recipient_name:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email destinataire</label>
                <input type="email" value={messageFormData.recipient_email} onChange={(e)=>setMessageFormData(d=>({...d,recipient_email:e.target.value}))} className="w-full px-3 py-2 border rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={messageFormData.status} onChange={(e)=>setMessageFormData(d=>({...d,status:e.target.value}))} className="w-full px-3 py-2 border rounded-lg">
                  <option value="new">Nouveau</option>
                  <option value="read">Lu</option>
                  <option value="archived">Archivé</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setMessageFormOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button onClick={saveMessage} disabled={messageSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                {messageSaving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}
   </div>
 );

  // État et handlers pour CRUD Projets
  const [_projectSearch, _setProjectSearch] = useState('');
  const [_projectStatusFilter, _setProjectStatusFilter] = useState('');
  const [_projectPriorityFilter, _setProjectPriorityFilter] = useState('');
  const [_projectFormOpen, setProjectFormOpen] = useState(false);
  const [projectFormData, setProjectFormData] = useState({
    id: null,
    nom: '',
    client: '',
    statut: 'Planifié',
    progression: 0,
    budget: '',
    deadline: '',
    priorite: 'Moyenne',
  });

  const resetProjectForm = () => setProjectFormData({
    id: null,
    nom: '',
    client: '',
    statut: 'Planifié',
    progression: 0,
    budget: '',
    deadline: '',
    priorite: 'Moyenne',
  });

  const nextProjectId = () => (projects.length ? Math.max(...projects.map(p => p.id)) + 1 : 1);

  const _handleAddProject = () => {
    resetProjectForm();
    setProjectFormOpen(true);
  };

  const _handleEditProject = (project) => {
    setProjectFormData(project);
    setProjectFormOpen(true);
  };

  const _handleDeleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const _handleSaveProject = () => {
    if (!projectFormData.nom || !projectFormData.client) return;
    if (projectFormData.id == null) {
      const newProject = { ...projectFormData, id: nextProjectId() };
      setProjects(prev => [newProject, ...prev]);
    } else {
      setProjects(prev => prev.map(p => p.id === projectFormData.id ? { ...projectFormData } : p));
    }
    setProjectFormOpen(false);
    resetProjectForm();
  };


  

  const renderDashboard = () => (
    <DashboardComponent />
  );

  const renderProjects = () => (
    <ComponentProjets/>
  );

  const openModalClient = (e, c) => {
    e.preventDefault();
    setSelectedClient(c || null);
    setIsOpenClient(true);
  }

  const openQuoteForClient = () => {
    if (!selectedClient) return;
    setSelectedDevisRequest({
      id: null,
      full_name: selectedClient.nom || selectedClient.contact || '',
      email: selectedClient.email || '',
      phone: selectedClient.telephone || '',
      project_type: '',
      project_description: '',
      attachment_url: null,
      status: 'reçu',
    });
    setShowQuoteModal(true);
  };
  const renderClients = () => (
    <div className=" relative z-100 overflow-hidden space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
      </div>

      {(() => {
        const filtered = applyGlobalFilters(clients);
        return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.map((client) => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold overflow-hidden text-lg">
                  <img src={client.avatar} className='w-full' alt={client.nom} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{client.nom}</h3>
                  <p className="text-sm text-gray-600">{client.contact}</p>
                </div>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(client.statut)}`}>
                {client.statut}
              </span>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{client.telephone}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Projets</p>
                  <p className="text-lg font-bold text-gray-900">{client.projets}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Valeur totale</p>
                  <p className="text-sm font-semibold text-green-600">{client.valeur}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Client depuis</p>
                  <p className="text-xs font-medium text-gray-900">{client.depuis}</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-3 border-t border-gray-100">
                <button 
                onClick={(e) => openModalClient(e, client)}
                className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
                  Voir profil
                </button>
                <button className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100">
                  Contacter
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
        );
      })()}

{isOpenClient && selectedClient && (
  <div className="fixed top-0 right-0 h-full w-full bg-black/50 z-50">

    <div className="absolute top-0 right-0 h-full w-96 bg-white rounded-l-xl shadow-lg flex flex-col animate-slide-left">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
        <button
          onClick={() => { setIsOpenClient(false); setSelectedClient(null); }}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900">Détails du client</h2>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="p-6 overflow-y-auto space-y-6">
        
        {/* Avatar */}
        <div className="flex justify-center py-4">
          <div className="w-32 h-32 rounded-full overflow-hidden shadow-sm">
            <img
              src={selectedClient.avatar}
              className="w-full h-full object-cover"
              alt={selectedClient.nom}
            />
          </div>
        </div>

        {/* Infos */}
        <div className="space-y-4">
          <div>
            <p className="text-xs text-gray-500">Nom</p>
            <p className="text-sm font-medium">{selectedClient.nom}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Contact</p>
            <p className="text-sm">{selectedClient.contact || "—"}</p>
          </div>

          <div>
            <p className="text-xs text-gray-500">Email</p>
            <a
              href={`mailto:${selectedClient.email}`}
              className="text-sm text-blue-600 hover:underline"
            >
              {selectedClient.email || "—"}
            </a>
          </div>

          <div>
            <p className="text-xs text-gray-500">Téléphone</p>
            <p className="text-sm">{selectedClient.telephone || "—"}</p>
          </div>

          {/* Statut + Projets */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Statut</p>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                ${selectedClient.statut === "Actif" 
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
                }`}>
                {selectedClient.statut}
              </span>
            </div>

            <div>
              <p className="text-xs text-gray-500">Projets</p>
              <p className="text-sm">{selectedClient.projets}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-500">Client depuis</p>
            <p className="text-sm">{selectedClient.depuis || "—"}</p>
          </div>

          {/* Infos compte */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-gray-500">Type de client</p>
              <p className="text-sm">
                {Number.isInteger(selectedClient.id) ? "Inscrit" : "Invité"}
              </p>
            </div>

            <div>
              <p className="text-xs text-gray-500">Identifiant</p>
              <p className="text-xs break-all">{selectedClient.id}</p>
            </div>
          </div>

          {/* Actions rapides */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <a
              href={`mailto:${selectedClient.email}`}
              className="px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-xs font-medium text-center hover:bg-blue-100"
            >
              Email
            </a>
            <a
              href={selectedClient.telephone ? `tel:${selectedClient.telephone}` : "#"}
              className="px-3 py-2 bg-green-50 text-green-600 rounded-lg text-xs font-medium text-center hover:bg-green-100"
            >
              Appeler
            </a>
            <button
              onClick={openQuoteForClient}
              className="px-3 py-2 bg-purple-50 text-purple-600 rounded-lg text-xs font-medium text-center hover:bg-purple-100"
            >
              Créer devis
            </button>
          </div>

        </div>

        {/* Demandes de devis */}
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-900 mb-2">
            Demandes de devis
          </p>

          <div className="space-y-3 max-h-52 overflow-y-auto pr-2">
            {(allDevisRequests || [])
              .filter(
                (r) =>
                  String(r.email).trim().toLowerCase() ===
                  String(selectedClient.email).trim().toLowerCase()
              ).length === 0 ? (
              <p className="text-sm text-gray-600">
                Aucun devis trouvé pour ce client.
              </p>
            ) : (
              (allDevisRequests || [])
                .filter(
                  (r) =>
                    String(r.email).trim().toLowerCase() ===
                    String(selectedClient.email).trim().toLowerCase()
                )
                .map((r) => (
                  <div key={r.id} className="border border-gray-100 rounded-lg p-3 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500">#{r.id}</p>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-medium bg-gray-100 text-gray-800">
                        {r.status || "reçu"}
                      </span>
                    </div>

                    <p className="text-sm text-gray-900">{r.project_type}</p>
                    <p className="text-xs text-gray-600">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}
                    </p>

                    {r.attachment_url && (
                      <a
                        href={r.attachment_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Voir pièce jointe
                      </a>
                    )}

                    <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500"
                        style={{ width: `${getProgressFromStatus(r.status)}%` }}
                      />
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

      </div>
    </div>
  </div>
)}

    {/* Fin du wrapper clients */}
    </div>
  );

  const renderPlanning = () => (
    <div className="">
      <PlanningComponent/>
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestion de l'équipe</h2>
        <button onClick={openUsersModal} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 text-sm">
          <Plus className="w-5 h-5" />
          <span>Nouveau membre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teamMembers.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3">
                <img src={member.avatar} className='w-full h-full rounded-full' alt={member.nom} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{member.nom}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
              <p className="text-sm text-gray-600">{member.poste}</p>
              <p className="text-xs text-gray-500 mt-1">{member.email}</p>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Disponibilité</span>
                  <span className="font-medium text-gray-900">{member.disponibilite}%</span>
                </div>
                <div className="bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${member.disponibilite > 70 ? 'bg-green-500' : member.disponibilite > 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${member.disponibilite}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-600">Projets actifs</p>
                  <p className="text-lg font-bold text-gray-900">{member.projets}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                    <Mail className="w-4 h-4" />
                  </button>
                  <button onClick={() => openTeamEdit(member)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {teamEditOpen && teamEditData && (
        <div className="fixed top-0 right-0 h-full w-full bg-black/50 z-50">
          <div className="absolute top-0 right-0 h-full w-96 bg-white rounded-l-xl shadow-lg flex flex-col animate-slide-left">
            {/* HEADER */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <button
                onClick={closeTeamEdit}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Éditer le membre</h2>
            </div>

            {/* CONTENU */}
            <div className="p-6 overflow-y-auto space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Nom</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={teamEditData.nom || ''}
                  onChange={(e) => handleTeamEditChange('nom', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Poste</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={teamEditData.poste || ''}
                  onChange={(e) => handleTeamEditChange('poste', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Rôle</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={teamEditData.role || ''}
                  onChange={(e) => handleTeamEditChange('role', e.target.value)}
                >
                  <option value="Administrateur">Administrateur</option>
                  <option value="Manager">Manager</option>
                  <option value="User">Utilisateur</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Email</label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={teamEditData.email || ''}
                  onChange={(e) => handleTeamEditChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-gray-500">Disponibilité (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  value={teamEditData.disponibilite ?? 0}
                  onChange={(e) => handleTeamEditChange('disponibilite', Number(e.target.value))}
                />
              </div>
            </div>

            {/* FOOTER */}
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-2">
              <button onClick={closeTeamEdit} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">Annuler</button>
              <button onClick={saveTeamEdit} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      {usersModalOpen && (
        <div className="fixed top-0 right-0 h-full w-full bg-black/50 z-50">
          <div className="absolute top-0 right-0 h-full w-[480px] bg-white rounded-l-xl shadow-lg flex flex-col animate-slide-left">
            {/* HEADER */}
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
              <button
                onClick={closeUsersModal}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Tous les utilisateurs</h2>
            </div>

            {/* BARRE DE RECHERCHE */}
            <div className="px-6 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Rechercher par nom ou email..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={usersQuery}
                  onChange={(e) => setUsersQuery(e.target.value)}
                />
              </div>
            </div>

            {/* LISTE */}
            <div className="p-6 overflow-y-auto flex-1">
              {usersLoading ? (
                <p className="text-sm text-gray-600">Chargement...</p>
              ) : usersError ? (
                <p className="text-sm text-red-600">{usersError}</p>
              ) : (
                <div className="space-y-2">
                  {usersList
                    .filter(u => {
                      const q = usersQuery.trim().toLowerCase();
                      if (!q) return true;
                      return (
                        String(u.first_name || '').toLowerCase().includes(q) ||
                        String(u.last_name || '').toLowerCase().includes(q) ||
                        String(u.email || '').toLowerCase().includes(q)
                      );
                    })
                    .map(u => {
                      const name = `${u.first_name || ''} ${u.last_name || ''}`.trim() || (u.email || 'Utilisateur');
                      const role = String(u.role || '').toLowerCase();
                      const canEdit = role === 'user';
                      return (
                        <div key={u.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{name}</p>
                            <p className="text-xs text-gray-600">{u.email}</p>
                            <span className={`mt-1 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${role === 'admin' ? 'bg-purple-100 text-purple-700' : role === 'manager' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                              {role}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => startEditUserRole(u)}
                              disabled={!canEdit}
                              className={`px-3 py-2 rounded-lg text-sm font-medium ${canEdit ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                            >
                              Modifier rôle
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>

            {/* FORMULAIRE DE MODIFICATION DU RÔLE */}
            {selectedUserForRole && (
              <div className="px-6 pb-4 border-t border-gray-100">
                <p className="text-sm font-semibold text-gray-900 mb-2">Modifier le rôle pour {`${selectedUserForRole.first_name || ''} ${selectedUserForRole.last_name || ''}`.trim() || selectedUserForRole.email}</p>
                <div className="space-y-2">
                  <label className="text-xs text-gray-500">Nouveau rôle</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    value={selectedUserForRole.nextRole}
                    onChange={(e) => handleChangeRoleSelection(e.target.value)}
                  >
                    <option value="manager">Manager</option>
                    <option value="admin">Administrateur</option>
                    <option value="User">Utilisateur</option>
                  </select>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <button onClick={() => setSelectedUserForRole(null)} className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">Annuler</button>
                  <button onClick={saveUserRoleUpdate} disabled={roleUpdateSaving} className="px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm">
                    {roleUpdateSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderTeamSecured = () => {
    if (!isAdmin) {
      return (
        <div className="flex items-center justify-center h-full p-8">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
            <div className="mx-auto mb-3 w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center">
              <Lock className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Accès refusé</h3>
            <p className="mt-1 text-sm text-gray-600">Cette section est réservée aux administrateurs.</p>
          </div>
        </div>
      );
    }
    return renderTeam();
  };

  const renderFinance = () => {
    const stats = computeFinanceStats(invoices);
    const yoyLabel = stats?.yoyDeltaPct === null
      ? '— vs année dernière'
      : `${stats.yoyDeltaPct >= 0 ? '+' : ''}${Number(stats.yoyDeltaPct).toFixed(1)}% vs année dernière`;

    return (
      <div className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Revenus totaux</p>
                <p className="text-2xl font-bold text-gray-900">{formatEuro(stats.totalRevenue)}</p>
              </div>
            </div>
            <p className={`text-sm ${Number(stats?.yoyDeltaPct || 0) >= 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>{yoyLabel}</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">{formatEuro(stats.pendingAmount)}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">{stats.unpaidCount} factures impayées</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">En retard</p>
                <p className="text-2xl font-bold text-gray-900">{formatEuro(stats.overdueAmount)}</p>
              </div>
            </div>
            <p className="text-sm text-red-600 font-medium">Action requise</p>
          </div>
        </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-base md:text-lg font-semibold">Factures récentes</h3>
            
          </div>
          {/* Zone de filtrage avancé */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Rechercher (N°, email, client)"
                value={invoiceFilters.query}
                onChange={(e) => setInvoiceFilters(f => ({ ...f, query: e.target.value }))}
              />
            </div>
            <div>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={invoiceFilters.status}
                onChange={(e) => setInvoiceFilters(f => ({ ...f, status: e.target.value }))}
              >
                <option value="">Tous statuts</option>
                <option value="payée">Payée</option>
                <option value="refusée">Refusée</option>
                <option value="envoyée">Envoyée</option>
                <option value="en_attente">En attente</option>
              </select>
            </div>
            <div>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={invoiceFilters.issuedFrom}
                onChange={(e) => setInvoiceFilters(f => ({ ...f, issuedFrom: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={invoiceFilters.issuedTo}
                onChange={(e) => setInvoiceFilters(f => ({ ...f, issuedTo: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={invoiceFilters.dueFrom}
                onChange={(e) => setInvoiceFilters(f => ({ ...f, dueFrom: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                value={invoiceFilters.dueTo}
                onChange={(e) => setInvoiceFilters(f => ({ ...f, dueTo: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Montant min"
                value={invoiceFilters.minAmount}
                onChange={(e) => setInvoiceFilters(f => ({ ...f, minAmount: e.target.value }))}
              />
            </div>
            <div>
              <input
                type="number"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                placeholder="Montant max"
                value={invoiceFilters.maxAmount}
                onChange={(e) => setInvoiceFilters(f => ({ ...f, maxAmount: e.target.value }))}
              />
            </div>
          </div>
        </div>
        {invoiceError && (
          <div className="mt-2 text-sm text-red-600">{invoiceError}</div>
        )}
        {loadingInvoices && (
          <div className="mt-2 text-sm text-gray-600">Chargement des factures…</div>
        )}      
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Numéro</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Échéance</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {(() => {
                const todayStr = new Date().toISOString().slice(0,10);
                const q = String(invoiceFilters.query || '').trim().toLowerCase();
                const filtered = invoices.filter(inv => {
                  const matchesText = !q || [
                    `#${inv.id}`,
                    String(inv.requester_email || ''),
                    String(inv.client_name || '')
                  ].some(s => String(s).toLowerCase().includes(q));
                  const matchesStatus = !invoiceFilters.status || String(inv.status || '').toLowerCase() === String(invoiceFilters.status);
                  const issued = inv.issued_date ? String(inv.issued_date).slice(0,10) : '';
                  const matchesIssuedFrom = !invoiceFilters.issuedFrom || issued >= invoiceFilters.issuedFrom;
                  const matchesIssuedTo = !invoiceFilters.issuedTo || issued <= invoiceFilters.issuedTo;
                  const due = inv.due_date ? String(inv.due_date).slice(0,10) : '';
                  const matchesDueFrom = !invoiceFilters.dueFrom || (due && due >= invoiceFilters.dueFrom);
                  const matchesDueTo = !invoiceFilters.dueTo || (due && due <= invoiceFilters.dueTo);
                  const amt = Number(inv.amount || 0);
                  const minOk = !invoiceFilters.minAmount || amt >= Number(invoiceFilters.minAmount);
                  const maxOk = !invoiceFilters.maxAmount || amt <= Number(invoiceFilters.maxAmount);
                  return matchesText && matchesStatus && matchesIssuedFrom && matchesIssuedTo && matchesDueFrom && matchesDueTo && minOk && maxOk;
                });
                return filtered.map((invoice) => {
                  const dueStr = invoice.due_date ? String(invoice.due_date).slice(0,10) : '';
                  const isOverdue = Boolean(dueStr) && dueStr < todayStr && labelStatus(invoice.status) !== 'Payée';
                  const rowClass = isOverdue ? 'bg-orange-50' : 'hover:bg-gray-50';
                  return (
                    <tr key={invoice.id} className={rowClass}>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>#{invoice.id}</span>
                          <span className="text-xs text-gray-500 mt-1">TKT-{String(invoice.id).padStart(6, '0')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">{invoice.requester_email || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900">{formatEuro(invoice.amount)}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(labelStatus(invoice.status))}`}>
                          {labelStatus(invoice.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">{fmtDate(invoice.issued_date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{fmtDate(invoice.due_date)}</td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-800" title="Télécharger">
                            <Download className="w-4 h-4" />
                          </button>
                          {labelStatus(invoice.status) === 'Payée' ? (
                            <div className="flex space-x-2 opacity-50 cursor-not-allowed">
                              <button disabled className="text-green-600" title="Envoyer">
                                <Send className="w-4 h-4" />
                              </button>
                              <button disabled className="text-emerald-600" title="Marquer payée">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button disabled className="text-red-600" title="Refuser">
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <>
                              <button onClick={() => sendInvoiceEmail(invoice.id)} className="text-green-600 hover:text-green-800" title="Envoyer">
                                <Send className="w-4 h-4" />
                              </button>
                              <button onClick={() => setInvoiceStatus(invoice.id, 'payée')} className="text-emerald-600 hover:text-emerald-800" title="Marquer payée">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              {isAdmin && (
                                <button onClick={() => deleteInvoice(invoice.id)} className="text-gray-600 hover:text-red-700" title="Supprimer">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {(() => {
            const todayStr = new Date().toISOString().slice(0,10);
            const q = String(invoiceFilters.query || '').trim().toLowerCase();
            const filtered = invoices.filter(inv => {
              const matchesText = !q || [
                `#${inv.id}`,
                String(inv.requester_email || ''),
                String(inv.client_name || '')
              ].some(s => String(s).toLowerCase().includes(q));
              const matchesStatus = !invoiceFilters.status || String(inv.status || '').toLowerCase() === String(invoiceFilters.status);
              const issued = inv.issued_date ? String(inv.issued_date).slice(0,10) : '';
              const matchesIssuedFrom = !invoiceFilters.issuedFrom || issued >= invoiceFilters.issuedFrom;
              const matchesIssuedTo = !invoiceFilters.issuedTo || issued <= invoiceFilters.issuedTo;
              const due = inv.due_date ? String(inv.due_date).slice(0,10) : '';
              const matchesDueFrom = !invoiceFilters.dueFrom || (due && due >= invoiceFilters.dueFrom);
              const matchesDueTo = !invoiceFilters.dueTo || (due && due <= invoiceFilters.dueTo);
              const amt = Number(inv.amount || 0);
              const minOk = !invoiceFilters.minAmount || amt >= Number(invoiceFilters.minAmount);
              const maxOk = !invoiceFilters.maxAmount || amt <= Number(invoiceFilters.maxAmount);
              return matchesText && matchesStatus && matchesIssuedFrom && matchesIssuedTo && matchesDueFrom && matchesDueTo && minOk && maxOk;
            });
            return filtered.map((invoice) => {
              const dueStr = invoice.due_date ? String(invoice.due_date).slice(0,10) : '';
              const isOverdue = Boolean(dueStr) && dueStr < todayStr && labelStatus(invoice.status) !== 'Payée';
              const boxClass = isOverdue ? 'p-4 bg-orange-50' : 'p-4';
              return (
                <div key={invoice.id} className={boxClass}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-medium text-gray-900">#{invoice.id}</p>
                      <p className="text-xs text-gray-500 mt-1">TKT-{String(invoice.id).padStart(6, '0')}</p>
                      <p className="text-sm text-gray-600 mt-1">{invoice.requester_email || '—'}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(labelStatus(invoice.status))}`}>
                      {labelStatus(invoice.status)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="font-semibold text-gray-900">{formatEuro(invoice.amount)}</span>
                    <span className="text-gray-500">Échéance: {fmtDate(invoice.due_date)}</span>
                  </div>
                  <div className="flex space-x-3 mt-3">
                    {labelStatus(invoice.status) === 'Payée' ? (
                      <div className="flex space-x-3 opacity-50 cursor-not-allowed">
                        <button disabled className="text-green-600" title="Envoyer">
                          <Send className="w-4 h-4" />
                        </button>
                        <button disabled className="text-emerald-600" title="Marquer payée">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button disabled className="text-red-600" title="Refuser">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <button onClick={() => sendInvoiceEmail(invoice.id)} className="text-green-600 hover:text-green-800" title="Envoyer">
                          <Send className="w-4 h-4" />
                        </button>
                        <button onClick={() => setInvoiceStatus(invoice.id, 'payée')} className="text-emerald-600 hover:text-emerald-800" title="Marquer payée">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button onClick={() => deleteInvoice(invoice.id)} className="text-gray-600 hover:text-red-700" title="Supprimer">
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>
    </div>
  );
  // Fermeture de la fonction renderFinance
  };


  const renderSettings = () => (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span space-y-2">
          {['Profil', 'Catégorie', 'Service', 'Blog', 'Portfolio', 'Promo', 'Paramètres Système'].map((item) => (
            <button
              key={item}
              onClick={() => setActiveTab(item)}
              className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium 
                ${activeTab === item ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
            >
              {item}
            </button>
          ))}

        </div>

        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm p-6">
          {activeTab === "Profil" && (
            <div className="text-gray-700 text-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestion du Profil (AboutDigital)</h3>
                <div className="flex items-center gap-2">
                  <button onClick={openCreateProfile} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">Nouveau</button>
                  <button onClick={loadProfiles} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">Recharger</button>
                </div>
              </div>

              {profilesError && <div className="text-red-600">{profilesError}</div>}

              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-3 text-left">Titre</th>
                      <th className="p-3 text-left">Actif</th>
                      <th className="p-3 text-left">Maj</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(profiles) && profiles.length > 0 ? profiles.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">{p.title || '-'}</td>
                        <td className="p-3">{p.is_active ? 'Oui' : 'Non'}</td>
                        <td className="p-3">{p.updated_at || '-'}</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <button onClick={() => openEditProfile(p)} className="px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded">Éditer</button>
                            <button onClick={() => deleteProfile(p.id)} className="px-2 py-1 bg-red-50 hover:bg-red-100 rounded">Supprimer</button>
                          </div>
                        </td>
                      </tr>
                    )) : (
                      <tr><td className="p-3 text-gray-500" colSpan={4}>{profilesLoading ? 'Chargement...' : 'Aucun profil trouvé'}</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {profileFormOpen && (
                <div className="border rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600">Titre</label>
                      <input value={profileFormData.title} onChange={e=>setProfileFormData({...profileFormData, title: e.target.value})} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Sous-titre</label>
                      <input value={profileFormData.subtitle} onChange={e=>setProfileFormData({...profileFormData, subtitle: e.target.value})} className="w-full border rounded px-3 py-2" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs text-gray-600">Bannière URL</label>
                      <input value={profileFormData.banner_url} onChange={e=>setProfileFormData({...profileFormData, banner_url: e.target.value})} className="w-full border rounded px-3 py-2" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-600">Stats JSON</label>
                      <textarea rows={4} value={profileFormData.stats_json_raw} onChange={e=>setProfileFormData({...profileFormData, stats_json_raw: e.target.value})} className="w-full border rounded px-3 py-2 font-mono text-xs" />
                      {!isValidJson(profileFormData.stats_json_raw) && <div className="text-red-600 text-xs mt-1">JSON invalide</div>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Services JSON</label>
                      <textarea rows={4} value={profileFormData.services_json_raw} onChange={e=>setProfileFormData({...profileFormData, services_json_raw: e.target.value})} className="w-full border rounded px-3 py-2 font-mono text-xs" />
                      {!isValidJson(profileFormData.services_json_raw) && <div className="text-red-600 text-xs mt-1">JSON invalide</div>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Valeurs JSON</label>
                      <textarea rows={4} value={profileFormData.values_json_raw} onChange={e=>setProfileFormData({...profileFormData, values_json_raw: e.target.value})} className="w-full border rounded px-3 py-2 font-mono text-xs" />
                      {!isValidJson(profileFormData.values_json_raw) && <div className="text-red-600 text-xs mt-1">JSON invalide</div>}
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600">Équipe JSON</label>
                      <textarea rows={4} value={profileFormData.team_json_raw} onChange={e=>setProfileFormData({...profileFormData, team_json_raw: e.target.value})} className="w-full border rounded px-3 py-2 font-mono text-xs" />
                      {!isValidJson(profileFormData.team_json_raw) && <div className="text-red-600 text-xs mt-1">JSON invalide</div>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-gray-600">Actif</label>
                    <input type="checkbox" checked={!!profileFormData.is_active} onChange={e=>setProfileFormData({...profileFormData, is_active: e.target.checked ? 1 : 0})} />
                  </div>

                  <div className="flex items-center gap-2">
                    <button disabled={profileSaving} onClick={saveProfile} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">{profileSaving ? 'Enregistrement...' : 'Enregistrer'}</button>
                    <button onClick={()=>setProfileFormOpen(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">Annuler</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "Promo" && (
            <div className="text-gray-700 text-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestion de la Promo (page Pricing)</h3>
                <div className="flex items-center gap-2">
                  <button onClick={openCreatePromo} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">Nouvelle promo</button>
                  <button onClick={loadPromos} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">Recharger</button>
                </div>
              </div>

              {promoError && <div className="text-red-600">{promoError}</div>}
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-3 text-left">Titre</th>
                      <th className="p-3 text-left">Cycle</th>
                      <th className="p-3 text-left">Active</th>
                      <th className="p-3 text-left">Maj</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(promos) && promos.length > 0 ? promos.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">{p.title || '-'}</td>
                        <td className="p-3">{p.billing_cycle_default}</td>
                        <td className="p-3">{p.is_active ? 'Oui' : 'Non'}</td>
                        <td className="p-3">{p.updated_at ? new Date(p.updated_at).toLocaleString() : '-'}</td>
                        <td className="p-3 flex items-center gap-2">
                          <button onClick={() => openEditPromo(p)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded">Éditer</button>
                          <button onClick={() => deletePromo(p.id)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className="p-3 text-center text-gray-500" colSpan={5}>{promoLoading ? 'Chargement...' : 'Aucune promo'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {promoFormOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl h-full max-h-[90vh] p-6 space-y-6 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold">{promoFormData.id ? 'Éditer la promo' : 'Nouvelle promo'}</h4>
                      <button onClick={()=>setPromoFormOpen(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">Fermer</button>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-500">Titre</label>
                          <input value={promoFormData.title} onChange={e=>setPromoFormData({...promoFormData, title: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-500">Sous-titre</label>
                          <textarea value={promoFormData.subtitle} onChange={e=>setPromoFormData({...promoFormData, subtitle: e.target.value})} className="w-full px-3 py-2 border rounded-lg" rows={2} />
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-500">Image URL</label>
                          <input 
                            value={promoFormData.img_url}
                            onChange={e=>setPromoFormData({...promoFormData, img_url: e.target.value})}
                            className="w-full px-3 py-2 border rounded-lg" placeholder="https://exemple.com/image.jpg" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-xs font-medium text-slate-500">Cycle par défaut</label>
                            <select value={promoFormData.billing_cycle_default} onChange={e=>setPromoFormData({...promoFormData, billing_cycle_default: e.target.value})} className="w-full px-3 py-2 border rounded-lg">
                              <option value="monthly">Mensuel</option>
                              <option value="annual">Annuel</option>
                            </select>
                          </div>
                          <div className="flex items-center gap-3">
                            <label className="text-xs font-medium text-slate-500">Active</label>
                            <input type="checkbox" checked={!!Number(promoFormData.is_active)} onChange={e=>setPromoFormData({...promoFormData, is_active: e.target.checked ? 1 : 0})} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-xs font-medium text-slate-500">Fin d'offre</label>
                          <input type="datetime-local" value={promoFormData.timer_end_at} onChange={e=>setPromoFormData({...promoFormData, timer_end_at: e.target.value})} className="w-full px-3 py-2 border rounded-lg" />
                        </div>

                        <details className="bg-slate-50 border rounded-lg p-3">
                          <summary className="cursor-pointer text-xs font-semibold text-slate-700">Plans & Comparaison (avancé)</summary>
                          <div className="mt-3 space-y-3">
                            <div>
                              <label className="block text-xs font-medium text-slate-500 mb-1">Données promo (JSON combiné)</label>
                              <textarea
                                value={promoCombinedRaw}
                                onChange={e => {
                                  const val = e.target.value;
                                  setPromoCombinedRaw(val);
                                  try {
                                    const obj = JSON.parse(val);
                                    const plans = Array.isArray(obj?.plans) ? obj.plans : [];
                                    const comp = Array.isArray(obj?.comparison) ? obj.comparison : [];
                                    const ent  = Array.isArray(obj?.enterprise_features) ? obj.enterprise_features : [];
                                    const priceErr = validatePlansPriceFCFA(plans);
                                    setPromoCombinedError(null);
                                    setPromoJsonErrors({ plans_json: null, comparison_json: null, enterprise_features_json: null, plans_price: priceErr });
                                    setPromoJsonRaw({
                                      plans_json: JSON.stringify(plans, null, 2),
                                      comparison_json: JSON.stringify(comp, null, 2),
                                      enterprise_features_json: JSON.stringify(ent, null, 2),
                                    });
                                    setPromoFormData({
                                      ...promoFormData,
                                      plans_json: plans,
                                      comparison_json: comp,
                                      enterprise_features_json: ent,
                                    });
                                  } catch (_ERR) {
                                    void _ERR;
                                    setPromoCombinedError('JSON invalide (objet attendu: { plans, comparison, enterprise_features })');
                                  }
                                }}
                                className={`w-full p-2 border rounded font-mono text-xs ${promoCombinedError ? 'border-red-400' : ''}`}
                                rows={10}
                              />
                              {promoCombinedError && (<div className="mt-1 text-xs text-red-600">{promoCombinedError}</div>)}
                              {promoJsonErrors.plans_price && (<div className="mt-1 text-xs text-orange-600">{promoJsonErrors.plans_price}</div>)}
                              <div className="text-[11px] text-slate-500 mt-2">Format attendu: {`{"plans":[], "comparison":[], "enterprise_features":[]}`}</div>
                            </div>
                          </div>
                        </details>
                      </div>

                      
                    </div>

                    <div className="flex items-center justify-end gap-2">
                      <button onClick={savePromo} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Enregistrer</button>
                      <button onClick={()=>setPromoFormOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg">Annuler</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Blog' && (
            <div className="text-gray-700 text-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestion des articles du blog</h3>
                <div className="flex items-center gap-2">
                  <button onClick={openCreateBlog} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">Nouvel article</button>
                  <button onClick={loadBlogs} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">Recharger</button>
                </div>
              </div>

              {blogsError && <div className="text-red-600">{blogsError}</div>}
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-3 text-left">Titre</th>
                      <th className="p-3 text-left">Catégorie</th>
                      <th className="p-3 text-left">Publié</th>
                      <th className="p-3 text-left">Vues</th>
                      <th className="p-3 text-left">Maj</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(blogs) && blogs.length > 0 ? blogs.map(b => (
                      <tr key={b.id} className="border-t">
                        <td className="p-3">{b.title}</td>
                        <td className="p-3">{(serviceCategories || []).find(c => c.id === b.category_id)?.name || b.category_id}</td>
                        <td className="p-3">{b.published_date || '-'}</td>
                        <td className="p-3">{typeof b.views === 'number' ? b.views : (b.views ? Number(b.views) || 0 : 0)}</td>
                        <td className="p-3">{b.updated_at ? new Date(b.updated_at).toLocaleString() : '-'}</td>
                        <td className="p-3 flex items-center gap-2">
                          <button onClick={() => openEditBlog(b)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded">Éditer</button>
                          <button onClick={() => deleteBlog(b.id)} className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded">Supprimer</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className="p-3" colSpan={6}>{blogsLoading ? 'Chargement...' : 'Aucun article'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {blogFormOpen && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                  <div className="bg-white rounded-xl shadow-lg w-full max-w-6xl h-full max-h-4xl p-6 space-y-4 overflow-y-auto">
                    <h4 className="text-lg font-semibold">{blogFormData.id ? 'Éditer l\'article' : 'Nouvel article'}</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-600">Catégorie</label>
                        <select value={blogFormData.category_id ?? ''} onChange={(e)=>setBlogFormData(d=>({...d, category_id: e.target.value }))} className="w-full px-3 py-2 border rounded-lg">
                          {(serviceCategories || []).map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Titre</label>
                        <input value={blogFormData.title} onChange={(e)=>setBlogFormData(d=>({...d, title: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-600">Extrait</label>
                        <textarea value={blogFormData.excerpt} onChange={(e)=>setBlogFormData(d=>({...d, excerpt: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={3} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs text-gray-600">Contenu</label>
                        <textarea value={blogFormData.content} onChange={(e)=>setBlogFormData(d=>({...d, content: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" rows={6} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Image URL</label>
                        <input value={blogFormData.image_url} onChange={(e)=>setBlogFormData(d=>({...d, image_url: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Date de publication</label>
                        <input type="date" value={blogFormData.published_date} onChange={(e)=>setBlogFormData(d=>({...d, published_date: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Durée de lecture</label>
                        <input value={blogFormData.read_time} onChange={(e)=>setBlogFormData(d=>({...d, read_time: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Tags (séparés par des virgules)</label>
                        <input value={blogFormData.tags_raw} onChange={(e)=>setBlogFormData(d=>({...d, tags_raw: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Auteur</label>
                        <input value={blogFormData.author_name} onChange={(e)=>setBlogFormData(d=>({...d, author_name: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Rôle de l'auteur</label>
                        <input value={blogFormData.author_role} onChange={(e)=>setBlogFormData(d=>({...d, author_role: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-600">Avatar de l'auteur (URL)</label>
                        <input value={blogFormData.author_avatar} onChange={(e)=>setBlogFormData(d=>({...d, author_avatar: e.target.value }))} className="w-full px-3 py-2 border rounded-lg" />
                      </div>
                      <div className="flex items-center gap-4 md:col-span-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={!!blogFormData.featured} onChange={(e)=>setBlogFormData(d=>({...d, featured: e.target.checked ? 1 : 0 }))} />
                          <span>Mis en avant</span>
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="checkbox" checked={!!blogFormData.trending} onChange={(e)=>setBlogFormData(d=>({...d, trending: e.target.checked ? 1 : 0 }))} />
                          <span>Tendance</span>
                        </label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button onClick={() => setBlogFormOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                      <button onClick={saveBlog} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Portfolio' && (
            <div className="text-gray-700 text-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Gestion du Portfolio (Projets)</h3>
                <div className="flex items-center gap-2">
                  <button onClick={() => {
                    setPortfolioFormData({ id: null, title: '', category: '', client: '', year: '', description: '', image_url: '', tags_raw: '' });
                    setPortfolioFormOpen(true);
                  }} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">Nouveau projet</button>
                  <button onClick={loadPortfolioProjects} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">Recharger</button>
                </div>
              </div>

              {portfolioError && <div className="text-red-600">{portfolioError}</div>}
              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-3 text-left">Titre</th>
                      <th className="p-3 text-left">Catégorie</th>
                      <th className="p-3 text-left">Client</th>
                      <th className="p-3 text-left">Année</th>
                      <th className="p-3 text-left">Maj</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(portfolioProjects) && portfolioProjects.length > 0 ? portfolioProjects.map(p => (
                      <tr key={p.id} className="border-t">
                        <td className="p-3">{p.title || '-'}</td>
                        <td className="p-3">{p.category || '-'}</td>
                        <td className="p-3">{p.client || '-'}</td>
                        <td className="p-3">{p.year || '-'}</td>
                        <td className="p-3">{p.updated_at ? new Date(p.updated_at).toLocaleString() : '-'}</td>
                        <td className="p-3 flex items-center gap-2">
                          <button onClick={() => {
                            setPortfolioFormData({
                              id: p.id,
                              title: p.title || '',
                              category: p.category || '',
                              client: p.client || '',
                              year: p.year || '',
                              description: p.description || '',
                              image_url: p.image_url || p.image || '',
                              tags_raw: Array.isArray(p.tags) ? p.tags.join(',') : (typeof p.tags === 'string' ? p.tags : ''),
                            });
                            setPortfolioFormOpen(true);
                          }} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded">Éditer</button>
                          <button onClick={async () => {
                            if (!confirm('Supprimer ce projet ?')) return;
                            try { await projectsApi.remove(p.id); await loadPortfolioProjects(); } catch (e) { alert(e?.message || 'Erreur suppression projet'); }
                          }} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className="p-3 text-center text-gray-500" colSpan={6}>{portfolioLoading ? 'Chargement...' : 'Aucun projet'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {portfolioFormOpen && (
                <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Titre</label>
                      <input value={portfolioFormData.title} onChange={e=>setPortfolioFormData({...portfolioFormData, title: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Catégorie</label>
                      <input value={portfolioFormData.category} onChange={e=>setPortfolioFormData({...portfolioFormData, category: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Client</label>
                      <input value={portfolioFormData.client} onChange={e=>setPortfolioFormData({...portfolioFormData, client: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Année</label>
                      <input value={portfolioFormData.year} onChange={e=>setPortfolioFormData({...portfolioFormData, year: e.target.value})} className="w-full p-2 border rounded" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                      <textarea value={portfolioFormData.description} onChange={e=>setPortfolioFormData({...portfolioFormData, description: e.target.value})} className="w-full p-2 border rounded" rows={3} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Image URL</label>
                      <input value={portfolioFormData.image_url} onChange={e=>setPortfolioFormData({...portfolioFormData, image_url: e.target.value})} className="w-full p-2 border rounded" placeholder="https://exemple.com/image.jpg" />
                      {portfolioFormData.image_url && (
                        <div className="mt-2">
                          <img src={portfolioFormData.image_url} alt="Aperçu" className="h-24 rounded object-cover border" />
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Tags (séparés par des virgules)</label>
                      <input value={portfolioFormData.tags_raw} onChange={e=>setPortfolioFormData({...portfolioFormData, tags_raw: e.target.value})} className="w-full p-2 border rounded" placeholder="React, Node, UI" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={async () => {
                      try {
                        if (!portfolioFormData.title?.trim()) throw new Error('Le titre est obligatoire');
                        if (!portfolioFormData.category?.trim()) throw new Error('La catégorie est obligatoire');
                        const payload = {
                          title: portfolioFormData.title.trim(),
                          category: portfolioFormData.category.trim(),
                          client: portfolioFormData.client ?? '',
                          year: portfolioFormData.year ?? '',
                          description: portfolioFormData.description ?? '',
                          image_url: portfolioFormData.image_url ?? '',
                          tags: (portfolioFormData.tags_raw || '').split(',').map(t=>t.trim()).filter(Boolean),
                        };
                        if (portfolioFormData.id) {
                          await projectsApi.update(portfolioFormData.id, payload);
                        } else {
                          await projectsApi.create(payload);
                        }
                        setPortfolioFormOpen(false);
                        await loadPortfolioProjects();
                        alert('Projet enregistré');
                      } catch (e) {
                        alert(e?.message || 'Erreur enregistrement projet');
                      }
                    }} className="px-4 py-2 bg-blue-600 text-white rounded">Enregistrer</button>
                    <button onClick={()=>setPortfolioFormOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Annuler</button>
                  </div>
                </div>
              )}
            </div>
          )}
          {activeTab === "Catégorie" && (
            <div className="text-gray-700 text-sm">
                {/* Catégories de services */}
                <div className="mt-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Catégories de services</h3>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={categorySearch}
                        onChange={(e) => setCategorySearch(e.target.value)}
                        placeholder="Rechercher une catégorie"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button onClick={openNewCategory} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
                        <Plus className="w-4 h-4" />
                        <span>Ajouter</span>
                      </button>
                    </div>
                  </div>

                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-500 grid grid-cols-12">
                      <div className="col-span-5">Nom</div>
                      <div className="col-span-4">Icône (texte)</div>
                      <div className="col-span-3 text-right">Actions</div>
                    </div>

                    {loadingCategories ? (
                      <div className="p-4 text-sm text-gray-600">Chargement des catégories…</div>
                    ) : (
                      <div>
                        {(serviceCategories || [])
                          .filter(c => {
                            const q = categorySearch.trim().toLowerCase();
                            if (!q) return true;
                            return (c.name || '').toLowerCase().includes(q) || (c.icon || '').toLowerCase().includes(q);
                          })
                          .map((c) => (
                            <div key={c.id} className="px-4 py-3 border-t grid grid-cols-12 items-center">
                              <div className="col-span-5 text-sm font-medium text-gray-900">{c.name}</div>
                              <div className="col-span-4 text-sm text-gray-600">{c.icon || '-'}</div>
                              <div className="col-span-3 flex justify-end gap-2">
                                <button onClick={() => openEditCategory(c)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteCategory(c.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        {(!serviceCategories || serviceCategories.length === 0) && (
                          <div className="p-4 text-sm text-gray-600">Aucune catégorie pour le moment.</div>
                        )}
                      </div>
                    )}
                  </div>

                  {categoryFormOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/40" onClick={() => setCategoryFormOpen(false)} />
                      <div className="relative bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-md">
                        <h4 className="text-lg font-semibold mb-4">{categoryFormData.id ? 'Modifier la catégorie' : 'Ajouter une catégorie'}</h4>
                        {categoryError && (
                          <div className="mb-3 text-sm text-red-600">{categoryError}</div>
                        )}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
                            <input
                              type="text"
                              value={categoryFormData.name}
                              onChange={(e) => setCategoryFormData(d => ({ ...d, name: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Ex: Développement Web"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Icône (nom du composant)</label>
                            <input
                              type="text"
                              value={categoryFormData.icon}
                              onChange={(e) => setCategoryFormData(d => ({ ...d, icon: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                              placeholder="Ex: FileText"
                            />
                            <p className="mt-1 text-xs text-gray-500">Saisis le nom de l'icône Lucide (ex: FileText, Mail, Camera).</p>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                          <button onClick={() => setCategoryFormOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                          <button onClick={saveCategory} disabled={categorySaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            {categorySaving ? 'Enregistrement…' : 'Enregistrer'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          {activeTab === "Service" && (
            <div className="text-gray-700 text-sm">
              {/* Services */}
              <div className="mt-10">
                <div className="flex  items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Services</h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                  placeholder="Rechercher un service"
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
                <button onClick={() => setShowFilters(v => !v)} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200">
                  <Filter className="w-4 h-4" />
                </button>
                <input id="bulk-file-input" type="file" accept=".json,.csv" className="hidden" onChange={handleBulkFileSelected} />
                <button onClick={handleBulkImportClick} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200">
                  <Upload className="w-4 h-4" />
                </button>
                <button onClick={exportCSVTemplate} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200">
                  <FileSpreadsheet className="w-4 h-4" />
                </button>
                <button onClick={exportJSONTemplate} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200">
                  <FileJson className="w-4 h-4" />
                </button>
                <button onClick={openNewService} className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                </button>
                <button onClick={bulkDeleteSelected} disabled={selectedIds.length === 0} className="bg-red-600 disabled:bg-red-300 text-white px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-red-700">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {showFilters && (
              <div className="mb-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-white border border-gray-200 rounded-xl p-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Catégorie</label>
                  <select value={filters.category_id} onChange={(e)=>setFilters(f=>({...f, category_id: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Toutes</option>
                    {(serviceCategories||[]).map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Type de prix</label>
                  <select value={filters.price_type} onChange={(e)=>setFilters(f=>({...f, price_type: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Tous</option>
                    <option value="fixe">fixe</option>
                    <option value="sur_devis">sur_devis</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Fournisseur</label>
                  <input type="text" value={filters.provider} onChange={(e)=>setFilters(f=>({...f, provider: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Ex: DigitalPro" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Note min</label>
                  <input type="number" step="0.1" min="0" max="5" value={filters.min_rating} onChange={(e)=>setFilters(f=>({...f, min_rating: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prix min</label>
                  <input type="number" min="0" value={filters.min_price} onChange={(e)=>setFilters(f=>({...f, min_price: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Prix max</label>
                  <input type="number" min="0" value={filters.max_price} onChange={(e)=>setFilters(f=>({...f, max_price: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">En avant</label>
                  <select value={filters.featured} onChange={(e)=>setFilters(f=>({...f, featured: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Tous</option>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Actif</label>
                  <select value={filters.is_active} onChange={(e)=>setFilters(f=>({...f, is_active: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Tous</option>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Stock</label>
                  <select value={filters.in_stock} onChange={(e)=>setFilters(f=>({...f, in_stock: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Tous</option>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Garantie</label>
                  <select value={filters.guarantee} onChange={(e)=>setFilters(f=>({...f, guarantee: e.target.value}))} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option value="">Tous</option>
                    <option value="true">Oui</option>
                    <option value="false">Non</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button onClick={()=>setFilters({category_id:'',price_type:'',featured:'',is_active:'',in_stock:'',guarantee:'',provider:'',min_rating:'',min_price:'',max_price:''})} className="px-3 py-2 border rounded-lg text-sm">Réinitialiser</button>
                </div>
              </div>
            )}

            <div className="border rounded-xl overflow-visible">
              {loadingServices ? (
                <div className="p-4 text-sm text-gray-600">Chargement des services…</div>
              ) : (
                <div className="overflow-x-auto rounded-xl shadow-sm border border-gray-200 bg-white">
  <table className="w-full text-sm">
    <thead className="bg-gray-50/80 backdrop-blur-sm">
      <tr className="text-left">
        {[
          "Sélection", "ID", "Titre", "Catégorie", "Description", "Durée", "Prix",
          "Type de prix", "Image URL", "En avant", "Note", "Fournisseur",
          "Stock", "Remise", "Actif", "Créé", "Mis à jour", "Actions"
        ].map((header, i) => (
          <th
            key={i}
            className="px-4 py-3 text-xs font-semibold text-gray-600 whitespace-nowrap"
          >
            {header === 'Sélection' ? (
              <input type="checkbox" checked={filteredServices.length>0 && selectedIds.length === filteredServices.map(s=>s.id).length} onChange={(e)=>toggleSelectAllDisplayed(e.target.checked)} />
            ) : header}
          </th>
        ))}
      </tr>
    </thead>

    <tbody className="divide-y divide-gray-100">
      {(filteredServices || [])
        .map((s) => {
          const cat = serviceCategories.find((c) => c.id === s.category_id);

          return (
            <tr
              key={s.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-4 py-3">
                <input type="checkbox" checked={selectedIds.includes(s.id)} onChange={(e)=>toggleSelectOne(s.id, e.target.checked)} />
              </td>
              <td className="px-4 py-3">{s.id}</td>

              <td className="px-4 py-3 font-medium text-gray-900">{s.title}</td>

              <td className="px-4 py-3 text-gray-700">{cat ? cat.name : "-"}</td>

              <td className="px-4 py-3 text-gray-700 max-w-xs truncate">
                {s.description}
              </td>

              <td className="px-4 py-3 text-gray-700">{s.duration}</td>

              <td className="px-4 py-3 text-gray-700">
            {s.price != null ? `${Math.round(Number(s.price)).toLocaleString('fr-FR')} FCFA` : ""}
              </td>

              <td className="px-4 py-3 text-gray-700">{s.price_type}</td>

              <td className="px-4 py-3 text-gray-700 max-w-[10rem] truncate">
                {s.image_url}
              </td>

              <td className="px-4 py-3">{s.featured ? "Oui" : "Non"}</td>

              <td className="px-4 py-3">{s.rating ?? ""}</td>

              <td className="px-4 py-3 max-w-[8rem] truncate">
                {s.provider}
              </td>

              <td className="px-4 py-3">{s.in_stock ? "Oui" : "Non"}</td>

              <td className="px-4 py-3">{s.discount ? `${s.discount}%` : ""}</td>

              <td className="px-4 py-3">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    s.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {s.is_active ? "Actif" : "Inactif"}
                </span>
              </td>

              <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                {s.created_at}
              </td>

              <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                {s.updated_at}
              </td>

              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => openEditService(s)}
                    className="p-2 rounded-lg hover:bg-blue-50 text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => deleteService(s.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}

      {(!services || services.length === 0) && (
        <tr>
          <td
            colSpan="18"
            className="px-4 py-6 text-center text-gray-500 text-sm"
          >
            Aucun service pour le moment.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

              )}
            </div>

            {serviceFormOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setServiceFormOpen(false)} />
                <div className="relative bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-xl">
                  <h4 className="text-lg font-semibold mb-4">{serviceFormData.id ? 'Modifier le service' : 'Ajouter un service'}</h4>
                  {serviceError && (
                    <div className="mb-3 text-sm text-red-600">{serviceError}</div>
                  )}
                  {serviceFormData.id && (
                    <div className="mb-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
                      <div className="font-mono"><span className="font-semibold">ID:</span> {serviceFormData.id}</div>
                      <div className="font-mono"><span className="font-semibold">Créé:</span> {serviceFormData.created_at || '-'}</div>
                      <div className="font-mono"><span className="font-semibold">Mis à jour:</span> {serviceFormData.updated_at || '-'}</div>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                      <input
                        type="text"
                        value={serviceFormData.title}
                        onChange={(e) => setServiceFormData(d => ({ ...d, title: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: Site vitrine"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                      <select
                        value={serviceFormData.category_id ?? ''}
                        onChange={(e) => setServiceFormData(d => ({ ...d, category_id: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="">Sélectionner…</option>
                        {(serviceCategories || []).map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Durée</label>
                      <input
                        type="text"
                        value={serviceFormData.duration}
                        onChange={(e) => setServiceFormData(d => ({ ...d, duration: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: 2 semaines"
                      />
                      <p className="mt-1 text-xs text-gray-500">Indiquez une durée lisible (ex: 10 jours, 2h).</p>
                    </div>
                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix (FCFA)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={serviceFormData.price}
                        onChange={(e) => setServiceFormData(d => ({ ...d, price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        disabled={serviceFormData.price_type !== 'fixe'}
                        placeholder="Ex: 1500"
                      />
                      {serviceFormData.price_type !== 'fixe' && (
                        <p className="mt-1 text-xs text-gray-500">Désactivé en mode "Sur devis".</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type de prix</label>
                      <select
                        value={serviceFormData.price_type}
                        onChange={(e) => {
                          const val = e.target.value;
                          setServiceFormData(d => ({ ...d, price_type: val, price: val === 'sur_devis' ? '' : d.price }));
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      >
                        <option value="sur_devis">Sur devis</option>
                        <option value="fixe">Fixe</option>
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Sélectionnez "Fixe" pour activer le champ prix.</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Image (URL)</label>
                      <input
                        type="text"
                        value={serviceFormData.image_url}
                        onChange={(e) => setServiceFormData(d => ({ ...d, image_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://…"
                      />
                      {serviceFormData.image_url && (
                        <div className="mt-2">
                          <img
                            src={serviceFormData.image_url}
                            alt="Aperçu"
                            className="h-24 w-24 object-cover rounded-lg border"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </div>
                      )}
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows="3"
                        value={serviceFormData.description}
                        onChange={(e) => setServiceFormData(d => ({ ...d, description: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Détails du service"
                      />
                      <p className="mt-1 text-xs text-gray-500">Décrivez succinctement le contenu et les livrables.</p>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Caractéristiques (une par ligne)</label>
                      <textarea
                        rows="4"
                        value={serviceFormData.features_raw}
                        onChange={(e) => setServiceFormData(d => ({ ...d, features_raw: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: Design responsive\nSuivi analytics\nOptimisation performance"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Livrables (un par ligne)</label>
                      <textarea
                        rows="4"
                        value={serviceFormData.deliverables_raw}
                        onChange={(e) => setServiceFormData(d => ({ ...d, deliverables_raw: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: Site en ligne\nDocumentation\nAccès au code source"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-2">
                      <input
                        id="svc-active"
                        type="checkbox"
                        checked={!!serviceFormData.is_active}
                        onChange={(e) => setServiceFormData(d => ({ ...d, is_active: e.target.checked }))}
                      />
                      <label htmlFor="svc-active" className="text-sm text-gray-700">Actif</label>
                    </div>
                    <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          id="svc-featured"
                          type="checkbox"
                          checked={!!serviceFormData.featured}
                          onChange={(e) => setServiceFormData(d => ({ ...d, featured: e.target.checked }))}
                        />
                        <label htmlFor="svc-featured" className="text-sm text-gray-700">Mis en avant</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="svc-stock"
                          type="checkbox"
                          checked={!!serviceFormData.in_stock}
                          onChange={(e) => setServiceFormData(d => ({ ...d, in_stock: e.target.checked }))}
                        />
                        <label htmlFor="svc-stock" className="text-sm text-gray-700">En stock / disponible</label>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          id="svc-guarantee"
                          type="checkbox"
                          checked={!!serviceFormData.guarantee}
                          onChange={(e) => setServiceFormData(d => ({ ...d, guarantee: e.target.checked }))}
                        />
                        <label htmlFor="svc-guarantee" className="text-sm text-gray-700">Garantie incluse</label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Fournisseur</label>
                      <input
                        type="text"
                        value={serviceFormData.provider}
                        onChange={(e) => setServiceFormData(d => ({ ...d, provider: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: DigitalPro"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note fournisseur</label>
                      <input
                        type="number"
                        step="0.1"
                        value={serviceFormData.provider_rating}
                        onChange={(e) => setServiceFormData(d => ({ ...d, provider_rating: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: 4.5"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Note (service)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={serviceFormData.rating}
                        onChange={(e) => setServiceFormData(d => ({ ...d, rating: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: 4.7"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre d’avis</label>
                      <input
                        type="number"
                        value={serviceFormData.review_count}
                        onChange={(e) => setServiceFormData(d => ({ ...d, review_count: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: 12"
                      />
                    </div>

                    <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix d’origine (FCFA)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={serviceFormData.original_price}
                        onChange={(e) => setServiceFormData(d => ({ ...d, original_price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: 1800"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Remise (%)</label>
                      <input
                        type="number"
                        value={serviceFormData.discount}
                        onChange={(e) => setServiceFormData(d => ({ ...d, discount: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Ex: 10"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Couverture (URL)</label>
                      <input
                        type="text"
                        value={serviceFormData.cover_url}
                        onChange={(e) => setServiceFormData(d => ({ ...d, cover_url: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://…"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-6">
                    <button onClick={() => setServiceFormOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                    <button onClick={saveService} disabled={serviceSaving} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      {serviceSaving ? 'Enregistrement…' : 'Enregistrer'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {bulkModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/40" onClick={() => setBulkModalOpen(false)} />
                <div className="relative bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-2xl">
                  <h4 className="text-lg font-semibold mb-2">Importer des services</h4>
                  <p className="text-sm text-gray-600 mb-4">Fichier: {bulkFileName || '—'}{bulkParsing ? ' (analyse en cours…)': ''}</p>
                  {bulkErrors && bulkErrors.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm font-medium text-red-600 mb-1">Erreurs détectées</div>
                      <ul className="text-xs text-red-600 list-disc pl-4 max-h-24 overflow-auto">
                        {bulkErrors.map((e, i) => (
                          <li key={i}>Ligne {e.index >= 0 ? e.index + 1 : '—'}: {e.error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="mb-4">
                    <div className="text-sm text-gray-700 mb-2">Prévisualisation ({Math.min(bulkRows.length, 5)} sur {bulkRows.length})</div>
                    <div className="overflow-x-auto border rounded">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">category_id</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">title</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">price_type</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">price</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">featured</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">provider</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">rating</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">is_active</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bulkRows.slice(0, 5).map((r, idx) => (
                            <tr key={idx} className="border-t">
                              <td className="px-3 py-2">{r.category_id}</td>
                              <td className="px-3 py-2">{r.title}</td>
                              <td className="px-3 py-2">{r.price_type}</td>
                              <td className="px-3 py-2">{r.price ?? ''}</td>
                              <td className="px-3 py-2">{r.featured ? 'true' : 'false'}</td>
                              <td className="px-3 py-2">{r.provider ?? ''}</td>
                              <td className="px-3 py-2">{r.rating ?? ''}</td>
                              <td className="px-3 py-2">{r.is_active ? 'true' : 'false'}</td>
                            </tr>
                          ))}
                          {bulkRows.length === 0 && (
                            <tr><td colSpan="8" className="px-3 py-2 text-gray-500">Aucune ligne prête.</td></tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-xs text-gray-500">Formats supportés: JSON (tableau d'objets) ou CSV avec en-têtes: category_id,title,description,duration,price,price_type,image_url,cover_url,featured,rating,review_count,provider,provider_rating,in_stock,guarantee,original_price,discount,is_active. Les champs texte contenant des virgules doivent être entourés de guillemets.</p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setBulkModalOpen(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
                    <button onClick={submitBulkImport} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Importer</button>
                  </div>
                </div>
              </div>
            )}
              </div>
            </div>
          )}

          {activeTab === 'Paramètres Système' && (
            <div className="text-gray-700 text-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Paramètres système (app_settings)</h3>
                <div className="flex items-center gap-2">
                  <button onClick={openCreateAppSetting} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">Nouveau paramètre</button>
                  <button onClick={loadAppSettings} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">Recharger</button>
                </div>
              </div>

              {appSettingsError && <div className="text-red-600">{appSettingsError}</div>}
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-3 text-left">Clé</th>
                      <th className="p-3 text-left">Type</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-left">Maj</th>
                      <th className="p-3 text-left">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(appSettings) && appSettings.length > 0 ? appSettings.map(s => (
                      <tr key={s.id} className="border-t">
                        <td className="p-3 font-mono">{s.setting_key}</td>
                        <td className="p-3">{s.setting_type}</td>
                        <td className="p-3">{s.description || '-'}</td>
                        <td className="p-3">{s.updated_at ? new Date(s.updated_at).toLocaleString() : '-'}</td>
                        <td className="p-3 flex items-center gap-2">
                          <button onClick={() => openEditAppSetting(s)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded">Éditer</button>
                          <button onClick={() => deleteAppSetting(s.id)} className="px-2 py-1 bg-red-600 text-white rounded">Supprimer</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td className="p-3 text-center text-gray-500" colSpan={5}>{appSettingsLoading ? 'Chargement...' : 'Aucun paramètre'}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {appSettingFormOpen && (
                <div className="bg-slate-50 border rounded-xl p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Clé</label>
                      <input value={appSettingFormData.setting_key} onChange={e=>setAppSettingFormData({...appSettingFormData, setting_key: e.target.value})} className="w-full p-2 border rounded font-mono" placeholder="EXEMPLE_CLE" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Type</label>
                      <select value={appSettingFormData.setting_type} onChange={e=>setAppSettingFormData({...appSettingFormData, setting_type: e.target.value})} className="w-full p-2 border rounded">
                        <option value="string">string</option>
                        <option value="number">number</option>
                        <option value="boolean">boolean</option>
                        <option value="json">json</option>
                        <option value="date">date</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Description</label>
                      <textarea value={appSettingFormData.description} onChange={e=>setAppSettingFormData({...appSettingFormData, description: e.target.value})} className="w-full p-2 border rounded" rows={2} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-slate-500 mb-1">Valeur</label>
                      <textarea
                        value={appSettingFormData.setting_value_raw}
                        onChange={e=>setAppSettingFormData({...appSettingFormData, setting_value_raw: e.target.value})}
                        className={`w-full p-2 border rounded font-mono text-xs`}
                        rows={8}
                        placeholder={appSettingFormData.setting_type === 'json' ? '{\n  "key": "value"\n}' : 'texte / nombre / true|false / date ISO'}
                      />
                      {appSettingFormData.setting_type === 'json' && appSettingFormData.setting_value_raw.trim() && !isValidJson(appSettingFormData.setting_value_raw) && (
                        <div className="mt-1 text-xs text-red-600">JSON invalide (doit être un objet/array valide)</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={saveAppSetting} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-xs">Enregistrer</button>
                    <button onClick={()=>setAppSettingFormOpen(false)} className="px-3 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs">Annuler</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderDevis = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h2 className="text-xl font-bold text-gray-900">Suivi des devis</h2>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowDevisFilters(v => !v)} className="bg-gray-100 text-gray-800 px-3 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-gray-200">
            <Filter className="w-4 h-4" />
            <span>Filtres</span>
          </button>
          <button onClick={loadDevis} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 text-sm">
            <RefreshCw className="w-5 h-5" />
            <span>Rafraîchir</span>
          </button>
        </div>
      </div>

      {devisError && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{devisError}</div>
      )}

      {showDevisFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 bg-white border border-gray-200 rounded-xl p-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Recherche</label>
            <input
              type="text"
              value={devisFilters.query}
              onChange={(e) => setDevisFilters(f => ({ ...f, query: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Client, email, ID…"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={devisFilters.status}
              onChange={(e) => setDevisFilters(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            >
              <option value="">Tous</option>
              {statusOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Type de projet</label>
            <input
              type="text"
              value={devisFilters.project_type}
              onChange={(e) => setDevisFilters(f => ({ ...f, project_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Ex: Site vitrine"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date min</label>
            <input
              type="date"
              value={devisFilters.date_min}
              onChange={(e) => setDevisFilters(f => ({ ...f, date_min: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Date max</label>
            <input
              type="date"
              value={devisFilters.date_max}
              onChange={(e) => setDevisFilters(f => ({ ...f, date_max: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Montant min (FCFA)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={devisFilters.amount_min}
              onChange={(e) => setDevisFilters(f => ({ ...f, amount_min: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Montant max (FCFA)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={devisFilters.amount_max}
              onChange={(e) => setDevisFilters(f => ({ ...f, amount_max: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setDevisFilters({ query: '', status: '', project_type: '', date_min: '', date_max: '', amount_min: '', amount_max: '' })}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              Réinitialiser
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-xs text-gray-500">
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
                <th className="px-4 py-3">Progression</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {devisLoading ? (
                <tr>
                  <td className="p-4 text-center text-sm text-gray-600" colSpan={6}>Chargement...</td>
                </tr>
              ) : Array.isArray(devisRequests) && devisRequests.length > 0 ? (
                // Application des filtres avancés + filtre global
                applyGlobalFilters(devisRequests)
                  .filter((d) => {
                    const q = (devisFilters.query || '').trim().toLowerCase();
                    const name = String(d?.full_name || d?.client_name || '').toLowerCase();
                    const email = String(d?.email || d?.client_email || d?.contact?.email || '').toLowerCase();
                    const idStr = String(d?.id ?? '');
                    const typeVal = String(d?.project_type || '').toLowerCase();

                    // Recherche globale
                    if (q && !(name.includes(q) || email.includes(q) || idStr.includes(q))) return false;

                    // Statut
                    const normalizedStatus = normalizeStatusKey(d?.status || d?.statut || '');
                    if (devisFilters.status && normalizedStatus !== devisFilters.status) return false;

                    // Type de projet
                    const filterType = (devisFilters.project_type || '').trim().toLowerCase();
                    if (filterType && !typeVal.includes(filterType)) return false;

                    // Dates
                    const created = d?.created_at ? new Date(d.created_at) : null;
                    if (devisFilters.date_min && created) {
                      const min = new Date(devisFilters.date_min + 'T00:00:00');
                      if (created < min) return false;
                    }
                    if (devisFilters.date_max && created) {
                      const max = new Date(devisFilters.date_max + 'T23:59:59');
                      if (created > max) return false;
                    }

                    // Montant estimé (compatibles: estimated_amount, montant_estime)
                    const amount = d?.estimated_amount ?? d?.montant_estime ?? null;
                    const minAmount = devisFilters.amount_min !== '' ? parseFloat(devisFilters.amount_min) : null;
                    const maxAmount = devisFilters.amount_max !== '' ? parseFloat(devisFilters.amount_max) : null;
                    if (minAmount != null && amount != null && parseFloat(amount) < minAmount) return false;
                    if (maxAmount != null && amount != null && parseFloat(amount) > maxAmount) return false;

                    return true;
                  })
                  .map((d, idx) => {
                  const client = d?.full_name|| '—';
                  const email = d?.email || d?.client_email || d?.contact?.email || '—';
                  const type = d?.project_type || '—';
                  const status = d?.status || d?.statut || '—';
                  const progress = getProgressFromStatus(status);
                  return (
                    <tr key={d?.id ?? idx} className="border-t border-gray-100">
                      <td className="px-4 py-3 text-sm text-gray-700">{d?.id ?? idx + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">{client}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{type}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <select
                            value={normalizeStatusKey(status)}
                            onChange={(e) => updateDevisStatus(d?.id, e.target.value)}
                            disabled={updatingDevisId === d?.id}
                            className="px-2 py-1 border border-gray-300 rounded-lg text-xs text-gray-700 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            {statusOptions.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                          {updatingDevisId === d?.id && (
                            <span className="text-xs text-gray-500">Mise à jour…</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 h-2 rounded-full">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                          </div>
                          <span className="text-xs text-gray-600">{progress}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDevisDrawer(d)}
                            className="px-3 py-2 bg-slate-100 text-gray-900 text-xs rounded-lg hover:bg-slate-200 border"
                          >
                            Voir détails
                          </button>
                          <button
                            onClick={() => openQuoteModal(d)}
                            className="px-3 py-2 bg-black text-white text-xs rounded-lg hover:bg-gray-900"
                          >
                            Répondre
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td className="p-4 text-center text-sm text-gray-600" colSpan={6}>Aucun devis à afficher.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showQuoteModal && (
        <QuoteComponent
          closePopup={closeQuoteModal}
          mode="backoffice"
          request={selectedDevisRequest}
        />
      )}

      {showDevisDrawer && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/30" onClick={closeDevisDrawer} />
          <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl border-l border-gray-200">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Demande de devis #{devisDrawerRequest?.id ?? ''}</h3>
              <button onClick={closeDevisDrawer} className="px-2 py-1 border rounded text-sm">Fermer</button>
            </div>
            <div className="p-4 space-y-3 text-sm text-gray-800 overflow-y-auto h-[calc(100%-56px)]">
              <div>
                <div className="text-xs text-gray-500">Client</div>
                <div className="font-medium">{devisDrawerRequest?.full_name || '-'}</div>
                <div className="text-gray-600">{devisDrawerRequest?.email || '-'}</div>
                {devisDrawerRequest?.phone && <div className="text-gray-600">{devisDrawerRequest.phone}</div>}
              </div>
              <div>
                <div className="text-xs text-gray-500">Service</div>
                <div>{devisDrawerRequest?.service_id ?? '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Type de projet</div>
                <div>{devisDrawerRequest?.project_type || '-'}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Description du projet</div>
                <pre className="whitespace-pre-wrap text-gray-700 bg-gray-50 border rounded p-2">{devisDrawerRequest?.project_description || '-'}</pre>
              </div>
              {devisDrawerRequest?.attachment_url && (
                <div>
                  <div className="text-xs text-gray-500">Pièce jointe</div>
                  <a href={devisDrawerRequest.attachment_url} target="_blank" rel="noopener" className="text-blue-600 hover:underline">Voir la pièce jointe</a>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500">Statut</div>
                  <div className="font-medium">{devisDrawerRequest?.status || '-'}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Créé le</div>
                  <div>{devisDrawerRequest?.created_at ? new Date(devisDrawerRequest.created_at).toLocaleString('fr-FR') : '-'}</div>
                </div>
              </div>
              <div className="pt-2 border-t">
                <button onClick={() => openQuoteModal(devisDrawerRequest)} className="px-3 py-2 bg-black text-white rounded text-xs">Répondre</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // =============================
  // Rendez-vous (appointments)
  // =============================
  const [appointments, setAppointments] = useState([]);
  const [appointmentsLoading, setAppointmentsLoading] = useState(false);
  const [appointmentsError, setAppointmentsError] = useState(null);
  const [updatingAppointmentId, setUpdatingAppointmentId] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [servicesIndex, setServicesIndex] = useState({});
  const [calendarCursor, setCalendarCursor] = useState(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0,0,0,0);
    return d;
  });
  const [selectedDay, setSelectedDay] = useState(null);

  const loadAppointments = async () => {
    setAppointmentsLoading(true);
    setAppointmentsError(null);
    try {
      const rows = await appointmentsApi.list();
      setAppointments(Array.isArray(rows) ? rows : []);
    } catch (e) {
      setAppointmentsError(e?.message || 'Erreur de chargement des rendez-vous');
    }
    setAppointmentsLoading(false);
  };

  const updateAppointmentStatus = async (id, nextStatus) => {
    try {
      setUpdatingAppointmentId(id);
      await appointmentsApi.update(id, { status: nextStatus });
      setAppointments(prev => prev.map(a => a.id === id ? { ...a, status: nextStatus } : a));
      setSelectedAppointment(prev => prev && prev.id === id ? { ...prev, status: nextStatus } : prev);
    } catch (e) {
      alert(e?.message || 'Erreur lors de la mise à jour du statut');
    }
    setUpdatingAppointmentId(null);
  };

  useEffect(() => { if (activeMenu === 'appointments') loadAppointments(); }, [activeMenu]);
  // Charger l'index des services pour afficher le titre dans le récapitulatif
  useEffect(() => {
    const loadServicesIndex = async () => {
      try {
        const rows = await servicesApi.list();
        const idx = {};
        (Array.isArray(rows) ? rows : []).forEach(s => { idx[s.id] = s.title || s.name || `Service ${s.id}`; });
        setServicesIndex(idx);
      } catch { /* silencieux */ }
    };
    if (activeMenu === 'appointments') loadServicesIndex();
  }, [activeMenu]);

  const renderAppointments = () => {
    const formatChannel = (ch) => {
      const key = String(ch || '').toLowerCase();
      if (!key) return '—';
      if (key.includes('chat')) return 'WhatsApp';
      return ch;
    };
    return (
  <div className="p-6 space-y-6">

    {/* Titre + Actions */}
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold text-gray-900">Rendez-vous</h2>

      <div className="flex items-center gap-3">
        <button 
          onClick={loadAppointments}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700 transition"
        >
          Recharger
        </button>

        <span className="text-sm text-gray-600">
          {appointmentsLoading ? "Chargement…" : `${appointments.length} trouvés`}
        </span>
      </div>
    </div>

    {appointmentsError && (
      <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg shadow">
        {appointmentsError}
      </div>
    )}

    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

      {/* ✅ LISTE MODERNE EN CARTES */}
      <div className="xl:col-span-3 space-y-4">
        {((selectedDay ? applyGlobalFilters(appointments).filter(a => {
          const dt = a.appointment_date ? new Date(a.appointment_date) : null;
          if (!dt || Number.isNaN(dt.getTime())) return false;
          const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
          return key === selectedDay;
        }) : applyGlobalFilters(appointments)).map(a => {
          const dateStr = a.appointment_date ? new Date(a.appointment_date).toLocaleString('fr-FR') : "";
          const serviceTitle = a.service_id != null ? (servicesIndex[a.service_id] || a.service_id) : "-";
          return (
            <div 
              key={a.id}
              className="bg-white rounded-xl border shadow-sm p-4 hover:shadow-md transition cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">{a.full_name}</h3>
                <span className="text-xs text-gray-500">{dateStr}</span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-3 text-sm text-gray-700">
                <p><span className="text-gray-500">Service :</span> {serviceTitle}</p>
                <p><span className="text-gray-500">Canal :</span> {formatChannel(a.channel)}</p>
                <p><span className="text-gray-500">Email :</span> {a.email}</p>
                <p><span className="text-gray-500">Téléphone :</span> {a.phone || "-"}</p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <select
                  value={a.status}
                  onChange={(e)=>updateAppointmentStatus(a.id, e.target.value)}
                  disabled={updatingAppointmentId === a.id}
                  className="border rounded px-2 py-1 text-sm bg-gray-50"
                >
                  <option value="pending">En attente</option>
                  <option value="confirmed">Confirmé</option>
                  <option value="cancelled">Annulé</option>
                  <option value="completed">Terminé</option>
                </select>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => alert(a.notes || "Pas de notes")}
                    className="px-3 py-1 text-xs border rounded hover:bg-gray-50"
                  >
                    Notes
                  </button>
                  <button
                    onClick={() => setSelectedAppointment(a)}
                    className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-xs rounded"
                  >
                    Voir
                  </button>
                </div>
              </div>
            </div>
          );
        }))}

        {(!appointments || appointments.length === 0) && !appointmentsLoading && (
          <div className="text-center py-10 text-gray-500">Aucun rendez-vous</div>
        )}
      </div>

      {/* ✅ CALENDRIER COMPACT */}
      <div className="xl:col-span-1 space-y-4">
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <button 
              onClick={() => { const d=new Date(calendarCursor); d.setMonth(d.getMonth()-1); setCalendarCursor(d); }}
              className="px-2 py-1 hover:bg-gray-100 rounded"
            >
              &lt;
            </button>
            <div className="font-semibold capitalize">
              {calendarCursor.toLocaleDateString('fr-FR',{month:"long",year:"numeric"})}
            </div>
            <button 
              onClick={() => { const d=new Date(calendarCursor); d.setMonth(d.getMonth()+1); setCalendarCursor(d); }}
              className="px-2 py-1 hover:bg-gray-100 rounded"
            >
              &gt;
            </button>
          </div>

          {/* (on garde ta logique de calendrier ici) */}
          {/* Je ne touche pas à ton code pour éviter tout bug */}
          <div>
            <div className="grid grid-cols-7 gap-2 text-xs text-gray-500 mb-2">
              {['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'].map((w)=>(<div key={w} className="text-center">{w}</div>))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {(() => {
                const fmtKey = (date) => {
                  const dt = new Date(date);
                  if (Number.isNaN(dt.getTime())) return null;
                  const y = dt.getFullYear();
                  const m = String(dt.getMonth()+1).padStart(2,'0');
                  const d = String(dt.getDate()).padStart(2,'0');
                  return `${y}-${m}-${d}`;
                };
                const counts = {};
                (appointments || []).forEach(a => {
                  if (!a.appointment_date) return;
                  const k = fmtKey(a.appointment_date);
                  if (k) {
                    counts[k] = counts[k] || { total:0, pending:0, confirmed:0, canceled:0, completed:0 };
                    counts[k].total += 1;
                    const st = String(a.status || '').toLowerCase();
                    if (st.includes('pending') || st.includes('attente')) counts[k].pending += 1;
                    else if (st.includes('confirm')) counts[k].confirmed += 1;
                    else if (st.includes('cancel') || st.includes('annul')) counts[k].canceled += 1;
                    else if (st.includes('complete') || st.includes('termin')) counts[k].completed += 1;
                  }
                });
                const year = calendarCursor.getFullYear();
                const month = calendarCursor.getMonth();
                const firstDayIndex = (new Date(year, month, 1).getDay()+6)%7; // lundi = 0
                const lastDate = new Date(year, month+1, 0).getDate();
                const prevMonthLastDate = new Date(year, month, 0).getDate();
                const cells = [];
                for (let i=0; i<firstDayIndex; i++) {
                  const day = prevMonthLastDate - firstDayIndex + i + 1;
                  cells.push({ date: new Date(year, month-1, day), inMonth: false });
                }
                for (let day=1; day<=lastDate; day++) {
                  cells.push({ date: new Date(year, month, day), inMonth: true });
                }
                const trailing = 42 - cells.length;
                for (let i=1; i<=trailing; i++) {
                  cells.push({ date: new Date(year, month+1, i), inMonth: false });
                }
                const todayKey = fmtKey(new Date());
                return cells.map(cell => {
                  const key = fmtKey(cell.date);
                  const isSelected = key === selectedDay;
                  const isToday = key === todayKey;
                  const stat = counts[key] || { total:0, pending:0, confirmed:0, canceled:0, completed:0 };
                  return (
                    <button key={key} onClick={() => setSelectedDay(key)} className={`relative h-12 rounded-lg text-xs flex items-center justify-center transition 
                      ${cell.inMonth ? 'bg-gray-50 hover:bg-blue-50' : 'bg-white'}
                      ${isSelected ? 'ring-2 ring-blue-600 bg-blue-100' : ''}
                      ${isToday ? 'border border-blue-300' : 'border border-gray-200'}
                    `}>
                      <span className={`${cell.inMonth ? 'text-gray-800' : 'text-gray-400'}`}>{new Date(cell.date).getDate()}</span>
                      {stat.total > 0 && (
                        <div className="absolute bottom-1 right-1 flex gap-0.5">
                          {stat.pending > 0 && <span title={`${stat.pending} en attente`} className="w-2 h-2 rounded-full bg-amber-400" />}
                          {stat.confirmed > 0 && <span title={`${stat.confirmed} confirmés`} className="w-2 h-2 rounded-full bg-emerald-500" />}
                          {stat.canceled > 0 && <span title={`${stat.canceled} annulés`} className="w-2 h-2 rounded-full bg-rose-500" />}
                          {stat.completed > 0 && <span title={`${stat.completed} terminés`} className="w-2 h-2 rounded-full bg-blue-500" />}
                        </div>
                      )}
                    </button>
                  );
                });
              })()}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-gray-600">
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> En attente</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Confirmé</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Annulé</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Terminé</div>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div className="text-xs text-gray-600">{selectedDay ? 'Filtré par date' : 'Tous les rendez-vous'}</div>
              <button onClick={() => setSelectedDay(null)} className="text-xs px-2 py-1 border rounded hover:bg-gray-50">Réinitialiser</button>
            </div>
          </div>
        </div>

       
      </div>

    </div>
    {renderAppointmentDrawer()}
  </div>
);

  };

  // Drawer latéral pour les détails de rendez-vous
  function renderAppointmentDrawer() {
    return selectedAppointment ? (
      <div className="fixed inset-0 z-50">
        <div className="absolute inset-0 bg-black/30" onClick={()=>setSelectedAppointment(null)}></div>
        <div className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-white shadow-xl border-l">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">Détails du rendez-vous</h3>
            <button onClick={()=>setSelectedAppointment(null)} className="px-2 py-1">Fermer</button>
          </div>
          <div className="p-4 space-y-3 text-sm">
            <div><span className="text-gray-500">Client :</span> {selectedAppointment.full_name || '—'}</div>
            <div><span className="text-gray-500">Email :</span> {selectedAppointment.email || '—'}</div>
            <div><span className="text-gray-500">Téléphone :</span> {selectedAppointment.phone || '—'}</div>
            <div><span className="text-gray-500">Service :</span> {selectedAppointment.service_id != null ? (servicesIndex[selectedAppointment.service_id] || selectedAppointment.service_id) : '—'}</div>
            <div><span className="text-gray-500">Date :</span> {selectedAppointment.appointment_date ? new Date(selectedAppointment.appointment_date).toLocaleString('fr-FR') : '—'}</div>
            <div>
              <span className="text-gray-500">Statut :</span>
              <select
                value={selectedAppointment.status}
                onChange={(e)=>updateAppointmentStatus(selectedAppointment.id, e.target.value)}
                className="border rounded px-2 py-1 mt-1"
              >
                <option value="pending">En attente</option>
                <option value="confirmed">Confirmé</option>
                <option value="cancelled">Annulé</option>
                <option value="completed">Terminé</option>
              </select>
            </div>
            {selectedAppointment.notes && (
              <div>
                <p className="text-gray-500 text-xs">Notes</p>
                <div className="p-2 bg-gray-50 rounded text-xs whitespace-pre-wrap">
                  {selectedAppointment.notes}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    ) : null;
  }

  const renderContent = () => {
    const renderContacts = () => {
      const rows = applyGlobalFilters(contacts);
      return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Messages de contact</h2>
          <button onClick={loadContacts} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded">
            Recharger
          </button>
        </div>
        {contactsError && (
          <div className="mb-3 text-red-600">Erreur: {String(contactsError)}</div>
        )}
        <div className="bg-white rounded shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-3 py-2 text-left">Nom</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Téléphone</th>
                <th className="px-3 py-2 text-left">Sujet</th>
                <th className="px-3 py-2 text-left">Message</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contactsLoading ? (
                <tr><td className="px-3 py-2" colSpan={6}>Chargement...</td></tr>
              ) : Array.isArray(rows) && rows.length > 0 ? (
                rows.map((c) => (
                  <tr key={c.id} className="border-t">
                    <td className="px-3 py-2">{c.full_name || '—'}</td>
                    <td className="px-3 py-2">{c.email || '—'}</td>
                    <td className="px-3 py-2">{c.phone || '—'}</td>
                    <td className="px-3 py-2">{c.subject || '—'}</td>
                    <td className="px-3 py-2 max-w-[400px] truncate" title={c.message || ''}>{c.message || '—'}</td>
                    <td className="px-3 py-2 text-right">
                      <button onClick={() => openViewContact(c)} className="inline-flex items-center px-2 py-1 text-gray-700 hover:text-gray-900 mr-2">
                        <Eye className="w-4 h-4 mr-1" /> Voir le message complet
                      </button>
                      <button onClick={() => openReplyContact(c)} className="inline-flex items-center px-2 py-1 text-blue-600 hover:text-blue-800 mr-2">
                        <Send className="w-4 h-4 mr-1" /> Répondre
                      </button>
                      <button onClick={() => deleteContact(c.id)} className="inline-flex items-center px-2 py-1 text-red-600 hover:text-red-800">
                        <Trash2 className="w-4 h-4 mr-1" /> Supprimer
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td className="px-3 py-2" colSpan={6}>Aucun message</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    ); };
    switch (activeMenu) {
      case 'dashboard': return renderDashboard();
      case 'projets': return renderProjects();
      case 'devis': return renderDevis();
      case 'appointments': return renderAppointments();
      case 'clients': return renderClients();
      case 'team': return renderTeamSecured();
      case 'finance': return renderFinance();
      case 'messages': return renderMessages();
      case 'users': return renderUsers();
      case 'contacts': return renderContacts();
      case 'privacy-terms': return renderPrivacy();
      case 'settings': return renderSettings();
      case 'planning': return renderPlanning();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex ${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && 
          <h1 className="text-xl flex items-content-center font-bold ">
            <img src="/img/web-app-manifest-192x192.png" alt="Logo Digital" width={32} />
            Digital
            
            </h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => { setActiveMenu(item.id); if (item.path) navigate(item.path); }}
                className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition ${
                  activeMenu === item.id ? 'bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg' : 'hover:bg-gray-700'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
              </button>
            );
          })}

          
        </nav>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 p-3 flex items-center justify-between lg:justify-end">
          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={toggleMobileMenu}
            onTouchStart={toggleMobileMenu}
            onPointerDown={toggleMobileMenu}
            onMouseDown={toggleMobileMenu}
            onKeyDown={handleMobileMenuKeyDown}
            aria-expanded={mobileMenuOpen}
            className="lg:hidden p-2 border rounded-lg"
            style={{ touchAction: 'manipulation' }}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-3">
            {/* Bouton ouverture sidebar droite */}
            <button onClick={openRightSidebar} className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50" aria-label="Ouvrir panneau">
              <DivideSquare className="w-5 h-5 text-gray-600" />
            </button>
            <div className="relative">
              <button onClick={toggleNotifications} className="p-2 border border-gray-200 rounded-lg relative" aria-label="Notifications">
                <Bell className="w-5 h-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </button>
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50">
                  <div className="px-3 py-2 border-b flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-800">Notifications</span>
                    <button onClick={()=>setNotificationsOpen(false)} className="text-xs text-gray-500 hover:text-gray-700">Fermer</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-3 text-sm text-gray-500">Aucune notification</div>
                    ) : notifications.map((n) => (
                      <div key={`${n.type}-${n.id}`} className="px-3 py-2 hover:bg-gray-50 cursor-default">
                        <div className="text-xs text-gray-500">{n.type === 'submission' ? 'Soumission' : 'Demande'} • {n.created_at ? new Date(n.created_at).toLocaleString('fr-FR') : ''}</div>
                        <div className="text-sm font-medium text-gray-900">{n.title}</div>
                        {n.summary && <div className="text-sm text-gray-600">{n.summary}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                onClick={toggleUserMenu}
                onKeyDown={handleUserMenuKeyDown}
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <img src={session.getAvatarUrl() || '/img/web-app-manifest-192x192.png'} alt="" className="w-6 h-6 rounded-lg" />
                <span className="text-sm font-medium capitalize">{String(currentUserRole || 'admin')}</span>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {userMenuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50"
                >
                  <button
                    type="button"
                    onClick={() => { closeUserMenu(); navigate('/'); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Accueil
                  </button>
                  <button
                    type="button"
                    onClick={() => { closeUserMenu(); navigate('/profil'); }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  >
                    Profil
                  </button>
                  <button
                    type="button"
                    onClick={() => { closeUserMenu(); navigate('/logout'); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Sidebar */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gray-900 text-white">
            <nav className="px-2 py-2 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveMenu(item.id);
                    if (item.path) navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-3 py-3 rounded-lg transition ${
                    activeMenu === item.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'hover:bg-gray-700'
                  }`}
                >
                  {React.createElement(item.icon, { className: 'w-5 h-5 flex-shrink-0' })}
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        )}

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {renderContent()}
        </main>

        {/* Sidebar droite sortante */}
        {/* Overlay */}
        {rightSidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeRightSidebar} aria-hidden="true"></div>
        )}
        {/* Panneau */}
        <aside
          className={`fixed right-0 top-0 h-full w-[360px] md:w-[420px] bg-white border-l border-gray-200 shadow-xl z-50 transform transition-transform duration-300 ${rightSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          role="dialog"
          aria-label="Sidebar droite"
        >
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="text-sm font-semibold text-gray-800">Panneau latéral</h3>
            <button onClick={closeRightSidebar} className="p-2 rounded hover:bg-gray-100" aria-label="Fermer panneau">
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto h-full">
            {/* Filtre caché */}
            <div className="border rounded-lg">
              <button
                type="button"
                onClick={() => setFiltersOpen(v => !v)}
                className="w-full flex items-center justify-between px-3 py-2"
                aria-expanded={filtersOpen}
              >
                <span className="text-sm font-medium flex items-center gap-2"><Filter className="w-4 h-4" /> Filtres</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${filtersOpen ? 'rotate-180' : ''}`} />
              </button>
              {filtersOpen && (
                <div className="px-3 pb-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Recherche (nom, message)"
                    value={contactFilters.q}
                    onChange={(e)=>setContactFilters(f=>({ ...f, q: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={contactFilters.email}
                    onChange={(e)=>setContactFilters(f=>({ ...f, email: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Sujet"
                    value={contactFilters.subject}
                    onChange={(e)=>setContactFilters(f=>({ ...f, subject: e.target.value }))}
                    className="w-full border rounded px-2 py-1 text-sm"
                  />
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={contactFilters.dateFrom}
                      onChange={(e)=>setContactFilters(f=>({ ...f, dateFrom: e.target.value }))}
                      className="w-1/2 border rounded px-2 py-1 text-sm"
                    />
                    <input
                      type="date"
                      value={contactFilters.dateTo}
                      onChange={(e)=>setContactFilters(f=>({ ...f, dateTo: e.target.value }))}
                      className="w-1/2 border rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={resetContactFilters} className="px-2 py-1 text-sm border rounded hover:bg-gray-50">Réinitialiser</button>
                    <button onClick={()=>setFiltersOpen(false)} className="px-2 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">Appliquer</button>
                  </div>
                </div>
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Ce panneau peut afficher des détails, des filtres ou des actions rapides du Backoffice.</p>
            </div>
            {/* Exemple: résumé rapide des contacts */}
            <div className="border rounded-lg">
              <div className="px-3 py-2 border-b flex items-center justify-between">
                <span className="text-sm font-medium">Aperçu Contacts</span>
                <button onClick={() => { closeRightSidebar(); setActiveMenu('contacts'); navigate('/backoffice/contacts'); }} className="text-xs text-blue-600 hover:text-blue-800">Ouvrir</button>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {Array.isArray(contacts) && contacts.length > 0 ? (
                  contacts.slice(0, 5).map(c => (
                    <div key={c.id} className="px-3 py-2 border-t">
                      <div className="text-sm font-medium text-gray-800 truncate">{c.full_name || '—'}</div>
                      <div className="text-xs text-gray-600 truncate">{c.email || ''} • {c.subject || ''}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-500">Aucun message récent</div>
                )}
              </div>
            </div>
          </div>
        </aside>
        {contactReplyOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setContactReplyOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-xl">
              <h4 className="text-lg font-semibold mb-4">Répondre au contact</h4>
              {contactReplyError && (
                <div className="mb-3 text-sm text-red-600">{contactReplyError}</div>
              )}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Destinataire</label>
                  <input type="email" value={contactReplyData.email} disabled className="w-full border rounded px-3 py-2 bg-gray-50 text-gray-700" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Sujet</label>
                  <input type="text" value={contactReplyData.subject} onChange={(e)=>setContactReplyData(d=>({ ...d, subject: e.target.value }))} className="w-full border rounded px-3 py-2" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Message</label>
                  <textarea rows={8} value={contactReplyData.message} onChange={(e)=>setContactReplyData(d=>({ ...d, message: e.target.value }))} className="w-full border rounded px-3 py-2" placeholder="Votre réponse au client..." />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-2">
                <button onClick={() => setContactReplyOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Annuler</button>
                <button onClick={sendContactReply} disabled={contactReplySending} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded inline-flex items-center">
                  <Send className="w-4 h-4 mr-1" /> {contactReplySending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </div>
        )}
        {contactViewOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/40" onClick={() => setContactViewOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-xl p-6 w-[92%] max-w-2xl">
              <h4 className="text-lg font-semibold mb-4">Message de contact</h4>
              <div className="space-y-3 text-sm">
                <div><span className="font-medium">Nom:</span> {contactViewData?.full_name || '—'}</div>
                <div><span className="font-medium">Email:</span> {contactViewData?.email || '—'}</div>
                <div><span className="font-medium">Téléphone:</span> {contactViewData?.phone || '—'}</div>
                <div><span className="font-medium">Sujet:</span> {contactViewData?.subject || '—'}</div>
                <div>
                  <span className="font-medium">Message:</span>
                  <div className="mt-2 p-3 border rounded bg-gray-50">
                    <div dangerouslySetInnerHTML={{ __html: contactViewData?.message || '' }} />
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end">
                <button onClick={() => setContactViewOpen(false)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded">Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BackofficeDigital;