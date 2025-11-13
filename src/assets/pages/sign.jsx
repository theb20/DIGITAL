import { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { loginWithGoogle } from '../configurations/services/auth.js';
import { usePopup } from '../configurations/PopupContext.jsx';
import session from '../configurations/services/session.js';


const AuthPage = () => {
  useEffect(()=>{
      document.title = "Connexion - Digital";
    })
  const navigate = useNavigate();
  const { openPopup } = usePopup();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

   const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setError('');
      const googleToken = credentialResponse.credential;
      if (!googleToken) throw new Error('Aucun token Google reçu');
      setIsLoading(true);
      const user = await loginWithGoogle(googleToken);
      const role = user?.role || 'user';
      const name = user?.first_name || user?.name || '';
      const avatar = user?.avatar || session.getAvatarUrl() || '/img/icons/user.png';
      if (['admin', 'manager'].includes(role)) {
        openPopup('postLoginChoice', { role, name, avatar });
      } else {
        navigate('/');
      }
    } catch (err) {
      setError('Erreur Google: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
   };

  const handleGoogleError = (error) => {
    console.error('Google login error:', error);
    setError('Échec de la connexion Google. Veuillez réessayer.');
  };

  const handleSocialAuth = (provider) => {
    setError(`Connexion ${provider} non encore implémentée.`);
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
          <div className="flex flex-col gap-4 items-center justify-center" style={{ width: "100%" }}>
          
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              size="large"
              text="continue_with"
              shape="rectangular"
              style={{ width: "100%" }}
            />

            {error && (
              <div className="text-red-600 text-center text-sm">
                {error}
              </div>
            )}

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