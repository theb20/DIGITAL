import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePopup } from '../configurations/PopupContext.jsx';
import session from '../configurations/services/session.js';
import userService from '../configurations/services/user.js';

export default function PostLoginChoice({ closePopup }) {
  const navigate = useNavigate();
  const { popupPayload } = usePopup();

  const role = popupPayload?.role || session.getSessionRole();
  const [name, setName] = useState(popupPayload?.name || 'Utilisateur');
  const [img, setImg] = useState(
    popupPayload?.avatar || session.getAvatarUrl() || '/img/icons/user.png'
  );

  useEffect(() => {
    let cancelled = false;
    async function hydrateFromService() {
      try {
        const user = await userService.getCurrentUser();
        if (!user || cancelled) return;
        const derivedName =
          (user.first_name && user.last_name)
            ? `${user.first_name} ${user.last_name}`
            : user.name || user.fullname || user.firstName || 'Utilisateur';
        const derivedAvatar = user.avatar || user.img || session.getAvatarUrl();
        setName(derivedName);
        if (derivedAvatar) {
          setImg(derivedAvatar);
          // Aligne la source d'avatar côté session pour l'UI
          session.setAvatarUrl(derivedAvatar);
        }
      } catch (_) {
        // Pas de bruit: si l'appel échoue, on garde les valeurs par défaut
      }
    }

    // Si le payload n'a pas tout, on complète via les services
    if (!popupPayload?.name || !popupPayload?.avatar) {
      hydrateFromService();
    }

    return () => {
      cancelled = true;
    };
  }, [popupPayload]);

  const goHome = () => {
    closePopup();
    navigate('/');
  };

  const goBackoffice = () => {
    closePopup();
    navigate('/backoffice');
  };

  // Sécurité: si rôle non admin/manager, ne rien afficher
  const isAllowed = role === 'admin' || role === 'manager';
  if (!isAllowed) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={closePopup} />
      <div className="relative bg-dark dark:bg-gray-900 rounded-2xl shadow-2xl p-6 md:p-8 max-w-md w-[92%] border border-gray-100 dark:border-gray-800">
        <div className="mb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
            Bienvenue,
          </h2>
          <div className="flex items-center mt-2">
            <img
              src={img}
              alt={name}
              className="w-12 h-12 rounded-full mr-3 object-cover"
              onError={(e) => {
                // Fallback propre si l'URL d'avatar est invalide
                e.currentTarget.src = '/img/icons/user.png';
                setImg('/img/icons/user.png');
              }}
            />
            <span className="text-lg md:text-xl font-semibold text-gray-900 dark:text-white">{name}</span>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            Choisissez où continuer selon vos besoins.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button onClick={goHome} className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 text-gray-800 dark:text-gray-200">
            Accueil
          </button>
          <button onClick={goBackoffice} className="px-4 py-3 rounded-xl dark:bg-slate-100 bg-black text-white hover:bg-black/30 transition-colors">
            Backoffice
          </button>
        </div>
        <div className="mt-4 flex justify-end">
          <button onClick={closePopup} className="text-xs text-gray-500 hover:text-gray-700">Fermer</button>
        </div>
      </div>
    </div>
  );
}