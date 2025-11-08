import api from '../api/api_axios.js';

const normalizeRequestItem = (r) => ({
  type: 'request',
  id: r?.id,
  created_at: r?.created_at || r?.createdAt || null,
  title: r?.full_name ? `${r.full_name} — demande de devis` : 'Demande de devis',
  summary: r?.project_type ? `Type: ${r.project_type}` : (r?.service_id ? `Service #${r.service_id}` : ''),
});

const normalizeSubmissionItem = (s) => ({
  type: 'submission',
  id: s?.id,
  created_at: s?.created_at || s?.createdAt || null,
  title: s?.title || 'Soumission de devis',
  summary: s?.status ? `Statut: ${s.status}` : '',
});

const notificationsApi = {
  async listLatest(limit = 10) {
    try {
      const [requestsRes, submissionsRes] = await Promise.all([
        api.get('/devis/requests'),
        api.get('/devis/submissions'),
      ]);
      const reqs = Array.isArray(requestsRes?.data) ? requestsRes.data : [];
      const subs = Array.isArray(submissionsRes?.data) ? submissionsRes.data : [];
      const items = [
        ...reqs.map(normalizeRequestItem),
        ...subs.map(normalizeSubmissionItem),
      ].filter(Boolean);
      items.sort((a, b) => {
        const da = a.created_at ? new Date(a.created_at).getTime() : 0;
        const db = b.created_at ? new Date(b.created_at).getTime() : 0;
        return db - da;
      });
      return items.slice(0, limit);
    } catch (e) {
      console.warn('notificationsApi.listLatest error:', e?.message || e);
      return [];
    }
  },
};

export default notificationsApi;