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

export async function getCurrentUser() {
  const email = getSessionEmail();
  const user = await getUserByEmail(email);
  const cookieAvatar = getAvatarUrl();
  if (user?.avatar && !cookieAvatar) setAvatarUrl(user.avatar);
  return user;
}

export default { getUserByEmail, getCurrentUser };