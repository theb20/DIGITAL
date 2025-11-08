import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || '';
const baseURL = rawBase.endsWith('/api')
  ? rawBase
  : `${rawBase.replace(/\/+$/, '')}/api`;

const api = axios.create({
  baseURL,
  timeout: 20000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour les requêtes
api.interceptors.request.use(
  (config) => {
    // Désactivation des en-têtes personnalisés pour éviter les erreurs CORS en développement
    // (Vite proxy est utilisé pour router les requêtes vers le backend)
    return config;
  },
  (error) => {
    console.error('Erreur de requête:', error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      console.error('❌ Aucune réponse du serveur');
      return Promise.reject(new Error('Erreur réseau'));
    }
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      error.message ||
      'Erreur serveur';
    // Préserver l'objet d'erreur d'origine pour garder status, headers et data
    error.message = message;
    return Promise.reject(error);
  }
);

export default api;
