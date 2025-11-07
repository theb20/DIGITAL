import React, { useEffect, useState } from 'react';
import { logout as logoutService } from "../configurations/services/auth.js";

// Simple page de déconnexion avec fond vidéo (overlay) pour l'application "Digital"
// Tailwind CSS requis pour le style.

export default function GoodbyePage() {
  useEffect(() => {
    document.title = "Déconnexion - Digital";
    // S'assure que la session est marquée déconnectée côté serveur
    logoutService();
  }, []);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          // redirection automatique vers l'accueil
          if (typeof window !== 'undefined') window.location.href = '/';
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen w-full relative overflow-hidden bg-black text-white">
      {/* Fond vidéo en full-bleed sous overflow */}
      <video
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        autoPlay
        muted
        loop
        playsInline
      >
        {/* Remplace le chemin par ta vidéo : /videos/goodbye.mp4 */}
        <source src="/videos/signup.webm" type="video/webm" />
      </video>

      {/* Overlay sombre pour meilleure lisibilité */}
      <div className="absolute inset-0 bg-black/55 z-11" />

      <main className="relative z-12 flex items-center justify-center min-h-screen p-6">
        <div className="max-w-2xl w-full text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-white/10 border border-white/20 mx-auto mb-6">
            <span className="text-2xl font-bold">
                <img src="/img/web-app-manifest-512x512.png" alt="" />
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">À bientôt</h1>
          <p className="text-sm sm:text-base text-white/80 mb-6">
            Tu es maintenant déconnecté de <span className="font-semibold">Digital</span>. Merci d'avoir passé du temps avec nous — reviens quand tu veux.
          </p>

          <div className="flex gap-3 justify-center mb-4">
            <a
              href="/sign"
              className="px-5 py-3 rounded-lg bg-white text-black font-semibold hover:opacity-95 transition"
            >
              Me reconnecter
            </a>

            <a
              href="/"
              className="px-5 py-3 rounded-lg border border-white/20 text-white hover:bg-white/5 transition"
            >
              Accueil
            </a>
          </div>

          <div className="text-xs text-white/60 mb-6">Redirection automatique dans <span className="font-medium">{countdown}s</span></div>

          <div className="text-xs text-white/50">
            Si tu utilises un appareil partagé, pense à fermer ton navigateur pour plus de confidentialité.
          </div>
        </div>
      </main>

      <footer className="absolute left-0 right-0 bottom-4 text-center text-[11px] text-white/50">
        © {new Date().getFullYear()} Digital — <a href="/privacy#section-12" className="underline underline-offset-2">Politique de confidentialité</a>
      </footer>
    </div>
  );
}
