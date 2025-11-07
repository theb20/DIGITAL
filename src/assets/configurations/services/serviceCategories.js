import api from '../api/api_axios.js';

export async function list() {
  const res = await api.get('/service-categories');
  return res.data;
}

export async function create(payload) {
  const res = await api.post('/service-categories', payload);
  return res.data;
}

export async function update(id, payload) {
  const res = await api.put(`/service-categories/${id}`, payload);
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/service-categories/${id}`);
  return res.data;
}

export async function seed() {
  const res = await api.post('/service-categories/seed');
  return res.data;
}

export default { list, create, update, remove, seed };