import { useState, useEffect } from "react";
import { FileText, CreditCard, Settings, LogOut, Mail, Phone, SquareDot, Trash2, Moon, Sun, ArrowLeftFromLine } from "lucide-react";

export default function ClientProfile() {
  useEffect(()=>{
    document.title = "Profil - Digital";
  })
  const [activeSection, setActiveSection] = useState(null);
  
  const client = {
    img: "",
    name: "Jean Dupont",
    company: "Entreprise Alpha",
    email: "jean.dupont@email.com",
    phone: "+33 6 12 34 56 78",
    plan: "Abonnement Pro",
    status: "Actif",
  };

  const handleSectionClick = (section) => {
    setActiveSection(activeSection === section ? null : section);
  };

  const [darkMode, setDarkMode] = useState(() => {
    // Récupérer la préférence depuis localStorage au chargement
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
     // Sauvegarder la préférence du mode sombre dans localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    // Ajouter ou retirer la classe 'dark' sur le body pour une transition globale
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);


     const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="flex mt-15 lg:mt-0 flex-col w-[800px] items-center py-10 px-4">
        <div className="max-w-3xl w-full bg-dark dark:bg-slate-800 dark:border-slate-700 backdrop-blur-lg rounded-2xl shadow-lg border border-slate-200 p-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
            <h1 className="text-2xl font-bold text-dark">Profil client</h1>
            <div className="flex items-center gap-4">
             
              <img src="/img/web-app-manifest-192x192.png" className="w-12 h-12 rounded-full  object-cover" alt="logo Digital" />
            </div>
          </div>

          {/* Infos de profil */}
          <div className="flex items-center gap-5 mt-6">
            <img
              src={client.img || "/img/icons/user.png"}
              alt="Avatar client"
              className="w-20 h-20 rounded-full object-cover"
            />
            <div>
              <h2 className="text-xl font-semibold text-dark dark:text-slate-200">{client.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{client.company}</p>
              <span className="inline-block mt-2 bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-md">
                {client.status}
              </span>
            </div>
          </div>

          {/* Coordonnées */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-700 text-sub">
            <p className="flex items-center gap-2">
              <Mail size={16} /> {client.email}
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} /> {client.phone}
            </p>
            <p className="flex items-center gap-2">
              <CreditCard size={16} /> {client.plan}
            </p>
          </div>

          {/* Actions rapides */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button 
              onClick={() => handleSectionClick('devis')}
              className={`flex flex-col items-center justify-center border rounded-xl py-6 transition-all ${
                activeSection === 'devis' 
                  ? 'bg-slate-200 border-slate-300 dark:bg-slate-900 dark:border-slate-700' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-700'
              }`}
            >
              <FileText size={24} className="text-slate-700 dark:text-slate-200" />
              <span className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">Mes devis</span>
            </button>
            <button 
              onClick={() => handleSectionClick('paiements')}
              className={`flex flex-col items-center justify-center border rounded-xl py-6 transition-all ${
                activeSection === 'paiements' 
                  ? 'bg-slate-200 border-slate-300 dark:bg-slate-900 dark:border-slate-700' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-700'
              }`}
            >
              <CreditCard size={24} className="text-slate-700 dark:text-slate-200" />
              <span className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">Mes paiements</span>
            </button>
            <button 
              onClick={() => handleSectionClick('parametres')}
              className={`flex flex-col items-center justify-center border rounded-xl py-6 transition-all ${
                activeSection === 'parametres' 
                   ? 'bg-slate-200 border-slate-300 dark:bg-slate-900 dark:border-slate-700' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 dark:border-slate-700'
              }`}
            >
              <Settings size={24} className="text-slate-700 dark:text-slate-200" />
              <span className="mt-2 text-sm font-medium text-slate-800 dark:text-slate-200">Paramètres</span>
            </button>
          </div>

        </div>
          {/* Section dynamique */}
          {activeSection && (
            <div className="w-full mt-6 bg-dark dark:bg-slate-800 border dark:border-slate-700 border-slate-200 rounded-xl p-6">
              {activeSection === 'devis' && (
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-4">Mes devis</h3>
                  <div className="space-y-3">
                    <div className="bg-dark dark:bg-slate-700 p-4 rounded-lg dark:border-slate-700 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">Devis #2024-001</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Site web vitrine</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Accepté</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Montant: 2 500 €</p>
                    </div>
                    <div className="bg-dark dark:bg-slate-700 p-4 rounded-lg dark:border-slate-700 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">Devis #2024-002</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Application mobile</p>
                        </div>
                        <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">En attente</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Montant: 8 000 €</p>
                    </div>
                    <div className="bg-dark dark:bg-slate-700 p-4 rounded-lg dark:border-slate-700 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">Devis #2023-045</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Refonte site e-commerce</p>
                        </div>
                        <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">Refusé</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Montant: 12 000 €</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'paiements' && (
                <div>
                  <h3 className="text-lg font-semibold text-dark mb-4">Mes paiements</h3>
                  <div className="space-y-3">
                    <div className="bg-dark dark:bg-slate-700 p-4 rounded-lg dark:border-slate-700 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">Paiement - Janvier 2025</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Abonnement Pro</p>
                          <p className="text-xs text-slate-400 mt-1">Date: 01/01/2025</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Payé</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Montant: 99 €</p>
                    </div>
                    <div className="bg-dark dark:bg-slate-700 p-4 rounded-lg dark:border-slate-700 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">Paiement - Décembre 2024</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Abonnement Pro</p>  
                          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Date: 01/12/2024</p>
                        </div>
                        <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">Payé</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Montant: 99 €</p>
                    </div>
                    <div className="bg-dark dark:bg-slate-700 p-4 rounded-lg dark:border-slate-700 border border-slate-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-slate-200">Paiement - Février 2025</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Abonnement Pro</p>
                          <p className="text-xs text-slate-400 dark:text-slate-400 mt-1">Date: 01/02/2025</p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded">À venir</span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">Montant: 99 €</p>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'parametres' && (
                <div>
                  <h3 className="text-lg font-semibold text-dark mb-4">Paramètres</h3>
                  <div className="space-y-3">

                    <button className="w-full flex items-center gap-3 bg-dark dark:bg-slate-700 dark:hover:bg-slate-600 p-4 rounded-lg dark:border-slate-700 border border-slate-200 transition-all text-left">
                      <SquareDot size={20} className="text-slate-700" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-200">Modifier le profil</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Mettre à jour vos informations personnelles</p>
                      </div>
                    </button>

                    <button 
                    onClick={toggleDarkMode}
                    className="w-full flex items-center gap-3 bg-dark dark:bg-slate-700 dark:hover:bg-slate-600 p-4 rounded-lg dark:border-slate-700 border border-slate-200 transition-all text-left">
                      {darkMode ? <Sun className="w-5 h-5 dark:text-slate-600" /> : <Moon className="w-5 h-5 dark:text-slate-200" />}
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-200">Changer de thème</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{darkMode ? "Activer le thème clair" : "Activer le thème sombre"}</p>
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-3 bg-dark dark:bg-slate-700 dark:hover:bg-slate-600 p-4 rounded-lg dark:border-slate-700 border border-slate-200 transition-all text-left">
                      <LogOut size={20} className="text-slate-700" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-200">Déconnexion</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Se déconnecter de votre compte</p>  
                      </div>
                    </button>

                    <button className="w-full flex items-center gap-3 bg-red-50 dark:bg-red-600/10 dark:hover:bg-red-700 p-4 rounded-lg dark:border-red-700 border border-red-200 transition-all text-left">
                      <Trash2 size={20} className="text-red-600 dark:hover:text-red-100" />
                      <div>
                        <p className="font-medium text-red-900 dark:text-red-200">Supprimer le compte</p>
                        <p className="text-xs text-red-600 dark:text-red-400">Supprimer définitivement votre compte</p>
                      </div>
                    </button>
                    
                  </div>
                </div>
              )}
            </div>
          )}
        {/* Footer */}
        <footer className="mt-8 text-xs text-slate-500">
          © 2025 Digital Company — Espace client
        </footer>
      </div>
    </div>
  );
}