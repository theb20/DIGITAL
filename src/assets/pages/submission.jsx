import React, { useState } from "react";
import api from "../configurations/api/api_axios.js";

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

  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  const fileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      const base64 = String(result).includes(',') ? String(result).split(',')[1] : String(result);
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);

    try {
      // 1) Préparer le fichier en base64 (si présent)
      let file_base64 = null;
      let file_name = null;
      let mime_type = "application/pdf";
      if (formData.fichier instanceof File) {
        file_base64 = await fileToBase64(formData.fichier);
        file_name = formData.fichier.name;
        mime_type = formData.fichier.type || mime_type;
      }

      // 2) Envoi des données vers l’endpoint Google Drive
      const payload = {
        full_name: formData.nom,
        email: formData.email,
        phone: formData.telephone || null,
        service_id: null,
        project_type: formData.typeProjet || null,
        project_description: formData.description,
        file_name,
        file_base64,
        mime_type,
      };

      await api.post("/devis/requests/with-file", payload);

      // 3) Feedback utilisateur + reset
      alert("Votre demande de devis a été transmise avec succès. Un expert vous contactera sous 24h.");
      setFormData({
        nom: "",
        email: "",
        telephone: "",
        typeProjet: "",
        budget: "",
        description: "",
        fichier: null,
      });
    } catch (err) {
      console.error("Erreur soumission devis:", err);
      alert(err?.message || "Erreur lors de l'envoi du devis");
    } finally {
      setSubmitting(false);
    }
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
            disabled={submitting}
            className={`w-full py-4 rounded-xl text-white text-lg font-semibold shadow-xl transition transform hover:-translate-y-0.5 ${submitting ? 'bg-black/60 cursor-not-allowed' : 'bg-black hover:bg-black/80'}`}
          >
            {submitting ? 'Envoi en cours…' : 'Soumettre ma demande'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          Réponse garantie sous 24 à 48h ouvrées.
        </p>
      </div>
    </main>
  );
}