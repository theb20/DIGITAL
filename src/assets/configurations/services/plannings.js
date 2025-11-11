import api from '../api/api_axios.js';

export async function list() {
  const res = await api.get('/plannings');
  return res.data;
}

export async function getByWeek(weekKey) {
  const res = await api.get(`/plannings/week/${encodeURIComponent(weekKey)}`);
  return res.data;
}

export async function create(payload) {
  const res = await api.post('/plannings', payload || {});
  return res.data;
}

export default { list, getByWeek, create };