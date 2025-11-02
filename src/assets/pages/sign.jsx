import { useState } from "react";

const AuthPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialAuth = (provider) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert(`Connexion via ${provider} réussie !`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Partie gauche - Image */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden">

        <video
          src="/videos/signup.webm"
          autoPlay
          loop
          muted
          className="w-full h-full object-cover absolute top-0 left-0"
        />

        {/* Overlay sombre */}
        <div className="absolute inset-0 bg-black/70"></div>
        {/* Motif de fond */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 50%),
                            radial-gradient(circle at 80% 80%, rgba(255,255,255,0.15) 0%, transparent 50%)`
          }}></div>
        </div>
        
        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-16">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <img src="/img/web-app-manifest-192x192.png" alt="" />
              </div>
              <span className="text-2xl font-semibold">Digital</span>
            </div>
            
            <div className="max-w-lg">
              <h2 className="text-5xl font-bold mb-6 leading-tight">
                Bienvenue sur Digital
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                La plateforme moderne pour gérer tous vos projets digitaux en un seul endroit.
              </p>
            </div>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-lg">
            <div>
              <div className="text-4xl font-bold mb-1">100+</div>
              <div className="text-sm text-white/60">Utilisateurs</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">4.1</div>
              <div className="text-sm text-white/60">Note</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-1">87%</div>
              <div className="text-sm text-white/60">Satisfaction</div>
            </div>
          </div>
        </div>
      </div>

      {/* Partie droite - Formulaire */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-lg mb-4">
              <img src="/img/web-app-manifest-192x192.png" alt="" />
            </div>
          </div>

          {/* Titre */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-semibold text-dark mb-2">
              Bienvenue
            </h1>
            <p className="text-sub">
              Connectez-vous / inscrivez-vous pour continuer
            </p>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleSocialAuth("Google")}
              disabled={isLoading}
              className="w-full flex items-center dark:bg-black/70 dark:border-0 dark:hover:bg-black/50 dark:text-white justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Continuer avec Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialAuth("Microsoft")}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#f25022" d="M1 1h10v10H1z"/>
                <path fill="#00a4ef" d="M13 1h10v10H13z"/>
                <path fill="#7fba00" d="M1 13h10v10H1z"/>
                <path fill="#ffb900" d="M13 13h10v10H13z"/>
              </svg>
              <span>Continuer avec Microsoft</span>
            </button>
          </div>

          {/* Terms */}
          <div className="mt-8 text-center text-xs text-sub">
            En continuant, vous acceptez nos{" "}
            <a href="/privacy#section-11" className="underline hover:text-gray-700 text-sub dark:hover:text-white">Conditions d'utilisation</a>
            {" "}et notre{" "}
            <a href="/privacy#section-12" className="underline hover:text-gray-700 text-sub dark:hover:text-white">Politique de confidentialité</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;