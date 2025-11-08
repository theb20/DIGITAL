import api from '../api/api_axios.js';

export async function list() {
  const res = await api.get('/appointments');
  return res.data;
}

export async function get(id) {
  const res = await api.get(`/appointments/${id}`);
  return res.data;
}

export async function create(payload) {
  const res = await api.post('/appointments', payload);
  return res.data;
}

export async function update(id, payload) {
  const res = await api.put(`/appointments/${id}`, payload);
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/appointments/${id}`);
  return res.data;
}

export default { list, get, create, update, remove };