import React, { useState, useEffect } from 'react';
import promosApi from '../configurations/services/promos.js';
import { list } from '../configurations/services/appSettings.js';
import { 
  Clock, 
  Check, 
  ArrowRight, 
  ChevronRight,
  Lock,
  Zap,
  Target,
  BarChart3,
  Globe,
  Server,
  Shield,
  Headphones,
  X
} from 'lucide-react';

function Promo() {

  const [_selectedPlan, setSelectedPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('annual'); // annual or monthly
  const [showPromoSection, setShowPromoSection] = useState(true);

  // Contenus dynamiques chargés depuis l'API (fallback sur le statique ci-dessous).
  const [plans, setPlans] = useState(null);
  const [comparisonData, setComparisonData] = useState(null);
  const [enterpriseFeatures, setEnterpriseFeatures] = useState(null);
  const [allPromos, setAllPromos] = useState([]);
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState(null);
  const [nowTick, setNowTick] = useState(Date.now());
  // Paramètres d'affichage des prix
  const [pricesInputCurrency, setPricesInputCurrency] = useState('XOF'); // 'XOF' ou 'EUR'
  const [fxEurXof, setFxEurXof] = useState(655.957);

  // Fallbacks statiques
  const staticPlans = [
    {
      id: 'starter',
      name: 'Starter',
      tagline: 'Pour les startups et projets pilotes',
      monthlyPrice: 899,
      annualPrice: 8990,
      annualMonthly: 749,
      setupFee: 500,
      savings: 1288,
      color: 'from-cyan-600 to-blue-600',
      features: [
        { text: "Site web jusqu'à 10 pages", included: true },
        { text: 'Design moderne et responsive', included: true },
        { text: 'Optimisation SEO de base', included: true },
        { text: 'Hébergement sécurisé (SSL)', included: true },
        { text: 'Tableau de bord analytics', included: true },
        { text: 'Support email (48h)', included: true },
        { text: 'Mises à jour sécurité', included: true },
        { text: 'Intégration CRM/ERP', included: false },
        { text: 'Support téléphonique prioritaire', included: false }
      ],
      metrics: { pages: '10', users: '5K/mois', storage: '10 GB' }
    },
    {
      id: 'business',
      name: 'Business',
      tagline: 'Solution complète pour PME/ETI',
      monthlyPrice: 1990,
      annualPrice: 19900,
      annualMonthly: 1658,
      setupFee: 1000,
      savings: 3880,
      color: 'from-violet-600 to-purple-600',
      recommended: true,
      features: [
        { text: 'Site web illimité (pages)', included: true },
        { text: 'Design premium sur-mesure', included: true },
        { text: 'SEO avancé + campagnes Google Ads', included: true },
        { text: 'Hébergement haute performance', included: true },
        { text: 'Dashboard BI et reporting', included: true },
        { text: 'Espace client sécurisé', included: true },
        { text: 'Intégration CRM/ERP', included: true },
        { text: 'Support téléphonique prioritaire', included: true },
        { text: 'Maintenance et mises à jour', included: true }
      ],
      metrics: { pages: 'Illimité', users: '50K/mois', storage: '100 GB' }
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      tagline: 'Infrastructure sur-mesure',
      monthlyPrice: null,
      annualPrice: null,
      setupFee: null,
      color: 'from-slate-700 to-slate-900',
      custom: true,
      features: [
        { text: 'Architecture cloud évolutive', included: true },
        { text: 'Design système et UX research', included: true },
        { text: 'SEO international multi-langues', included: true },
        { text: 'Infrastructure dédiée (bare metal)', included: true },
        { text: 'BI avancé avec IA prédictive', included: true },
        { text: 'API & webhooks personnalisés', included: true },
        { text: 'Intégrations entreprise complètes', included: true },
        { text: 'Account manager dédié 24/7', included: true },
        { text: 'SLA 99.99% avec pénalités', included: true }
      ],
      metrics: { pages: 'Illimité', users: 'Illimité', storage: 'Personnalisé' }
    }
  ];

  const staticComparisonData = [];

  const staticEnterpriseFeatures = [
    { icon: Globe, title: 'Multi-sites', desc: 'Gestion centralisée de plusieurs sites' },
    { icon: Server, title: 'Cloud privé', desc: 'Infrastructure dédiée et sécurisée' },
    { icon: Lock, title: 'Conformité', desc: 'RGPD, ISO27001, HDS' },
    { icon: BarChart3, title: 'Analytics', desc: 'Tableaux de bord personnalisés' }
  ];
  // Le décompte est désormais calculé dynamiquement à partir de nowTick


  useEffect(() => {
    const loadActivePromo = async () => {
      try {
        const active = await promosApi.getActive();
        // billingCycle par défaut
        if (active?.billing_cycle_default) {
          setBillingCycle(String(active.billing_cycle_default));
        }

        // Timer actif: géré via computeTimeLeft(p.timer_end_at) et nowTick

        // Charger JSON
        const plansJson = active?.plans_json;
        const comparisonJson = active?.comparison_json;
        const enterpriseJson = active?.enterprise_features_json;
        setPlans(Array.isArray(plansJson) ? plansJson : (typeof plansJson === 'string' ? JSON.parse(plansJson) : null));
        setComparisonData(Array.isArray(comparisonJson) ? comparisonJson : (typeof comparisonJson === 'string' ? JSON.parse(comparisonJson) : null));
        setEnterpriseFeatures(Array.isArray(enterpriseJson) ? enterpriseJson : (typeof enterpriseJson === 'string' ? JSON.parse(enterpriseJson) : null));
      } catch {
        // Aucun actif => rester sur le contenu statique
        setPlans(null);
        setComparisonData(null);
        setEnterpriseFeatures(null);
      }
    };
    loadActivePromo();
  }, []);

  // Charger l’intégralité des promos
  useEffect(() => {
    const loadAllPromos = async () => {
      setLoadingAll(true);
      setErrorAll(null);
      try {
        const items = await promosApi.list();
        setAllPromos(Array.isArray(items) ? items : []);
      } catch {
        setErrorAll('Impossible de charger toutes les promos');
        setAllPromos([]);
      } finally {
        setLoadingAll(false);
      }
    };
    loadAllPromos();
  }, []);

  // Tick global pour timers multiples
  useEffect(() => {
    const iv = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(iv);
  }, []);

  // Charger app_settings et contrôler la visibilité de la section promo
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const settingsList = await list();
        const item = Array.isArray(settingsList)
          ? settingsList.find(s => String(s.setting_key).toLowerCase() === 'section_promo')
          : null;
        let visible = true;
        if (item && String(item.setting_type) === 'boolean') {
          const raw = item.setting_value;
          visible = typeof raw === 'boolean' ? raw : String(raw).toLowerCase() === 'true';
        }
        setShowPromoSection(visible);

        // Charger configuration de currency et taux FX si disponibles
        const currencySetting = Array.isArray(settingsList)
          ? settingsList.find(s => String(s.setting_key).toUpperCase() === 'PROMO_PRICES_INPUT_CURRENCY')
          : null;
        const fxSetting = Array.isArray(settingsList)
          ? settingsList.find(s => String(s.setting_key).toUpperCase() === 'FX_EUR_XOF')
          : null;
        const currencyValue = currencySetting ? String(currencySetting.setting_value).toUpperCase() : 'XOF';
        setPricesInputCurrency(currencyValue === 'EUR' ? 'EUR' : 'XOF');
        const fxValue = fxSetting ? Number(fxSetting.setting_value) : 655.957;
        setFxEurXof(Number.isFinite(fxValue) && fxValue > 0 ? fxValue : 655.957);
      } catch {
        // En cas d'erreur, on laisse la section visible
        setShowPromoSection(true);
      }
    };
    loadSettings();
  }, []);

  const effectivePlans = Array.isArray(plans) ? plans : staticPlans;
  const effectiveComparison = Array.isArray(comparisonData) ? comparisonData : staticComparisonData;
  const _effectiveEnterprise = Array.isArray(enterpriseFeatures) ? enterpriseFeatures : staticEnterpriseFeatures;

  const calculatePrice = (plan) => {
    if (plan.custom) return null;
    if (billingCycle === 'annual') {
      // Supporte annualMonthly ou dérive de priceYearly
      if (Number.isFinite(Number(plan.annualMonthly))) {
        const base = Number(plan.annualMonthly);
        return pricesInputCurrency === 'EUR' ? Math.round(base * fxEurXof) : base;
      }
      if (Number.isFinite(Number(plan.priceYearly))) {
        const base = Math.round(Number(plan.priceYearly) / 12);
        return pricesInputCurrency === 'EUR' ? Math.round(base * fxEurXof) : base;
      }
      return null;
    }
    // Mensuel: monthlyPrice ou priceMonthly
    if (Number.isFinite(Number(plan.monthlyPrice))) {
      const base = Number(plan.monthlyPrice);
      return pricesInputCurrency === 'EUR' ? Math.round(base * fxEurXof) : base;
    }
    if (Number.isFinite(Number(plan.priceMonthly))) {
      const base = Number(plan.priceMonthly);
      return pricesInputCurrency === 'EUR' ? Math.round(base * fxEurXof) : base;
    }
    return null;
  };

  const getMetric = (plan, key, fallback = '-') => {
    const m = plan?.metrics?.[key];
    if (m != null) return m;
    // Essaye clé à plat (ex: plan.pages)
    const flat = plan?.[key];
    return flat != null ? flat : fallback;
  };

  // Parsing robuste du timestamp (ISO, "YYYY-MM-DD HH:mm:ss", epoch sec/ms)
  const parseEndAt = (endAt) => {
    if (!endAt) return null;
    if (typeof endAt === 'number') {
      return endAt > 1e12 ? endAt : endAt * 1000;
    }
    if (typeof endAt === 'string') {
      const s = endAt.trim();
      if (!s) return null;
      let d = new Date(s);
      if (isNaN(d.getTime())) {
        const s2 = s.replace(' ', 'T');
        d = new Date(s2);
        if (isNaN(d.getTime())) {
          const m = s.match(/^(\d{4}-\d{2}-\d{2})(?:\s+(\d{2}:\d{2}:\d{2}))?$/);
          if (m) {
            const iso = m[2] ? `${m[1]}T${m[2]}` : `${m[1]}T00:00:00`;
            d = new Date(iso);
          }
        }
      }
      if (isNaN(d.getTime())) return null;
      return d.getTime();
    }
    return null;
  };

  const computeTimeLeft = (endAt) => {
    const endTs = parseEndAt(endAt);
    if (endTs == null) return null;
    const diff = Math.max(0, endTs - nowTick);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds, expired: diff === 0 };
  };


  // Masquer complètement la section promo si le paramètre l'indique
  if (showPromoSection === false) {
    return null;
  }

  return (
    <section className="pt-22 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loadingAll && (
          <div className="text-center mb-8">
            <span className="text-slate-500 text-sm">Chargement des promos…</span>
          </div>
        )}
        {errorAll && (
          <div className="text-center mb-8">
            <span className="text-red-600 text-sm">{String(errorAll)}</span>
          </div>
        )}
        {!loadingAll && !errorAll && allPromos.length === 0 && (
          <div className="text-center mb-8">
            <span className="text-slate-500 text-sm">Aucune promo disponible</span>
          </div>
        )}
        
        {allPromos.map((p) => {
          const tl = computeTimeLeft(p.timer_end_at);
          return (
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-4 bg-white border border-slate-200 rounded-full px-6 py-3 shadow-sm mb-8">
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">Offre valable encore</span>
            </div>
            <div className="flex items-center gap-2 font-mono text-sm">
              {tl ? (
                tl.expired ? (
                  <span className="text-red-600 font-semibold">Expiré</span>
                ) : (
                  <>
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-md font-bold">
                      {String(tl.days).padStart(2, '0')}
                    </div>
                    <span className="text-slate-400">:</span>
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-md font-bold">
                      {String(tl.hours).padStart(2, '0')}
                    </div>
                    <span className="text-slate-400">:</span>
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-md font-bold">
                      {String(tl.minutes).padStart(2, '0')}
                    </div>
                    <span className="text-slate-400">:</span>
                    <div className="bg-slate-900 text-white px-3 py-1.5 rounded-md font-bold">
                      {String(tl.seconds).padStart(2, '0')}
                    </div>
                  </>
                )
              ) : (
                <span className="text-slate-500">-</span>
              )}
            </div>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold text-slate-900 mb-6 tracking-tight">
            {p.title}
          </h2>
          
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            {p.subtitle}
          </p>

          <img src={p.img_url} className='w-full rounded-xl h-100 mb-5' alt={p.title} />

          {/* Toggle de facturation */}
          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingCycle('annual')}
              className={`px-6 py-2.5 rounded-md text-sm font-semibold transition-all relative ${
                billingCycle === 'annual'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Annuel
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                -17%
              </span>
            </button>
          </div>
        </div>
        );
        })}

        {/* Grille des plans */}
        <div className="grid lg:grid-cols-3 gap-6 mb-20">
          {effectivePlans.map((plan) => {
            const price = calculatePrice(plan);
            const recommended = !!(plan?.recommended || plan?.mostPopular);
            const color = plan?.color || 'from-violet-600 to-purple-600';
            return (
              <div 
                key={plan.id}
                className={`relative bg-white rounded-2xl transition-all duration-300 ${
                  recommended 
                    ? 'border-2 border-violet-600 shadow-2xl lg:scale-105 z-10' 
                    : 'border border-slate-200 shadow-lg hover:shadow-xl'
                }`}
              >
                {/* Badge recommandé */}
                {recommended && (
                  <div className={`absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r ${color} text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg`}>
                    Le plus populaire
                  </div>
                )}

                <div className="p-8">
                  {/* En-tête du plan */}
                  <div className={`inline-flex px-4 py-1.5 rounded-full text-xs font-bold mb-4 bg-gradient-to-r ${color} text-white`}>
                    {plan.name}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">
                    {plan.tagline}
                  </h3>

                  {/* Prix */}
                  <div className="mb-8 pb-8 border-b border-slate-200">
                    {plan.custom ? (
                      <>
                        <div className="text-4xl font-bold text-slate-900 mb-2">
                          Sur mesure
                        </div>
                        <p className="text-sm text-slate-600">
                          Tarification personnalisée selon vos besoins
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="text-3xl font-bold text-slate-900">
          {Math.round(Number(price || 0)).toLocaleString('fr-FR')} FCFA
                          </span>
                          <span className="text-slate-600">/mois</span>
                        </div>
                        {billingCycle === 'annual' && (
                          <div className="space-y-1">
                            <p className="text-sm text-slate-600">
          {Math.round(Number(pricesInputCurrency === 'EUR' ? Number(plan.annualPrice || 0) * fxEurXof : Number(plan.annualPrice || 0))).toLocaleString('fr-FR')} FCFA facturé annuellement
                            </p>
                            <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-semibold">
                              <Zap className="w-3 h-3" />
          Économie de {Math.round(Number(pricesInputCurrency === 'EUR' ? Number(plan.savings || 0) * fxEurXof : Number(plan.savings || 0))).toLocaleString('fr-FR')} FCFA/an
                            </div>
                          </div>
                        )}
                        {plan.setupFee && (
                          <p className="text-xs text-slate-500 mt-2">
          + Frais de mise en service : {Math.round(Number(pricesInputCurrency === 'EUR' ? Number(plan.setupFee || 0) * fxEurXof : Number(plan.setupFee || 0))).toLocaleString('fr-FR')} FCFA (unique)
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* Métriques clés (tolérantes) */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-900">{getMetric(plan, 'pages')}</div>
                      <div className="text-xs text-slate-500">Pages</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-900">{getMetric(plan, 'users')}</div>
                      <div className="text-xs text-slate-500">Visites</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-slate-900">{getMetric(plan, 'storage')}</div>
                      <div className="text-xs text-slate-500">Stockage</div>
                    </div>
                  </div>

                  {/* Features (accepte tableau de chaînes ou d'objets) */}
                  <ul className="space-y-3 mb-8">
                    {(Array.isArray(plan.features) ? plan.features : []).map((feature, idx) => {
                      const isString = typeof feature === 'string';
                      const included = isString ? true : !!feature?.included;
                      const text = isString ? feature : (feature?.text ?? '');
                      return (
                        <li key={idx} className="flex items-start gap-3">
                          {included ? (
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                          ) : (
                            <X className="w-5 h-5 text-slate-300 flex-shrink-0 mt-0.5" />
                          )}
                          <span className={`text-sm ${included ? 'text-slate-700' : 'text-slate-400'}`}>{text}</span>
                        </li>
                      );
                    })}
                  </ul>

                  {/* CTA */}
                  {plan.custom ? (
                    <button 
                      onClick={() => setSelectedPlan(plan)}
                      className="w-full py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all inline-flex items-center justify-center gap-2"
                    >
                      Demander un devis
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  ) : (
                    <button className={`w-full py-4 font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 ${
                      recommended
                        ? `bg-gradient-to-r ${color} text-white hover:opacity-90 shadow-lg`
                        : 'bg-slate-900 text-white hover:bg-slate-800'
                    }`}>
                      Commencer maintenant
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Tableau de comparaison */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden mb-20">
          <div className="bg-slate-50 px-8 py-6 border-b border-slate-200">
            <h3 className="text-2xl font-bold text-slate-900">Comparaison détaillée</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="px-8 py-4 text-left text-sm font-semibold text-slate-900">Fonctionnalité</th>
                  <th className="px-8 py-4 text-center text-sm font-semibold text-slate-900">Starter</th>
                  <th className="px-8 py-4 text-center text-sm font-semibold text-slate-900 bg-violet-50">Business</th>
                  <th className="px-8 py-4 text-center text-sm font-semibold text-slate-900">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {effectiveComparison.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 last:border-0">
                    <td className="px-8 py-4 text-sm text-slate-700 font-medium">{row.feature ?? row.label ?? ''}</td>
                    <td className="px-8 py-4 text-center text-sm text-slate-600">{row.starter ?? row.free ?? ''}</td>
                    <td className="px-8 py-4 text-center text-sm text-slate-900 font-semibold bg-violet-50">{row.business ?? row.pro ?? ''}</td>
                    <td className="px-8 py-4 text-center text-sm text-slate-600">{row.enterprise ?? row.enterprise ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    </section>
  );
}

export default Promo;
export { Promo };