// Utilitaires cookies simples
export function setCookie(name, value, options = {}) {
  const {
    days = 7,
    path = '/',
    sameSite = 'Lax',
    secure = typeof window !== 'undefined' && window.location.protocol === 'https:',
  } = options;

  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  const encoded = encodeURIComponent(String(value));
  let cookie = `${name}=${encoded}; Expires=${expires}; Path=${path}; SameSite=${sameSite}`;
  if (secure) cookie += '; Secure';
  document.cookie = cookie;
}

export function getCookie(name) {
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.$?*|{}()\[\]\\/+^])/g, '\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

export function removeCookie(name, options = {}) {
  const { path = '/' } = options;
  document.cookie = `${name}=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=${path}`;
}

export function setSession(name, value) {
  setCookie(name, value, { days: 7 });
}

export function getSession(name) {
  return getCookie(name);
}

export function clearSession() {
  removeCookie('token');
  removeCookie('current_user_email');
  removeCookie('role');
}