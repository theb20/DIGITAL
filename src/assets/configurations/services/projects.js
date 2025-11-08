import api from '../api/api_axios.js';

const BASE = '/projects';

export async function list() {
  const res = await api.get(BASE);
  return res.data;
}

export async function get(id) {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
}

export async function create(payload) {
  const res = await api.post(BASE, payload);
  return res.data;
}

export async function update(id, payload) {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}

export default { list, get, create, update, remove };