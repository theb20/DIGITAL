import api from '../api/api_axios.js';

const BASE = '/contact';

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

export async function remove(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data;
}

export async function reply(id, payload) {
  const res = await api.post(`${BASE}/${id}/reply`, payload || {});
  return res.data;
}

export default { list, get, create, remove, reply };