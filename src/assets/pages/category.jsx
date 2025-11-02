import React, { useState } from 'react';
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp, Star, Heart,
  ShoppingCart, Eye, Filter, Grid, List, ArrowUpDown, Search,
  MapPin, Truck, Shield, CheckCircle, TrendingUp, Award, Package
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CategoryPage() {
    const navigate = useNavigate();
    
  const [selectedFilters, setSelectedFilters] = useState({
    categories: [],
    brands: [],
    priceRange: [0, 500],
    ratings: [],
    availability: [],
    features: []
  });

  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('popularity');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: true,
    availability: true,
    features: true
  });

  const products = [
    {
      id: 1,
      name: "Filtre à Air Premium K&N",
      category: "Filtres à Air",
      brand: "K&N",
      price: 89.99,
      originalPrice: 120.00,
      rating: 4.8,
      reviews: 245,
      image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=400&fit=crop",
      inStock: true,
      featured: true,
      discount: 25,
      features: ["Réutilisable", "Haute Performance", "Garantie 1 an"]
    },
    {
      id: 2,
      name: "Filtre à Huile Bosch Pro",
      category: "Filtres à Huile",
      brand: "Bosch",
      price: 24.99,
      originalPrice: 29.99,
      rating: 4.6,
      reviews: 189,
      image: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400&h=400&fit=crop",
      inStock: true,
      featured: false,
      discount: 17,
      features: ["OEM Quality", "Longue Durée"]
    },
    {
      id: 3,
      name: "Filtre à Carburant Mann",
      category: "Filtres à Carburant",
      brand: "Mann-Filter",
      price: 34.99,
      rating: 4.7,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400&h=400&fit=crop",
      inStock: true,
      featured: true,
      discount: 0,
      features: ["Filtration Optimale", "Installation Facile"]
    },
    {
      id: 4,
      name: "Filtre d'Habitacle Mahle",
      category: "Filtres d'Habitacle",
      brand: "Mahle",
      price: 19.99,
      originalPrice: 25.99,
      rating: 4.5,
      reviews: 203,
      image: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400&h=400&fit=crop",
      inStock: true,
      featured: false,
      discount: 23,
      features: ["Anti-Allergène", "Charbon Actif"]
    },
    {
      id: 5,
      name: "Kit Filtration Complet Pro",
      category: "Kits",
      brand: "FilterPro",
      price: 149.99,
      originalPrice: 199.99,
      rating: 4.9,
      reviews: 312,
      image: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=400&h=400&fit=crop",
      inStock: true,
      featured: true,
      discount: 25,
      features: ["Pack Complet", "Économie 30%", "Premium"]
    },
    {
      id: 6,
      name: "Filtre à Air Sport Airaid",
      category: "Filtres à Air",
      brand: "Airaid",
      price: 119.99,
      rating: 4.7,
      reviews: 178,
      image: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=400&h=400&fit=crop",
      inStock: false,
      featured: false,
      discount: 0,
      features: ["Performance", "Racing"]
    },
    {
      id: 7,
      name: "Filtre à Huile Mobile 1",
      category: "Filtres à Huile",
      brand: "Mobile 1",
      price: 29.99,
      originalPrice: 35.99,
      rating: 4.8,
      reviews: 267,
      image: "https://images.unsplash.com/photo-1580274455191-1c62238fa333?w=400&h=400&fit=crop",
      inStock: true,
      featured: false,
      discount: 17,
      features: ["Synthétique", "Protection Maximum"]
    },
    {
      id: 8,
      name: "Filtre à Carburant Fram",
      category: "Filtres à Carburant",
      brand: "Fram",
      price: 27.99,
      rating: 4.4,
      reviews: 134,
      image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=400&fit=crop",
      inStock: true,
      featured: false,
      discount: 0,
      features: ["Efficacité Maximum", "Durable"]
    }
  ];

  const filterOptions = {
    categories: [
      { name: "Filtres à Air", count: 156 },
      { name: "Filtres à Huile", count: 243 },
      { name: "Filtres à Carburant", count: 89 },
      { name: "Filtres d'Habitacle", count: 167 },
      { name: "Kits Complets", count: 45 }
    ],
    brands: [
      { name: "K&N", count: 67 },
      { name: "Bosch", count: 124 },
      { name: "Mann-Filter", count: 89 },
      { name: "Mahle", count: 76 },
      { name: "Fram", count: 54 },
      { name: "Airaid", count: 34 },
      { name: "Mobile 1", count: 45 },
      { name: "FilterPro", count: 23 }
    ],
    ratings: [
      { stars: 5, count: 234 },
      { stars: 4, count: 567 },
      { stars: 3, count: 123 },
      { stars: 2, count: 34 },
      { stars: 1, count: 12 }
    ],
    availability: [
      { name: "En stock", count: 645 },
      { name: "Disponible sous 48h", count: 234 },
      { name: "Sur commande", count: 89 }
    ],
    features: [
      { name: "Réutilisable", count: 123 },
      { name: "Haute Performance", count: 234 },
      { name: "Écologique", count: 156 },
      { name: "Longue Durée", count: 289 },
      { name: "Installation Facile", count: 445 }
    ]
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleFilter = (type, value) => {
    setSelectedFilters(prev => {
      const currentValues = prev[type];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [type]: newValues };
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({
      categories: [],
      brands: [],
      priceRange: [0, 500],
      ratings: [],
      availability: [],
      features: []
    });
  };

  const activeFilterCount = 
    selectedFilters.categories.length +
    selectedFilters.brands.length +
    selectedFilters.ratings.length +
    selectedFilters.availability.length +
    selectedFilters.features.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <Filter className="w-8 h-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Catalogue Filtres Automobiles</h1>
          </div>
          <p className="text-lg text-amber-50 max-w-2xl">
            Trouvez le filtre parfait pour votre véhicule parmi notre sélection premium
          </p>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Package className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">700+</p>
              <p className="text-sm text-amber-100">Produits</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Award className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">50+</p>
              <p className="text-sm text-amber-100">Marques</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Truck className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">24h</p>
              <p className="text-sm text-amber-100">Livraison</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <Shield className="w-6 h-6 mb-2" />
              <p className="text-2xl font-bold">100%</p>
              <p className="text-sm text-amber-100">Garantie</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        

        {/* Toolbar */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="md:hidden flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg font-semibold"
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filtres {activeFilterCount > 0 && `(${activeFilterCount})`}
              </button>
              
              <p className="text-gray-700">
                <span className="font-bold">{products.length}</span> produits trouvés
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="popularity">Plus populaires</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Meilleures notes</option>
                <option value="newest">Nouveautés</option>
              </select>

              {/* View Mode */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-gray-700">Filtres actifs:</span>
                {selectedFilters.categories.map(cat => (
                  <span key={cat} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {cat}
                    <button onClick={() => toggleFilter('categories', cat)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                {selectedFilters.brands.map(brand => (
                  <span key={brand} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                    {brand}
                    <button onClick={() => toggleFilter('brands', brand)}>
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                ))}
                <button
                  onClick={clearAllFilters}
                  className="text-sm text-red-600 hover:text-red-700 font-semibold underline"
                >
                  Tout effacer
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Sidebar Filters - Desktop */}
          <aside className="hidden md:block w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtres
                </h2>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              <div className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                {/* Categories */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('category')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Catégories</h3>
                    {expandedSections.category ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.category && (
                    <div className="space-y-2">
                      {filterOptions.categories.map(cat => (
                        <label key={cat.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.categories.includes(cat.name)}
                            onChange={() => toggleFilter('categories', cat.name)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{cat.name}</span>
                          <span className="text-xs text-gray-500">({cat.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brands */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('brand')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Marques</h3>
                    {expandedSections.brand ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.brand && (
                    <div className="space-y-2">
                      {filterOptions.brands.map(brand => (
                        <label key={brand.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.brands.includes(brand.name)}
                            onChange={() => toggleFilter('brands', brand.name)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{brand.name}</span>
                          <span className="text-xs text-gray-500">({brand.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Prix</h3>
                    {expandedSections.price ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.price && (
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={selectedFilters.priceRange[1]}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: [0, parseInt(e.target.value)]
                        }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>0 €</span>
                        <span className="font-semibold">{selectedFilters.priceRange[1]} €</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ratings */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('rating')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Notes</h3>
                    {expandedSections.rating ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.rating && (
                    <div className="space-y-2">
                      {filterOptions.ratings.map(rating => (
                        <label key={rating.stars} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.ratings.includes(rating.stars)}
                            onChange={() => toggleFilter('ratings', rating.stars)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <div className="flex items-center gap-1 flex-1">
                            {[...Array(rating.stars)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(5 - rating.stars)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-gray-300" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({rating.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('availability')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Disponibilité</h3>
                    {expandedSections.availability ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.availability && (
                    <div className="space-y-2">
                      {filterOptions.availability.map(avail => (
                        <label key={avail.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.availability.includes(avail.name)}
                            onChange={() => toggleFilter('availability', avail.name)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{avail.name}</span>
                          <span className="text-xs text-gray-500">({avail.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="pb-4">
                  <button
                    onClick={() => toggleSection('features')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Caractéristiques</h3>
                    {expandedSections.features ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.features && (
                    <div className="space-y-2">
                      {filterOptions.features.map(feature => (
                        <label key={feature.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.features.includes(feature.name)}
                            onChange={() => toggleFilter('features', feature.name)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{feature.name}</span>
                          <span className="text-xs text-gray-500">({feature.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>

          {/* Products Grid */}
          <main className="flex-1">
            <div className={`grid gap-6 ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                : 'grid-cols-1'
            }`}>
              {products.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Essayez de modifier vos filtres pour voir plus de résultats
                  </p>
                  <button
                    onClick={clearAllFilters}
                    className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2 rounded-lg font-semibold"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                products.map(product => (
                  <div
                    key={product.id}
                    className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all group ${
                      viewMode === 'list' ? 'flex' : ''
                    }`}
                  >
                    <div className={`relative ${viewMode === 'list' ? 'w-48' : 'w-full'}`}>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-64 object-cover group-hover:scale-105 transition-transform"
                      />
                      {product.discount > 0 && (
                        <div className="absolute top-3 left-3 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                          -{product.discount}%
                        </div>
                      )}
                      {product.featured && (
                        <div className="absolute top-3 right-3 bg-amber-500 text-white p-2 rounded-full">
                          <TrendingUp className="w-5 h-5" />
                        </div>
                      )}
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                          <span className="bg-white text-gray-900 px-4 py-2 rounded-full font-bold">
                            Rupture de stock
                          </span>
                        </div>
                      )}
                      <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-white p-2 rounded-full shadow-lg hover:bg-amber-500 hover:text-white transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="bg-white p-2 rounded-full shadow-lg hover:bg-red-500 hover:text-white transition-colors">
                          <Heart className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className={`p-4 ${viewMode === 'list' ? 'flex-1' : ''}`}>
                      <span className="text-xs text-amber-600 font-semibold">{product.category}</span>
                      <h3 className="font-bold text-gray-900 mt-1 mb-2 line-clamp-2">
                        {product.name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating)
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.rating} ({product.reviews})
                        </span>
                      </div>

                      <p className="text-xs text-gray-600 mb-3">
                        Marque: <span className="font-semibold text-gray-900">{product.brand}</span>
                      </p>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.features.map(feature => (
                          <span
                            key={feature}
                            className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <div>
                          {product.originalPrice && (
                            <span className="text-sm text-gray-500 line-through mr-2">
                              {product.originalPrice.toFixed(2)} €
                            </span>
                          )}
                          <span className="text-2xl font-bold text-gray-900">
                            {product.price.toFixed(2)} €
                          </span>
                        </div>
                        {product.inStock && (
                          <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
                            <CheckCircle className="w-4 h-4" />
                            En stock
                          </span>
                        )}
                      </div>

                      <button
                        disabled={!product.inStock}
                        onClick={()=>navigate('/card')}
                        className={`w-full font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                          product.inStock
                            ? 'bg-amber-500 hover:bg-amber-600 text-white'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart className="w-5 h-5" />
                        {product.inStock ? 'Ajouter au panier' : 'Indisponible'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </main>
        </div>


         {/* Mobile Filters Modal */}
        {showMobileFilters && (
          <div className="fixed inset-0 bg-black/50 h-screen z-20 md:hidden">
            <div className="absolute inset-y-0 left-0 w-full pt-16 max-w-sm bg-white shadow-xl flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5" />
                  Filtres
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Filters Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Categories */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('category')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Catégories</h3>
                    {expandedSections.category ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.category && (
                    <div className="space-y-2">
                      {filterOptions.categories.map(cat => (
                        <label key={cat.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.categories.includes(cat.name)}
                            onChange={() => toggleFilter('categories', cat.name)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{cat.name}</span>
                          <span className="text-xs text-gray-500">({cat.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Brands */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('brand')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Marques</h3>
                    {expandedSections.brand ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.brand && (
                    <div className="space-y-2">
                      {filterOptions.brands.map(brand => (
                        <label key={brand.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.brands.includes(brand.name)}
                            onChange={() => toggleFilter('brands', brand.name)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{brand.name}</span>
                          <span className="text-xs text-gray-500">({brand.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('price')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Prix</h3>
                    {expandedSections.price ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.price && (
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="0"
                        max="500"
                        value={selectedFilters.priceRange[1]}
                        onChange={(e) => setSelectedFilters(prev => ({
                          ...prev,
                          priceRange: [0, parseInt(e.target.value)]
                        }))}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-700">
                        <span>0 €</span>
                        <span className="font-semibold">{selectedFilters.priceRange[1]} €</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Ratings */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('rating')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Notes</h3>
                    {expandedSections.rating ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.rating && (
                    <div className="space-y-2">
                      {filterOptions.ratings.map(rating => (
                        <label key={rating.stars} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.ratings.includes(rating.stars)}
                            onChange={() => toggleFilter('ratings', rating.stars)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <div className="flex items-center gap-1 flex-1">
                            {[...Array(rating.stars)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            ))}
                            {[...Array(5 - rating.stars)].map((_, i) => (
                              <Star key={i} className="w-4 h-4 text-gray-300" />
                            ))}
                          </div>
                          <span className="text-xs text-gray-500">({rating.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Availability */}
                <div className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleSection('availability')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Disponibilité</h3>
                    {expandedSections.availability ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.availability && (
                    <div className="space-y-2">
                      {filterOptions.availability.map(avail => (
                        <label key={avail.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.availability.includes(avail.name)}
                            onChange={() => toggleFilter('availability', avail.name)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{avail.name}</span>
                          <span className="text-xs text-gray-500">({avail.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Features */}
                <div className="pb-4">
                  <button
                    onClick={() => toggleSection('features')}
                    className="flex items-center justify-between w-full mb-3"
                  >
                    <h3 className="font-semibold text-gray-900">Caractéristiques</h3>
                    {expandedSections.features ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {expandedSections.features && (
                    <div className="space-y-2">
                      {filterOptions.features.map(feature => (
                        <label key={feature.name} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={selectedFilters.features.includes(feature.name)}
                            onChange={() => toggleFilter('features', feature.name)}
                            className="w-4 h-4 text-amber-500 rounded focus:ring-amber-500"
                          />
                          <span className="text-sm text-gray-700 flex-1">{feature.name}</span>
                          <span className="text-xs text-gray-500">({feature.count})</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-4 border-t border-gray-200 space-y-3">
                <button
                  onClick={clearAllFilters}
                  className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold transition-colors"
                >
                  Voir les résultats ({products.length})
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}