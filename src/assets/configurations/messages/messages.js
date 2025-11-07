import api from "../api/api_axios.js";

const base = "/messages";

export default {
  list: async (filters = {}) => {
    const params = { ...filters };
    const { data } = await api.get(base, { params });
    return data;
  },
  get: async (id) => {
    const { data } = await api.get(`${base}/${id}`);
    return data;
  },
  create: async (payload) => {
    const { data } = await api.post(base, payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`${base}/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    await api.delete(`${base}/${id}`);
    return true;
  }
};