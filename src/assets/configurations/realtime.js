import { io } from 'socket.io-client';

function getBackendOrigin() {
  const raw = import.meta.env.VITE_API_URL || '';
  if (raw) {
    // Extraire l'origine sans utiliser try/catch pour éviter les blocs vides
    const match = String(raw).match(/^https?:\/\/[^/]+/);
    if (match && match[0]) return match[0];
    // Si pas de correspondance, retirer les suffixes /api ou /health
    const trimmed = raw.replace(/\/+$/, '').replace(/\/(api|health)$/,'');
    if (trimmed) return trimmed;
  }
  // Fallback dev: aligné avec le proxy Vite qui cible le backend sur :3000
  return 'http://localhost:3000';
}

let socket = null;

export function connectRealtime() {
  if (socket && socket.connected) return socket;
  const origin = getBackendOrigin();
  socket = io(origin, {
    path: '/socket.io',
    transports: ['websocket', 'polling'],
    withCredentials: true,
  });
  return socket;
}

export function getSocket() {
  return socket;
}

export default { connectRealtime, getSocket };