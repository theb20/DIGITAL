import React, { useState } from 'react';
import { Heart, Share2, MapPin, Bed, Bath, Maximize, Car, TrendingUp, Phone, Mail, MessageSquare, ChevronLeft, ChevronRight, Home, Zap, Droplet, Wifi, Shield, Calendar, Eye, X, Menu } from 'lucide-react';

export default function PropertyCard() {
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showContact, setShowContact] = useState(false);
  const [showFullGallery, setShowFullGallery] = useState(false);
  const [activeTab, setActiveTab] = useState('description');

  const property = {
    title: "Appartement de prestige vue panoramique",
    type: "Appartement",
    status: "À vendre",
    price: 485000,
    pricePerSqm: 4850,
    address: "15 Avenue des Champs-Élysées",
    city: "Paris 8ème",
    postalCode: "75008",
    description: "Magnifique appartement de standing situé dans un immeuble haussmannien du 8ème arrondissement. Vue dégagée sur les toits de Paris. Prestations haut de gamme avec parquet massif, moulures d'origine et cheminées en marbre. Proximité immédiate des commerces et transports.",
    features: {
      surface: 100,
      rooms: 4,
      bedrooms: 3,
      bathrooms: 2,
      floor: 5,
      totalFloors: 6,
      parking: 1,
      balcony: 15,
      yearBuilt: 1880,
      yearRenovated: 2022
    },
    amenities: [
      { icon: Zap, label: "Chauffage individuel" },
      { icon: Shield, label: "Digicode" },
      { icon: Home, label: "Gardien" },
      { icon: Wifi, label: "Fibre optique" },
      { icon: Droplet, label: "Climatisation" }
    ],
    energyClass: "C",
    gesClass: "B",
    images: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=1200&h=800&fit=crop"
    ],
    agent: {
      name: "Sophie Dubois",
      title: "Conseillère en immobilier",
      phone: "+33 1 42 00 00 00",
      email: "sophie.dubois@agence.fr",
      photo: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop"
    },
    reference: "IMM-2024-7589",
    publishedDate: "Il y a 3 jours",
    views: 1247
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(price);
  };

  const energyColors = {
    A: 'bg-green-600',
    B: 'bg-green-500',
    C: 'bg-yellow-500',
    D: 'bg-yellow-600',
    E: 'bg-orange-500',
    F: 'bg-orange-600',
    G: 'bg-red-600'
  };

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* Galerie plein écran (mobile/tablet friendly) */}
      <div className="relative h-48 sm:h-64 md:h-80 lg:h-96 bg-gray-900">
        <img 
          src={property.images[currentImage]} 
          alt={property.title}
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>

        {/* Navigation images - Responsive */}
        <button 
          onClick={prevImage}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 sm:p-3 shadow-lg transition-all rounded-full"
        >
          <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6 text-gray-900" />
        </button>
        <button 
          onClick={nextImage}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white p-2 sm:p-3 shadow-lg transition-all rounded-full"
        >
          <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6 text-gray-900" />
        </button>

        {/* Badges - Empilés sur mobile */}
        <div className="absolute top-3 sm:top-4 left-3 sm:left-4 flex flex-col sm:flex-row gap-2">
          <span className="bg-blue-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded">
            {property.status}
          </span>
          <span className="bg-white text-gray-900 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-semibold rounded">
            {property.type}
          </span>
        </div>

        {/* Actions - Responsive */}
        <div className="absolute top-3 sm:top-4 right-3 sm:right-4 flex gap-2">
          <button 
            onClick={() => setIsFavorite(!isFavorite)}
            className="bg-white/95 hover:bg-white p-2 sm:p-3 transition-all rounded-full shadow-lg"
          >
            <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-900'}`} />
          </button>
          <button className="bg-white/95 hover:bg-white p-2 sm:p-3 transition-all rounded-full shadow-lg">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-gray-900" />
          </button>
        </div>

        {/* Compteur - Responsive */}
        <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 bg-black/80 text-white px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm rounded">
          {currentImage + 1} / {property.images.length}
        </div>

        {/* Miniatures - Hidden sur mobile, visible tablet+ */}
        <div className="hidden md:flex absolute bottom-4 left-4 gap-2">
          {property.images.slice(0, 5).map((img, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentImage(idx)}
              className={`w-12 h-12 lg:w-16 lg:h-16 overflow-hidden border-2 transition-all rounded ${
                currentImage === idx ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      {/* Container principal responsive */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg sm:rounded-xl shadow-lg overflow-hidden">
              
              {/* En-tête - Prix sticky sur mobile */}
              <div className="sticky top-0 bg-white z-10 border-b border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {property.title}
                    </h1>
                    <div className="flex items-center gap-2 text-gray-600 text-sm sm:text-base">
                      <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span className="truncate">{property.address}, {property.city}</span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right flex-shrink-0">
                    <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-blue-600">
                      {formatPrice(property.price)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">{formatPrice(property.pricePerSqm)}/m²</div>
                  </div>
                </div>

                {/* Méta - Responsive */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-200">
                  <span className="flex items-center gap-1">
                    <span className="hidden sm:inline">Réf.</span> {property.reference}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                    {property.publishedDate}
                  </span>
                  <span className="hidden sm:inline">•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                    {property.views}
                  </span>
                </div>
              </div>

              {/* Caractéristiques principales - Grid responsive */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-4 sm:p-6 bg-gray-50">
                <div className="bg-white p-3 sm:p-4 rounded-lg text-center shadow-sm">
                  <Maximize className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{property.features.surface}</div>
                  <div className="text-xs sm:text-sm text-gray-600">m²</div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg text-center shadow-sm">
                  <Home className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{property.features.rooms}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Pièces</div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg text-center shadow-sm">
                  <Bed className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{property.features.bedrooms}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Chambres</div>
                </div>
                <div className="bg-white p-3 sm:p-4 rounded-lg text-center shadow-sm">
                  <Bath className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 mx-auto mb-1 sm:mb-2" />
                  <div className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">{property.features.bathrooms}</div>
                  <div className="text-xs sm:text-sm text-gray-600">SDB</div>
                </div>
              </div>

              {/* Tabs navigation - Mobile friendly */}
              <div className="flex overflow-x-auto border-b border-gray-200 bg-white">
                {['description', 'details', 'equipements', 'energie'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium whitespace-nowrap transition-colors ${
                      activeTab === tab
                        ? 'text-blue-600 border-b-2 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab === 'description' && 'Description'}
                    {tab === 'details' && 'Détails'}
                    {tab === 'equipements' && 'Équipements'}
                    {tab === 'energie' && 'Énergie'}
                  </button>
                ))}
              </div>

              {/* Contenu des tabs */}
              <div className="p-4 sm:p-6">
                {activeTab === 'description' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Description</h2>
                    <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{property.description}</p>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Détails du bien</h2>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex justify-between py-2 sm:py-3 border-b border-gray-200">
                        <span className="text-sm sm:text-base text-gray-600">Étage</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900">{property.features.floor}/{property.features.totalFloors}</span>
                      </div>
                      <div className="flex justify-between py-2 sm:py-3 border-b border-gray-200">
                        <span className="text-sm sm:text-base text-gray-600">Parking</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900">{property.features.parking} place</span>
                      </div>
                      <div className="flex justify-between py-2 sm:py-3 border-b border-gray-200">
                        <span className="text-sm sm:text-base text-gray-600">Balcon</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900">{property.features.balcony} m²</span>
                      </div>
                      <div className="flex justify-between py-2 sm:py-3 border-b border-gray-200">
                        <span className="text-sm sm:text-base text-gray-600">Construction</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900">{property.features.yearBuilt}</span>
                      </div>
                      <div className="flex justify-between py-2 sm:py-3 border-b border-gray-200">
                        <span className="text-sm sm:text-base text-gray-600">Rénovation</span>
                        <span className="text-sm sm:text-base font-semibold text-gray-900">{property.features.yearRenovated}</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'equipements' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Équipements et services</h2>
                    <div className="grid sm:grid-cols-2 gap-2 sm:gap-3">
                      {property.amenities.map((amenity, idx) => {
                        const Icon = amenity.icon;
                        return (
                          <div key={idx} className="flex items-center gap-3 bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                            <span className="text-sm sm:text-base text-gray-700">{amenity.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'energie' && (
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">Performance énergétique</h2>
                    <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                        <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Consommation énergétique</div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`${energyColors[property.energyClass]} text-white w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold rounded`}>
                            {property.energyClass}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Classe énergétique
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
                        <div className="text-xs sm:text-sm font-semibold text-gray-700 mb-3">Émissions GES</div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className={`${energyColors[property.gesClass]} text-white w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center text-xl sm:text-2xl font-bold rounded`}>
                            {property.gesClass}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-600">
                            Indice GES
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Contact - Sticky sur desktop, section sur mobile */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-4 sm:space-y-6">
              
              {/* Agent */}
              <div className="bg-white rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <img 
                    src={property.agent.photo} 
                    alt={property.agent.name}
                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="font-bold text-sm sm:text-base text-gray-900 truncate">{property.agent.name}</div>
                    <div className="text-xs sm:text-sm text-gray-600 truncate">{property.agent.title}</div>
                  </div>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <button 
                    onClick={() => setShowContact(!showContact)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-3.5 px-4 text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2 rounded-lg"
                  >
                    <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
                    {showContact ? property.agent.phone : 'Afficher le téléphone'}
                  </button>
                  
                  <button className="w-full bg-gray-900 hover:bg-gray-800 text-white py-3 sm:py-3.5 px-4 text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2 rounded-lg">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5" />
                    Email
                  </button>

                  <button className="w-full border-2 border-gray-300 hover:border-gray-900 text-gray-900 py-3 sm:py-3.5 px-4 text-sm sm:text-base font-semibold transition-colors flex items-center justify-center gap-2 rounded-lg">
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    Demander une visite
                  </button>
                </div>
              </div>

              {/* Calculateur - Collapsible sur mobile */}
              <div className="bg-blue-50 rounded-lg sm:rounded-xl shadow-lg p-4 sm:p-6">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 mb-3 sm:mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  Simuler mon prêt
                </h3>
                <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Prix du bien</span>
                    <span className="font-semibold text-gray-900">{formatPrice(property.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Apport (20%)</span>
                    <span className="font-semibold text-gray-900">{formatPrice(property.price * 0.2)}</span>
                  </div>
                  <div className="flex justify-between pb-2 sm:pb-3 border-b border-blue-200">
                    <span className="text-gray-600">Prêt sur 25 ans</span>
                    <span className="font-semibold text-gray-900">{formatPrice(property.price * 0.8)}</span>
                  </div>
                  <div className="pt-2 sm:pt-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2">
                      <span className="text-gray-700 font-semibold">Mensualité estimée</span>
                      <span className="text-lg sm:text-xl font-bold text-blue-600">
                        {formatPrice((property.price * 0.8 * 1.02) / 300)}/mois
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Taux 2% sur 25 ans</div>
                  </div>
                </div>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 sm:py-3 mt-3 sm:mt-4 text-sm sm:text-base font-semibold transition-colors rounded-lg">
                  Simulation détaillée
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}