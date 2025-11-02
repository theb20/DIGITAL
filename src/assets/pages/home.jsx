import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence  } from "framer-motion";

import { Award, Sparkles, Target, Warehouse, Users, Bed, DollarSign, TrendingUp, Star, ChevronRight, Filter, Map, Grid, List, Heart, ArrowRight, Headphones, CheckCircle, Clock, Lock, Shield, Phone, HandPlatter , Mail, Menu, X, SlidersHorizontal , ChevronDown,  Search, Package, Wrench, ShieldCheck, BarChart3,  Cpu, Zap,  } from 'lucide-react';


import SearchComponent from '../components/search.jsx';
import AboutDigital from '../components/AboutDigital.jsx';
import Partnership from '../components/Partnership.jsx';
import Contact from '../components/Contact.jsx';

export default function FilterFinderHome() {
    const navigate = useNavigate();
    const [index, setIndex] = useState(0);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [displayedText, setDisplayedText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

  const words = [
    "solutions numériques",
    "un sites web performants",
    "une applications sur mesure",
    "une stratégies digitales",];
// ⏱ Changement de mot toutes les 3 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [words.length]);


  const features = [
    {
    icon: Zap,
    title: 'Performance Optimale',
    description: 'Des solutions rapides et efficaces qui boostent votre productivité et améliorent l\'expérience utilisateur.'
  },
  {
    icon: Shield,
    title: 'Sécurité Renforcée',
    description: 'Protection maximale de vos données avec les dernières technologies de cryptage et protocoles de sécurité.'
  },
  {
    icon: TrendingUp,
    title: 'Croissance Garantie',
    description: 'Stratégies éprouvées pour développer votre présence digitale et augmenter votre chiffre d\'affaires.'
  },
  {
    icon: Users,
    title: 'Support Dédié',
    description: 'Une équipe d\'experts disponible 24/7 pour vous accompagner à chaque étape de votre projet.'
  },
  {
    icon: Clock,
    title: 'Livraison Rapide',
    description: 'Respect des délais avec une méthodologie agile pour des résultats concrets en un temps record.'
  },
  {
    icon: Award,
    title: 'Qualité Premium',
    description: 'Standards d\'excellence et attention aux détails pour des produits qui dépassent vos attentes.'
  },
  {
    icon: Sparkles,
    title: 'Innovation Continue',
    description: 'Technologies de pointe et veille constante pour rester à la pointe des tendances digitales.'
  },
  {
    icon: Target,
    title: 'ROI Mesurable',
    description: 'Analytics détaillés et KPIs précis pour mesurer l\'impact réel de votre investissement digital.'
  }
  ];

  const testimonials = [
    {
      name: "Marie Dubois",
      role: "Acheteuse",
      photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
      rating: 5,
      text: "Excellente expérience ! J'ai trouvé l'appartement de mes rêves en moins de 2 semaines. L'équipe est très professionnelle."
    },
    {
      name: "Pierre Martin",
      role: "Vendeur",
      photo: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop",
      rating: 5,
      text: "Service impeccable du début à la fin. Mon bien a été vendu rapidement et au meilleur prix. Je recommande vivement."
    },
    {
      name: "Sophie Laurent",
      role: "Locataire",
      photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
      rating: 5,
      text: "La recherche était simple et intuitive. J'ai pu filtrer exactement ce que je cherchais et trouver rapidement."
    }
  ];

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        if (displayedText.length < currentWord.length) {
          setDisplayedText(currentWord.substring(0, displayedText.length + 1));
        } else {
          setTimeout(() => setIsDeleting(true), 2500);
        }
      } else {
        if (displayedText.length > 0) {
          setDisplayedText(currentWord.substring(0, displayedText.length - 1));
        } else {
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, isDeleting ? 40 : 120);

    return () => clearTimeout(timeout);
  }, [displayedText, isDeleting, currentWordIndex]);

  return (
    <div className="min-h-screen bg-white">
      
      {/* Hero Section avec Search */}
      <section className="relative py-32 text-white transition-colors duration-500 dark:text-gray-100 overflow-hidden">
      {/* 🎥 Vidéo ou Image de fond */}
      <div className="absolute inset-0">
        <img
            src="/img/background/hero.png"
            className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2 object-cover"
          />

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-800/70 to-transparent dark:from-black/80 dark:via-gray-900/70 dark:to-transparent"></div>
      </div>

      {/* 🌟 Contenu principal */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Badge de certifications - Digital */}
          <div className="flex animate-bounce justify-center mb-8">
            <div className="inline-flex items-center lg:mt-12  gap-6 px-6 py-3 bg-white border border-gray-200 shadow-sm rounded-full">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-600" />
                <span className="lg:flex hidden text-xs font-medium text-gray-600">
                  Vérifiés
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-gray-600" />
                <span className="lg:flex hidden text-xs font-medium text-gray-600">
                  Données protégées
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-gray-600" />
                <span className="lg:flex hidden text-xs font-medium text-gray-600">
                  24H/7
                </span>
              </div>
              <div className="w-px h-4 bg-gray-300"></div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-gray-600" />
                <span className="lg:flex hidden text-xs font-medium text-gray-600">
                  +100 Clients
                </span>
              </div>
            </div>
          </div>


          {/* Titre principal avec animation */}
          <div className="max-w-4xl mx-auto text-center mb-16">
              <h1 className="text-3xl h-[130px] lg:h-[220px] sm:text-5xl lg:text-6xl font-light text-gray-100 mb-6 leading-tight tracking-tight">
                  Développez votre présence digitale avec{" "}
                  <br className="" />
                  <span className="relative inline-block">

                    {/* 1️⃣ VERSION SIMPLE (juste couleur) */}
                    <span className="">
                      {displayedText}
                    </span>

                    <span className="inline-block w-0.5 h-12 sm:h-14 lg:h-16 bg-gray-500 ml-1 align-middle animate-cursor"></span>
                  </span>
              </h1>


            <p className="text-lg sm:text-xl text-gray-100 max-w-3xl mx-auto font-light leading-relaxed mb-8">Nous vous accompagnons dans votre transformation numérique<br/>
        de la conception à la mise en ligne, pour <br/>faire croître votre activité.
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Factures personnalisées</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Support commercial dédié</span>
              </div>
            </div>
          </div>

{/* Module de recherche B2B */}
<div className="max-w-4xl mx-auto relative">
  {/* Cercle ping derrière le composant */}
  <div className="absolute inset-0 flex justify-center items-center">
    <span className="lg:w-100 lg:h-17 bg-white rounded-full opacity-30 lg:animate-ping"></span>
  </div>

  {/* Composant de recherche au-dessus */}
  <div className="relative z-10">
    <SearchComponent />
  </div>
</div>


      </div>
       
      </section>

      {/* About Digital Company */}
      <section className="">
       <AboutDigital/>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-block mb-4">
              <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase bg-blue-100 px-4 py-2 rounded-full">
                Nos Avantages
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Pourquoi choisir <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Digital</span> ?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Une plateforme complète qui transforme vos ambitions digitales en succès concrets
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.slice(0, 4).map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={idx} 
                  className="group bg-white p-6 sm:p-8 rounded-2xl border-2 border-gray-100 hover:border-black/10 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl mb-5 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7 sm:w-8 sm:h-8 text-black group-hover:text-black/60 transition-colors" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-black transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Section */}
          <div className="mt-16 text-center">
            <div className="inline-flex flex-col sm:flex-row gap-4">
              <button
              onClick={() => navigate('/privacy#section-13')}
               className="px-8 py-4 bg-black text-white font-semibold rounded-xl hover:shadow-2xl hover:scale-105 transition-all duration-300">
                Consulter l’ensemble de la FAQ
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-gray-200 hover:border-black-600 hover:shadow-xl transition-all duration-300">
                Voir nos réalisations
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Ce que disent nos clients
            </h2>
            <p className="text-lg text-gray-600">Des milliers de personnes nous font confiance</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <img 
                    src={testimonial.photo} 
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 lg:py-24 ">
        <Contact/>
      </section>

       {/* Stats Section */}
      <section className=" px-4 sm:px-6 lg:px-8 overflow-hidden items-center justify-center flex">
        <div className=" w-[80%]">
          <Partnership/>
        </div>
      </section>
    </div>
  );
}