import React, { useState, useEffect, useRef } from 'react';
import { Cookie, X, Shield, ChevronDown, CheckCircle2, Info } from 'lucide-react';

const STORAGE_KEY = "ff_cookie_consent";
const COOKIE_NAME = "ff_cookie_consent";

export default function CookiePopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true,
    analytics: true,
    marketing: false,
    functional: false
  });
  const [isAnimating, setIsAnimating] = useState(false);

  const mainActionRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed?.consented === true || parsed?.decisionDate) {
          return;
        }
      } catch (e) {}
    }

    previouslyFocused.current = document.activeElement;
    setIsVisible(true);
    requestAnimationFrame(() => setIsAnimating(true));
  }, []);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isVisible]);

  useEffect(() => {
    if (isAnimating && mainActionRef.current) {
      mainActionRef.current.focus();
    }
  }, [isAnimating]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape" && isVisible) {
        handleCloseDismiss();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible]);

  const saveConsent = (prefs, extra = {}) => {
    const payload = {
      preferences: prefs,
      consented: !!(prefs.analytics || prefs.marketing || prefs.functional),
      decisionDate: new Date().toISOString(),
      ...extra
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));

    try {
      const expires = new Date();
      expires.setFullYear(expires.getFullYear() + 1);
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))}; expires=${expires.toUTCString()}; path=/; samesite=lax`;
    } catch (e) {}
  };

  const handleAcceptAll = () => {
    const prefs = { necessary: true, analytics: true, marketing: true, functional: true };
    setPreferences(prefs);
    saveConsent(prefs, { acceptedAll: true });
    closePopup();
  };

  const handleAcceptSelected = () => {
    const prefs = { ...preferences, necessary: true };
    setPreferences(prefs);
    saveConsent(prefs, { acceptedSelected: true });
    closePopup();
  };

  const handleRejectAll = () => {
    const prefs = { necessary: true, analytics: false, marketing: false, functional: false };
    setPreferences(prefs);
    saveConsent(prefs, { rejectedAll: true });
    closePopup();
  };

  const handleCloseDismiss = () => {
    const prefs = { necessary: true, analytics: true, marketing: false, functional: false };
    saveConsent(prefs, { dismissed: true });
    closePopup();
  };

  const closePopup = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      if (previouslyFocused.current && previouslyFocused.current.focus) {
        previouslyFocused.current.focus();
      }
    }, 300);
  };

  const togglePreference = (key) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center pointer-events-none">
      <div
        onClick={handleCloseDismiss}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300 pointer-events-auto ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Gestion des cookies"
        className={`relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 pointer-events-auto ${
          isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      >
        <div className="absolute top-0 left-0 right-0 h-1 bg-black" />
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black" />
        <button
          onClick={handleCloseDismiss}
          className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors z-10"
          aria-label="Fermer"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>

        <div className="p-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-1 bg-gray-50 rounded-xl border border-gray-200">
              <img src="/img/web-app-manifest-512x512.png" className="w-10 h-10 text-black" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Gestion des cookies
              </h2>
              <p className="text-sm text-gray-500">Digital</p>
            </div>
          </div>

          <p className="text-gray-600 mb-6 leading-relaxed">
            Nous utilisons des cookies pour améliorer votre expérience, personnaliser nos services 
            et analyser notre trafic. Vous gardez le contrôle total sur vos données.
          </p>

          {!showSettings ? (
            <div className="space-y-3 mb-6">
              <button
                ref={mainActionRef}
                onClick={handleAcceptAll}
                className="w-full px-6 py-3.5 bg-black text-white font-semibold rounded-xl hover:bg-slate-900 transition-all duration-200 shadow-sm hover:shadow-md flex items-center justify-center border-0 gap-2"
              >
                <CheckCircle2 className="w-5 h-5" />
                Accepter tous les cookies
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleRejectAll}
                  className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-300"
                >
                  Tout refuser
                </button>
                <button
                  onClick={() => setShowSettings(true)}
                  className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-300 flex items-center justify-center gap-2"
                >
                  <ChevronDown className="w-4 h-4" />
                  Personnaliser
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-3 mb-6">
                <CookieOption
                  icon={<Shield className="w-5 h-5" />}
                  title="Cookies nécessaires"
                  description="Essentiels pour le fonctionnement du site"
                  checked={preferences.necessary}
                  disabled={true}
                  badge="Requis"
                  onChange={() => {}}
                />
                <CookieOption
                  icon={<Info className="w-5 h-5" />}
                  title="Cookies fonctionnels"
                  description="Fonctionnalités avancées et personnalisation"
                  checked={preferences.functional}
                  onChange={() => togglePreference('functional')}
                />
                <CookieOption
                  icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>}
                  title="Cookies analytiques"
                  description="Analyse de l'utilisation de la plateforme"
                  checked={preferences.analytics}
                  onChange={() => togglePreference('analytics')}
                />
                <CookieOption
                  icon={<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>}
                  title="Cookies marketing"
                  description="Publicités personnalisées selon vos intérêts"
                  checked={preferences.marketing}
                  onChange={() => togglePreference('marketing')}
                />
              </div>

              <div className="flex gap-3 mb-4">
                <button
                  onClick={handleAcceptSelected}
                  className="flex-1 px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-black/70 transition-all duration-200 shadow-sm"
                >
                  Confirmer
                </button>
                <button
                  onClick={() => setShowSettings(false)}
                  className="px-6 py-3 bg-white text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 border border-gray-300"
                >
                  Retour
                </button>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              <a href="/privacy#section-12" className="text-gray-600 hover:text-gray-700 font-medium hover:underline transition-colors">
                Politique de confidentialité
              </a>
              {' • '}
              <a href="/privacy#section-1" className="text-gray-600 hover:text-gray-700 font-medium hover:underline transition-colors">
                Politique des cookies
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CookieOption({ icon, title, description, checked, disabled, onChange, badge }) {
  return (
    <div className={`flex items-start gap-4 p-4 rounded-xl transition-all duration-200 border ${
      checked && !disabled 
        ? 'bg-black/70 border-black' 
        : 'bg-gray-50 border-gray-200'
    }`}>
      <div className={`flex-shrink-0 ${checked ? 'text-gray-300' : 'text-black'}`}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className={`font-semibold ${checked ? 'text-gray-300' : 'text-black'}`}>{title}</h3>
          {badge && (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700">
              {badge}
            </span>
          )}
        </div>
        <p className={`text-sm ${checked ? 'text-gray-300' : 'text-black'}`}>{description}</p>
      </div>

      <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="sr-only peer"
          aria-checked={checked}
          aria-disabled={disabled}
        />
        <div className={`w-11 h-6 rounded-full transition-all duration-200 ${
          disabled 
            ? 'bg-gray-300 cursor-not-allowed' 
            : checked 
              ? 'bg-black' 
              : 'bg-gray-300'
        }`}>
          <div className={`absolute top-0.5 left-0.5 bg-white w-5 h-5 rounded-full shadow transition-all duration-200 ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`} />
        </div>
      </label>
    </div>
  );
}