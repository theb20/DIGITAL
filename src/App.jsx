import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { PopupProvider } from "./assets/configurations/PopupContext.jsx";
import { GoogleOAuthProvider } from '@react-oauth/google';

// Layout principal
import Layout from "./assets/components/layout.jsx";

// Composants
import RequireAuth from "./assets/configurations/RequireAuth.jsx";
import RequireAuth_admin from "./assets/configurations/RequireAuth_admin.jsx";

// Pages
import Sign from "./assets/pages/sign.jsx";
import Contact from "./assets/pages/contact.jsx";
import Card from "./assets/pages/card.jsx";
import Home from "./assets/pages/home.jsx";
import Profil from "./assets/pages/profil.jsx"
import Privacy from "./assets/pages/privacy.jsx"
import Blog from "./assets/pages/blog.jsx"
import Services from "./assets/pages/services.jsx"
import Portfolio from "./assets/pages/portfolio.jsx"
import Submission from "./assets/pages/submission.jsx"
import FollowService from "./assets/pages/followService.jsx"
import Logout from "./assets/pages/logout.jsx"
import Backoffice from "./assets/pages/backoffice.jsx"
import Inbox from "./assets/pages/inbox.jsx"
import Rendezvous from "./assets/pages/rendezvous.jsx"
import Pay from "./assets/pages/Pay.jsx"

// Page 404 optionnelle
const NotFound = ({
  title = "404 — Page introuvable",
  description = "On dirait que cette page s'est faite la malle. Essayez l'accueil ou revenez en arrière.",
  homePath = '/',
  showSearch = true,
}) => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 p-6">
      <section className="max-w-4xl w-full rounded-2xl shadow-2xl bg-white/80 dark:bg-gray-900/60 backdrop-blur-md border border-gray-100 dark:border-gray-800 p-8 md:p-12 flex flex-col md:flex-row items-center gap-8">
        {/* Left: texte */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4">
            {title}
          </h1>

          <p className="text-gray-600 dark:text-gray-300 mb-6">{description}</p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start">
            <div className="flex items-center gap-2">
              <Link
                to={homePath}
                className="inline-flex flex items-center gap-2 px-5 py-3 rounded-xl bg-violet-600 text-white font-semibold shadow hover:shadow-lg transform hover:-translate-y-0.5 transition"
                aria-label="Retour à l'accueil"
              >
                Accueil
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M10.707 2.293a1 1 0 00-1.414 0L3 8.586V17a1 1 0 001 1h4a1 1 0 001-1v-3h2v3a1 1 0 001 1h4a1 1 0 001-1V8.586l-6.293-6.293z" clipRule="evenodd" />
                </svg>
              </Link>

              <button
                onClick={() => history.back()}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 bg-white dark:bg-transparent hover:bg-gray-50 transition"
                aria-label="Revenir en arrière"
              >
                Retour
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path fillRule="evenodd" d="M12.293 16.293a1 1 0 010-1.414L15.586 11H4a1 1 0 110-2h11.586l-3.293-3.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            {showSearch && (
              <div className="mt-2 sm:mt-0 sm:ml-2">
                <label htmlFor="page-select" className="sr-only">Choisir une page</label>
                <select
                  id="page-select"
                  className="w-full sm:w-64 rounded-xl border border-gray-200 dark:border-gray-700 py-3 pl-4 pr-4 focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                  onChange={(e) => (window.location.href = e.target.value)}
                >
                  <option value="">Aller vers…</option>
                  <option value="/">Accueil</option>
                  <option value="/services">Services</option>
                  <option value="/contact">Contact</option>
                  <option value="/portfolio">Portfolio</option>
                  <option value="/#about">À propos</option>
                </select>
              </div>
            )}
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">Si vraiment tout est perdu, contacte le support — ou menace gentiment ton serveur.</p>
        </div>

        {/* Right: illustration */}
        <div className="flex-1 max-w-md relative">
          <div className="bg-gradient-to-br from-violet-50 to-white dark:from-transparent dark:to-gray-800 rounded-xl p-6 flex items-center justify-center">
            {/* Simple illustration: robot perdu */}
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 360" role="img" aria-label="Illustration robot perdu" className="w-full h-auto">
              <defs>
                <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
              <rect width="100%" height="100%" rx="20" fill="url(#g1)" opacity="0.08" />

              <g transform="translate(40,30)">
                <g transform="translate(80,20)">
                  <rect x="60" y="70" width="140" height="120" rx="16" fill="#fff" opacity="0.95" />

                  <circle cx="130" cy="40" r="36" fill="#fff" />
                  <circle cx="118" cy="36" r="6" fill="#111827" />
                  <circle cx="142" cy="36" r="6" fill="#111827" />

                  <rect x="110" y="95" width="40" height="10" rx="6" fill="#d1d5db" />

                  <g transform="translate(25,120)">
                    <rect x="10" y="0" width="40" height="12" rx="6" fill="#111827" opacity="0.08" />
                    <rect x="90" y="0" width="40" height="12" rx="6" fill="#111827" opacity="0.08" />
                  </g>

                  <g transform="translate(10,20)">
                    <rect x="0" y="110" width="220" height="8" rx="4" fill="#f3f4f6" />
                    <text x="110" y="160" textAnchor="middle" fontSize="24" fill="#6b7280">Oups...</text>
                  </g>
                </g>
              </g>
            </svg>
            <img 
              className="w-12 h-12 rounded-full absolute top-1 right-7"
              src="/img/web-app-manifest-192x192.png" alt="" />
          </div>

          <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">Astuce: garde ton URL — les devs adorent les mystères.</div>
        </div>
      </section>
    </main>
  );
}


function App() {
  return (
    <div className="min-h-screen relative h-full bg-white dark:bg-gray-900 transition-colors duration-300">
       <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
        <PopupProvider>
          <Routes>
            {/* Routes avec layout global */}
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              
              <Route path="/contact" element={<Contact />} />
              <Route path="/card" element={<Card />} />
              <Route path="/profil" element={
                <RequireAuth>
                  <Profil />
                </RequireAuth>
              } />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/sign" element={<Sign />} />
              <Route path="/inbox" element={
                <RequireAuth>
                  <Inbox />
                </RequireAuth>
              } />
             
              
              
            </Route>

            {/* Page 404 */}
            <Route path="*" element={<NotFound />} />
            <Route path="/rendezvous" element={<Rendezvous />} />
            <Route path="/logout" element={<Logout />} />
            <Route path="/backoffice" element={
                <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
            <Route path="/backoffice/clients" element={
                <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
            <Route path="/backoffice/dashboard" element={
                <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
            <Route path="/backoffice/services" element={
                <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
            <Route path="/backoffice/devis" element={
                <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
            <Route path="/backoffice/appointments" element={
                <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
              <Route path="/backoffice/messages" element={
                <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
            <Route path="/backoffice/parametre" element={
                <RequireAuth_admin allowedRoles={['admin']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
            <Route path="/submission" element={
                <RequireAuth>
                  <Submission />
                </RequireAuth>
              } />
              <Route path="/followService" element={
                <RequireAuth>
                  <FollowService />
                </RequireAuth>
              } />
              
              <Route path="/backoffice/contacts" element={
                <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />
              <Route path="backoffice/users" element={
               <RequireAuth_admin allowedRoles={['admin', 'manager']}>
                  <Backoffice />
                </RequireAuth_admin >
              } />

              <Route path="/pay/:link" element={<Pay />} />
          </Routes>

        </PopupProvider>
      </GoogleOAuthProvider>
    </div>
  );
}

export default App;
