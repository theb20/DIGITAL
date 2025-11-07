import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { Home, Users, ShoppingCart, FileText, Settings, LogOut, Menu, X, TrendingUp, DollarSign, Package, Search, Bell, ChevronDown, Eye, Edit, Trash2, Plus, Calendar, CreditCard, Activity, Award, Mail, Phone, MapPin, Filter, Download, Upload, Save, Send, Star, Clock, CheckCircle, XCircle, AlertCircle, Zap, Target, BarChart3, PieChart as PieChartIcon, TrendingDown, RefreshCw, Globe, Smartphone, Monitor, FileJson, FileSpreadsheet, Lock } from 'lucide-react';
import serviceCategoriesApi from '../configurations/services/serviceCategories.js';
import servicesApi from '../configurations/services/services.js';
import devisRequestsApi from '../configurations/services/devisRequests.js';
import messagesApi from '../configurations/messages/messages.js';
import session from '../configurations/services/session.js';
import QuoteComponent from '../components/quote.jsx';

const BackofficeDigital = () => {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dateRange, setDateRange] = useState('30days');
  const [selectedProject, setSelectedProject] = useState(null);

  // Devis (quotes) state and helpers
  const [devisRequests, setDevisRequests] = useState([]);
  const [devisLoading, setDevisLoading] = useState(false);
  const [devisError, setDevisError] = useState(null);
  const [updatingDevisId, setUpdatingDevisId] = useState(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedDevisRequest, setSelectedDevisRequest] = useState(null);

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
      console.error('Erreur mise à jour devis:', e?.message || e);
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
      console.error('Erreur chargement devis:', e?.message || e);
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

  // Données Analytics
  const revenueData = [
    { month: 'Jan', revenus: 45000, depenses: 28000, profit: 17000 },
    { month: 'Fév', revenus: 52000, depenses: 31000, profit: 21000 },
    { month: 'Mar', revenus: 48000, depenses: 29000, profit: 19000 },
    { month: 'Avr', revenus: 61000, depenses: 35000, profit: 26000 },
    { month: 'Mai', revenus: 55000, depenses: 33000, profit: 22000 },
    { month: 'Jun', revenus: 67000, depenses: 38000, profit: 29000 },
    { month: 'Jul', revenus: 72000, depenses: 41000, profit: 31000 },
  ];

  const trafficData = [
    { day: 'Lun', visitors: 1240, pageviews: 3420, conversions: 45 },
    { day: 'Mar', visitors: 1580, pageviews: 4120, conversions: 62 },
    { day: 'Mer', visitors: 1820, pageviews: 4850, conversions: 71 },
    { day: 'Jeu', visitors: 1650, pageviews: 4320, conversions: 58 },
    { day: 'Ven', visitors: 2100, pageviews: 5680, conversions: 89 },
    { day: 'Sam', visitors: 980, pageviews: 2150, conversions: 34 },
    { day: 'Dim', visitors: 750, pageviews: 1680, conversions: 28 },
  ];

  const clientsData = [
    { segment: 'Entreprises', value: 4200, color: '#3b82f6' },
    { segment: 'PME', value: 3100, color: '#8b5cf6' },
    { segment: 'Startups', value: 2800, color: '#ec4899' },
    { segment: 'Indépendants', value: 1900, color: '#10b981' },
  ];

  const [projects, setProjects] = useState(() => [
    { 
      id: 1, 
      nom: 'Refonte Site E-commerce', 
      client: 'TechStore France',
      statut: 'En cours', 
      progression: 75,
      budget: '45,000 €',
      deadline: '2025-12-15',
      priorite: 'Haute'
    },
    { 
      id: 2, 
      nom: 'Application Mobile iOS', 
      client: 'FitLife App',
      statut: 'En cours', 
      progression: 45,
      budget: '65,000 €',
      deadline: '2026-01-30',
      priorite: 'Haute'
    },
    { 
      id: 3, 
      nom: 'Dashboard Analytics', 
      client: 'DataViz Corp',
      statut: 'En révision', 
      progression: 90,
      budget: '28,000 €',
      deadline: '2025-11-20',
      priorite: 'Moyenne'
    },
    { 
      id: 4, 
      nom: 'Campagne SEO', 
      client: 'BioMarket',
      statut: 'Planifié', 
      progression: 15,
      budget: '12,000 €',
      deadline: '2025-12-01',
      priorite: 'Basse'
    },
    { 
      id: 5, 
      nom: 'Intégration CRM', 
      client: 'SalesForce Pro',
      statut: 'Terminé', 
      progression: 100,
      budget: '38,000 €',
      deadline: '2025-10-31',
      priorite: 'Haute'
    },
  ]);
  useEffect(() => {
    const saved = localStorage.getItem('bo_projects');
    if (saved) {
      try { setProjects(JSON.parse(saved)); } catch (e) {}
    }
  }, []);
  useEffect(() => {
    localStorage.setItem('bo_projects', JSON.stringify(projects));
  }, [projects]);

  const clients = [
    { 
      id: 1, 
      nom: 'TechStore France', 
      contact: 'Sophie Martin',
      email: 'sophie@techstore.fr', 
      telephone: '+33 6 12 34 56 78',
      projets: 3,
      valeur: '125,000 €',
      statut: 'Actif',
      depuis: '2023-03-15'
    },
    { 
      id: 2, 
      nom: 'FitLife App', 
      contact: 'Marc Dubois',
      email: 'marc@fitlife.com', 
      telephone: '+33 6 98 76 54 32',
      projets: 2,
      valeur: '95,000 €',
      statut: 'Actif',
      depuis: '2023-07-22'
    },
    { 
      id: 3, 
      nom: 'DataViz Corp', 
      contact: 'Julie Bernard',
      email: 'julie@dataviz.io', 
      telephone: '+33 6 45 67 89 01',
      projets: 4,
      valeur: '180,000 €',
      statut: 'Actif',
      depuis: '2022-11-08'
    },
    { 
      id: 4, 
      nom: 'BioMarket', 
      contact: 'Pierre Roux',
      email: 'pierre@biomarket.fr', 
      telephone: '+33 6 23 45 67 89',
      projets: 1,
      valeur: '45,000 €',
      statut: 'Nouveau',
      depuis: '2025-10-01'
    },
  ];

  const team = [
    { id: 1, nom: 'Alexandre Dubois', role: 'CEO & Founder', email: 'alex@digital.com', projets: 12, disponibilite: 85, avatar: 'AD' },
    { id: 2, nom: 'Marie Laurent', role: 'Lead Designer', email: 'marie@digital.com', projets: 8, disponibilite: 60, avatar: 'ML' },
    { id: 3, nom: 'Thomas Bernard', role: 'Full Stack Dev', email: 'thomas@digital.com', projets: 6, disponibilite: 45, avatar: 'TB' },
    { id: 4, nom: 'Sarah Petit', role: 'Marketing Manager', email: 'sarah@digital.com', projets: 10, disponibilite: 70, avatar: 'SP' },
    { id: 5, nom: 'Lucas Martin', role: 'DevOps Engineer', email: 'lucas@digital.com', projets: 5, disponibilite: 90, avatar: 'LM' },
  ];

  const invoices = [
    { id: '#INV-2025-089', client: 'TechStore France', montant: '12,500 €', statut: 'Payée', date: '2025-11-01', echeance: '2025-11-15' },
    { id: '#INV-2025-088', client: 'FitLife App', montant: '8,750 €', statut: 'En attente', date: '2025-10-28', echeance: '2025-11-12' },
    { id: '#INV-2025-087', client: 'DataViz Corp', montant: '15,200 €', statut: 'Payée', date: '2025-10-25', echeance: '2025-11-09' },
    { id: '#INV-2025-086', client: 'BioMarket', montant: '6,300 €', statut: 'En retard', date: '2025-10-15', echeance: '2025-10-30' },
    { id: '#INV-2025-085', client: 'SalesForce Pro', montant: '19,800 €', statut: 'Payée', date: '2025-10-10', echeance: '2025-10-25' },
  ];

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
      console.error('Erreur chargement catégories:', e?.message || e);
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
      console.error('Erreur chargement services:', e?.message || e);
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
    { id: 'projects', name: 'Services', icon: Package, path: '/backoffice/services' },
    { id: 'devis', name: 'Suivi devis', icon: FileText, path: '/backoffice/devis' },
    { id: 'settings', name: 'Catégories', icon: Settings, path: '/backoffice/categories' },
    { id: 'messages', name: 'Messagerie', icon: Mail, path: '/backoffice/messages' },
    { id: 'clients', name: 'Clients', icon: Users, path: '/backoffice' },
    { id: 'team', name: 'Équipe', icon: Award, path: '/backoffice' },
    { id: 'finance', name: 'Finance', icon: DollarSign, path: '/backoffice' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, path: '/backoffice' },
    { id: 'tasks', name: 'Tâches', icon: CheckCircle, path: '/backoffice' },
  ];

  useEffect(() => {
    const p = location.pathname;
    if (p.includes('/backoffice/services')) setActiveMenu('projects');
    else if (p.includes('/backoffice/devis')) setActiveMenu('devis');
    else if (p.includes('/backoffice/categories')) setActiveMenu('settings');
    else if (p.includes('/backoffice/messages')) setActiveMenu('messages');
    else setActiveMenu('dashboard');
  }, [location.pathname]);

  const getStatusColor = (statut) => {
    const colors = {
      'Actif': 'bg-green-100 text-green-800',
      'Inactif': 'bg-gray-100 text-gray-800',
      'Nouveau': 'bg-blue-100 text-blue-800',
      'En cours': 'bg-blue-100 text-blue-800',
      'Terminé': 'bg-green-100 text-green-800',
      'En révision': 'bg-yellow-100 text-yellow-800',
      'Planifié': 'bg-purple-100 text-purple-800',
      'Payée': 'bg-green-100 text-green-800',
      'En attente': 'bg-yellow-100 text-yellow-800',
      'En retard': 'bg-red-100 text-red-800',
    };
    return colors[statut] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priorite) => {
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
  const STANDARD_EMAIL = import.meta.env.VITE_STANDARD_EMAIL || 'support@digital.tld';
  const currentUserEmail = session.getSessionEmail();
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
            const groups = buildGroups(messages || [], groupMode);
            return groups.map((g) => (
              <div key={(g.header?.key)||'all'} className="border-t">
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
  const [projectSearch, setProjectSearch] = useState('');
  const [projectStatusFilter, setProjectStatusFilter] = useState('');
  const [projectPriorityFilter, setProjectPriorityFilter] = useState('');
  const [projectFormOpen, setProjectFormOpen] = useState(false);
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

  const handleAddProject = () => {
    resetProjectForm();
    setProjectFormOpen(true);
  };

  const handleEditProject = (project) => {
    setProjectFormData(project);
    setProjectFormOpen(true);
  };

  const handleDeleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const handleSaveProject = () => {
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

  const handleMenuClick = (menuId) => {
    setActiveMenu(menuId);
    setMobileMenuOpen(false);
    setSidebarOpen(false);
  };

  const StatCard = ({ title, value, change, icon: Icon, color, subtitle }) => (
    <div className="bg-white rounded-xl shadow-sm p-4 md:p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-xs md:text-sm text-gray-600 mb-1">{title}</p>
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">{value}</h3>
          {subtitle && <p className="text-xs text-gray-500 mb-2">{subtitle}</p>}
          {change !== undefined && (
            <div className="flex items-center space-x-1">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600" />
              )}
              <p className={`text-xs md:text-sm font-medium ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change)}% vs période précédente
              </p>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-xl`}>
          <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-4 md:space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Revenus du mois" 
          value="72,450 €" 
          change={15.3} 
          icon={DollarSign} 
          color="bg-gradient-to-br from-blue-500 to-blue-600" 
          subtitle="Target: 80,000 €"
        />
        <StatCard 
          title="Projets actifs" 
          value="12" 
          change={8.5} 
          icon={Package} 
          color="bg-gradient-to-br from-purple-500 to-purple-600" 
          subtitle="3 livrables cette semaine"
        />
        <StatCard 
          title="Clients actifs" 
          value="48" 
          change={12.1} 
          icon={Users} 
          color="bg-gradient-to-br from-green-500 to-green-600" 
          subtitle="4 nouveaux ce mois"
        />
        <StatCard 
          title="Taux de satisfaction" 
          value="94%" 
          change={3.2} 
          icon={Star} 
          color="bg-gradient-to-br from-orange-500 to-orange-600" 
          subtitle="Basé sur 156 avis"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base md:text-lg font-semibold">Performance financière</h3>
            <select 
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7days">7 jours</option>
              <option value="30days">30 jours</option>
              <option value="90days">90 jours</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorRevenu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="revenus" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenu)" />
              <Area type="monotone" dataKey="profit" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Répartition clients par segment</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={clientsData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={90}
                fill="#8884d8"
                dataKey="value"
              >
                {clientsData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Traffic Analytics */}
      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Trafic et conversions (7 derniers jours)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={trafficData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="visitors" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            <Bar dataKey="conversions" fill="#10b981" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Projects */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold">Projets récents</h3>
          <button className="text-blue-600 text-sm font-medium hover:text-blue-700">Voir tout</button>
        </div>
        
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Projet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progression</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {projects.slice(0, 5).map((project) => (
                <tr key={project.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{project.nom}</div>
                      <div className={`text-xs ${getPriorityColor(project.priorite)}`}>
                        Priorité {project.priorite}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{project.client}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2 w-24">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${project.progression}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{project.progression}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{project.budget}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.statut)}`}>
                      {project.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {projects.slice(0, 5).map((project) => (
            <div key={project.id} className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-sm">{project.nom}</h4>
                  <p className="text-xs text-gray-600 mt-1">{project.client}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.statut)}`}>
                  {project.statut}
                </span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progression}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600">{project.progression}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-medium ${getPriorityColor(project.priorite)}`}>
                    Priorité {project.priorite}
                  </span>
                  <span className="font-semibold text-gray-900">{project.budget}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un projet..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={projectSearch}
              onChange={(e) => setProjectSearch(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2">
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              value={projectStatusFilter}
              onChange={(e) => setProjectStatusFilter(e.target.value)}
            >
              <option value="">Statut: Tous</option>
              <option value="Planifié">Planifié</option>
              <option value="En cours">En cours</option>
              <option value="En révision">En révision</option>
              <option value="Terminé">Terminé</option>
            </select>
            <select
              className="text-sm border border-gray-300 rounded-lg px-3 py-2"
              value={projectPriorityFilter}
              onChange={(e) => setProjectPriorityFilter(e.target.value)}
            >
              <option value="">Priorité: Toutes</option>
              <option value="Basse">Basse</option>
              <option value="Moyenne">Moyenne</option>
              <option value="Haute">Haute</option>
            </select>
          </div>
        </div>
        <button onClick={handleAddProject} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 text-sm">
          <Plus className="w-5 h-5" />
          <span>Nouveau projet</span>
        </button>
      </div>

      {(() => {
        const normalized = projectSearch.trim().toLowerCase();
        const filtered = projects.filter(p => {
          const matchesSearch = !normalized || [p.nom, p.client, p.statut, p.priorite].some(v => String(v).toLowerCase().includes(normalized));
          const matchesStatus = !projectStatusFilter || p.statut === projectStatusFilter;
          const matchesPriority = !projectPriorityFilter || p.priorite === projectPriorityFilter;
          return matchesSearch && matchesStatus && matchesPriority;
        });
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filtered.map((project) => (
              <div key={project.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{project.nom}</h3>
                    <p className="text-sm text-gray-600">{project.client}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(project.statut)}`}>
                    {project.statut}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Progression</span>
                      <span className="font-medium text-gray-900">{project.progression}%</span>
                    </div>
                    <div className="bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${project.progression}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Budget</p>
                      <p className="text-sm font-semibold text-gray-900">{project.budget}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Deadline</p>
                      <p className="text-sm font-medium text-gray-900">{project.deadline}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className={`text-sm font-medium ${getPriorityColor(project.priorite)}`}>
                      Priorité {project.priorite}
                    </span>
                    <div className="flex space-x-2">
                      <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleEditProject(project)} className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDeleteProject(project.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );
      })()}

      {projectFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">{projectFormData.id ? 'Modifier le projet' : 'Nouveau projet'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-gray-600">Nom</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={projectFormData.nom}
                  onChange={(e) => setProjectFormData({ ...projectFormData, nom: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Client</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={projectFormData.client}
                  onChange={(e) => setProjectFormData({ ...projectFormData, client: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Statut</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={projectFormData.statut}
                  onChange={(e) => setProjectFormData({ ...projectFormData, statut: e.target.value })}
                >
                  <option>Planifié</option>
                  <option>En cours</option>
                  <option>En révision</option>
                  <option>Terminé</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Priorité</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={projectFormData.priorite}
                  onChange={(e) => setProjectFormData({ ...projectFormData, priorite: e.target.value })}
                >
                  <option>Basse</option>
                  <option>Moyenne</option>
                  <option>Haute</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600">Progression (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={projectFormData.progression}
                  onChange={(e) => setProjectFormData({ ...projectFormData, progression: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Budget</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  placeholder="ex: 20,000 €"
                  value={projectFormData.budget}
                  onChange={(e) => setProjectFormData({ ...projectFormData, budget: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Deadline</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  value={projectFormData.deadline}
                  onChange={(e) => setProjectFormData({ ...projectFormData, deadline: e.target.value })}
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm"
                onClick={() => { setProjectFormOpen(false); resetProjectForm(); }}
              >
                Annuler
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-sm"
                onClick={handleSaveProject}
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderClients = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 text-sm">
          <Plus className="w-5 h-5" />
          <span>Nouveau client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {clients.map((client) => (
          <div key={client.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                  {client.nom.charAt(0)}
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
                <button className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100">
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
    </div>
  );

  const renderTeam = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestion de l'équipe</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 text-sm">
          <Plus className="w-5 h-5" />
          <span>Nouveau membre</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.map((member) => (
          <div key={member.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-2xl mb-3">
                {member.avatar}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{member.nom}</h3>
              <p className="text-sm text-gray-600">{member.role}</p>
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
                  <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg">
                    <Edit className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFinance = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Revenus totaux</p>
              <p className="text-2xl font-bold text-gray-900">328,450 €</p>
            </div>
          </div>
          <p className="text-sm text-green-600 font-medium">+18.5% vs année dernière</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-gray-900">45,750 €</p>
            </div>
          </div>
          <p className="text-sm text-gray-600">8 factures impayées</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">En retard</p>
              <p className="text-2xl font-bold text-gray-900">6,300 €</p>
            </div>
          </div>
          <p className="text-sm text-red-600 font-medium">Action requise</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-base md:text-lg font-semibold">Factures récentes</h3>
          <div className="flex space-x-2">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <Download className="w-5 h-5" />
            </button>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-blue-700 text-sm">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouvelle facture</span>
            </button>
          </div>
        </div>
        
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
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{invoice.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{invoice.client}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{invoice.montant}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.statut)}`}>
                      {invoice.statut}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{invoice.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{invoice.echeance}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800">
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-800">
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="md:hidden divide-y divide-gray-200">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-medium text-gray-900">{invoice.id}</p>
                  <p className="text-sm text-gray-600 mt-1">{invoice.client}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(invoice.statut)}`}>
                  {invoice.statut}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-900">{invoice.montant}</span>
                <span className="text-gray-500">Échéance: {invoice.echeance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Globe className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+12.5%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Visiteurs uniques</p>
          <p className="text-2xl font-bold text-gray-900">12,845</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="w-6 h-6 text-purple-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+8.2%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pages vues</p>
          <p className="text-2xl font-bold text-gray-900">45,231</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Target className="w-6 h-6 text-green-600" />
            </div>
            <span className="text-xs text-green-600 font-medium">+15.3%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Taux de conversion</p>
          <p className="text-2xl font-bold text-gray-900">3.24%</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-xs text-red-600 font-medium">-2.1%</span>
          </div>
          <p className="text-sm text-gray-600 mb-1">Temps moyen</p>
          <p className="text-2xl font-bold text-gray-900">4m 32s</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Sources de trafic</h3>
        <div className="space-y-4">
          {[
            { source: 'Recherche organique', visits: 5420, percentage: 42, color: 'bg-blue-500' },
            { source: 'Réseaux sociaux', visits: 3240, percentage: 25, color: 'bg-purple-500' },
            { source: 'Direct', visits: 2680, percentage: 21, color: 'bg-green-500' },
            { source: 'Referral', visits: 1540, percentage: 12, color: 'bg-orange-500' },
          ].map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-900">{item.source}</span>
                <span className="text-sm text-gray-600">{item.visits.toLocaleString()} visites ({item.percentage}%)</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className={`${item.color} h-2 rounded-full`} style={{ width: `${item.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Appareils</h3>
          <div className="space-y-4">
            {[
              { device: 'Desktop', icon: Monitor, visits: 7240, percentage: 56 },
              { device: 'Mobile', icon: Smartphone, visits: 4580, percentage: 36 },
              { device: 'Tablette', icon: Smartphone, visits: 1025, percentage: 8 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-900">{item.device}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">{item.visits.toLocaleString()}</span>
                  <span className="text-sm font-medium text-gray-900 w-12 text-right">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Pages populaires</h3>
          <div className="space-y-3">
            {[
              { page: '/services', views: 8420 },
              { page: '/portfolio', views: 6280 },
              { page: '/contact', views: 4150 },
              { page: '/blog', views: 3680 },
              { page: '/about', views: 2940 },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-900 font-mono">{item.page}</span>
                <span className="text-sm font-medium text-gray-600">{item.views.toLocaleString()} vues</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h2 className="text-xl font-bold text-gray-900">Gestion des tâches</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 text-sm">
          <Plus className="w-5 h-5" />
          <span>Nouvelle tâche</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* À faire */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">À faire</h3>
            <span className="px-2 py-1 bg-gray-200 text-gray-700 text-xs font-medium rounded-full">8</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">Révision design homepage</h4>
                  <span className="text-xs text-red-600 font-medium">Haute</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">TechStore France</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full border-2 border-white"></div>
                    <div className="w-6 h-6 bg-purple-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-xs text-gray-500">15 Nov</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* En cours */}
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">En cours</h3>
            <span className="px-2 py-1 bg-blue-200 text-blue-700 text-xs font-medium rounded-full">5</span>
          </div>
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm">Développement API REST</h4>
                  <span className="text-xs text-yellow-600 font-medium">Moyenne</span>
                </div>
                <p className="text-xs text-gray-600 mb-3">FitLife App</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-xs text-gray-500">20 Nov</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terminé */}
        <div className="bg-green-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Terminé</h3>
            <span className="px-2 py-1 bg-green-200 text-green-700 text-xs font-medium rounded-full">12</span>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 shadow-sm opacity-75">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-medium text-gray-900 text-sm line-through">Migration serveur</h4>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="text-xs text-gray-600 mb-3">DataViz Corp</p>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-6 h-6 bg-orange-500 rounded-full border-2 border-white"></div>
                  </div>
                  <span className="text-xs text-gray-500">10 Nov</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Paramètres</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          {['Profil', 'Entreprise', 'Facturation', 'Notifications', 'Sécurité', 'Intégrations'].map((item) => (
            <button key={item} className="w-full text-left px-4 py-3 bg-white rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              {item}
            </button>
          ))}
        </div>

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">

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

            <div className="border rounded-xl overflow-hidden">
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
                {s.price != null ? `${s.price} Fcfa` : ""}
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix (€)</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prix d’origine (€)</label>
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
      </div>
    </div>
  );

  const renderDevis = () => (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center">
        <h2 className="text-xl font-bold text-gray-900">Suivi des devis</h2>
        <button onClick={loadDevis} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 text-sm">
          <RefreshCw className="w-5 h-5" />
          <span>Rafraîchir</span>
        </button>
      </div>

      {devisError && (
        <div className="p-3 bg-red-50 text-red-700 text-sm rounded-lg">{devisError}</div>
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
                devisRequests.map((d, idx) => {
                  const client = d?.client_name || d?.clientName || d?.client || d?.name || '—';
                  const email = d?.email || d?.client_email || d?.contact?.email || '—';
                  const type = d?.service_type || d?.type || d?.category || '—';
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
                        <button
                          onClick={() => openQuoteModal(d)}
                          className="px-3 py-2 bg-black text-white text-xs rounded-lg hover:bg-gray-900"
                        >
                          Voir devis / Répondre
                        </button>
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
    </div>
  );

  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard': return renderDashboard();
      case 'projects': return renderProjects();
      case 'devis': return renderDevis();
      case 'clients': return renderClients();
      case 'team': return renderTeam();
      case 'finance': return renderFinance();
      case 'analytics': return renderAnalytics();
      case 'tasks': return renderTasks();
      case 'messages': return renderMessages();
      case 'settings': return renderSettings();
      default: return renderDashboard();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside className={`hidden lg:flex ${sidebarOpen ? 'w-64' : 'w-20'} bg-gradient-to-b from-gray-900 to-gray-800 text-white transition-all duration-300 flex-col`}>
        <div className="p-4 flex items-center justify-between border-b border-gray-700">
          {sidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Digital BO</h1>}
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

          {sidebarOpen && (
            <div className="mt-4">
              <div className="px-3 text-xs uppercase tracking-wide text-gray-400 mb-2">Services</div>
              <div className="space-y-1">
                {Array.isArray(services) && services.length > 0 ? (
                  services.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => openEditService(s)}
                      className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-700"
                      title={s.title || ''}
                    >
                      <Package className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm truncate">{s.title || '(Sans titre)'}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-gray-400">Aucun service</div>
                )}
              </div>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg">
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-200 p-3 flex items-center justify-between lg:justify-end">
          {/* Mobile menu toggle */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 border rounded-lg">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center space-x-3">
            <button className="p-2 border border-gray-200 rounded-lg">
              <Bell className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2 px-3 py-2 border border-gray-200 rounded-lg">
              <img src="/img/web-app-manifest-192x192.png" alt="" className="w-6 h-6 rounded-lg" />
              <span className="text-sm font-medium">Admin</span>
              <ChevronDown className="w-4 h-4 text-gray-500" />
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
      </div>
    </div>
  );
};

export default BackofficeDigital;