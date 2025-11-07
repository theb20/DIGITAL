import React, { useEffect, useState } from "react";
import QuotePreview from './QuotePreview'; 
import { 
  Building, User, Mail, Phone, MapPin, Calendar, Plus, Trash2, 
  Save, Send, Download, FileText, Calculator, CheckCircle, 
  AlertCircle, X, Eye, Edit2, Percent, Euro, Globe, Palette,
  Smartphone, Package, Image, Printer, Zap, Monitor, Layers,
  TrendingUp, Share2, Camera, Video, ShoppingCart, Code
} from "lucide-react";

import api from '../configurations/api/api_axios.js';

const QuoteComponent = ({ closePopup, mode = 'client', request = null }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [respondSuccess, setRespondSuccess] = useState(false);

  // Services digitaux avec icônes et descriptions
  const digitalServices = [
    { 
      category: "Développement Web & Mobile",
      icon: Code,
      color: "blue",
      services: [
        { name: "Site Web Vitrine", price: 250000, unit: "projet", icon: Globe },
        { name: "Site E-commerce", price: 500000, unit: "projet", icon: ShoppingCart },
        { name: "Application Web", price: 750000, unit: "projet", icon: Monitor },
        { name: "Application Mobile (iOS/Android)", price: 1000000, unit: "projet", icon: Smartphone },
        { name: "Landing Page", price: 150000, unit: "page", icon: Zap },
        { name: "Maintenance Mensuelle", price: 50000, unit: "mois", icon: Code }
      ]
    },
    { 
      category: "Design & Identité Visuelle",
      icon: Palette,
      color: "purple",
      services: [
        { name: "Logo & Charte Graphique", price: 100000, unit: "projet", icon: Palette },
        { name: "Design UI/UX Application", price: 200000, unit: "projet", icon: Layers },
        { name: "Refonte Graphique Site Web", price: 150000, unit: "projet", icon: Monitor },
        { name: "Kit Identité Visuelle Complet", price: 250000, unit: "projet", icon: Image }
      ]
    },
    { 
      category: "Print & Communication",
      icon: Printer,
      color: "green",
      services: [
        { name: "Carte de Visite", price: 15000, unit: "lot 100", icon: FileText },
        { name: "Flyer A5", price: 25000, unit: "lot 100", icon: FileText },
        { name: "Brochure (8 pages)", price: 80000, unit: "projet", icon: FileText },
        { name: "Affiche A3", price: 30000, unit: "lot 50", icon: Image },
        { name: "Kakémono Roll-up", price: 40000, unit: "unité", icon: Image }
      ]
    },
    { 
      category: "Réseaux Sociaux & Digital Marketing",
      icon: Share2,
      color: "pink",
      services: [
        { name: "Bannière Facebook", price: 10000, unit: "design", icon: Share2 },
        { name: "Bannière Instagram", price: 10000, unit: "design", icon: Camera },
        { name: "Bannière LinkedIn", price: 10000, unit: "design", icon: Share2 },
        { name: "Pack 10 Posts Réseaux Sociaux", price: 75000, unit: "pack", icon: Image },
        { name: "Gestion Réseaux Sociaux", price: 100000, unit: "mois", icon: TrendingUp },
        { name: "Publicité Facebook/Instagram", price: 150000, unit: "campagne", icon: Zap }
      ]
    },
    { 
      category: "Photo & Vidéo",
      icon: Camera,
      color: "red",
      services: [
        { name: "Shooting Photo Produit", price: 50000, unit: "séance", icon: Camera },
        { name: "Retouche Photo", price: 5000, unit: "photo", icon: Image },
        { name: "Vidéo Promotionnelle (30s)", price: 150000, unit: "vidéo", icon: Video },
        { name: "Montage Vidéo Simple", price: 75000, unit: "vidéo", icon: Video }
      ]
    },
    { 
      category: "Packaging & Impression",
      icon: Package,
      color: "orange",
      services: [
        { name: "Design Packaging Produit", price: 100000, unit: "design", icon: Package },
        { name: "Étiquettes Personnalisées", price: 20000, unit: "lot 100", icon: FileText },
        { name: "Boîte Personnalisée", price: 50000, unit: "design", icon: Package },
        { name: "Sac Personnalisé", price: 30000, unit: "design", icon: Package }
      ]
    }
  ];

  const [quoteData, setQuoteData] = useState({
    clientType: "entreprise",
    clientName: "",
    clientCompany: "",
    clientEmail: "",
    clientPhone: "",
    clientAddress: "",
    clientCity: "",
    clientPostal: "",
    clientWebsite: "",
    clientSector: "",
    quoteNumber: `DIG-${Date.now().toString().slice(-6)}`,// Numéro de devis unique
    quoteDate: new Date().toISOString().split('T')[0],
    validityDate: new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
    projectCategory: "",
    projectDeadline: "",
    items: [
      { id: 1, service: "", description: "", quantity: 1, unitPrice: 0, unit: "unité", taxRate: 0 }
    ],
    discount: 0,
    discountType: "percent",
    notes: "",
    paymentTerms: "50% à la commande, 50% à la livraison",
    deliveryTerms: "",
    termsAndConditions: `CONDITIONS GÉNÉRALES :

Ce devis est valable trente (30) jours à compter de sa date d’émission. Le paiement s’effectue en deux étapes : un acompte de 50 % à la signature et le solde de 50 % à la livraison du projet. Les moyens de paiement acceptés sont le virement bancaire et le Mobile Money (Orange Money, MoMo ou Wave).

Les délais mentionnés prennent effet à partir de la réception de l’acompte et de l’ensemble des éléments nécessaires à la bonne exécution du projet (contenus, images, accès, etc.). Deux révisions sont incluses par livrable ; toute révision supplémentaire fera l’objet d’une facturation selon le taux horaire en vigueur.

Les livrables finaux seront fournis dans les formats adaptés (PSD, AI, PDF, etc.). Les droits d’auteur et de propriété intellectuelle seront transférés au client uniquement après le paiement intégral du montant dû. En cas d’annulation par le client, l’acompte reste acquis au prestataire à titre de dédommagement pour le travail entrepris.

TVA non applicable – Article 293 B du CGI.`,
  });

  const [errors, setErrors] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");

  const businessSectors = [
    "E-commerce", "Restaurant/Hôtellerie", "Santé/Médical", "Éducation/Formation",
    "Immobilier", "Mode/Beauté", "Tech/Startup", "Services Professionnels",
    "Agriculture", "Industrie", "Art/Culture", "Sport/Fitness", "Autre"
  ];

  const calculateItemTotal = (item) => item.quantity * item.unitPrice;
  const calculateItemTax = (item) => (calculateItemTotal(item) * item.taxRate) / 100;
  const calculateSubtotal = () => quoteData.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);
  
  const calculateDiscount = () => {
    const subtotal = calculateSubtotal();
    return quoteData.discountType === "percent" 
      ? (subtotal * quoteData.discount) / 100 
      : quoteData.discount;
  };
  
  const calculateTotalTax = () => quoteData.items.reduce((sum, item) => sum + calculateItemTax(item), 0);
  const calculateTotal = () => calculateSubtotal() - calculateDiscount() + calculateTotalTax();

  const handleInputChange = (field, value) => {
    setQuoteData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleItemChange = (id, field, value) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { ...item, [field]: value } : item
      )
    }));
  };

  const handleServiceSelect = (id, serviceName, servicePrice, serviceUnit) => {
    setQuoteData(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === id ? { 
          ...item, 
          service: serviceName,
          description: serviceName,
          unitPrice: servicePrice,
          unit: serviceUnit
        } : item
      )
    }));
  };

  const addItem = () => {
    const newId = Math.max(...quoteData.items.map(i => i.id), 0) + 1;
    setQuoteData(prev => ({
      ...prev,
      items: [...prev.items, { 
        id: newId, 
        service: "",
        description: "", 
        quantity: 1, 
        unitPrice: 0,
        unit: "unité",
        taxRate: 0 
      }]
    }));
  };

  const removeItem = (id) => {
    if (quoteData.items.length > 1) {
      setQuoteData(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== id)
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 1) {
      if (!quoteData.clientName.trim()) newErrors.clientName = "Le nom est requis";
      if (quoteData.clientType === "entreprise" && !quoteData.clientCompany.trim()) {
        newErrors.clientCompany = "Le nom de l'entreprise est requis";
      }
      if (!quoteData.clientEmail.trim()) {
        newErrors.clientEmail = "L'email est requis";
      } else if (!/\S+@\S+\.\S+/.test(quoteData.clientEmail)) {
        newErrors.clientEmail = "Email invalide";
      }
      if (!quoteData.clientPhone.trim()) newErrors.clientPhone = "Le téléphone est requis";
    }
    
    if (step === 2) {
      const hasValidItems = quoteData.items.some(item => 
        item.description.trim() && item.quantity > 0 && item.unitPrice > 0
      );
      
      if (!hasValidItems) newErrors.items = "Au moins une prestation valide est requise";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const handleDownload = () => {
    if (!showPreview) {
      setShowPreview(true);
      setTimeout(() => {
        window.print();
      }, 500);
    } else {
      window.print();
    }
  };

  const handleSend = () => {
    if (validateStep(1) && validateStep(2)) {
      alert(`✅ Devis envoyé avec succès à ${quoteData.clientEmail}`);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Préremplissage BackOffice depuis la demande
  useEffect(() => {
    if (mode === 'backoffice' && request) {
      setQuoteData(prev => ({
        ...prev,
        clientType: prev.clientType || 'entreprise',
        clientName: request.full_name || prev.clientName,
        clientCompany: prev.clientCompany,
        clientEmail: request.email || prev.clientEmail,
        clientPhone: request.phone || prev.clientPhone,
        projectCategory: request.project_type || prev.projectCategory,
        notes: (request.project_description ? `Demande initiale:\n${request.project_description}\n\n` : '') + (prev.notes || ''),
      }));
    }
  }, [mode, request]);

  const sendBackofficeResponse = async ({ estimation_amount, delivery_time, message, pdf_base64 = null, pdf_name = null }) => {
    if (!request?.id) throw new Error('Demande introuvable');
    // Récupérer l'utilisateur courant pour remplir provider_id
    let currentUserId = null;
    try {
      const userModule = await import('../configurations/services/user.js');
      const currentUser = await userModule.getCurrentUser();
      currentUserId = currentUser?.id || null;
    } catch (_) {
      currentUserId = null;
    }
    if (!currentUserId) {
      throw new Error("Utilisateur non connecté ou introuvable. Veuillez vous reconnecter.");
    }
    const basePayload = {
      request_id: request.id,
      provider_id: currentUserId,
      estimation_amount: Number(estimation_amount) || 0,
      delivery_time: delivery_time || null,
      message: message || null,
      status: 'envoyé',
    };

    if (pdf_base64 && pdf_name) {
      await api.post('/devis/submissions/with-pdf', {
        ...basePayload,
        pdf_base64,
        pdf_name,
        mime_type: 'application/pdf',
      });
    } else {
      await api.post('/devis/submissions', basePayload);
    }

    // Mettre à jour le statut de la demande
    await api.put(`/devis/requests/${request.id}`, { status: 'envoyé' });
    setRespondSuccess(true);
    setTimeout(() => setRespondSuccess(false), 3000);
  };

  const getCategoryColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-700 border-blue-200",
      purple: "bg-purple-100 text-purple-700 border-purple-200",
      green: "bg-green-100 text-green-700 border-green-200",
      pink: "bg-pink-100 text-pink-700 border-pink-200",
      red: "bg-red-100 text-red-700 border-red-200",
      orange: "bg-orange-100 text-orange-700 border-orange-200"
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="fixed top-0 left-0 flex items-center justify-center z-[1000] w-full min-h-screen backdrop-blur-sm bg-black/50 p-4">

      <div className="w-full max-w-5xl overflow-hidden  mx-auto bg-white rounded-2xl shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r flex items-center justify-between from-slate-900 to-slate-800 text-white px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm">
              <Zap className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Devis </h1>
              <p className="text-sm text-slate-300">Digital</p>
            </div>
          </div>
          <button onClick={ closePopup} className="text-sm text-slate-300 hover:text-white transition-colors">
            Fermer
          </button>
        </div>

        <div className="p-6 h-[calc(100vh-200px)] overflow-y-scroll">
          {/* Progress Steps */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: "Client", icon: User },
                { num: 2, label: "Prestations", icon: Package },
                { num: 3, label: "Finalisation", icon: CheckCircle }
              ].map((step, index) => (
                <div key={step.num} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep >= step.num 
                        ? "bg-slate-900 text-white shadow-lg" 
                        : "bg-slate-200 text-slate-600"
                    }`}>
                      {currentStep > step.num ? <CheckCircle className="w-6 h-6" /> : <step.icon className="w-6 h-6" />}
                    </div>
                    <span className={`text-sm mt-2 font-medium ${
                      currentStep >= step.num ? "text-slate-900" : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`h-1 flex-1 mx-2 rounded transition-all ${
                      currentStep > step.num ? "bg-slate-900" : "bg-slate-200"
                    }`}></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Client Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-200 p-8">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                Informations Client
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Type de client
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-6 py-4 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-slate-300">
                    <input
                      type="radio"
                      name="clientType"
                      value="entreprise"
                      checked={quoteData.clientType === "entreprise"}
                      onChange={(e) => handleInputChange("clientType", e.target.value)}
                      className="w-4 h-4 text-slate-900"
                    />
                    <Building className="w-5 h-5 text-slate-700" />
                    <span className="text-sm font-medium text-slate-700">Entreprise</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-6 py-4 rounded-xl hover:shadow-md transition-all border-2 border-transparent hover:border-slate-300">
                    <input
                      type="radio"
                      name="clientType"
                      value="particulier"
                      checked={quoteData.clientType === "particulier"}
                      onChange={(e) => handleInputChange("clientType", e.target.value)}
                      className="w-4 h-4 text-slate-900"
                    />
                    <User className="w-5 h-5 text-slate-700" />
                    <span className="text-sm font-medium text-slate-700">Particulier</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quoteData.clientType === "entreprise" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Nom de l'entreprise <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                        <input
                          type="text"
                          value={quoteData.clientCompany}
                          onChange={(e) => handleInputChange("clientCompany", e.target.value)}
                          placeholder="ACME Corporation"
                          className={`w-full pl-11 pr-4 py-3 border ${
                            errors.clientCompany ? "border-red-500 bg-red-50" : "border-slate-300"
                          } rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`}
                        />
                      </div>
                      {errors.clientCompany && (
                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                          <AlertCircle className="w-4 h-4" /> {errors.clientCompany}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Secteur d'activité
                      </label>
                      <select
                        value={quoteData.clientSector}
                        onChange={(e) => handleInputChange("clientSector", e.target.value)}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="">Sélectionner</option>
                        {businessSectors.map((sector) => (
                          <option key={sector} value={sector}>{sector}</option>
                        ))}
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nom du contact <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={quoteData.clientName}
                      onChange={(e) => handleInputChange("clientName", e.target.value)}
                      placeholder="Jean Dupont"
                      className={`w-full pl-11 pr-4 py-3 border ${
                        errors.clientName ? "border-red-500 bg-red-50" : "border-slate-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900`}
                    />
                  </div>
                  {errors.clientName && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.clientName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="email"
                      value={quoteData.clientEmail}
                      onChange={(e) => handleInputChange("clientEmail", e.target.value)}
                      placeholder="contact@example.com"
                      className={`w-full pl-11 pr-4 py-3 border ${
                        errors.clientEmail ? "border-red-500 bg-red-50" : "border-slate-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900`}
                    />
                  </div>
                  {errors.clientEmail && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.clientEmail}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Téléphone <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="tel"
                      value={quoteData.clientPhone}
                      onChange={(e) => handleInputChange("clientPhone", e.target.value)}
                      placeholder="+221 77 123 45 67"
                      className={`w-full pl-11 pr-4 py-3 border ${
                        errors.clientPhone ? "border-red-500 bg-red-50" : "border-slate-300"
                      } rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900`}
                    />
                  </div>
                  {errors.clientPhone && (
                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" /> {errors.clientPhone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Site web
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <input
                      type="url"
                      value={quoteData.clientWebsite}
                      onChange={(e) => handleInputChange("clientWebsite", e.target.value)}
                      placeholder="www.exemple.com"
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Adresse
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                    <input
                      type="text"
                      value={quoteData.clientAddress}
                      onChange={(e) => handleInputChange("clientAddress", e.target.value)}
                      placeholder="Dakar, Sénégal"
                      className="w-full pl-11 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Ville
                  </label>
                  <input
                    type="text"
                    value={quoteData.clientCity}
                    onChange={(e) => handleInputChange("clientCity", e.target.value)}
                    placeholder="Dakar"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Code postal
                  </label>
                  <input
                    type="text"
                    value={quoteData.clientPostal}
                    onChange={(e) => handleInputChange("clientPostal", e.target.value)}
                    placeholder="12000"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Services */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  Informations du Devis
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">N° Devis</label>
                    <input
                      type="text"
                      value={quoteData.quoteNumber}
                      readOnly
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 font-mono text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Date du devis</label>
                    <input
                      type="date"
                      value={quoteData.quoteDate}
                      onChange={(e) => handleInputChange("quoteDate", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Valable jusqu'au</label>
                    <input
                      type="date"
                      value={quoteData.validityDate}
                      onChange={(e) => handleInputChange("validityDate", e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Délai estimé
                    </label>
                    <input
                      type="text"
                      value={quoteData.projectDeadline}
                      onChange={(e) => handleInputChange("projectDeadline", e.target.value)}
                      placeholder="ex: 2-3 semaines"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Catalogue de services */}
              <div className="bg-gradient-to-br from-indigo-50 to-gray-50 rounded-xl shadow-sm border border-indigo-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Package className="w-6 h-6 text-indigo-600" />
                  Catalogue de Services Digitaux
                </h2>
                <p className="text-sm text-slate-600 mb-6">
                  Sélectionnez une catégorie pour voir les services disponibles
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                  {digitalServices.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.category}
                        onClick={() => setSelectedCategory(
                          selectedCategory === category.category ? "" : category.category
                        )}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedCategory === category.category
                            ? `${getCategoryColor(category.color)} border-current shadow-md scale-105`
                            : "bg-white border-slate-200 hover:border-slate-300 hover:shadow"
                        }`}
                      >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${
                          selectedCategory === category.category ? "" : "text-slate-600"
                        }`} />
                        <p className="text-xs font-medium text-center">{category.category}</p>
                      </button>
                    );
                  })}
                </div>

                {selectedCategory && (
                  <div className="bg-white rounded-lg p-6 border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-900 mb-4">
                      {digitalServices.find(c => c.category === selectedCategory)?.category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {digitalServices
                        .find(c => c.category === selectedCategory)
                        ?.services.map((service) => {
                          const ServiceIcon = service.icon;
                          return (
                            <div
                              key={service.name}
                              className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
                            >
                              <div className="flex items-center gap-3 flex-1">
                                <ServiceIcon className="w-5 h-5 text-indigo-600" />
                                <div>
                                  <p className="text-sm font-medium text-slate-900">{service.name}</p>
                                  <p className="text-xs text-slate-600">{service.unit}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-bold text-indigo-600">
                                  {formatCurrency(service.price)}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-slate-900">Prestations du Devis</h2>
                  <button
                    onClick={addItem}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r flex items-center justify-between from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-90 text-white rounded-lg transition-all shadow-md"
                  >
                    <Plus className="w-5 h-5" />
                    Ajouter une ligne
                  </button>
                </div>

                {errors.items && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span>{errors.items}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {quoteData.items.map((item, index) => (
                    <div key={item.id} className="border-2 border-indigo-100 rounded-xl p-5 bg-gradient-to-br from-white to-indigo-50/30">
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-sm font-bold text-black bg-gray-300 px-3 py-1 rounded-full">
                          Prestation #{index + 1}
                        </span>
                        {quoteData.items.length > 1 && (
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Service prédéfini (optionnel)
                          </label>
                          <select
                            value={item.service}
                            onChange={(e) => {
                              const selectedService = digitalServices
                                .flatMap(cat => cat.services)
                                .find(s => s.name === e.target.value);
                              if (selectedService) {
                                handleServiceSelect(
                                  item.id,
                                  selectedService.name,
                                  selectedService.price,
                                  selectedService.unit
                                );
                              } else {
                                handleItemChange(item.id, "service", "");
                              }
                            }}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">-- Sélectionner un service --</option>
                            {digitalServices.map(category => (
                              <optgroup key={category.category} label={category.category}>
                                {category.services.map(service => (
                                  <option key={service.name} value={service.name}>
                                    {service.name} - {formatCurrency(service.price)} / {service.unit}
                                  </option>
                                ))}
                              </optgroup>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                          <div className="md:col-span-6">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Description détaillée
                            </label>
                            <textarea
                              value={item.description}
                              onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                              placeholder="Décrivez la prestation en détail..."
                              rows={3}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Quantité
                            </label>
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(item.id, "quantity", parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Prix unitaire (FCFA)
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="1000"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(item.id, "unitPrice", parseFloat(e.target.value) || 0)}
                              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>

                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                              Total HT
                            </label>
                            <div className="px-3 py-2 bg-indigo-50 border-2 border-indigo-200 rounded-lg font-bold text-indigo-700 text-center">
                              {formatCurrency(calculateItemTotal(item))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-emerald-600" />
                      Remise Commerciale
                    </h3>
                    <div className="space-y-4">
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors flex-1">
                          <input
                            type="radio"
                            name="discountType"
                            value="percent"
                            checked={quoteData.discountType === "percent"}
                            onChange={(e) => handleInputChange("discountType", e.target.value)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <Percent className="w-5 h-5 text-slate-600" />
                          <span className="text-slate-700 font-medium">Pourcentage</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer bg-slate-50 px-4 py-3 rounded-lg hover:bg-slate-100 transition-colors flex-1">
                          <input
                            type="radio"
                            name="discountType"
                            value="fixed"
                            checked={quoteData.discountType === "fixed"}
                            onChange={(e) => handleInputChange("discountType", e.target.value)}
                            className="w-4 h-4 text-indigo-600"
                          />
                          <span className="text-slate-700 font-bold">FCFA</span>
                          <span className="text-slate-700 font-medium">Montant fixe</span>
                        </label>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={quoteData.discount}
                          onChange={(e) => handleInputChange("discount", parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 font-semibold">
                          {quoteData.discountType === "percent" ? "%" : "FCFA"}
                        </span>
                      </div>
                      <div className="p-4 bg-emerald-50 border-2 border-emerald-200 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-emerald-700 font-medium">Montant de la remise :</span>
                          <span className="font-bold text-emerald-700 text-lg">- {formatCurrency(calculateDiscount())}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-indigo-600" />
                      Récapitulatif des Montants
                    </h3>
                    <div className="space-y-3 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 rounded-xl border-2 border-indigo-100">
                      <div className="flex justify-between items-center py-2">
                        <span className="text-slate-700">Sous-total HT :</span>
                        <span className="font-semibold text-slate-900 text-lg">{formatCurrency(calculateSubtotal())}</span>
                      </div>
                      {quoteData.discount > 0 && (
                        <div className="flex justify-between items-center py-2 text-emerald-600">
                          <span className="font-medium">Remise :</span>
                          <span className="font-bold text-lg">- {formatCurrency(calculateDiscount())}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center py-3 border-t-2 border-indigo-200">
                        <span className="text-xl font-bold text-black">Total Net :</span>
                        <span className="text-3xl font-bold text-black">
                          {formatCurrency(calculateTotal())}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 text-center mt-2">
                        TVA non applicable - Régime de franchise
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  ← Précédent
                </button>
                <button
                  onClick={nextStep}
                  className="px-8 py-3 bg-black hover:bg-slate-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Summary */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  Conditions & Notes
                </h2>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <span className="flex items-center gap-2">
                          <Euro className="w-4 h-4" />
                          Modalités de paiement
                        </span>
                      </label>
                      <input
                        type="text"
                        value={quoteData.paymentTerms}
                        onChange={(e) => handleInputChange("paymentTerms", e.target.value)}
                        placeholder="50% à la commande, 50% à la livraison"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Conditions de livraison
                        </span>
                      </label>
                      <input
                        type="text"
                        value={quoteData.deliveryTerms}
                        onChange={(e) => handleInputChange("deliveryTerms", e.target.value)}
                        placeholder="Livraison sous 2-3 semaines"
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Notes personnalisées pour le client
                    </label>
                    <textarea
                      value={quoteData.notes}
                      onChange={(e) => handleInputChange("notes", e.target.value)}
                      placeholder="Ajoutez des notes spécifiques pour ce projet..."
                      rows={4}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Conditions générales de vente
                    </label>
                    <textarea
                      value={quoteData.termsAndConditions}
                      onChange={(e) => handleInputChange("termsAndConditions", e.target.value)}
                      rows={10}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-100 rounded-xl shadow-sm border-2 border-gray-300 p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Eye className="w-6 h-6 text-black" />
                  Récapitulatif Final
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-black" />
                      Informations client
                    </h3>
                    <div className="space-y-2 text-sm">
                      {quoteData.clientType === "entreprise" && quoteData.clientCompany && (
                        <div className="flex items-start gap-2">
                          <Building className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700 font-semibold">{quoteData.clientCompany}</span>
                        </div>
                      )}
                      {quoteData.clientSector && (
                        <div className="flex items-start gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-600">Secteur: {quoteData.clientSector}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2">
                        <User className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{quoteData.clientName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Mail className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{quoteData.clientEmail}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{quoteData.clientPhone}</span>
                      </div>
                      {quoteData.clientWebsite && (
                        <div className="flex items-start gap-2">
                          <Globe className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">{quoteData.clientWebsite}</span>
                        </div>
                      )}
                      {quoteData.clientAddress && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-slate-600 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-700">
                            {quoteData.clientAddress}
                            {quoteData.clientCity && `, ${quoteData.clientCity}`}
                            {quoteData.clientPostal && ` ${quoteData.clientPostal}`}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-black" />
                      Détails du devis
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">N° Devis :</span>
                        <span className="font-mono font-bold text-red-600">{quoteData.quoteNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Date :</span>
                        <span className="text-slate-900">{new Date(quoteData.quoteDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Valable jusqu'au :</span>
                        <span className="text-slate-900">{new Date(quoteData.validityDate).toLocaleDateString('fr-FR')}</span>
                      </div>
                      {quoteData.projectDeadline && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Délai estimé :</span>
                          <span className="text-slate-900">{quoteData.projectDeadline}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-slate-600">Nombre de prestations :</span>
                        <span className="text-slate-900 font-semibold">{quoteData.items.length}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-sm mb-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Prestations</h3>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold">Description</th>
                          <th className="px-4 py-3 text-center text-sm font-semibold">Qté</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">P.U.</th>
                          <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quoteData.items.map((item, index) => (
                          <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                            <td className="px-4 py-3 text-sm text-slate-700">
                              {item.description || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-slate-700">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right text-slate-700">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold text-slate-900">
                              {formatCurrency(calculateItemTotal(item))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="w-full md:w-1/2 bg-white rounded-lg p-6 shadow-sm space-y-2">
                    <div className="flex justify-between py-2">
                      <span className="text-slate-700">Sous-total :</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(calculateSubtotal())}</span>
                    </div>
                    {quoteData.discount > 0 && (
                      <div className="flex justify-between py-2 text-emerald-600">
                        <span>Remise ({quoteData.discountType === "percent" ? `${quoteData.discount}%` : "fixe"}) :</span>
                        <span className="font-semibold">- {formatCurrency(calculateDiscount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-4 border-t-2 border-slate-200">
                      <span className="text-xl font-bold text-black">TOTAL NET :</span>
                      <span className="text-3xl font-bold text-red-600">{formatCurrency(calculateTotal())}</span>
                    </div>
                    <div className="text-xs text-slate-500 text-center pt-2">
                      Montant exprimé en Francs CFA (FCFA)
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-black" />
                  Actions Finales
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    <Save className="w-5 h-5" />
                    {isSaving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    <Eye className="w-5 h-5" />
                    Aperçu PDF
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger
                  </button>
                  <button
                    onClick={handleSend}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-lg transition-colors shadow-md hover:shadow-lg"
                  >
                    <Send className="w-5 h-5" />
                    Envoyer
                  </button>
                </div>
                
                {saveSuccess && (
                  <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center gap-2 text-green-700 animate-pulse">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">✅ Devis sauvegardé avec succès !</span>
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold rounded-lg transition-colors"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-8 py-3 bg-black hover:bg-slate-700 text-white font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl"
                >
                  Nouveau Devis
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
  <QuotePreview
    quoteData={quoteData}
    request={request}
    mode={mode}
    onClose={() => setShowPreview(false)}
    onSend={handleSend}
    onDownload={handleDownload}
    onRespond={mode === 'backoffice' ? sendBackofficeResponse : undefined}
  />
)}

      {respondSuccess && (
        <div className="fixed bottom-6 right-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg shadow flex items-center gap-2 text-green-700 z-1000">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">
            {`Devis envoyé avec succès à ${(request?.email || request?.client_email || request?.contact?.email || 'le client')}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default QuoteComponent;