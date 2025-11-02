import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, CheckCircle, ArrowLeft, Shield, Key } from "lucide-react";

const PasswordResetFlow = () => {
    useState(()=>{
        document.title = "Réinitialisation de mot de passe";
    });
  const navigate = useNavigate();
  const [step, setStep] = useState("request");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({ new: false, confirm: false });

  const validateEmail = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email invalide";
    }
    return newErrors;
  };

  const validateCode = () => {
    const newErrors = {};
    const fullCode = code.join("");
    if (fullCode.length !== 6) {
      newErrors.code = "Veuillez entrer les 6 chiffres";
    }
    return newErrors;
  };

  const validatePasswords = () => {
    const newErrors = {};
    if (!passwords.newPassword) {
      newErrors.newPassword = "Le mot de passe est requis";
    } else if (passwords.newPassword.length < 8) {
      newErrors.newPassword = "Minimum 8 caractères requis";
    }
    if (!passwords.confirmPassword) {
      newErrors.confirmPassword = "Confirmez votre mot de passe";
    } else if (passwords.newPassword !== passwords.confirmPassword) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    return newErrors;
  };

  const handleRequestReset = () => {
    const newErrors = validateEmail();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("email-sent");
      setErrors({});
    }, 1500);
  };

  const handleVerifyCode = () => {
    const newErrors = validateCode();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("reset");
      setErrors({});
    }, 1500);
  };

  const handleResetPassword = () => {
    const newErrors = validatePasswords();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep("success");
      setErrors({});
    }, 1500);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }

    if (errors.code) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.code;
        return updated;
      });
    }
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePasswordChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setPasswords((prev) => {
      const updated = { ...prev };
      updated[name] = value;
      return updated;
    });
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const resetFlow = () => {
    setStep("request");
    setEmail("");
    setCode(["", "", "", "", "", ""]);
    setPasswords({ newPassword: "", confirmPassword: "" });
    setErrors({});
  };

  const getPasswordStrength = () => {
    const pass = passwords.newPassword;
    let strength = 0;
    if (pass.length >= 8) strength++;
    if (/[a-z]/.test(pass) && /[A-Z]/.test(pass)) strength++;
    if (/\d/.test(pass)) strength++;
    if (/[^a-zA-Z0-9]/.test(pass)) strength++;
    return strength;
  };

  const strengthColors = ["bg-red-600", "bg-orange-500", "bg-yellow-500", "bg-emerald-600"];
  const strengthLabels = ["Faible", "Moyen", "Bon", "Excellent"];

  return (
    <div className="min-h-screen flex bg-slate-50"> 

      {/* Left side - Image/Brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="white" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          }}></div>
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12rounded-lg flex items-center justify-center">
                <img src="/img/web-app-manifest-512x512.png" alt="" />
              </div>
              <div>
                <h1 className="text-2xl font-bold"> Digital</h1>
                <p className="text-slate-400 text-sm">Solutions Digitales & Créatives</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Sécurité et confidentialité<br />au cœur de nos priorités
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed">
                Protégez votre compte avec un système de réinitialisation 
                sécurisé et conforme aux normes bancaires.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-700">
              <div>
                <div className="text-3xl font-bold text-white">256-bit</div>
                <div className="text-slate-400 text-sm mt-1">Chiffrement SSL</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">2FA</div>
                <div className="text-slate-400 text-sm mt-1">Authentification</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-white">RGPD</div>
                <div className="text-slate-400 text-sm mt-1">Conformité</div>
              </div>
            </div>
          </div>

          <div className="text-slate-500 text-sm">
            © 2025 Digital. Tous droits réservés.
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {step === "request" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-xl mb-6">
                  <Lock className="w-8 h-8 text-black/60" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  Réinitialiser le mot de passe
                </h2>
                <p className="text-slate-600 text-lg">
                  Saisissez votre adresse email professionnelle pour recevoir un code de vérification sécurisé.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      placeholder="votre.email@entreprise.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) {
                          setErrors((prev) => {
                            const updated = { ...prev };
                            delete updated.email;
                            return updated;
                          });
                        }
                      }}
                      className={`w-full pl-12 pr-4 py-3.5 border ${
                        errors.email ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
                      } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black/40 focus:border-transparent transition-all`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <span className="font-medium">⚠</span> {errors.email}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleRequestReset}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-black hover:bg-black/80 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Envoi en cours...
                    </span>
                  ) : (
                    "Envoyer le code de vérification"
                  )}
                </button>

                <button
                  onClick={() => navigate("/sign")}
                  className="w-full flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors py-2 font-medium"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Retour à la connexion
                </button>
              </div>

              <div className="pt-6 border-t border-slate-200">
                <p className="text-slate-500 text-sm text-center">
                  Besoin d'aide? Contactez notre support au{" "}
                  <span className="text-slate-700 font-semibold">servicesdigitalplus@proton.me</span>
                </p>
              </div>
            </div>
          )}

          {step === "email-sent" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-200 rounded-xl mb-6">
                  <Mail className="w-8 h-8 text-black/60" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  Code de vérification envoyé
                </h2>
                <p className="text-slate-600 text-lg mb-2">
                  Un code à 6 chiffres a été envoyé à
                </p>
                <p className="text-slate-900 font-semibold text-lg bg-slate-100 rounded-lg py-2 px-4 inline-block">
                  {email}
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Code de vérification
                </label>
                <div className="flex justify-center gap-3 mb-2">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      id={`code-${index}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleCodeChange(index, e.target.value)}
                      onKeyDown={(e) => handleCodeKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-slate-300 rounded-lg bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-black/40 focus:border-transparent transition-all"
                    />
                  ))}
                </div>
                {errors.code && (
                  <p className="text-red-600 text-sm mt-2 text-center flex items-center justify-center gap-1">
                    <span className="font-medium">⚠</span> {errors.code}
                  </p>
                )}
              </div>

              <button
                onClick={handleVerifyCode}
                disabled={isLoading}
                className="w-full py-3.5 bg-black hover:bg-black/80 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Vérification...
                  </span>
                ) : (
                  "Vérifier le code"
                )}
              </button>

              <div className="text-center">
                <button
                  onClick={handleRequestReset}
                  className="text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                >
                  Code non reçu? Renvoyer le code
                </button>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <p className="text-slate-500 text-sm text-center">
                  Le code expire dans <span className="font-semibold text-slate-900">10 minutes</span>
                </p>
              </div>
            </div>
          )}

          {step === "reset" && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-xl mb-6">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-900 mb-3">
                  Créer un nouveau mot de passe
                </h2>
                <p className="text-slate-600 text-lg">
                  Choisissez un mot de passe robuste pour sécuriser votre compte.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      name="newPassword"
                      placeholder="••••••••"
                      value={passwords.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3.5 border ${
                        errors.newPassword ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
                      } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black/40 focus:border-transparent transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword.new ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <span className="font-medium">⚠</span> {errors.newPassword}
                    </p>
                  )}
                </div>

                {passwords.newPassword && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex gap-2">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                            i < getPasswordStrength() ? strengthColors[getPasswordStrength() - 1] : "bg-slate-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-slate-700 text-sm font-medium">
                      Force: {strengthLabels[getPasswordStrength() - 1] || "Très faible"}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={passwords.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-4 py-3.5 border ${
                        errors.confirmPassword ? "border-red-500 bg-red-50" : "border-slate-300 bg-white"
                      } rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-black/40 focus:border-transparent transition-all`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword.confirm ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                      <span className="font-medium">⚠</span> {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="bg-slate-100 rounded-lg p-4 border border-slate-200">
                  <p className="font-semibold text-slate-900 text-sm mb-2">
                    Exigences de sécurité:
                  </p>
                  <ul className="space-y-1.5 text-sm">
                    <li className="flex items-center gap-2">
                      <span className={passwords.newPassword.length >= 8 ? "text-emerald-600" : "text-slate-400"}>
                        {passwords.newPassword.length >= 8 ? "✓" : "○"}
                      </span>
                      <span className={passwords.newPassword.length >= 8 ? "text-slate-900" : "text-slate-600"}>
                        Au moins 8 caractères
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/[A-Z]/.test(passwords.newPassword) && /[a-z]/.test(passwords.newPassword) ? "text-emerald-600" : "text-slate-400"}>
                        {/[A-Z]/.test(passwords.newPassword) && /[a-z]/.test(passwords.newPassword) ? "✓" : "○"}
                      </span>
                      <span className={/[A-Z]/.test(passwords.newPassword) && /[a-z]/.test(passwords.newPassword) ? "text-slate-900" : "text-slate-600"}>
                        Majuscules et minuscules
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className={/\d/.test(passwords.newPassword) ? "text-emerald-600" : "text-slate-400"}>
                        {/\d/.test(passwords.newPassword) ? "✓" : "○"}
                      </span>
                      <span className={/\d/.test(passwords.newPassword) ? "text-slate-900" : "text-slate-600"}>
                        Au moins un chiffre
                      </span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={isLoading}
                  className="w-full py-3.5 bg-black hover:bg-black/80 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sauvegarde en cours...
                    </span>
                  ) : (
                    "Réinitialiser le mot de passe"
                  )}
                </button>
              </div>
            </div>
          )}

          {step === "success" && (
            <div className="space-y-6 text-center animate-fade-in">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-xl mb-4">
                <CheckCircle className="w-12 h-12 text-emerald-600" />
              </div>
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-slate-900">
                  Mot de passe réinitialisé avec succès
                </h2>
                <p className="text-slate-600 text-lg">
                  Votre mot de passe a été mis à jour. Vous pouvez maintenant vous connecter avec vos nouveaux identifiants.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={() => navigate("/sign")}
                  className="w-full py-3.5 bg-black hover:bg-black/80 text-white font-semibold rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  Se connecter maintenant
                </button>
              </div>
              <div className="pt-4 border-t border-slate-200">
                <p className="text-slate-500 text-sm">
                  <a href="" className="text-black/80 hover:text-black">
                    Politique de confidentialité et de sécurité
                  </a>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PasswordResetFlow;