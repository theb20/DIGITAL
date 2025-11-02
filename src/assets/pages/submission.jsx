import React, { useState } from "react";

/**
 * PAGE DE SOUMISSION DE DEVIS – VERSION ULTRA PROFESSIONNELLE
 * Design premium, structure corporate, CTA puissant, expérience utilisateur soignée.
 * Modern UI + ton élégant.
 */

export default function SoumissionDevis() {
  const [formData, setFormData] = useState({
    nom: "",
    email: "",
    telephone: "",
    typeProjet: "",
    budget: "",
    description: "",
    fichier: null,
  });

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Devis soumis:", formData);
    alert("Votre demande de devis a été transmise avec succès. Un expert vous contactera sous 24h.");
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 p-3 flex items-center justify-center">
      <div className="max-w-4xl w-full bg-white dark:bg-gray-900 shadow-[0_8px_40px_-4px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_40px_-4px_rgba(0,0,0,0.45)] rounded-3xl lg:p-12 p-5 border border-gray-200 dark:border-gray-800 relative">
        <button
        onClick={() => window.history.back()}
        className=" absolute top-10 end-10 border-black dark:border-white text-dark dark:text-white hover:text-red-900 text-lg shadow-xl transition transform hover:-translate-y-0.5">
            x
        </button>

        <div className="flex justify-center items-center">
          <img src="/img/web-app-manifest-192x192.png" alt="Logo FilterFinder" className="w-12 h-12" />
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white ml-2">
            Digital
          </h2>
        </div>
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="lg:text-4xl text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Demande de devis professionnel
          </h1>
          <p className="mt-3 sm:text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Renseignez les informations ci-dessous. Nous analysons votre besoin et vous envoyons
            une estimation détaillée sous 24 à 48h.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom */}
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium mb-1">Nom complet *</label>
              <input
                name="nom"
                placeholder="Entrez votre nom complet"
                type="text"
                required
                onChange={handleChange}
                className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium mb-1">Email *</label>
              <input
                name="email"
                placeholder="Entrez votre adresse email"
                type="email"
                required
                onChange={handleChange}
                className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            {/* Téléphone */}
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium mb-1">Téléphone *</label>
              <input
                name="telephone"
                placeholder="Entrez votre numéro de téléphone"
                type="text"
                required
                onChange={handleChange}
                className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
              />
            </div>

            {/* Type de projet */}
            <div className="flex flex-col">
              <label className="text-gray-700 dark:text-gray-300 font-medium mb-1">Type de projet *</label>
              <select
                name="typeProjet"
                required
                onChange={handleChange}
                className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
              >
                <option value="">Sélectionnez…</option>
                <option value="Site vitrine">Site vitrine</option>
                <option value="Site e-commerce">Site e-commerce</option>
                <option value="Application web">Application web</option>
                <option value="UI/UX design">UI/UX design</option>
                <option value="Refonte de site">Refonte de site</option>
                <option value="Plateforme sur-mesure">Plateforme sur-mesure</option>
              </select>
            </div>
          </div>

          

          {/* Upload de fichier */}
          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 font-medium mb-2">Joindre un document (optionnel)</label>
            <input
              type="file"
              name="fichier"
              accept=".pdf"
              onChange={handleChange}
              className="block w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-black dark:file:bg-white
               file:text-white dark:file:text-black file:font-semibold hover:file:bg-violet-700 cursor-pointer"
            />
          </div>

          {/* Description */}
          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 font-medium mb-1">Description du projet *</label>
            <textarea
              name="description"
              rows="5"
              required
              onChange={handleChange}
              placeholder="Décrivez précisément votre projet, vos objectifs, vos contraintes, vos inspirations…"
              className="rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-3 px-4 text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-violet-500 outline-none"
            />
          </div>

          {/* CTA */}
          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-black hover:bg-black/80 text-white text-lg font-semibold shadow-xl transition transform hover:-translate-y-0.5"
          >
            Soumettre ma demande
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Réponse garantie sous 24 à 48h ouvrées.
        </p>
      </div>
    </main>
  );
}