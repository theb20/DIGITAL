import api from '../api/api_axios.js';
import session from './session.js';

// Décode le payload d'un ID token Google (JWT) côté client
function decodeGoogleIdToken(idToken) {
  try {
    const parts = idToken.split('.');
    if (parts.length !== 3) throw new Error('Token JWT invalide');
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload;
  } catch (e) {
    throw new Error('Impossible de décoder le token Google');
  }
}

function formatMySQLDate(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  const Y = date.getFullYear();
  const M = pad(date.getMonth() + 1);
  const D = pad(date.getDate());
  const h = pad(date.getHours());
  const m = pad(date.getMinutes());
  const s = pad(date.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

// Insère ou met à jour l'utilisateur dans la DB via le backend
export async function loginWithGoogle(idToken) {
  const payload = decodeGoogleIdToken(idToken);
  const {
    email,
    given_name,
    family_name,
    name,
    picture,
    sub, // identifiant Google
  } = payload;

  if (!email || !sub) {
    throw new Error("Le token Google ne contient pas d'email ou d'identifiant");
  }

  const firstName = given_name || (name ? name.split(' ')[0] : '');
  const lastName = family_name || (name ? name.split(' ').slice(1).join(' ') : '');

  const userData = {
    first_name: firstName || 'Inconnu',
    last_name: lastName || 'Inconnu',
    email,
    provider: 'google',
    provider_id: String(sub),
    role: 'user',
    avatar: picture || null,
    is_active: true,
    session_status: 'connected',
    // Ne pas envoyer last_login en création pour éviter erreur MySQL; géré en update.
  };

  // 1) Cherche d'abord l'utilisateur par email
  try {
    const res = await api.get(`/users/email/${encodeURIComponent(email)}`);
    const existing = res.data;
    if (existing && existing.id) {
      await api.put(`/users/${existing.id}`, {
        session_status: 'connected',
        last_login: formatMySQLDate(new Date()),
        avatar: userData.avatar,
        provider_id: userData.provider_id,
        id_token: idToken,
      });
      session.setSessionUi({ email, role: existing.role, avatar: userData.avatar });
      return { ...existing, session_status: 'connected' };
    }
  } catch (e) {
    // 404 => utilisateur non trouvé, on passera à la création
    if (!(e && e.response && e.response.status === 404)) {
      throw e;
    }
  }

  // 2) Sinon on crée l'utilisateur
  const created = await api.post('/users', { ...userData, id_token: idToken });
  const createdRole = created?.data?.role || 'user';
  session.setSessionUi({ email, role: createdRole, avatar: userData.avatar });
  return created.data;
}

export async function logout() {
  try {
    const email = session.getSessionEmail();
    // Supprimer les cookies UI côté client
    session.clearSessionUiCookies();

    if (!email) {
      return { success: true };
    }

    const res = await api.post('/users/logout', { email });
    return res.data || { success: true };
  } catch (e) {
    return { success: false, error: e?.response?.data || e.message };
  }
}

export default { loginWithGoogle, logout };