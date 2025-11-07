import axios from 'axios';
import { getCookie } from './cookies.js';

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
    // Ajouter l'acteur côté client pour la vérification des permissions backend
    const email = getCookie('current_user_email');
    const role = getCookie('role');
    if (!config.headers) config.headers = {};
    if (email) config.headers['x-user-email'] = String(email);
    if (role) config.headers['x-user-role'] = String(role);
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
