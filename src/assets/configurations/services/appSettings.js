import api from '../api/api_axios.js';

const BASE = '/app-settings';
const LS_KEY = 'app_settings';

function readLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function writeLocal(items) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(items)); } catch { }
}

function nowIso() {
  return new Date().toISOString();
}

export async function list() {
  try {
    const res = await api.get(BASE);
    return res.data;
  } catch {
    return readLocal();
  }
}

export async function get(id) {
  try {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  } catch {
    const items = readLocal();
    return items.find(x => String(x.id) === String(id)) || null;
  }
}

export async function getByKey(key) {
  try {
    const res = await api.get(`${BASE}/key/${encodeURIComponent(key)}`);
    return res.data;
  } catch {
    const items = readLocal();
    return items.find(x => String(x.setting_key) === String(key)) || null;
  }
}

export async function create(payload) {
  try {
    const res = await api.post(BASE, payload);
    return res.data;
  } catch {
    const items = readLocal();
    const id = payload?.id ?? Date.now();
    const item = {
      id,
      setting_key: payload?.setting_key ?? '',
      setting_value: payload?.setting_value ?? '',
      setting_type: payload?.setting_type ?? 'string',
      description: payload?.description ?? '',
      created_at: nowIso(),
      updated_at: nowIso(),
    };
    items.push(item);
    writeLocal(items);
    return item;
  }
}

export async function update(id, payload) {
  try {
    const res = await api.put(`${BASE}/${id}`, payload);
    return res.data;
  } catch {
    const items = readLocal();
    const idx = items.findIndex(x => String(x.id) === String(id));
    if (idx === -1) return null;
    const prev = items[idx];
    const next = {
      ...prev,
      setting_key: payload?.setting_key ?? prev.setting_key,
      setting_value: payload?.setting_value ?? prev.setting_value,
      setting_type: payload?.setting_type ?? prev.setting_type,
      description: payload?.description ?? prev.description,
      updated_at: nowIso(),
    };
    items[idx] = next;
    writeLocal(items);
    return next;
  }
}

export async function remove(id) {
  try {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  } catch {
    const items = readLocal();
    const filtered = items.filter(x => String(x.id) !== String(id));
    writeLocal(filtered);
    return { success: true };
  }
}

export default { list, get, getByKey, create, update, remove };