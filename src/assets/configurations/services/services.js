import api from '../api/api_axios.js';

export async function list() {
  const res = await api.get('/services');
  return res.data;
}

export async function get(id) {
  const res = await api.get(`/services/${id}`);
  return res.data;
}

export async function create(payload) {
  const res = await api.post('/services', payload);
  return res.data;
}

export async function bulkCreate(payloads) {
  const res = await api.post('/services/bulk', payloads);
  return res.data;
}

export async function update(id, payload) {
  const res = await api.put(`/services/${id}`, payload);
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/services/${id}`);
  return res.data;
}

export default { list, get, create, bulkCreate, update, remove };