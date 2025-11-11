import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users,
  Calendar,
  DollarSign,
  Activity,
  Clock,
  ArrowUp,
  ArrowDown,
  FileText,
  Target,
  X,
} from 'lucide-react';

// Services existants du projet
import appointmentsApi from '../configurations/services/appointments.js';
import projectsApi from '../configurations/services/projects.js';
import invoicesService from '../configurations/services/invoices.js';
import usersApi from '../configurations/services/user.js';
import servicesApi from '../configurations/services/services.js';

export default function DashboardDigital() {
    const navigate = useNavigate()
  const [selectedPeriod, setSelectedPeriod] = useState('7days');
  // États pour les données réelles
  const [appointments, setAppointments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  // Utilitaires période sélectionnée
  const periodRange = useMemo(() => {
    const now = new Date();
    let start = new Date(now);
    switch (selectedPeriod) {
      case '7days':
        start.setDate(now.getDate() - 7);
        break;
      case '30days':
        start.setDate(now.getDate() - 30);
        break;
      case '90days':
        start.setDate(now.getDate() - 90);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        start.setDate(now.getDate() - 7);
    }
    return { start, end: now };
  }, [selectedPeriod]);

  // Parsing robuste de dates venant du backend (ISO, "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD")
  const parseDateRobust = (dateStr) => {
    if (!dateStr) return null;
    try {
      let d = new Date(dateStr);
      if (isNaN(d.getTime())) {
        const s = String(dateStr);
        // Essaye avec remplacement espace -> 'T'
        d = new Date(s.replace(' ', 'T'));
        if (isNaN(d.getTime())) {
          const m = s.match(/^\d{4}-\d{2}-\d{2}$/);
          if (m) d = new Date(`${s}T00:00:00`);
        }
      }
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  const isInRange = (dateStr) => {
    const d = parseDateRobust(dateStr);
    if (!d) return false;
    return d >= periodRange.start && d <= periodRange.end;
  };

  const formatTime = (dateStr) => {
    const d = parseDateRobust(dateStr) || new Date();
    const hours = String(d.getHours()).padStart(2, '0');
    const mins = String(d.getMinutes()).padStart(2, '0');
    return `${hours}:${mins}`;
  };

  // Nouveaux clients de la semaine en cours (bornes lundi->dimanche)
  const weekRange = useMemo(() => {
    const now = new Date();
    const day = now.getDay(); // 0=dimanche, 1=lundi, ...
    const offsetToMonday = ((day + 6) % 7);
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(now.getDate() - offsetToMonday);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }, []);

  // Récupère la date de création d'un utilisateur quel que soit le champ
  const getUserCreatedAt = (u) => (
    u?.created_at || u?.createdAt || u?.created_date || u?.createdDate || u?.created || u?.created_on || u?.createdOn
  );

  // Charger données réelles
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [apps, projs, invs, usrs, svcs] = await Promise.all([
          appointmentsApi.list(),
          projectsApi.list(),
          invoicesService.list(),
          usersApi.list(),
          servicesApi.list(),
        ]);
        if (!cancelled) {
          setAppointments(Array.isArray(apps) ? apps : []);
          setProjects(Array.isArray(projs) ? projs : []);
          setInvoices(Array.isArray(invs) ? invs : []);
          setUsers(Array.isArray(usrs) ? usrs : []);
          setServices(Array.isArray(svcs) ? svcs : []);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Erreur lors du chargement');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [selectedPeriod]);

  // Mapping des services pour affichage des noms
  const serviceTitleById = useMemo(() => {
    const map = new Map();
    for (const s of services) {
      map.set(String(s.id), s.title || 'Service');
    }
    return map;
  }, [services]);

  // Stats calculées
  const computedStats = useMemo(() => {
    const invsInRange = invoices.filter((i) => isInRange(i.issued_date));
    const ca = invsInRange.reduce((sum, i) => sum + Number(i.amount || 0), 0);
    // Nouveaux clients sur la semaine en cours
    const newClients = (users || []).filter((u) => {
      const d = parseDateRobust(getUserCreatedAt(u));
      return d && d >= weekRange.start && d <= weekRange.end;
    }).length;
    const rdvCount = appointments.filter((a) => isInRange(a.appointment_date)).length;
    const activeProjects = projects.filter((p) => p.is_active).length;

    const fmtCurrency = (val) => `${Math.round(val).toLocaleString('fr-FR')} Fcfa`;

    return [
      {
        title: "Chiffre d'affaires",
        value: fmtCurrency(ca),
        change: '',
        trend: 'up',
        icon: DollarSign,
        bgColor: 'bg-blue-500'
      },
      {
        title: 'Nouveaux clients',
        value: String(newClients),
        change: '',
        trend: 'up',
        icon: Users,
        bgColor: 'bg-green-500'
      },
      {
        title: 'Rendez-vous',
        value: String(rdvCount),
        change: '',
        trend: rdvCount >= 0 ? 'up' : 'down',
        icon: Calendar,
        bgColor: 'bg-purple-500'
      },
      {
        title: 'Projets actifs',
        value: String(activeProjects),
        change: '',
        trend: 'up',
        icon: Activity,
        bgColor: 'bg-orange-500'
      }
    ];
  }, [invoices, users, appointments, projects, periodRange, weekRange]);
  // Dépend aussi de weekRange puisqu'on calcule les clients de la semaine
  // (weekRange est stable mais on le inclut pour clarté)
  

  const statusConfig = {
    confirmed: { label: 'Confirmé', bgColor: 'bg-green-100', textColor: 'text-green-700' },
    pending: { label: 'En attente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
    cancelled: { label: 'Annulé', bgColor: 'bg-red-100', textColor: 'text-red-700' },
    in_progress: { label: 'En cours', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
    review: { label: 'Révision', bgColor: 'bg-purple-100', textColor: 'text-purple-700' },
    completed: { label: 'Terminé', bgColor: 'bg-green-100', textColor: 'text-green-700' }
  };

  // Activités basées sur données réelles (simple agrégation)
  const activities = useMemo(() => {
    const items = [];
    const latestInv = invoices.slice(0, 3).map(i => ({
      text: `Facture ${i.status || ''} (${Number(i.amount || 0).toFixed(0)} Fcfa)`,
      time: i.issued_date ? new Date(i.issued_date).toLocaleDateString('fr-FR') : '—',
      icon: DollarSign,
    }));
    const latestApps = appointments.slice(0, 3).map(a => ({
      text: `Rendez-vous avec ${a.full_name || 'Client'}`,
      time: a.appointment_date ? new Date(a.appointment_date).toLocaleDateString('fr-FR') : '—',
      icon: Calendar,
    }));
    const latestProjs = projects.slice(0, 3).map(p => ({
      text: `Projet ${p.title} ${p.is_active ? 'actif' : 'inactif'}`,
      time: p.created_at ? new Date(p.created_at).toLocaleDateString('fr-FR') : '—',
      icon: Activity,
    }));
    items.push(...latestInv, ...latestApps, ...latestProjs);
    return items.slice(0, 8);
  }, [invoices, appointments, projects]);

  // Objectifs du mois (calcul dynamique)
  const monthlyObjectives = useMemo(() => {
    const now = new Date();
    const sameMonth = (d) => d && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    const toDate = (s) => (s ? new Date(s) : null);

    // CA mensuel courant
    const invByMonth = new Map();
    for (const i of invoices) {
      const d = toDate(i.issued_date);
      if (!d) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      invByMonth.set(key, (invByMonth.get(key) || 0) + Number(i.amount || 0));
    }
    const revenueThisMonth = invoices.filter(i => sameMonth(toDate(i.issued_date))).reduce((s, i) => s + Number(i.amount || 0), 0);
    const revenueMax = Array.from(invByMonth.values()).reduce((m, v) => Math.max(m, v), 0) || revenueThisMonth || 1;
    const revenuePct = Math.max(0, Math.min(100, Math.round((revenueThisMonth / revenueMax) * 100)));

    // Nouveaux clients ce mois vs max historique
    const usersByMonth = new Map();
    for (const u of users) {
      const d = toDate(u.created_at);
      if (!d) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      usersByMonth.set(key, (usersByMonth.get(key) || 0) + 1);
    }
    const clientsThisMonth = users.filter(u => sameMonth(toDate(u.created_at))).length;
    const clientsMax = Array.from(usersByMonth.values()).reduce((m, v) => Math.max(m, v), 0) || clientsThisMonth || 1;
    const clientsPct = Math.max(0, Math.min(100, Math.round((clientsThisMonth / clientsMax) * 100)));

    // Projets livrés ce mois (is_active = false) vs max historique
    const projByMonthDelivered = new Map();
    for (const p of projects) {
      const d = toDate(p.updated_at || p.created_at);
      if (!d) continue;
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const delivered = !p.is_active;
      if (delivered) {
        projByMonthDelivered.set(key, (projByMonthDelivered.get(key) || 0) + 1);
      }
    }
    const deliveredThisMonth = projects.filter(p => !p.is_active && sameMonth(toDate(p.updated_at || p.created_at))).length;
    const deliveredMax = Array.from(projByMonthDelivered.values()).reduce((m, v) => Math.max(m, v), 0) || deliveredThisMonth || 1;
    const deliveredPct = Math.max(0, Math.min(100, Math.round((deliveredThisMonth / deliveredMax) * 100)));

    return {
      revenuePct,
      clientsPct,
      deliveredPct,
    };
  }, [invoices, users, projects]);

  // Session: charger l'utilisateur connecté et dériver salutation + compteur RDV
  useEffect(() => {
    (async () => {
      try {
        const user = await usersApi.getCurrentUser?.();
        if (user && (user.email || user.first_name || user.last_name)) {
          setCurrentUser(user);
        }
      } catch (e) {
        console.warn('[Dashboard] getCurrentUser failed:', e?.message || e);
      }
    })();
  }, []);

  const greetingName = useMemo(() => {
    const u = currentUser;
    if (!u) return 'Utilisateur';
    const byNames = `${u.first_name || ''} ${u.last_name || ''}`.trim();
    return byNames || u.name || u.fullname || u.email || 'Utilisateur';
  }, [currentUser]);

  const myAppointmentsCount = useMemo(() => {
    if (!currentUser) return 0;
    const email = String(currentUser.email || '').trim().toLowerCase();
    const id = currentUser.id;
    return (appointments || []).filter(a => {
      const aEmail = String(a.email || '').trim().toLowerCase();
      return (id && a.user_id === id) || (email && aEmail === email);
    }).length;
  }, [appointments, currentUser]);

  

  const clientsThisWeek = useMemo(() => {
    return (users || []).filter(u => {
      const d = parseDateRobust(getUserCreatedAt(u));
      return d && d >= weekRange.start && d <= weekRange.end;
    });
  }, [users, weekRange]);



  return (
    <div className="min-h-screen ">
     
      {/* Main Content */}
      <div className="">
       

        {/* Main Content Area */}
        <main className="p-4 sm:p-6 lg:p-8">
          {/* Welcome Section */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              {`Bienvenue, ${greetingName} 👋`}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Voici un aperçu de votre activité aujourd'hui
            </p>
            {currentUser && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs sm:text-sm">
                <Calendar className="w-4 h-4" />
                {`Rendez-vous ${myAppointmentsCount}`}
              </div>
            )}
          </div>

          {/* Period Selector */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {[
              { value: '7days', label: '7 jours' },
              { value: '30days', label: '30 jours' },
              { value: '90days', label: '90 jours' },
              { value: 'year', label: 'Année' }
            ].map((period) => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition ${
                  selectedPeriod === period.value
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
              Erreur de chargement: {String(error)}
            </div>
          )}
          {loading && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700">
              Chargement des données en cours...
            </div>
          )}
          {actionMessage && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
              {actionMessage}
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {computedStats.map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 border border-gray-100 hover:shadow-xl transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${stat.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-semibold ${
                      stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                      <span>{stat.change}</span>
                      {stat?.delta ? <span className="opacity-70">({stat.delta})</span> : null}
                    </div>
                  </div>
                  <h3 className="text-xs sm:text-sm text-gray-600 mb-1">{stat.title}</h3>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              );
            })}
          </div>

          {/* Main Grid */}
          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Recent Appointments */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Rendez-vous récents
                    </h2>
                    <button 
                    onClick={() => navigate('/backoffice/appointments')}
                    className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                      Voir tout
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Service</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Heure</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {(appointments || []).slice(0, 10).map((apt) => {
                        const status = statusConfig[apt.status] || statusConfig.pending;
                        const serviceName = apt.service_id ? (serviceTitleById.get(String(apt.service_id)) || 'Service') : '—';
                        return (
                          <tr key={apt.id} className="hover:bg-gray-50 transition">
                            <td className="px-4 sm:px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                  {(apt.full_name || 'CL').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 truncate">{apt.full_name || 'Client'}</p>
                                  <p className="text-xs text-gray-500 sm:hidden">{serviceName}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 hidden sm:table-cell">{serviceName}</td>
                            <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 hidden md:table-cell">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-400" />
                                {apt.appointment_date ? formatTime(apt.appointment_date) : '—'}
                              </div>
                            </td>
                            <td className="px-4 sm:px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${status.bgColor} ${status.textColor}`}>
                                {status.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Projects */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Activity className="w-5 h-5 text-purple-600" />
                      Projets en cours
                    </h2>
                    <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                      Voir tout
                    </button>
                  </div>
                </div>
                <div className="p-4 sm:p-6 space-y-4">
                  {(projects || []).slice(0, 6).map((project) => {
                    const badge = project.is_active ? { bgColor: 'bg-blue-100', textColor: 'text-blue-700', label: 'Actif' } : { bgColor: 'bg-gray-100', textColor: 'text-gray-700', label: 'Inactif' };
                    return (
                      <div key={project.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-semibold text-gray-900 mb-1 truncate">{project.title}</h3>
                            <p className="text-xs text-gray-500">{project.client || 'Client non renseigné'}</p>
                          </div>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${badge.bgColor} ${badge.textColor} ml-2 flex-shrink-0`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">Catégorie</span>
                            <span className="font-semibold text-gray-900">{project.category}</span>
                          </div>
                          {project.year && (
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Année</span>
                              <span className="font-semibold text-gray-900">{project.year}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Nouveaux clients – semaine en cours */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Users className="w-5 h-5 text-green-600" />
                      Nouveaux clients (semaine en cours)
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs">
                        {clientsThisWeek.length}
                      </span>
                    </h2>
                    <button 
                      onClick={() => navigate('/backoffice/clients')}
                      className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                      Voir tout
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Nom</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">Email</th>
                        <th className="px-4 sm:px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase hidden md:table-cell">Créé le</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {clientsThisWeek.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="px-4 sm:px-6 py-6 text-center text-sm text-gray-500">
                            Aucun nouveau client cette semaine
                          </td>
                        </tr>
                      ) : (
                        clientsThisWeek.slice(0, 10).map((u) => {
                          const created = u.created_at ? new Date(u.created_at) : null;
                          const createdStr = created ? created.toLocaleDateString('fr-FR') : '—';
                          return (
                            <tr key={u.id} className="hover:bg-gray-50 transition">
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {(u.full_name || `${u.first_name || ''} ${u.last_name || ''}` || 'CL').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase()}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{u.full_name || `${u.first_name || ''} ${u.last_name || ''}`.trim() || 'Client'}</p>
                                    <p className="text-xs text-gray-500 sm:hidden">{u.email || '—'}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 hidden sm:table-cell">{u.email || '—'}</td>
                              <td className="px-4 sm:px-6 py-4 text-sm text-gray-700 hidden md:table-cell">{createdStr}</td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Activity Feed */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-orange-600" />
                  Activité récente
                </h2>
                <div className="space-y-4">
                  {activities.map((activity, idx) => {
                    const Icon = activity.icon;
                    return (
                      <div key={idx} className="flex gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 mb-1">{activity.text}</p>
                          <p className="text-xs text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-4">Actions rapides</h3>
              <div className="space-y-3">
                  <button onClick={()=>navigate('/backoffice/appointments')} className="w-full flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition text-left">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm font-medium">Nouveau RDV</span>
                  </button>
                  <button onClick={()=>navigate('/backoffice/clients')} className="w-full flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition text-left">
                    <Users className="w-5 h-5" />
                    <span className="text-sm font-medium">Ajouter client</span>
                  </button>
                  <button onClick={()=>navigate('/backoffice/invoices')} className="w-full flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl hover:bg-white/20 transition text-left">
                    <FileText className="w-5 h-5" />
                    <span className="text-sm font-medium">Créer facture</span>
                  </button>
                </div>
              </div>

              {/* Performance */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-green-600" />
                  Objectifs du mois
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">CA mensuel</span>
                      <span className="font-semibold text-gray-900">{monthlyObjectives.revenuePct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: `${monthlyObjectives.revenuePct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Nouveaux clients</span>
                      <span className="font-semibold text-gray-900">{monthlyObjectives.clientsPct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: `${monthlyObjectives.clientsPct}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Projets livrés</span>
                      <span className="font-semibold text-gray-900">{monthlyObjectives.deliveredPct}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${monthlyObjectives.deliveredPct}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

         
        </main>
      </div>
    </div>
  );
}