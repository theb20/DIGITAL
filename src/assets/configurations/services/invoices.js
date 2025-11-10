import api from '../api/api_axios.js';

const BASE = '/invoices';

const invoicesService = {
  async list() {
    const res = await api.get(BASE);
    return res.data;
  },
  async get(id) {
    const res = await api.get(`${BASE}/${id}`);
    return res.data;
  },
  async create(payload) {
    const res = await api.post(BASE, payload);
    return res.data;
  },
  async update(id, payload) {
    const res = await api.put(`${BASE}/${id}`, payload);
    return res.data;
  },
  async remove(id) {
    const res = await api.delete(`${BASE}/${id}`);
    return res.data;
  },
  async sendEmail(id) {
    const res = await api.post(`${BASE}/${id}/send-email`);
    return res.data;
  },
  async setStatus(id, status) {
    const res = await api.post(`${BASE}/${id}/status`, { status });
    return res.data;
  }
};

export default invoicesService;