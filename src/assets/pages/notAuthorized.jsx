import React, { useState, useEffect } from 'react';
import { Lock, ShieldAlert, Home, Mail, ArrowLeft, AlertCircle, Key, UserX } from 'lucide-react';

export default function UnauthorizedPage() {
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleGoBack = () => {
    window.history.back();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-6">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-20 w-72 h-72 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative max-w-4xl w-full">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header avec animation */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-black opacity-10"></div>
            <div className="relative z-10">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full mb-4 animate-bounce">
                <ShieldAlert size={48} className="text-red-600" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                Accès Refusé
              </h1>
              <p className="text-red-100 text-lg">
                Erreur 403 - Non Autorisé
              </p>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="p-8 md:p-12">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-2 bg-red-50 text-red-700 px-6 py-3 rounded-full mb-6">
                <Lock size={20} />
                <span className="font-semibold">Zone Protégée</span>
              </div>
              
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Vous n'avez pas l'autorisation d'accéder à cette page
              </h2>
              
              <p className="text-gray-600 text-lg mb-6 max-w-2xl mx-auto">
                Cette section est réservée aux utilisateurs autorisés. Si vous pensez qu'il s'agit d'une erreur, 
                veuillez contacter l'administrateur ou vous connecter avec un compte disposant des permissions nécessaires.
              </p>
            </div>

            {/* Raisons possibles */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="bg-red-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <UserX size={24} className="text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Non connecté</h3>
                <p className="text-sm text-gray-600">
                  Vous devez vous connecter pour accéder à cette ressource
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Key size={24} className="text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Permissions insuffisantes</h3>
                <p className="text-sm text-gray-600">
                  Votre compte ne dispose pas des droits nécessaires
                </p>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="bg-yellow-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <AlertCircle size={24} className="text-yellow-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Session expirée</h3>
                <p className="text-sm text-gray-600">
                  Votre session a peut-être expiré, reconnectez-vous
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-semibold shadow-lg"
              >
                <Home size={20} />
                Retour à l'accueil
              </button>

              <button
                onClick={handleGoBack}
                className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-8 py-4 rounded-xl hover:bg-gray-200 transition-all transform hover:scale-105 font-semibold"
              >
                <ArrowLeft size={20} />
                Page précédente
              </button>
            </div>

            {/* Informations de contact */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-center md:text-left">
                  <h3 className="font-semibold text-gray-900 mb-1">Besoin d'aide ?</h3>
                  <p className="text-sm text-gray-600">
                    Contactez notre équipe support pour obtenir de l'assistance
                  </p>
                </div>
                <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium whitespace-nowrap">
                  <Mail size={18} />
                  Contacter le support
                </button>
              </div>
            </div>

            {/* Countdown */}
            {countdown > 0 && (
              <div className="text-center mt-8">
                <p className="text-sm text-gray-500">
                  Redirection automatique vers l'accueil dans{' '}
                  <span className="font-bold text-red-600">{countdown}</span> secondes
                </p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3 max-w-xs mx-auto">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-orange-600 h-1.5 rounded-full transition-all duration-1000"
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t border-gray-200 px-8 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Lock size={16} />
                <span>Zone sécurisée - TechCorp Solutions</span>
              </div>
              <div className="flex gap-6">
                <a href="#" className="hover:text-red-600 transition-colors">Politique de confidentialité</a>
                <a href="#" className="hover:text-red-600 transition-colors">Conditions d'utilisation</a>
                <a href="#" className="hover:text-red-600 transition-colors">Support</a>
              </div>
            </div>
          </div>
        </div>

        {/* Additional info cards */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Key size={18} className="text-blue-600" />
              Comment obtenir l'accès ?
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Connectez-vous avec un compte autorisé</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Demandez les permissions à votre administrateur</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>Vérifiez que vous êtes connecté au bon compte</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Mail size={18} className="text-green-600" />
              Informations de contact
            </h4>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Email : support@techcorp.com</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Téléphone : +33 1 23 45 67 89</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">•</span>
                <span>Support disponible 24/7</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}