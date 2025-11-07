import api from '../api/api_axios.js';

export async function list() {
  const res = await api.get('/devis/requests');
  return res.data;
}

export async function get(id) {
  const res = await api.get(`/devis/requests/${id}`);
  return res.data;
}

export async function create(payload) {
  const res = await api.post('/devis/requests', payload);
  return res.data;
}

export async function createWithFile(payload) {
  const res = await api.post('/devis/requests/with-file', payload);
  return res.data;
}

export async function update(id, payload) {
  const res = await api.put(`/devis/requests/${id}`, payload);
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/devis/requests/${id}`);
  return res.data;
}

export default { list, get, create, createWithFile, update, remove };
