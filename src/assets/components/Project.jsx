import React, { useState, useEffect } from "react";
import invoicesService from '../configurations/services/invoices.js';
import projectsApi from '../configurations/services/projects.js';
import { Briefcase, Plus, Trash2, Edit2, Save, X, DollarSign, Calendar, CheckCircle, Clock, AlertCircle, Download, Upload, Search, Send, Loader2 } from "lucide-react";

const STATUS_COLORS = {
  pending: { bg: "bg-yellow-100", text: "text-yellow-800", border: "border-yellow-300", icon: Clock },
  paid: { bg: "bg-green-100", text: "text-green-800", border: "border-green-300", icon: CheckCircle },
  project: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300", icon: Briefcase },
  sent: { bg: "bg-indigo-100", text: "text-indigo-800", border: "border-indigo-300", icon: Send },
  rejected: { bg: "bg-red-100", text: "text-red-800", border: "border-red-300", icon: AlertCircle },
  overdue: { bg: "bg-orange-100", text: "text-orange-800", border: "border-orange-300", icon: AlertCircle }
};

const STATUS_LABELS = {
  pending: "En attente",
  paid: "Payée",
  project: "Projet actif",
  sent: "Envoyée",
  rejected: "Refusée",
  overdue: "En retard"
};

export default function ProjectManager() {
  // Stockage sécurisé: utilise window.storage si disponible, sinon fallback localStorage
  const safeStorage = React.useMemo(() => {
    const hasAsyncStorage = typeof window !== 'undefined' && window.storage && typeof window.storage.get === 'function' && typeof window.storage.set === 'function';
    if (hasAsyncStorage) return window.storage;
    return {
      get: async (key) => {
        try {
          const value = localStorage.getItem(key);
          return value ? { value } : null;
        } catch (e) {
          console.warn('localStorage get error', e);
          return null;
        }
      },
      set: async (key, value) => {
        try {
          localStorage.setItem(key, value);
          return true;
        } catch (e) {
          console.warn('localStorage set error', e);
          return false;
        }
      }
    };
  }, []);
  const [invoices, setInvoices] = useState([]);
  const [projects, setProjects] = useState([]);
  const [existingProjectRefs, setExistingProjectRefs] = useState(new Set());
  const [showAddInvoice, setShowAddInvoice] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [notification, setNotification] = useState(null);
  const [selectedInvoiceIds, setSelectedInvoiceIds] = useState(new Set());
  // Référentiel: invoiceId -> backend project id
  const [backendProjectByInvoiceId, setBackendProjectByInvoiceId] = useState(new Map());
  // Brouillons de livrables par projet (file, to, message)
const [deliverableDrafts, setDeliverableDrafts] = useState({});
const [sendingDeliverable, setSendingDeliverable] = useState({});

  const [formData, setFormData] = useState({
    clientName: "",
    invoiceNumber: "",
    amount: "",
    dueDate: "",
    description: "",
    status: "pending"
  });

  useEffect(() => {
    loadData();
  }, []);

  // Charger les projets backend pour éviter les doublons lors de la persistance
  useEffect(() => {
    (async () => {
      try {
        const rows = await projectsApi.list();
        const setRefs = new Set();
        const map = new Map();
        for (const r of Array.isArray(rows) ? rows : []) {
          const tags = r?.tags;
          const arr = Array.isArray(tags) ? tags : (typeof tags === 'string' ? (() => { try { return JSON.parse(tags); } catch { return []; } })() : []);
          for (const t of arr) {
            const m = String(t).match(/^invoice:(.+)$/);
            if (m) {
              setRefs.add(m[1]);
              map.set(String(m[1]), r.id);
            }
          }
        }
        setExistingProjectRefs(setRefs);
        setBackendProjectByInvoiceId(map);
      } catch (e) {
        // Best-effort; ne pas bloquer l'UI
        console.warn('Chargement projets backend échoué:', e?.message || e);
      }
    })();
  }, []);

  // Synchroniser automatiquement: toute facture "Payée" devient projet si pas déjà convertie
  useEffect(() => {
    if (!Array.isArray(invoices) || !Array.isArray(projects)) return;
    const paidWithoutProject = invoices.filter(inv => inv.status === 'paid' && !projects.some(p => p.invoiceId === inv.id));
    if (paidWithoutProject.length === 0) return;

    const newProjects = paidWithoutProject.map(inv => ({
      id: `${inv.id}-proj`,
      invoiceId: inv.id,
      name: `Projet ${inv.clientName}`,
      client: inv.clientName,
      clientEmail: inv.clientEmail || null,
      budget: inv.amount,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      progress: 0,
      tasks: [],
      notes: inv.description || '',
      createdAt: new Date().toISOString()
    }));

    setProjects(prev => [...prev, ...newProjects]);
    setInvoices(prev => prev.map(inv =>
      (inv.status === 'paid' && newProjects.some(p => p.invoiceId === inv.id))
        ? { ...inv, status: 'project' }
        : inv
    ));
    showNotification(`✅ ${newProjects.length} projet(s) créé(s) à partir des factures payées`);

    // Persister côté backend (éviter doublons via tag invoice:<id>)
    (async () => {
      for (const p of newProjects) {
        const inv = invoices.find(i => i.id === p.invoiceId);
        const invoiceIdStr = String(p.invoiceId);
        if (existingProjectRefs.has(invoiceIdStr)) continue;
        try {
          const payload = {
            title: p.name,
            category: 'Projet',
            description: p.notes || null,
            image_url: null,
            client: p.client || null,
            year: (p.startDate || '').slice(0,4) || null,
            tags: [
              'from_invoice',
              `invoice:${invoiceIdStr}`,
              inv?.invoiceNumber ? `invnum:${inv.invoiceNumber}` : null,
              `amount:${p.budget}`,
            ].filter(Boolean),
            is_active: true,
          };
          const created = await projectsApi.create(payload);
          setExistingProjectRefs(prev => new Set(prev).add(invoiceIdStr));
          if (created?.id) {
            setBackendProjectByInvoiceId(prev => new Map(prev).set(invoiceIdStr, created.id));
          }
        } catch (e) {
          console.warn('Persistance projet backend échouée:', e?.message || e);
        }
      }
    })();
  }, [invoices, projects]);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    try {
      const invoicesResult = await safeStorage.get('invoices-data');
      const projectsResult = await safeStorage.get('projects-data');

      let parsedInvoices = null;
      let parsedProjects = null;
      try {
        parsedInvoices = invoicesResult ? JSON.parse(invoicesResult.value) : null;
      } catch (e) {
        console.warn('Parse error for invoices-data:', e);
        parsedInvoices = null;
      }
      try {
        parsedProjects = projectsResult ? JSON.parse(projectsResult.value) : null;
      } catch (e) {
        console.warn('Parse error for projects-data:', e);
        parsedProjects = null;
      }

      if (parsedInvoices) setInvoices(parsedInvoices);
      if (parsedProjects) setProjects(parsedProjects);

      // Si aucune facture en storage, charger depuis le backend et mapper le format
      setInvoices(prev => Array.isArray(prev) ? prev : []);
      if (!parsedInvoices || !Array.isArray(parsedInvoices) || parsedInvoices.length === 0) {
        try {
          const rows = await invoicesService.list();
          const mapStatus = (s) => {
            switch (String(s || '').toLowerCase()) {
              case 'payée': return 'paid';
              case 'en_attente': return 'pending';
              case 'envoyée': return 'sent';
              case 'refusée': return 'rejected';
              default: return 'pending';
            }
          };
          const mapped = (Array.isArray(rows) ? rows : []).map(r => ({
            id: String(r.id ?? Date.now()),
            clientName: r.client_name || r.requester_email || 'Client',
            clientEmail: r.requester_email || null,
            invoiceNumber: r.id ? `INV-${r.id}` : (r.devis_submission_id ? `DEV-${r.devis_submission_id}` : `INV-${Date.now()}`),
            amount: Number(r.amount ?? 0),
            dueDate: r.due_date ? new Date(r.due_date).toISOString().slice(0,10) : '',
            description: '',
            status: mapStatus(r.status),
            createdAt: r.created_at ? new Date(r.created_at).toISOString() : new Date().toISOString(),
            updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
            paymentLink: r.payment_link || null,
          }));
          // Marquer en retard si date dépassée et non payée (sans bloc catch vide)
          const nowTs = Date.now();
          for (const m of mapped) {
            const dueTs = Date.parse(m.dueDate || '');
            const isDateValid = !Number.isNaN(dueTs);
            const isUnpaid = m.status !== 'paid' && m.status !== 'project' && m.status !== 'rejected';
            if (isDateValid && isUnpaid && dueTs < nowTs) {
              m.status = 'overdue';
            }
          }
          if (mapped.length) setInvoices(mapped);
        } catch (err) {
          console.error('Chargement backend des factures échoué:', err);
        }
      }
    } catch (error) {
      console.log('Première utilisation', error);
    }
  };

  const saveData = async () => {
    try {
      await safeStorage.set('invoices-data', JSON.stringify(invoices));
      await safeStorage.set('projects-data', JSON.stringify(projects));
      showNotification('✅ Données sauvegardées');
    } catch (error) {
      console.error(error);
      showNotification('❌ Erreur de sauvegarde', 'error');
    }
  };

  const resetForm = () => {
    setFormData({
      clientName: "",
      invoiceNumber: "",
      amount: "",
      dueDate: "",
      description: "",
      status: "pending"
    });
    setEditingId(null);
    setShowAddInvoice(false);
  };

  const handleSubmit = () => {
    if (!formData.clientName || !formData.invoiceNumber || !formData.amount) {
      showNotification('⚠️ Veuillez remplir tous les champs obligatoires', 'warning');
      return;
    }

    const invoiceData = {
      ...formData,
      id: editingId || Date.now().toString(),
      amount: parseFloat(formData.amount),
      createdAt: editingId ? invoices.find(i => i.id === editingId)?.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Prépare le nouvel état des factures (ajout ou mise à jour)
    let nextInvoices;
    if (editingId) {
      nextInvoices = invoices.map(inv => inv.id === editingId ? invoiceData : inv);
      showNotification('✅ Facture mise à jour');
    } else {
      nextInvoices = [...invoices, invoiceData];
      showNotification('✅ Facture ajoutée');
    }

    // Si la facture est payée, créer automatiquement un projet (évite les doublons)
    if (invoiceData.status === 'paid') {
      const existingProject = projects.find(p => p.invoiceId === invoiceData.id);
      if (!existingProject) {
        const project = {
          id: Date.now().toString(),
          invoiceId: invoiceData.id,
          name: `Projet ${invoiceData.clientName}`,
          client: invoiceData.clientName,
          clientEmail: invoiceData.clientEmail || null,
          budget: invoiceData.amount,
          startDate: new Date().toISOString().split('T')[0],
          status: 'active',
          progress: 0,
          tasks: [],
          notes: invoiceData.description || '',
          createdAt: new Date().toISOString()
        };

        // Marque la facture comme projet
        nextInvoices = nextInvoices.map(inv => inv.id === invoiceData.id ? { ...inv, status: 'project' } : inv);
        setProjects([...projects, project]);
        showNotification('✅ Projet créé avec succès');

        // Persister côté backend
        (async () => {
          const invoiceIdStr = String(project.invoiceId);
          if (!existingProjectRefs.has(invoiceIdStr)) {
            try {
              const payload = {
                title: project.name,
                category: 'Projet',
                description: project.notes || null,
                image_url: null,
                client: project.client || null,
                year: (project.startDate || '').slice(0,4) || null,
                tags: [
                  'from_invoice',
                  `invoice:${invoiceIdStr}`,
                  invoiceData?.invoiceNumber ? `invnum:${invoiceData.invoiceNumber}` : null,
                  `amount:${project.budget}`,
                ].filter(Boolean),
                is_active: true,
              };
              await projectsApi.create(payload);
              setExistingProjectRefs(prev => new Set(prev).add(invoiceIdStr));
            } catch (e) {
              console.warn('Persistance projet backend échouée:', e?.message || e);
            }
          }
        })();
      }
    }

    setInvoices(nextInvoices);
    resetForm();
  };

  const deleteInvoice = (id) => {
    if (confirm('Supprimer cette facture ?')) {
      setInvoices(invoices.filter(inv => inv.id !== id));
      setProjects(projects.filter(p => p.invoiceId !== id));
      showNotification('🗑️ Facture supprimée');
    }
  };

  const editInvoice = (invoice) => {
    setFormData({
      clientName: invoice.clientName,
      invoiceNumber: invoice.invoiceNumber,
      amount: invoice.amount.toString(),
      dueDate: invoice.dueDate,
      description: invoice.description,
      status: invoice.status
    });
    setEditingId(invoice.id);
    setShowAddInvoice(true);
  };

  const convertToProject = (invoice) => {
    if (invoice.status !== 'paid') {
      showNotification('⚠️ Seules les factures payées peuvent devenir des projets', 'warning');
      return;
    }

    const existingProject = projects.find(p => p.invoiceId === invoice.id);
    if (existingProject) {
      showNotification('⚠️ Ce projet existe déjà', 'warning');
      return;
    }

    const project = {
      id: Date.now().toString(),
      invoiceId: invoice.id,
      name: `Projet ${invoice.clientName}`,
      client: invoice.clientName,
      clientEmail: invoice.clientEmail || null,
      budget: invoice.amount,
      startDate: new Date().toISOString().split('T')[0],
      status: 'active',
      progress: 0,
      tasks: [],
      notes: invoice.description || '',
      createdAt: new Date().toISOString()
    };

    setProjects([...projects, project]);
    setInvoices(invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'project' } : inv
    ));
    showNotification('✅ Projet créé avec succès');

    // Persister côté backend
    (async () => {
      const invoiceIdStr = String(project.invoiceId);
      if (!existingProjectRefs.has(invoiceIdStr)) {
        try {
          const payload = {
            title: project.name,
            category: 'Projet',
            description: project.notes || null,
            image_url: null,
            client: project.client || null,
            year: (project.startDate || '').slice(0,4) || null,
            tags: [
              'from_invoice',
              `invoice:${invoiceIdStr}`,
              invoice?.invoiceNumber ? `invnum:${invoice.invoiceNumber}` : null,
              `amount:${project.budget}`,
            ].filter(Boolean),
            is_active: true,
          };
          await projectsApi.create(payload);
          setExistingProjectRefs(prev => new Set(prev).add(invoiceIdStr));
        } catch (e) {
          console.warn('Persistance projet backend échouée:', e?.message || e);
        }
      }
    })();
  };

  const updateProjectProgress = (projectId, progress) => {
    setProjects(projects.map(p => 
      p.id === projectId ? { ...p, progress: parseInt(progress) } : p
    ));
  };

  const deleteProject = (projectId) => {
    if (confirm('Supprimer ce projet ?')) {
      const project = projects.find(p => p.id === projectId);
      setProjects(projects.filter(p => p.id !== projectId));
      
      if (project?.invoiceId) {
        setInvoices(invoices.map(inv => 
          inv.id === project.invoiceId ? { ...inv, status: 'paid' } : inv
        ));
      }
      
      showNotification('🗑️ Projet supprimé');
    }
  };

  const exportData = () => {
    const data = { invoices, projects, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `projets-factures-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📥 Données exportées');
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.invoices) setInvoices(data.invoices);
        if (data.projects) setProjects(data.projects);
        showNotification('✅ Données importées');
      } catch (error) {
        console.error(error);
        showNotification('❌ Fichier invalide', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredInvoices = invoices.filter(inv => {
    const status = String(inv.status || '').trim().toLowerCase();
    const matchesSearch = String(inv.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || status === String(filterStatus).toLowerCase();
    return matchesSearch && matchesFilter;
  });

  // Sélection et conversion en lot
  const toggleInvoiceSelection = (id) => {
    setSelectedInvoiceIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedInvoiceIds(new Set());

  const selectAllFiltered = () => {
    setSelectedInvoiceIds(new Set(filteredInvoices.map(i => i.id)));
  };

  const convertSelectedToProjects = () => {
    for (const id of selectedInvoiceIds) {
      const inv = invoices.find(i => i.id === id);
      if (inv) {
        convertToProject(inv);
      }
    }
    clearSelection();
  };

  const stats = {
    total: invoices.reduce((sum, inv) => sum + inv.amount, 0),
    paid: invoices.filter(inv => inv.status === 'paid' || inv.status === 'project').reduce((sum, inv) => sum + inv.amount, 0),
    pending: invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0),
    projectsCount: projects.length
  };

  const updateDeliverableDraft = (projectId, patch) => {
    setDeliverableDrafts(prev => ({
      ...prev,
      [projectId]: { ...(prev[projectId] || {}), ...patch }
    }));
  };

  const sendDeliverable = async (project) => {
    if (sendingDeliverable[project.id]) {
      return; // Empêche les envois multiples simultanés
    }
    const draft = deliverableDrafts[project.id] || {};
    const file = draft.file;
    let toEmail = String(draft.to || '').trim();
    if (!toEmail) {
      const fallback = project?.clientEmail || (invoices.find(i => i.id === project.invoiceId)?.clientEmail) || '';
      toEmail = String(fallback || '').trim();
    }
    const message = String(draft.message || '').trim();
    if (!file) {
      showNotification('⚠️ Sélectionnez un fichier livrable', 'warning');
      return;
    }
    if (!toEmail) {
      showNotification('⚠️ Email client introuvable. Renseignez un email.', 'warning');
      return;
    }

    const invoiceIdStr = String(project.invoiceId || '').trim();
    let backendId = backendProjectByInvoiceId.get(invoiceIdStr);
    if (!backendId) {
      try {
        const payload = {
          title: project.name,
          category: 'Projet',
          description: project.notes || null,
          image_url: null,
          client: project.client || null,
          year: (project.startDate || '').slice(0,4) || null,
          tags: ['manual_deliverable', invoiceIdStr ? `invoice:${invoiceIdStr}` : null].filter(Boolean),
          is_active: true,
        };
        const created = await projectsApi.create(payload);
        backendId = created?.id;
        if (backendId) {
          setBackendProjectByInvoiceId(prev => new Map(prev).set(invoiceIdStr, backendId));
        }
      } catch (e) {
        console.warn('Création backend projet pour livrable échouée:', e?.message || e);
      }
    }

    if (!backendId) {
      showNotification('❌ Impossible de trouver/créer le projet backend', 'error');
      return;
    }

    try {
      setSendingDeliverable(prev => ({ ...prev, [project.id]: true }));
      const fileBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const res = String(reader.result || '');
          const base64 = res.split(',')[1] || res;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const resp = await projectsApi.uploadDeliverable(backendId, {
        filename: file.name,
        mimeType: file.type || 'application/octet-stream',
        file_base64: fileBase64,
        to: toEmail,
        message,
      });

      if (resp?.deliverable_url) {
        setProjects(prev => prev.map(p => p.id === project.id ? { ...p, deliverableUrl: resp.deliverable_url, deliverableMessage: message } : p));
      }
      showNotification(resp?.emailed ? '✅ Livrable envoyé au client' : '✅ Livrable enregistré (email non envoyé)');
      updateDeliverableDraft(project.id, { file: null, message: '', to: '' });
    } catch (e) {
      console.error(e);
      showNotification('❌ Erreur lors de l’envoi du livrable', 'error');
    } finally {
      setSendingDeliverable(prev => ({ ...prev, [project.id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 p-4 md:p-8">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-500 text-white' :
          notification.type === 'warning' ? 'bg-orange-500 text-white' :
          'bg-green-500 text-white'
        }`}>
          {notification.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
          {notification.message}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-lg ring-1 ring-slate-200 p-6 md:p-7 mb-6 transition-shadow hover:shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-3 rounded-xl shadow">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Gestion Projets & Factures</h1>
                <p className="text-gray-500 text-sm">Transformez vos factures payées en projets</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={saveData} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow hover:shadow-md hover:scale-[1.02]">
                <Save className="w-4 h-4" /> Sauvegarder
              </button>
              <button onClick={exportData} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow hover:shadow-md hover:scale-[1.02]">
                <Download className="w-4 h-4" /> Export
              </button>
              <label className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow hover:shadow-md hover:scale-[1.02] cursor-pointer">
                <Upload className="w-4 h-4" /> Import
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200 p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Total Factures</p>
                <p className="text-3xl font-bold text-slate-800">{stats.total.toFixed(2)}€</p>
              </div>
              <DollarSign className="w-12 h-12 text-gray-300" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200 p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Payé</p>
                <p className="text-3xl font-bold text-green-600">{stats.paid.toFixed(2)}€</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-300" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200 p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">En attente</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending.toFixed(2)}€</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-300" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md ring-1 ring-slate-200 p-6 transition-shadow hover:shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Projets actifs</p>
                <p className="text-3xl font-bold text-blue-600">{stats.projectsCount}</p>
              </div>
              <Briefcase className="w-12 h-12 text-blue-300" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md ring-1 ring-slate-200 p-6 transition-shadow hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">💼 Factures</h2>
                <button
                  onClick={() => setShowAddInvoice(!showAddInvoice)}
                  className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow hover:shadow-md hover:scale-[1.02]"
                >
                  {showAddInvoice ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {showAddInvoice ? 'Annuler' : 'Nouvelle facture'}
                </button>
              </div>

              <div className="flex gap-2 mb-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none shadow-sm"
                  />
                </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none shadow-sm"
              >
                <option value="all">Tous</option>
                <option value="pending">En attente</option>
                <option value="sent">Envoyées</option>
                <option value="paid">Payées</option>
                <option value="project">Projets</option>
                <option value="overdue">En retard</option>
                <option value="rejected">Refusées</option>
              </select>
              </div>

              {showAddInvoice && (
                <div className="bg-slate-50 rounded-xl p-5 mb-5 border border-slate-200">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Nom du client *"
                      value={formData.clientName}
                      onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none shadow-sm"
                    />
                    <input
                      type="text"
                      placeholder="N° Facture *"
                      value={formData.invoiceNumber}
                      onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-800 focus:outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Montant (€) *"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-800 focus:outline-none"
                    />
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-800 focus:outline-none"
                    />
                  </div>

                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-800 focus:outline-none mb-3"
                  >
                    <option value="pending">En attente</option>
                    <option value="paid">Payée</option>
                  </select>

                  <textarea
                    placeholder="Description / Notes"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-800 focus:outline-none mb-3"
                    rows="2"
                  />

                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmit}
                      className="flex-1 bg-slate-800 text-white py-2 rounded-lg hover:bg-slate-700 transition font-semibold"
                    >
                      {editingId ? 'Mettre à jour' : 'Ajouter'}
                    </button>
                    <button
                      onClick={resetForm}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              )}

              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Aucune facture trouvée</p>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm text-gray-600">
                        {selectedInvoiceIds.size} facture(s) sélectionnée(s)
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={selectAllFiltered} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 border border-gray-300">Tout sélectionner</button>
                        <button onClick={clearSelection} className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 border border-gray-300">Vider</button>
                        <button onClick={convertSelectedToProjects} className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Créer projets (sélection)</button>
                      </div>
                    </div>
                    {filteredInvoices.map(invoice => {
                    const statusConfig = STATUS_COLORS[invoice.status];
                    const StatusIcon = statusConfig.icon;
                    
                    return (
                      <div key={invoice.id} className={`border-2 ${statusConfig.border} rounded-lg p-4 ${statusConfig.bg}`}>
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={selectedInvoiceIds.has(invoice.id)}
                                  onChange={() => toggleInvoiceSelection(invoice.id)}
                                />
                                <span className="text-xs text-gray-700">Sélectionner</span>
                              </label>
                              <h3 className="font-bold text-lg text-gray-900">{invoice.clientName}</h3>
                              <span className={`text-xs px-2 py-1 rounded-full ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border} flex items-center gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {STATUS_LABELS[invoice.status]}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600">N° {invoice.invoiceNumber}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-2xl font-bold text-gray-900">{invoice.amount.toFixed(2)}€</p>
                            {invoice.dueDate && (
                              <p className="text-xs text-gray-600 flex items-center gap-1 justify-end">
                                <Calendar className="w-3 h-3" />
                                {new Date(invoice.dueDate).toLocaleDateString()}
                              </p>
                            )}
                            {invoice.paymentLink && (
                              <p className="mt-1 text-xs">
                                <a href={invoice.paymentLink} target="_blank" rel="noreferrer" className="text-blue-700 underline">Lien de paiement</a>
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {invoice.description && (
                          <p className="text-sm text-gray-700 mb-3">{invoice.description}</p>
                        )}
                        
                        <div className="flex gap-2">
                          {invoice.status === 'paid' && (
                            <button
                              onClick={() => convertToProject(invoice)}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-semibold"
                            >
                              <Briefcase className="w-4 h-4" />
                              Créer projet
                            </button>
                          )}
                          <button
                            onClick={() => editInvoice(invoice)}
                            className="flex items-center gap-1 bg-gray-700 text-white px-3 py-2 rounded-lg hover:bg-gray-800 transition text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteInvoice(invoice.id)}
                            className="flex items-center gap-1 bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md ring-1 ring-slate-200 p-6 transition-shadow hover:shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">🚀 Projets Actifs</h2>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {projects.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="font-semibold">Aucun projet actif</p>
                    <p className="text-sm">Convertissez une facture payée en projet</p>
                  </div>
                ) : (
                  projects.map(project => {
                    return (
                      <div key={project.id} className="bg-blue-50/70 rounded-2xl p-5 ring-1 ring-blue-200 shadow-sm mb-4 transition-shadow hover:shadow-md">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-xl text-gray-900 mb-1">{project.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">Client: {project.client}</p>
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                              <DollarSign className="w-4 h-4" />
                              <span className="font-semibold">{project.budget.toFixed(2)}€</span>
                              <span className="text-gray-400">•</span>
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(project.startDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => deleteProject(project.id)}
                            className="text-red-600 hover:text-red-800 hover:bg-red-100 p-2 rounded-lg transition-all hover:scale-[1.03]"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        {project.notes && (
                          <p className="text-sm text-gray-700 mb-3 p-3 bg-slate-50 rounded-lg border border-slate-200">{project.notes}</p>
                        )}

                        {/* Zone Livrable: fichier + email + message */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-4 transition-shadow hover:shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-700">Livrable</span>
                            {project.deliverableUrl && (
                              <a href={project.deliverableUrl} target="_blank" rel="noreferrer" className="text-xs text-blue-700 underline">Voir le livrable</a>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                            <input
                              type="file"
                              onChange={(e) => updateDeliverableDraft(project.id, { file: e.target.files?.[0] || null })}
                              disabled={!!sendingDeliverable[project.id]}
                              className="px-2 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                            />
                          <input
                              type="email"
                              placeholder="Email du client"
                              value={(deliverableDrafts[project.id]?.to) || project.clientEmail || ''}
                              onChange={(e) => updateDeliverableDraft(project.id, { to: e.target.value })}
                              disabled={!!sendingDeliverable[project.id]}
                              className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          />
                            <button
                              disabled={!!sendingDeliverable[project.id]}
                              aria-busy={!!sendingDeliverable[project.id]}
                              onClick={() => sendDeliverable(project)}
                              className="flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-all text-sm font-semibold shadow hover:shadow-md hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:scale-100"
                            >
                              {sendingDeliverable[project.id] ? (
                                <>
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Envoi en cours...
                                </>
                              ) : (
                                <>
                                  <Upload className="w-4 h-4" />
                                  Envoyer le livrable
                                </>
                              )}
                            </button>
                          </div>
                          <textarea
                            placeholder="Message à envoyer avec le lien"
                            rows={2}
                            value={(deliverableDrafts[project.id]?.message) || ''}
                            onChange={(e) => updateDeliverableDraft(project.id, { message: e.target.value })}
                            disabled={!!sendingDeliverable[project.id]}
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-slate-900 focus:outline-none shadow-sm disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                          />
                        </div>

                        <div className="mb-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-gray-700">Progression</span>
                            <span className="text-sm font-bold text-blue-600">{project.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300 rounded-full shadow-sm"
                              style={{ width: `${project.progress}%` }}
                            />
                          </div>
                        </div>

                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={project.progress}
                          onChange={(e) => updateProjectProgress(project.id, e.target.value)}
                          className="w-full mt-2 accent-black"
                        />
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}