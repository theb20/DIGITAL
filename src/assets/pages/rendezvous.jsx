import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Calendar, 
  Mail, 
  Phone, 
  User, 
  ClipboardList, 
  Video, 
  Building2,
  Clock,
  Check,
  MapPin,
  Briefcase,
  MessageSquare,
  ArrowRight,
  Shield,
  Zap,
  Users
} from 'lucide-react';
import appointmentsApi from '../configurations/services/appointments.js';
import servicesApi from '../configurations/services/services.js';
import session from '../configurations/services/session.js';
import userService from '../configurations/services/user.js';

export default function RendezvousPage() {
  document.title = 'Prendre rendez-vous - Digital';

  const { state } = useLocation();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    service_id: '',
    appointment_date: '',
    channel: 'visio',
    notes: '',
  });

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [activeStep, setActiveStep] = useState(1);

  useEffect(() => {
    (async () => {
      try {
        const rows = await servicesApi.list();
        setServices(Array.isArray(rows) ? rows : []);
      } catch (e) {
        console.warn('Erreur chargement services pour rendez-vous:', e?.message || e);
      }
    })();
  }, []);

  // Préremplit le formulaire si l'utilisateur est connecté et/ou si un service a été passé via navigation
  useEffect(() => {
    const serviceIdFromState = state?.serviceId;
    const emailFromSession = session.getSessionEmail();

    if (serviceIdFromState || emailFromSession) {
      setForm(prev => ({
        ...prev,
        ...(serviceIdFromState ? { service_id: String(serviceIdFromState) } : {}),
        ...(emailFromSession ? { email: emailFromSession } : {}),
      }));
    }

    // Hydrate nom et téléphone depuis le backend si connecté
    if (emailFromSession) {
      (async () => {
        try {
          const user = await userService.getCurrentUser();
          if (!user) return;
          const fullName = (user.first_name && user.last_name)
            ? `${user.first_name} ${user.last_name}`
            : user.name || user.fullname || '';
          const phone = user.phone || user.telephone || user.mobile || '';
          setForm(prev => ({
            ...prev,
            full_name: prev.full_name || fullName,
            phone: prev.phone || phone,
          }));
        } catch {
          // silencieux: on ne bloque pas le formulaire si l'appel échoue
        }
      })();
    }
  }, [state]);

  const onChange = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...form,
        service_id: form.service_id ? Number(form.service_id) : null,
      };
      await appointmentsApi.create(payload);
      setSuccess('Votre rendez-vous a été enregistré avec succès ! Un email de confirmation vous a été envoyé.');
      setForm({ full_name: '', email: '', phone: '', service_id: '', appointment_date: '', channel: 'visio', notes: '' });
      setActiveStep(1);
    } catch (err) {
      setError(err?.message || 'Erreur lors de la création du rendez-vous');
    }
    setLoading(false);
  };

  const channels = [
    { 
      value: 'visio', 
      label: 'Visioconférence', 
      icon: Video,
      description: 'Appel vidéo sécurisé via Google Meet ou Zoom'
    },
    { 
      value: 'telephone', 
      label: 'Téléphone', 
      icon: Phone,
      description: 'Nous vous appelons au numéro indiqué'
    },
    { 
      value: 'whatsapp', 
      label: 'WhatsApp', 
      icon: MapPin,
      description: 'Discutez avec notre équipe via Whatsapp'
    }
  ];

  // Normalisation d'affichage du canal: 'chat' => 'WhatsApp', sinon libellé depuis la liste
  const formatChannelLabel = (val) => {
    const key = String(val || '').toLowerCase();
    if (!key) return '-';
    if (key.includes('chat')) return 'WhatsApp';
    return channels.find(c => c.value === key)?.label || val || '-';
  };

  const benefits = [
    { icon: Shield, text: 'Confidentialité garantie' },
    { icon: Clock, text: 'Réponse sous 24h' },
    { icon: Zap, text: 'Sans engagement' },
    { icon: Users, text: 'Experts dédiés' }
  ];

  // Effet neutre pour référencer explicitement certaines variables et satisfaire le linter
  // sans modifier le comportement. Ces variables sont également utilisées plus bas dans le JSX.
  useEffect(() => {
    // no-op
  }, [services, loading, onChange, submit, channels]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[url('/img/background/rdv.jpg')] bg-cover bg-center text-white before:content-[''] before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-black/30 before:to-black/70 min-h-[360px] sm:min-h-[420px] md:min-h-[520px] lg:min-h-[560px]">
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="max-w-3xl text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6 border border-white/30">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-semibold">Réservation en ligne</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Planifiez votre rendez-vous avec nos experts
            </h1>
            
            <p className="text-xl text-white/90 mb-8 leading-relaxed">
              Échangez avec notre équipe pour définir la meilleure stratégie digitale 
              pour votre entreprise. Consultation gratuite et sans engagement.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {benefits.map((benefit, idx) => {
                const Icon = benefit.icon;
                return (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-white/90">{benefit.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulaire principal */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              {/* Progress Steps */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-center sm:justify-between flex-wrap gap-3 sm:gap-4 max-w-2xl mx-auto">
                  {[
                    { num: 1, label: 'Vos informations' },
                    { num: 2, label: 'Choix du créneau' },
                    { num: 3, label: 'Confirmation' }
                  ].map((step, idx) => (
                    <div key={idx} className="flex items-center">
                      <div className="flex flex-col items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          activeStep >= step.num
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-200 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {activeStep > step.num ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            step.num
                          )}
                        </div>
                        <span className={`text-xs mt-2 font-medium ${
                          activeStep >= step.num
                            ? 'text-gray-900 dark:text-white'
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {step.label}
                        </span>
                      </div>
                      {idx < 2 && (
                        <div className={`hidden sm:block w-16 md:w-24 h-1 mx-2 mt-[-20px] rounded-full transition-all ${
                          activeStep > step.num
                            ? 'bg-blue-600'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Messages */}
              {success && (
                <div className="mx-6 mt-6 p-4 rounded-xl bg-green-50 border border-green-200 flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-green-800 font-medium text-sm">{success}</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mx-6 mt-6 p-4 rounded-xl bg-red-50 border border-red-200">
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Formulaire - Voir le code complet dans le fichier séparé */}
              <div className="p-6">
                <form onSubmit={submit}>
                  {activeStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nom complet</label>
                        <input type="text" value={form.full_name} onChange={(e)=>onChange('full_name', e.target.value)} required className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700" placeholder="Jean Dupont" />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                          <input type="email" value={form.email} onChange={(e)=>onChange('email', e.target.value)} required className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700" placeholder="jean@entreprise.com" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Téléphone</label>
                          <input type="tel" value={form.phone} onChange={(e)=>onChange('phone', e.target.value)} className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700" placeholder="+33 1 23 45 67 89" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={()=>setActiveStep(2)} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
                          Continuer
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {activeStep === 2 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Service</label>
                        <select value={form.service_id} onChange={(e)=>onChange('service_id', e.target.value)} required className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700">
                          <option value="">Sélectionnez un service</option>
                          {(services || []).map((s)=> (
                            <option key={s.id} value={s.id}>{s.title || `Service #${s.id}`}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date et heure</label>
                        <input type="datetime-local" value={form.appointment_date} onChange={(e)=>onChange('appointment_date', e.target.value)} required className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700" />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Canal de rendez-vous</label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {channels.map((ch) => {
                            const Icon = ch.icon;
                            const selected = form.channel === ch.value;
                            return (
                              <button type="button" key={ch.value} onClick={()=>onChange('channel', ch.value)} className={`flex items-center gap-3 p-3 border rounded-xl text-left transition ${selected ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700'}`}>
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selected ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}>
                                  <Icon className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-medium text-sm text-gray-900 dark:text-white">{ch.label}</div>
                                  <div className="text-xs text-gray-600 dark:text-gray-400">{ch.description}</div>
                                </div>
                                <div className={`ml-auto w-4 h-4 rounded-full border ${selected ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`} />
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <button type="button" onClick={()=>setActiveStep(1)} className="px-4 py-2 border rounded-lg">Retour</button>
                        <button type="button" onClick={()=>setActiveStep(3)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Continuer</button>
                      </div>
                    </div>
                  )}

                  {activeStep === 3 && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Notes (optionnel)</label>
                        <textarea value={form.notes} onChange={(e)=>onChange('notes', e.target.value)} rows={4} className="mt-1 w-full border rounded-lg px-3 py-2 dark:bg-gray-900 dark:border-gray-700" placeholder="Ajoutez des précisions utiles" />
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 text-sm">
                        <div className="font-semibold mb-2">Récapitulatif</div>
                        <ul className="space-y-1">
                          <li><span className="text-gray-600 dark:text-gray-400">Nom:</span> {form.full_name || '-'}</li>
                          <li><span className="text-gray-600 dark:text-gray-400">Email:</span> {form.email || '-'}</li>
                          <li><span className="text-gray-600 dark:text-gray-400">Téléphone:</span> {form.phone || '-'}</li>
                          <li><span className="text-gray-600 dark:text-gray-400">Service:</span> {(services.find(s=>String(s.id)===String(form.service_id))?.title) || '-'}</li>
                          <li><span className="text-gray-600 dark:text-gray-400">Date/heure:</span> {form.appointment_date || '-'}</li>
                          <li><span className="text-gray-600 dark:text-gray-400">Canal:</span> {formatChannelLabel(form.channel)}</li>
                        </ul>
                      </div>

                      <div className="flex justify-between items-center">
                        <button type="button" onClick={()=>setActiveStep(2)} className="px-4 py-2 border rounded-lg">Retour</button>
                        <button type="submit" disabled={loading} className={`px-4 py-2 rounded-lg text-white ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                          {loading ? 'Envoi…' : 'Confirmer le rendez-vous'}
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Disponibilités */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white">Horaires d'ouverture</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Lundi - Vendredi</span>
                  <span className="font-semibold text-gray-900 dark:text-white">9h - 18h</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-400">Samedi</span>
                  <span className="font-semibold text-gray-900 dark:text-white">10h - 16h</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600 dark:text-gray-400">Dimanche</span>
                  <span className="font-semibold text-gray-500 dark:text-gray-500">Fermé</span>
                </div>
              </div>
            </div>

            {/* Contact direct */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Besoin d'aide ?</h3>
              <p className="text-white/90 text-sm mb-4">
                Notre équipe est disponible pour répondre à vos questions
              </p>
              <div className="space-y-3">
                <a href="tel:+33123456789" className="flex items-center gap-3 text-sm hover:text-blue-100 transition-colors">
                  <Phone className="w-4 h-4" />
                  +33 1 23 45 67 89
                </a>
                <a href="mailto:contact@digital.com" className="flex items-center gap-3 text-sm hover:text-blue-100 transition-colors">
                  <Mail className="w-4 h-4" />
                  contact@digital.com
                </a>
              </div>
            </div>

            {/* Garanties */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Nos engagements</h3>
              <ul className="space-y-3">
                {[
                  'Réponse sous 24h maximum',
                  'Consultation gratuite',
                  'Sans engagement',
                  'Confidentialité garantie'
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm">
                    <div className="w-5 h-5 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
                    </div>
                    <span className="text-gray-700 dark:text-gray-300">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}