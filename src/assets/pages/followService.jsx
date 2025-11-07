import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, User, FileText, Package, ChevronRight, Phone, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import session from '../configurations/services/session.js';
import api from '../configurations/api/api_axios.js';

export default function ServiceTrackingPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requests, setRequests] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedPdfUrl, setSelectedPdfUrl] = useState(null);

  const currentEmail = session.getSessionEmail();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get('/devis/requests');
        const rows = Array.isArray(res.data) ? res.data : [];
        const mine = currentEmail ? rows.filter(r => String(r.email||'').toLowerCase() === String(currentEmail).toLowerCase()) : rows;
        if (!mounted) return;
        setRequests(mine);
        if (mine.length > 0) setSelectedId(mine[0].id);

        // (optimisé) les submissions seront chargées par demande sélectionnée
      } catch (e) {
        if (!mounted) return;
        setError(e?.message || 'Erreur de chargement des demandes');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [currentEmail]);

  const selected = useMemo(() => requests.find(r => r.id === selectedId) || null, [requests, selectedId]);

  useEffect(() => {
    let mounted = true;
    const loadSelectedPdf = async () => {
      try {
        if (!selectedId) { setSelectedPdfUrl(null); return; }
        const res = await api.get(`/devis/submissions/by-request/${selectedId}`);
        const list = Array.isArray(res.data) ? res.data : [];
        const latest = list[0] || null;
        if (!mounted) return;
        setSelectedPdfUrl(latest?.pdf_url || null);
      } catch (e) {
        if (!mounted) return;
        setSelectedPdfUrl(null);
      }
    };
    loadSelectedPdf();
    return () => { mounted = false; };
  }, [selectedId]);

  const progress = useMemo(() => {
    const s = String(selected?.status || '').toLowerCase();
    // Cartographie revue pour coller aux étapes affichées (10 / 40 / 60 / 85 / 100)
    const map = {
      'reçu': 10,
      'nouveau': 10,
      'en_analyse': 40,
      'analyse': 40,
      'analysé': 40,
      'en cours': 60,
      'envoyé': 60,
      'proposé': 60,
      'soumis': 60,
      'accepté': 85,
      'approuvé': 85,
      'terminé': 100,
      'livré': 100,
      'refusé': 0,
    };
    if (map[s] != null) return map[s];
    // Compatibilité pour variantes textuelles et états proches
    if (s.includes('reç') || s.includes('attente') || s.includes('pend')) return 10;
    if (s.includes('analys')) return 40;
    if (s.includes('cours') || s.includes('prod') || s.includes('envoy') || s.includes('propos') || s.includes('soumis')) return 60;
    if (s.includes('approuv') || s.includes('accept')) return 85;
    if (s.includes('termin') || s.includes('livr')) return 100;
    if (s.includes('refus') || s.includes('reject')) return 0;
    return 25;
  }, [selected]);

  return (
    <div className="min-h-screen  bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mt-10 mx-auto">

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white relative dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-6 border border-gray-200 dark:border-gray-700"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
                Suivi de votre service
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Restez informé en temps réel de chaque étape de votre prestation.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {loading && <span className="text-sm text-gray-500">Chargement…</span>}
              {!loading && (
                <select
                  className="text-sm border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg px-3 py-2"
                  value={selectedId || ''}
                  onChange={e => setSelectedId(Number(e.target.value))}
                >
                  {requests.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.project_type || r.email} {`Demande #${r.id}`}
                    </option>
                  ))}
                  {requests.length === 0 && <option value="">Aucune demande</option>}
                </select>
              )}
            </div>
          </div>
          <button 
          onClick={() =>navigate('/')}
          className=" absolute top-0 right-0 m-6 text-red-500 hover:text-red-700 transition-colors dark:hover:text-red-300 dark:text-white">
            x
          </button>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Package size={20}/> Progression générale
          </h2>

          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1 }}
              className="h-full bg-violet-600 rounded-full"
            />
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{progress}% terminé</p>
          {error && (
            <p className="mt-2 text-xs text-red-600">{error}</p>
          )}
        </motion.div>

        {/* Customer Info */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User size={20}/> Informations du client
          </h2>

          <div className="grid sm:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
            <p><span className="font-semibold">Nom :</span> {selected?.full_name || '-'}</p>
            <p><span className="font-semibold">Email :</span> {selected?.email || currentEmail || '-'}</p>
            <p><span className="font-semibold">Téléphone :</span> {selected?.phone || '-'}</p>
            <p><span className="font-semibold">Type :</span> {selected?.project_type || '-'}</p>
            <p><span className="font-semibold">Statut :</span> {selected?.status || 'reçu'}</p>
            <p><span className="font-semibold">ID Demande :</span> {selected?.id ?? '-'}</p>
          </div>
        </motion.div>

        {/* Status Timeline */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Clock size={20}/> Avancement détaillé
          </h2>

          <div className="space-y-6">

            {/* Step 1 */}
            <motion.div className="flex gap-4 items-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
            >
              {(progress >= 10) ? <CheckCircle className="text-green-600" /> : <Clock className="text-gray-400" />}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Demande reçue</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Votre demande a été enregistrée.</p>
                <span className="text-xs text-gray-500">{selected?.created_at || '—'}</span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div className="flex gap-4 items-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            >
              {(progress >= 40) ? <CheckCircle className="text-green-600" /> : <Clock className="text-gray-400" />}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Analyse en cours</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Notre équipe technique analyse votre besoin.</p>
                <span className="text-xs text-gray-500">{progress >= 40 ? 'Terminé' : 'À venir'}</span>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div className="flex gap-4 items-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            >
              {(progress >= 60) ? <Loader2 className="animate-spin text-violet-600" /> : <Clock className="text-gray-400" />}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Production en cours</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Votre service est actuellement en réalisation...</p>
                <span className="text-xs text-gray-500">{progress >= 60 ? 'En cours' : 'À venir'}</span>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div className="flex gap-4 items-start opacity-50"
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.3 }}
            >
              {(progress >= 85) ? <CheckCircle className="text-green-600" /> : <AlertCircle className="text-gray-400" />}
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Validation finale</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{progress >= 85 ? 'Livraison/Validation en cours' : 'En attente de finalisation.'}</p>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Documents */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 mb-6 border border-gray-200 dark:border-gray-700"
        >
          <h2 className="text-xl font-semibold flex items-center gap-2 text-gray-900 dark:text-white mb-4">
            <FileText size={20}/> Documents associés
          </h2>
          <div className="space-y-3">
            <button 
              className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-dark dark:hover:bg-gray-700 transition"
              disabled={!selectedPdfUrl}
              onClick={() => { if (selectedPdfUrl) window.open(selectedPdfUrl, '_blank'); }}
            >
              <span className="font-medium ">Devis officiel - Digital</span>
              <ChevronRight size={18} />
            </button>
            {selectedPdfUrl && (
              <p className="text-xs text-blue-700 underline break-all">
                <a href={selectedPdfUrl} target="_blank" rel="noreferrer">{selectedPdfUrl}</a>
              </p>
            )}
            <button 
              className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-dark dark:hover:bg-gray-700 transition"
              disabled={!selected}
            >
              <span className="font-medium">Contrat de prestation</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-gray-500 dark:text-gray-400 text-sm mt-6">
          Besoin d'assistance ? Contactez-nous : support@digitalcompany.com
        </p>
      </div>
    </div>
  );
}
