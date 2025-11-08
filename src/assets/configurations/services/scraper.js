import api from '../api/api_axios.js';

const BASE = '/scrape';

// selectors: { item, title?, link?, excerpt?, image?, date? }
export async function scrape(url, selectors = {}) {
  if (!url) throw new Error('URL de scraping manquante');
  const { data } = await api.post(BASE, { url, selectors });
  if (!data?.success) throw new Error(data?.error || 'Scraping a échoué');
  return data.items || [];
}

export default { scrape };