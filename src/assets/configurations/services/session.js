import { getCookie, setCookie, removeCookie } from '../api/cookies.js';

export function getSessionEmail() {
  return getCookie('current_user_email') || null;
}

export function getSessionRole() {
  return getCookie('role') || null;
}

export function getAvatarUrl() {
  // Back-compat: si ancien cookie 'avatar_url' existe, le migrer vers 'avatar'
  const current = getCookie('avatar');
  if (current) return current;
  const legacy = getCookie('avatar_url');
  if (legacy) {
    setCookie('avatar', legacy);
    return legacy;
  }
  return null;
}

export function setAvatarUrl(url, days) {
  if (url) setCookie('avatar', url, days);
}

export function setSessionUi({ email, role, avatar }) {
  if (email) setCookie('current_user_email', email);
  if (role) setCookie('role', role);
  if (avatar) setCookie('avatar', avatar);
}

export function clearSessionUiCookies() {
  removeCookie('role');
  removeCookie('current_user_email');
  removeCookie('avatar');
  removeCookie('avatar_url');
}

export function isAuthenticated() {
  return Boolean(getSessionEmail());
}

export default {
  getSessionEmail,
  getSessionRole,
  getAvatarUrl,
  setAvatarUrl,
  setSessionUi,
  clearSessionUiCookies,
  isAuthenticated,
};