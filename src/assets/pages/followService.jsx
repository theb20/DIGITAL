import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, User, FileText, Package, ChevronRight, MapPin, Phone, Mail, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ServiceTrackingPage() {
  const navigate = useNavigate();
  const progress = 85; // Pourcentage d'avancement dynamique

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
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
            Suivi de votre service
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Restez informé en temps réel de chaque étape de votre prestation.
          </p>
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
            <p><span className="font-semibold">Nom :</span> Jean Dupont</p>
            <p><span className="font-semibold">Email :</span> jean.dupont@example.com</p>
            <p><span className="font-semibold">Téléphone :</span> 06 45 22 18 90</p>
            <p><span className="font-semibold">Adresse :</span> Paris, France</p>
            <p><span className="font-semibold">Service :</span> Refonte complète du site web</p>
            <p><span className="font-semibold">ID Suivi :</span> SRV-2025-0031</p>
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
              <CheckCircle className="text-green-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Demande reçue</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Votre demande a été validée.</p>
                <span className="text-xs text-gray-500">02 Nov 2025 - 10h22</span>
              </div>
            </motion.div>

            {/* Step 2 */}
            <motion.div className="flex gap-4 items-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
            >
              <CheckCircle className="text-green-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Analyse en cours</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Notre équipe technique analyse votre besoin.</p>
                <span className="text-xs text-gray-500">02 Nov 2025 - 12h40</span>
              </div>
            </motion.div>

            {/* Step 3 */}
            <motion.div className="flex gap-4 items-start"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}
            >
              <Loader2 className="animate-spin text-violet-600" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Production en cours</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Votre service est actuellement en réalisation...</p>
                <span className="text-xs text-gray-500">En cours</span>
              </div>
            </motion.div>

            {/* Step 4 */}
            <motion.div className="flex gap-4 items-start opacity-50"
              initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.3 }}
            >
              <AlertCircle className="text-gray-400" />
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Validation finale</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">En attente de finalisation.</p>
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
            className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-dark dark:hover:bg-gray-700 transition">
              <span className="font-medium ">Devis officiel - Digital</span>
              <ChevronRight size={18} />
            </button>
            <button 
            
            className="w-full flex justify-between items-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-100 text-dark dark:hover:bg-gray-700 transition">
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
