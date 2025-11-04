import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaSearch,
  FaShoppingCart,
  FaUser,
  FaHeart,
  FaBars,
  FaTimes,
  FaGlobe,
  FaPhoneAlt,
  FaSearch as SearchIcon,
} from "react-icons/fa";
import {Moon, Sun } from 'lucide-react';

const Header = ({openPopup}) => {
    const location = useLocation();
    const navigate = useNavigate();

    const [menuOpen, setMenuOpen] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
      const [darkMode, setDarkMode] = useState(() => {
    // Récupérer la préférence depuis localStorage au chargement
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

    const isSignPage = location.pathname === "/sign";
    const isResetPage = location.pathname === "/reset";
    const isPrivacyPage = location.pathname === "/privacy";
    const isBlogPage = location.pathname === "/blog";
    const isCardPage = location.pathname === "/card";
    const isProfilPage = location.pathname === "/profil";
    const isSubmissionPage = location.pathname === "/submission";
    const isFollowServicePage = location.pathname === "/followService";
    const isHomePage = location.pathname === "/";

    // Fonction pour fermer tous les menus
    const closeAllMenus = () => {
      setMenuOpen(false);
      setShowSearch(false);
    };

    // Fonction pour gérer la navigation et fermer les menus
    const handleNavigation = (path) => {
      navigate(path);
      closeAllMenus();
    };


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
    <>
     {!isSignPage && !isBlogPage && !isResetPage && (
        <header className="w-full fixed top-0 left-0 z-50 bg-transparent transition-all duration-300">
            {/* ===== Barre supérieure (Desktop uniquement) ===== */}
            {!isProfilPage && (
            <div className={`hidden xl:flex justify-between backdrop-blur-md items-center px-6 xl:px-12 2xl:px-16 py-3 text-xs ${
              isHomePage 
                ? 'bg-white/1 text-gray-300' 
                : 'dark:bg-gray-900 text-sub '
            }`}>
                <div className="flex items-center space-x-6">
                  <span className="flex items-center gap-2 hover:text-slate-100 transition-colors">
                      <FaPhoneAlt className="text-slate-400 dark:text-white" /> +33 1 23 45 67 89
                  </span>
                  <span className="flex items-center gap-2 hover:text-slate-100 transition-colors">
                      <FaGlobe className="text-slate-400 dark:text-white" />XOF | €  
                  </span>
                </div>

                <div className="flex items-center gap-6 font-medium">
                  {!isHomePage && (
                  <button
                    onClick={toggleDarkMode}
                    className={`p-2 flex items-center justify-center rounded-full transition-all ${
                      darkMode
                      ? ' text-yellow-400 border-0 hover:bg-yellow-400/50'
                      : ' text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-label="Toggle dark mode"
                    >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  )}
                  <a href="/submission" className=" hover:text-black/90  cursor-pointer transition-colors dark:hover:text-slate-100">Demander un devis</a>
                  <a href="/followService" className="hover:text-black/90 transition-colors dark:hover:text-slate-100">Suivre mon service</a>
                </div>
            </div>
            )}
            {!isFollowServicePage && !isSubmissionPage && !isBlogPage && !isCardPage && !isPrivacyPage && (
              <>
                {/* ===== Barre principale ===== */}
                <div className="w-full flex justify-center items-center px-0 sm:px-4 lg:px-6 xl:px-8">
                  <div className="w-full overflow-hidden lg:w-4/5 xl:w-3/4 2xl:w-3/5 py-0 sm:py-3 lg:py-4 flex items-center justify-center">
                    <div className="bg-white sm:rounded-full md:rounded-full lg:rounded-full shadow-sm lg:shadow-md overflow-hidden w-full lg:w-[calc(90%-20px)] md:w-[calc(90%-20px)] ">
                          <div className="flex items-center justify-between px-4 sm:px-5 md:px-6 lg:px-8 xl:px-10 py-3 md:py-3.5 lg:py-0 gap-2 sm:gap-3 md:gap-4 lg:gap-6">
                              
                              {/* Bouton menu mobile */}
                              <button
                                  className="lg:hidden text-xl md:text-2xl cursor-pointer text-slate-700 hover:text-slate-900 transition-colors flex-shrink-0"
                                  onClick={() => {
                                    setMenuOpen(!menuOpen);
                                    if (showSearch) setShowSearch(false);
                                  }}
                                  aria-label="Toggle menu"
                              >
                                  {menuOpen ? <FaTimes /> : <FaBars />}
                              </button>
                              
                              {/* Logo */}
                              <div 
                                onClick={() => handleNavigation("/")} 
                                className="font-bold flex items-center cursor-pointer select-none text-slate-800 flex-shrink-0 gap-2 md:gap-3"
                              >
                                <div className="w-9 sm:w-10 md:w-12 lg:w-14 xl:w-16">
                                  <img 
                                    src="/img/web-app-manifest-512x512.png" 
                                    className="w-full rounded-lg" 
                                    alt="Digital Logo" 
                                  />
                                </div>      
                                <span className="tracking-tight font-bold text-xl sm:text-2xl md:text-2xl lg:text-3xl xl:text-4xl">
                                  Digital
                                </span>
                              </div>
                              
                              {/* Navigation desktop */}
                              <nav className="hidden lg:flex flex-1 justify-center py-4 xl:py-5">
                                  <div className="flex space-x-5 xl:space-x-8 2xl:space-x-10 font-medium text-sm xl:text-base text-slate-700">
                                    <a href="/" className="hover:text-slate-900 transition-colors whitespace-nowrap">Accueil</a>
                                    <a href="/blog" className="hover:text-slate-900 transition-colors whitespace-nowrap">Blog</a>
                                    <a href="/portfolio" className="hover:text-slate-900 transition-colors whitespace-nowrap">Porfolio</a>
                                    <a href="/contact" className="hover:text-slate-900 transition-colors whitespace-nowrap">Contact</a>
                                  </div>
                              </nav>

                              {/* Bouton de connexion */}
                              <div className="flex items-center flex-shrink-0">

                                
                                  {/* Version mobile avec icône uniquement */}
                                  <button 
                                    onClick={() => handleNavigation("/sign")}
                                    className="lg:hidden text-slate-600 hover:text-slate-900 transition-colors p-2"
                                    aria-label="Connexon"
                                  >
                                    <FaUser className="text-xl md:text-2xl" />
                                  </button>

                                  {/* Version desktop avec texte */}
                                  <button 
                                    onClick={() => handleNavigation("/sign")}
                                    className=" hidden lg:flex bg-slate-100 hover:bg-slate-200 py-2.5 lg:py-3 px-4 lg:px-5 xl:px-6 rounded-full items-center gap-2 text-slate-700 hover:text-slate-900 transition-all font-medium text-sm xl:text-base"
                                  >
                                    <FaUser className="lg:hidden text-base xl:text-lg" />
                                    <span className="whitespace-nowrap">Connexion</span>
                                  </button>
                              </div>
                          </div>
                    </div>
                  </div>
                </div>

                {/* Menu mobile */}
                <div
                    className={`lg:hidden absolute w-full bg-white border-t border-gray-200 shadow-lg transition-all duration-300 z-60 ${
                    menuOpen ? "max-h-[32rem] opacity-100" : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                >
                    <nav className="flex flex-col items-center py-6 md:py-8 space-y-4 md:space-y-5 text-slate-700 font-medium text-sm md:text-base">
                      <a 
                        onClick={() => handleNavigation("/")}
                        className="hover:text-slate-900 transition-colors cursor-pointer py-2"
                      >
                        Accueil
                      </a>
                      <a 
                        onClick={() => handleNavigation("/services")} 
                        className="hover:text-slate-900 transition-colors cursor-pointer py-2"
                      >
                        Services
                      </a>
                      <a 
                        href="#" 
                        className="hover:text-slate-900 transition-colors py-2"
                      >
                        Portfolio
                      </a>
                      <a 
                        onClick={() => navigate("/submission")} 
                        className="hover:text-slate-900 transition-colors cursor-pointer py-2"
                      >
                        Demander un devis
                      </a>
                      <a 
                        onClick={() => handleNavigation("/followService")}
                        className="hover:text-slate-900 transition-colors cursor-pointer py-2"
                      >
                        Suivre mon service
                      </a>
                      <a 
                        onClick={() => handleNavigation("/contact")}
                        className="hover:text-slate-900 transition-colors cursor-pointer py-2"
                      >
                        Contact
                      </a>
                      
                      {/* Bouton de connexion dans le menu mobile */}
                     {!isHomePage && ( <div className="pt-4 flex border-t border-slate-200 w-4/5">
                      
                        <>
                          <button
                            onClick={() => {
                                          setShowSearch(!showSearch);
                                          if (menuOpen) setMenuOpen(false);
                                        }}
                            className="w-full bg-slate-100 hover:bg-slate-200 py-3 px-6 rounded-full flex items-center justify-center gap-2 text-slate-700 hover:text-slate-900 transition-all font-medium"
                          >
                            <SearchIcon className="text-base md:text-lg" />
                            <span>Recherche</span>
                          </button>
                        
                          <button
                                      onClick={toggleDarkMode}
                                      className={`p-2 lg:hidden flex items-center justify-center rounded-lg transition-all ${
                                        darkMode
                                          ? ' text-yellow-400 hover:bg-gray-200'
                                          : ' text-gray-700 hover:bg-gray-200'
                                      }`}
                                      aria-label="Toggle dark mode"
                                    >
                                      {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                          </button>
                        </>
                      
                      </div>)}
                    </nav>
                </div>

                
                <div
                    className={`lg:hidden bg-white border-t border-gray-200 shadow-md overflow-hidden transition-all duration-300 ease-in-out ${
                    showSearch 
                        ? "max-h-32 opacity-100" 
                        : "max-h-0 opacity-0"
                    }`}
                >
                    <div className="p-4 md:p-5 flex items-center justify-center">
                      <div className={`bg-slate-50 rounded-lg px-4 py-2.5 md:py-3 flex items-center w-full border border-slate-200 transition-all duration-300 ${
                          showSearch 
                          ? "scale-100 opacity-100" 
                          : "scale-95 opacity-0"
                      }`}>
                          <FaSearch className="text-slate-400 mr-3 flex-shrink-0 text-base md:text-lg" />
                          <input
                            type="text"
                            placeholder="Rechercher..."
                            className="bg-transparent py-2 outline-none w-full text-sm md:text-base text-slate-700 placeholder:text-slate-400"
                            autoFocus={showSearch}
                          />
                          <button
                            onClick={() => setShowSearch(false)}
                            className="ml-2 text-slate-400 hover:text-slate-700 transition-colors flex-shrink-0"
                            aria-label="Fermer la recherche"
                          >
                            <FaTimes className="text-lg" />
                          </button>
                      </div>
                    </div>
                </div>
            </>) }  
        </header>
     )}
    </>
  );
};

export default Header;