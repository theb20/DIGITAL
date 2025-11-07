import api from '../api/api_axios.js';

export async function getPrivacy() {
  try {
    const response = await api.get('/privacy');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la politique de confidentialité:', error);
    throw error;
  }
}

export async function getSection(sectionNumber) {
  try {
    const response = await api.get(`/privacy/section/${sectionNumber}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la section de confidentialité:', error);
    throw error;
  }
}

// Fonctions utilisées par la page privacy.jsx
export async function getSections() {
  try {
    const response = await api.get('/privacy/sections');
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement des sections de confidentialité:', error);
    throw error;
  }
}

export async function getPrivacySection(sectionNumber) {
  try {
    const response = await api.get(`/privacy/section/${sectionNumber}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors du chargement du contenu de la section:', error);
    throw error;
  }
}

export async function getLastUpdated() {
  try {
    const response = await api.get('/privacy/last_updated');
    return response.data?.last_updated ?? response.data ?? null;
  } catch (error) {
    console.error('Erreur lors de la récupération de la date de mise à jour:', error);
    return null;
  }
}

const privacyService = {
  getPrivacy,
  getSection,
  getSections,
  getPrivacySection,
  getLastUpdated,
};

export default privacyService;