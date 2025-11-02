import React, { useState } from 'react';
import { Trash2, Heart, ChevronDown, ChevronUp, Tag, AlertCircle, Truck, Shield, Clock, Star, Check, X, CreditCard, Package, Info } from 'lucide-react';

export default function ShoppingCart() {
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      name: "Sony WH-1000XM5 Wireless Noise Cancelling Headphones",
      price: 379.99,
      originalPrice: 449.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&h=400&fit=crop",
      inStock: true,
      prime: true,
      seller: "Amazon.fr",
      delivery: "Livraison gratuite demain",
      rating: 4.7,
      reviews: 12453
    },
    {
      id: 2,
      name: "Apple AirPods Pro (2ème génération) avec Étui de Charge MagSafe",
      price: 279.00,
      originalPrice: 299.00,
      quantity: 2,
      image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=400&h=400&fit=crop",
      inStock: true,
      prime: true,
      seller: "Amazon.fr",
      delivery: "Livraison gratuite demain",
      rating: 4.8,
      reviews: 28934
    },
    {
      id: 3,
      name: "Kindle Paperwhite Signature Edition (32 Go) avec Recharge sans fil",
      price: 139.99,
      originalPrice: 159.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1592422746598-c56c93be3894?w=400&h=400&fit=crop",
      inStock: true,
      prime: true,
      seller: "Amazon.fr",
      delivery: "Livraison gratuite demain",
      rating: 4.6,
      reviews: 45678
    },
    {
      id: 4,
      name: "Logitech MX Master 3S Performance Wireless Mouse",
      price: 89.99,
      originalPrice: 119.99,
      quantity: 1,
      image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=400&fit=crop",
      inStock: true,
      prime: false,
      seller: "TechStore France",
      delivery: "Livraison 3-5 jours ouvrés",
      rating: 4.5,
      reviews: 8234
    }
  ]);

  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    ));
  };

  const removeItem = (id) => {
    setCartItems(cartItems.filter(item => item.id !== id));
  };

  const moveToWishlist = (id) => {
    removeItem(id);
  };

  const applyPromoCode = () => {
    if (promoCode.toUpperCase() === 'SAVE10') {
      setAppliedPromo({ code: 'SAVE10', discount: 10 });
    } else {
      alert('Code promo invalide');
      setPromoCode('');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const savings = cartItems.reduce((sum, item) => sum + ((item.originalPrice - item.price) * item.quantity), 0);
  const promoDiscount = appliedPromo ? (subtotal * appliedPromo.discount / 100) : 0;
  const shipping = cartItems.some(item => !item.prime) ? 4.99 : 0;
  const total = subtotal - promoDiscount + shipping;
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Info Bar */}
      <div className="bg-slate-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>Paiement sécurisé</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4" />
              <span>Livraison gratuite dès 25€</span>
            </div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              <span>Retours sous 30 jours</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-600 mb-6">
          <span className="hover:text-blue-600 cursor-pointer">Accueil</span>
          <span className="mx-2">/</span>
          <span className="font-medium text-gray-900">Panier</span>
        </nav>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Panier d'achat</h1>
          <p className="text-gray-600">{totalItems} article{totalItems > 1 ? 's' : ''}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Prime Shipping Banner */}
            {cartItems.some(item => item.prime) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-900 text-sm">Votre commande est éligible à la livraison gratuite</p>
                    <p className="text-xs text-blue-700 mt-1">Sélectionnez l'option de livraison gratuite lors du paiement</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="bg-white rounded-lg border border-gray-200">
              {cartItems.map((item, index) => (
                <div 
                  key={item.id} 
                  className={`p-4 sm:p-6 ${index !== cartItems.length - 1 ? 'border-b border-gray-200' : ''}`}
                >
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name}
                        className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded border border-gray-200"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 hover:text-blue-600 cursor-pointer mb-2 text-sm sm:text-base">
                        {item.name}
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3 h-3 sm:w-4 sm:h-4 ${
                                i < Math.floor(item.rating) 
                                  ? 'fill-yellow-400 text-yellow-400' 
                                  : 'fill-gray-200 text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">
                          {item.rating} ({item.reviews.toLocaleString()})
                        </span>
                      </div>

                      {/* Stock & Prime Badge */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {item.inStock && (
                          <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">
                            En stock
                          </span>
                        )}
                        {item.prime && (
                          <span className="text-xs font-bold text-white bg-blue-500 px-2 py-1 rounded">
                            prime
                          </span>
                        )}
                      </div>

                      {/* Delivery Info */}
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-xs sm:text-sm text-gray-700">{item.delivery}</span>
                      </div>

                      {/* Seller */}
                      <p className="text-xs text-gray-600 mb-3">
                        Vendu par <span className="text-blue-600 hover:underline cursor-pointer">{item.seller}</span>
                      </p>

                      {/* Price & Actions */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          {/* Discount Badge */}
                          {item.originalPrice > item.price && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs line-through text-gray-500">
                                {item.originalPrice.toFixed(2)} €
                              </span>
                              <span className="text-xs font-semibold text-red-600">
                                -{Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)}%
                              </span>
                            </div>
                          )}
                          <p className="text-xl sm:text-2xl font-bold text-gray-900">
                            {item.price.toFixed(2)} €
                          </p>
                        </div>

                        {/* Quantity Selector */}
                        <div className="flex items-center gap-3">
                          <div className="flex items-center border border-gray-300 rounded">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-3 py-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={item.quantity <= 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 font-medium min-w-[40px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-3 py-2 hover:bg-gray-50"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-sm text-gray-700 hover:text-red-600 flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          Supprimer
                        </button>
                        <button
                          onClick={() => moveToWishlist(item.id)}
                          className="text-sm text-gray-700 hover:text-blue-600 flex items-center gap-1"
                        >
                          <Heart className="w-4 h-4" />
                          Enregistrer pour plus tard
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary - Right Column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg border border-gray-200 sticky top-55">
              <div className="p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Récapitulatif de la commande</h2>
                
                {/* Promo Code Section */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code promo
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Entrez votre code"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800"
                    >
                      Appliquer
                    </button>
                  </div>
                  {appliedPromo && (
                    <div className="mt-2 flex items-center justify-between text-sm bg-green-50 px-3 py-2 rounded">
                      <span className="text-green-800 font-medium">Code {appliedPromo.code} appliqué</span>
                      <button onClick={() => setAppliedPromo(null)} className="text-green-800 hover:text-green-900">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 pb-4 border-b border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sous-total ({totalItems} articles)</span>
                    <span className="font-medium text-gray-900">{subtotal.toFixed(2)} €</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Économies</span>
                      <span className="font-medium text-green-600">-{savings.toFixed(2)} €</span>
                    </div>
                  )}
                  
                  {appliedPromo && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Réduction ({appliedPromo.discount}%)</span>
                      <span className="font-medium text-green-600">-{promoDiscount.toFixed(2)} €</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Livraison</span>
                    <span className="font-medium text-gray-900">
                      {shipping === 0 ? (
                        <span className="text-green-600">Gratuit</span>
                      ) : (
                        `${shipping.toFixed(2)} €`
                      )}
                    </span>
                  </div>
                </div>
                
                {/* Total */}
                <div className="py-4 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-bold text-gray-900">Total</span>
                    <span className="text-2xl font-bold text-gray-900">{total.toFixed(2)} €</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">TVA incluse</p>
                </div>

                {/* Checkout Button */}
                <button className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold py-3 px-4 rounded text-sm">
                  Procéder au paiement
                </button>

                {/* Info Message */}
                <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex gap-2">
                    <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800">
                      Les prix et la disponibilité des articles sont susceptibles de changer. Le montant final sera confirmé lors du paiement.
                    </p>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg">
                <p className="text-xs text-gray-600 mb-3 font-medium">Modes de paiement acceptés</p>
                <div className="flex flex-wrap gap-2">
                  <div className="bg-white border border-gray-200 px-3 py-1 rounded text-xs font-medium text-gray-700">
                    Carte bancaire
                  </div>
                  <div className="bg-white border border-gray-200 px-3 py-1 rounded text-xs font-medium text-gray-700">
                    PayPal
                  </div>
                  <div className="bg-white border border-gray-200 px-3 py-1 rounded text-xs font-medium text-gray-700">
                    Apple Pay
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <Shield className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">Transactions sécurisées</p>
                  <p className="text-xs text-gray-600">Vos données sont protégées</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}