import React, { useState, useEffect } from "react";
import { Calendar, Users, Trash2, Plus, RefreshCw, Download, Save, Upload, AlertCircle, CheckCircle, Mail } from "lucide-react";
import userService from "../configurations/services/user.js";
import planningsApi from "../configurations/services/plannings.js";

const JOURS_SEMAINE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

export default function PlanningGenerator() {
  const [employees, setEmployees] = useState([]);
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [selectedUserEmail, setSelectedUserEmail] = useState("");
  const [planning, setPlanning] = useState([]);
  const [employeesPerDay, setEmployeesPerDay] = useState(3);
  const [maxDaysPerEmployee, setMaxDaysPerEmployee] = useState(3);
  const [constraints, setConstraints] = useState({});
  const [selectedDays, setSelectedDays] = useState([0, 1, 2, 3, 4, 5]);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const [generationAttempts, setGenerationAttempts] = useState(100);
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const all = await userService.list();
        const eligible = (Array.isArray(all) ? all : []).filter(u => ['admin','manager'].includes(String(u.role || '').toLowerCase()));
        const mapped = eligible.map(u => ({
          email: String(u.email || '').trim(),
          name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || String(u.email || '').trim()
        })).filter(u => u.email);
        setEligibleUsers(mapped);
      } catch (e) {
        console.error('Erreur chargement utilisateurs éligibles:', e?.message || e);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const rows = await planningsApi.list();
        setHistory(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.error('Erreur chargement historique:', e?.message || e);
      }
    })();
  }, []);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadData = async () => {
    try {
      const dataResult = await window.storage.get('planning-data-v2');
      if (dataResult) {
        const data = JSON.parse(dataResult.value);
        setEmployees(data.employees || []);
        setConstraints(data.constraints || {});
        setEmployeesPerDay(data.employeesPerDay || 3);
        setMaxDaysPerEmployee(data.maxDaysPerEmployee || 3);
        setSelectedDays(data.selectedDays || [0, 1, 2, 3, 4, 5]);
        setGenerationAttempts(data.generationAttempts || 100);
      }
    } catch {
      console.log('Première utilisation');
    }
  };

  const loadWeekByKey = async (weekKey) => {
    try {
      const saved = await planningsApi.getByWeek(weekKey);
      const data = typeof saved?.data === 'string' ? JSON.parse(saved.data) : (saved?.data || {});
      setEmployees(Array.isArray(data.employees) ? data.employees : []);
      setConstraints(data.constraints || {});
      setEmployeesPerDay(Number(data.employeesPerDay ?? employeesPerDay));
      setMaxDaysPerEmployee(Number(data.maxDaysPerEmployee ?? maxDaysPerEmployee));
      setSelectedDays(Array.isArray(data.selectedDays) ? data.selectedDays : selectedDays);
      setGenerationAttempts(Number(data.generationAttempts ?? generationAttempts));
      setPlanning(Array.isArray(data.planning) ? data.planning : []);
      showNotification(`📅 Semaine ${weekKey} chargée`);
    } catch (e) {
      showNotification(`❌ Chargement échoué: ${e?.message || e}`, 'error');
    }
  };

  const onFilterStartChange = (e) => setFilterStartDate(e.target.value);
  const onFilterEndChange = (e) => setFilterEndDate(e.target.value);
  const loadStartWeekFromRange = () => {
    if (!filterStartDate) {
      showNotification('⚠️ Choisissez une date de début', 'warning');
      return;
    }
    const d = new Date(filterStartDate);
    const monday = getMonday(d);
    const weekKey = getISOWeekKey(monday);
    loadWeekByKey(weekKey);
  };

  const saveData = async () => {
    try {
      const data = {
        employees,
        constraints,
        employeesPerDay,
        maxDaysPerEmployee,
        selectedDays,
        generationAttempts,
        lastSaved: new Date().toISOString()
      };
      await window.storage.set('planning-data-v2', JSON.stringify(data));
      showNotification('✅ Données sauvegardées avec succès');
    } catch {
      showNotification('❌ Erreur lors de la sauvegarde', 'error');
    }
  };

  const addEmployee = () => {
    const selected = eligibleUsers.find(u => u.email === selectedUserEmail);
    if (!selected) {
      showNotification('⚠️ Sélectionnez un admin/manager', 'warning');
      return;
    }
    const name = selected.name;
    if (employees.some(e => e.toLowerCase() === name.toLowerCase())) {
      showNotification('⚠️ Cet employé existe déjà', 'warning');
      return;
    }
    setEmployees([...employees, name]);
    setSelectedUserEmail("");
    showNotification(`✅ ${name} ajouté(e)`);
  };

  // Helpers semaine (ISO)
  const getMonday = (date = new Date()) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0,0,0,0);
    return d;
  };

  const getISOWeekKey = (date = new Date()) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    const year = d.getUTCFullYear();
    return `${year}-${String(weekNo).padStart(2, '0')}`;
  };

  const savePlanning = async (sendEmail = false) => {
    try {
      setSaving(true);
      const monday = getMonday(new Date());
      const week_key = getISOWeekKey(monday);

      // Construire un mapping d'assignations pour l'email
      const assignments = {};
      employees.forEach(emp => { assignments[emp] = {}; });
      planning.forEach(p => {
        const dayIdx = JOURS_SEMAINE.indexOf(p.jour);
        p.employes.forEach(emp => {
          if (!assignments[emp]) assignments[emp] = {};
          assignments[emp][dayIdx] = 'Présent';
        });
      });

      const payload = {
        week_key,
        week_start: monday.toISOString().slice(0, 10),
        data: {
          employees,
          constraints,
          employeesPerDay,
          maxDaysPerEmployee,
          selectedDays,
          generationAttempts,
          planning,
          days: JOURS_SEMAINE,
          assignments
        },
        sendEmail,
      };
      const res = await planningsApi.create(payload);
      if (res?.success) {
        showNotification(sendEmail ? '📧 Planning sauvegardé et envoyé' : '💾 Planning sauvegardé');
      } else {
        showNotification('❌ Échec de sauvegarde', 'error');
      }
    } catch (e) {
      showNotification(`❌ ${e?.message || e}`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const removeEmployee = (name) => {
    if (confirm(`Supprimer ${name} ?`)) {
      setEmployees(employees.filter((e) => e !== name));
      const newConstraints = { ...constraints };
      delete newConstraints[name];
      setConstraints(newConstraints);
      showNotification(`${name} supprimé(e)`);
    }
  };

  const toggleConstraint = (employee, dayIndex) => {
    setConstraints(prev => {
      const newConstraints = { ...prev };
      if (!newConstraints[employee]) newConstraints[employee] = [];
      
      if (newConstraints[employee].includes(dayIndex)) {
        newConstraints[employee] = newConstraints[employee].filter(d => d !== dayIndex);
      } else {
        newConstraints[employee] = [...newConstraints[employee], dayIndex];
      }
      
      if (newConstraints[employee].length === 0) {
        delete newConstraints[employee];
      }
      
      return newConstraints;
    });
  };

  const toggleDaySelection = (dayIndex) => {
    setSelectedDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort((a, b) => a - b)
    );
  };

  const validateConfiguration = () => {
    const errors = [];
    
    if (employees.length === 0) {
      errors.push("Aucun employé défini");
    }
    
    if (selectedDays.length === 0) {
      errors.push("Aucun jour sélectionné");
    }
    
    if (employees.length < employeesPerDay) {
      errors.push(`Minimum ${employeesPerDay} employés requis`);
    }
    
    const totalSlotsNeeded = selectedDays.length * employeesPerDay;
    const maxSlotsAvailable = employees.length * maxDaysPerEmployee;
    
    if (totalSlotsNeeded > maxSlotsAvailable) {
      errors.push(`Impossible: ${totalSlotsNeeded} créneaux nécessaires, seulement ${maxSlotsAvailable} disponibles`);
    }

    selectedDays.forEach(dayIdx => {
      const availableForDay = employees.filter(emp => 
        !constraints[emp]?.includes(dayIdx)
      ).length;
      
      if (availableForDay < employeesPerDay) {
        errors.push(`${JOURS_SEMAINE[dayIdx]}: seulement ${availableForDay} employés disponibles (${employeesPerDay} requis)`);
      }
    });
    
    return errors;
  };

  const generatePlanningWithBacktracking = () => {
    const compteur = {};
    employees.forEach((e) => (compteur[e] = 0));
    
    const planning = [];
    
    const backtrack = (dayIndex) => {
      if (dayIndex === selectedDays.length) {
        return true;
      }
      
      const currentDayIdx = selectedDays[dayIndex];
      const currentDay = JOURS_SEMAINE[currentDayIdx];
      
      const disponibles = employees.filter((e) => {
        const hasConstraint = constraints[e]?.includes(currentDayIdx);
        const underMax = compteur[e] < maxDaysPerEmployee;
        return !hasConstraint && underMax;
      });
      
      if (disponibles.length < employeesPerDay) {
        return false;
      }
      
      const sorted = [...disponibles].sort((a, b) => {
        const diffCount = compteur[a] - compteur[b];
        if (diffCount !== 0) return diffCount;
        
        const futureAvailA = selectedDays.slice(dayIndex + 1).filter(
          d => !constraints[a]?.includes(d)
        ).length;
        const futureAvailB = selectedDays.slice(dayIndex + 1).filter(
          d => !constraints[b]?.includes(d)
        ).length;
        return futureAvailB - futureAvailA;
      });
      
      const tryAssignment = (assigned, index) => {
        if (assigned.length === employeesPerDay) {
          planning.push({ jour: currentDay, employes: [...assigned] });
          assigned.forEach(e => compteur[e]++);
          
          if (backtrack(dayIndex + 1)) {
            return true;
          }
          
          planning.pop();
          assigned.forEach(e => compteur[e]--);
          return false;
        }
        
        for (let i = index; i < sorted.length; i++) {
          assigned.push(sorted[i]);
          if (tryAssignment(assigned, i + 1)) {
            return true;
          }
          assigned.pop();
        }
        
        return false;
      };
      
      return tryAssignment([], 0);
    };
    
    if (backtrack(0)) {
      return planning;
    }
    
    return null;
  };

  const generatePlanning = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const errors = validateConfiguration();
      
      if (errors.length > 0) {
        showNotification(errors.join(' • '), 'error');
        setIsLoading(false);
        return;
      }
      
      let bestPlanning = null;
      let bestVariance = Infinity;
      
      for (let attempt = 0; attempt < generationAttempts; attempt++) {
        const testPlanning = generatePlanningWithBacktracking();
        
        if (testPlanning) {
          const stats = {};
          testPlanning.forEach(p => {
            p.employes.forEach(e => {
              stats[e] = (stats[e] || 0) + 1;
            });
          });
          
          const counts = Object.values(stats);
          const mean = counts.reduce((a, b) => a + b, 0) / counts.length;
          const variance = counts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / counts.length;
          
          if (variance < bestVariance) {
            bestVariance = variance;
            bestPlanning = testPlanning;
          }
          
          if (variance === 0) break;
        }
      }
      
      if (bestPlanning) {
        setPlanning(bestPlanning);
        showNotification('✅ Planning généré avec succès');
      } else {
        showNotification('❌ Impossible de générer un planning valide. Vérifiez les contraintes.', 'error');
      }
      
      setIsLoading(false);
    }, 100);
  };

  const exportPlanning = () => {
    const data = {
      employees,
      planning,
      constraints,
      employeesPerDay,
      maxDaysPerEmployee,
      selectedDays,
      generationAttempts,
      exportDate: new Date().toISOString(),
      stats: getStats()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planning-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotification('📥 Planning exporté');
  };

  const importPlanning = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        
        if (data.employees) setEmployees(data.employees);
        if (data.constraints) setConstraints(data.constraints);
        if (data.employeesPerDay) setEmployeesPerDay(data.employeesPerDay);
        if (data.maxDaysPerEmployee) setMaxDaysPerEmployee(data.maxDaysPerEmployee);
        if (data.selectedDays) setSelectedDays(data.selectedDays);
        if (data.generationAttempts) setGenerationAttempts(data.generationAttempts);
        
        showNotification('✅ Planning importé');
      } catch {
        showNotification('❌ Fichier invalide', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const resetAll = () => {
    if (confirm('⚠️ Réinitialiser toutes les données ?')) {
      setEmployees([]);
      setPlanning([]);
      setConstraints({});
      setEmployeesPerDay(3);
      setMaxDaysPerEmployee(3);
      setSelectedDays([0, 1, 2, 3, 4, 5]);
      setGenerationAttempts(100);
      showNotification('🔄 Données réinitialisées');
    }
  };

  const getStats = () => {
    if (planning.length === 0) return {};
    
    const stats = {};
    planning.forEach(p => {
      p.employes.forEach(e => {
        stats[e] = (stats[e] || 0) + 1;
      });
    });
    return stats;
  };

  const stats = getStats();
  const statsArray = Object.entries(stats).sort((a, b) => b[1] - a[1]);
  const filteredHistory = (filterStartDate || filterEndDate)
    ? history.filter(h => {
        const ws = h.week_start ? new Date(h.week_start) : null;
        if (!ws) return false;
        if (filterStartDate) {
          const s = new Date(filterStartDate);
          if (ws < s) return false;
        }
        if (filterEndDate) {
          const e = new Date(filterEndDate);
          if (ws > e) return false;
        }
        return true;
      })
    : history;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-200 p-4 md:p-6">
      {/* Notification */}
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
        {/* Header */}
        <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-black p-3 rounded-lg">
                <Calendar className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Planning Pro</h1>
                <p className="text-gray-500 text-sm">Générateur de planning robuste</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={saveData} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow">
                <Save className="w-4 h-4" /> Sauvegarder
              </button>
              <button onClick={exportPlanning} disabled={planning.length === 0} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow disabled:opacity-50 disabled:cursor-not-allowed">
                <Download className="w-4 h-4" /> Export
              </button>
              <label className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow cursor-pointer">
                <Upload className="w-4 h-4" /> Import
                <input type="file" accept=".json" onChange={importPlanning} className="hidden" />
              </label>
              <button onClick={resetAll} className="flex items-center gap-2 bg-slate-800 text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow">
                <Trash2 className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Configuration */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filtrer par semaine (plage de dates) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Filtrer par calendrier (plage)</h2>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Du</label>
                  <input
                    type="date"
                    value={filterStartDate}
                    onChange={onFilterStartChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black focus:outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Au</label>
                  <input
                    type="date"
                    value={filterEndDate}
                    onChange={onFilterEndChange}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black focus:outline-none"
                  />
                </div>
                <div className="w-full">
                  <button
                    onClick={loadStartWeekFromRange}
                    className="bg-slate-800 w-full text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition shadow"
                  >
                    Charger semaine (début)
                  </button>
                </div>
              </div>
            </div>

            {/* Historique des plannings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">🗂️ Historique</h2>
              {filteredHistory.length === 0 ? (
                <p className="text-sm text-gray-600">Aucun planning sauvegardé pour l’instant.</p>
              ) : (
                <ul className="space-y-3">
                  {filteredHistory.slice(0, 10).map(h => (
                    <li key={h.id} className="flex items-center justify-between border-2 border-gray-200 rounded-lg px-4 py-2">
                      <div>
                        <div className="font-semibold text-gray-900">Semaine {h.week_key}</div>
                        <div className="text-xs text-gray-600">Début: {h.week_start || '—'} • Créé: {new Date(h.created_at).toLocaleString()}</div>
                      </div>
                      <button
                        onClick={() => loadWeekByKey(h.week_key)}
                        className="text-white bg-slate-800 px-3 py-2 rounded-lg hover:bg-gray-800 transition"
                      >
                        Charger
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Ajouter employé (depuis users: admin/manager) */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">👤 Ajouter employé</h2>
              <div className="flex gap-2">
                <select
                  value={selectedUserEmail}
                  onChange={(e) => setSelectedUserEmail(e.target.value)}
                  className="flex-1 border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black focus:outline-none"
                >
                  <option value="">Sélectionner une personne</option>
                  {eligibleUsers.map(u => (
                    <option key={u.email} value={u.email}>{u.name}</option>
                  ))}
                </select>
                <button
                  onClick={addEmployee}
                  className="bg-slate-800 text-white p-3 rounded-lg hover:bg-gray-800 transition shadow-md"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {employees.length} employé(s) • {selectedDays.length} jour(s)
              </p>
            </div>
            {/* Paramètres */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">⚙️ Paramètres</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Employés par jour
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={employeesPerDay}
                    onChange={(e) => setEmployeesPerDay(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jours max par employé
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="7"
                    value={maxDaysPerEmployee}
                    onChange={(e) => setMaxDaysPerEmployee(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Tentatives de génération
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="1000"
                    step="10"
                    value={generationAttempts}
                    onChange={(e) => setGenerationAttempts(Math.max(10, parseInt(e.target.value) || 100))}
                    className="w-full border-2 border-gray-300 rounded-lg px-4 py-2 focus:border-black focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Plus de tentatives = meilleur équilibrage</p>
                </div>
              </div>
            </div>

            {/* Jours actifs */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">📅 Jours actifs</h2>
              <div className="space-y-2">
                {JOURS_SEMAINE.map((jour, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleDaySelection(idx)}
                    className={`w-full px-4 py-3 rounded-lg font-medium transition ${
                      selectedDays.includes(idx)
                        ? 'bg-slate-800 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {jour}
                  </button>
                ))}
              </div>
            </div>

           
          </div>

          {/* Table des disponibilités */}
          <div className="lg:col-span-2 space-y-6">
            {employees.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">📋 Disponibilités</h2>
                  <div className="flex gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-green-500 rounded"></div> Disponible
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-4 h-4 bg-red-500 rounded"></div> Indisponible
                    </span>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-3 px-4 font-bold text-gray-800 sticky left-0 bg-white">Employé</th>
                        {JOURS_SEMAINE.map((jour, idx) => (
                          <th key={idx} className={`text-center py-3 px-2 font-bold text-xs ${selectedDays.includes(idx) ? 'text-black' : 'text-gray-400'}`}>
                            {jour.slice(0, 3).toUpperCase()}
                          </th>
                        ))}
                        <th className="text-center py-3 px-4 font-bold text-gray-800">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employees.map((emp, empIdx) => (
                        <tr key={emp} className={empIdx % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                          <td className="py-3 px-4 font-semibold text-gray-900 sticky left-0 bg-inherit">{emp}</td>
                          {JOURS_SEMAINE.map((jour, dayIdx) => (
                            <td key={dayIdx} className="text-center py-3 px-2">
                              <button
                                onClick={() => toggleConstraint(emp, dayIdx)}
                                disabled={!selectedDays.includes(dayIdx)}
                                className={`w-10 h-10 rounded-lg transition font-bold text-white shadow ${
                                  !selectedDays.includes(dayIdx)
                                    ? 'bg-gray-200 cursor-not-allowed'
                                    : constraints[emp]?.includes(dayIdx)
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-green-500 hover:bg-green-600'
                                }`}
                              >
                                {selectedDays.includes(dayIdx) && (constraints[emp]?.includes(dayIdx) ? '✖' : '✓')}
                              </button>
                            </td>
                          ))}
                          <td className="text-center py-3 px-4">
                            <button
                              onClick={() => removeEmployee(emp)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Bouton générer */}
            {employees.length > 0 && (
              <div className="text-center">
                <button
                  onClick={generatePlanning}
                  disabled={isLoading}
                  className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition transform ${
                    isLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-slate-800 hover:bg-gray-800 text-white hover:scale-105'
                  }`}
                >
                  <RefreshCw className={`w-6 h-6 ${isLoading ? 'animate-spin' : ''}`} />
                  {isLoading ? 'Génération en cours...' : 'Générer le Planning'}
                </button>
              </div>
            )}

            {/* Planning généré - VUE CALENDRIER */}
            {planning.length > 0 && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="w-7 h-7 text-black" />
                    Planning de la semaine
                  </h2>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          {planning.map((p, index) => (
                            <th key={index} className="border-2 border-gray-300 bg-black text-white p-4 min-w-[150px]">
                              <div className="text-lg font-bold">{p.jour}</div>
                              <div className="text-xs opacity-90 mt-1">{p.employes.length} pers.</div>
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...Array(Math.max(...planning.map(p => p.employes.length)))].map((_, rowIndex) => (
                          <tr key={rowIndex}>
                            {planning.map((p, colIndex) => (
                              <td key={colIndex} className="border-2 border-gray-300 p-4 align-top bg-white hover:bg-gray-50 transition">
                                {p.employes[rowIndex] && (
                                  <div className="bg-black text-white px-4 py-3 rounded-lg shadow-md font-semibold text-center">
                                    {p.employes[rowIndex]}
                                  </div>
                                )}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Actions: sauvegarde et envoi par email */}
                <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions du planning</h3>
                  <p className="text-sm text-gray-600 mb-4">La sauvegarde enverra aussi la semaine si vous choisissez l’option.</p>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => savePlanning(false)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Save className="w-5 h-5" />
                      Sauvegarder la semaine
                    </button>
                    <button
                      onClick={() => savePlanning(true)}
                      disabled={saving}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-800 text-white hover:bg-gray-800 transition shadow disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      <Mail className="w-5 h-5" />
                      Sauvegarder et envoyer par e-mail
                    </button>
                  </div>
                </div>

                {/* Statistiques */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">📊 Statistiques</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {statsArray.map(([emp, count]) => (
                      <div key={emp} className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-lg border-2 border-gray-300">
                        <div className="font-semibold text-gray-800 mb-1">{emp}</div>
                        <div className="text-3xl font-bold text-black">{count}</div>
                        <div className="text-xs text-gray-600">jours assignés</div>
                      </div>
                    ))}
                  </div>
                  
                  {statsArray.length > 0 && (
                    <div className="mt-4 pt-4 border-t-2 border-gray-200">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-black">{Math.min(...statsArray.map(s => s[1]))}</div>
                          <div className="text-xs text-gray-600">Minimum</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-black">
                            {(statsArray.reduce((sum, s) => sum + s[1], 0) / statsArray.length).toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-600">Moyenne</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-black">{Math.max(...statsArray.map(s => s[1]))}</div>
                          <div className="text-xs text-gray-600">Maximum</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {employees.length === 0 && (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun employé</h3>
                <p className="text-gray-600">Ajoutez des employés pour commencer</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}