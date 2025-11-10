import api from '../api/api_axios.js';
import { getSessionEmail, getAvatarUrl, setAvatarUrl } from './session.js';

export async function getUserByEmail(email) {
  if (!email) return null;
  try {
    const res = await api.get(`/users/email/${encodeURIComponent(email)}`);
    return res.data;
  } catch (e) {
    if (e?.response?.status === 404) return null;
    throw e;
  }
}

export async function list() {
  const res = await api.get('/users');
  return res.data;
}

export async function get(id) {
  const res = await api.get(`/users/${id}`);
  return res.data;
}

export async function create(data) {
  const res = await api.post('/users', data || {});
  return res.data;
}

export async function update(id, data) {
  const res = await api.put(`/users/${id}`, data || {});
  return res.data;
}

export async function remove(id) {
  const res = await api.delete(`/users/${id}`);
  return res.data;
}

export async function getCurrentUser() {
  const email = getSessionEmail();
  const user = await getUserByEmail(email);
  const cookieAvatar = getAvatarUrl();
  if (user?.avatar && !cookieAvatar) setAvatarUrl(user.avatar);
  return user;
}

export default { getUserByEmail, getCurrentUser, list, get, create, update, remove };