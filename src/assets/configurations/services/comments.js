import api from '../api/api_axios.js';

const commentsApi = {
  // Génériques (si besoin ailleurs)
  list: async () => (await api.get('/comments')).data,
  get: async (id) => (await api.get(`/comments/${id}`)).data,
  create: async (payload) => (await api.post('/comments', payload)).data,
  update: async (id, payload) => (await api.put(`/comments/${id}`, payload)).data,
  remove: async (id) => (await api.delete(`/comments/${id}`)).data,
  // Réactions
  like: async (id, userId) => (await api.post(`/comments/${id}/like`, { user_id: userId })).data,
  dislike: async (id, userId) => (await api.post(`/comments/${id}/dislike`, { user_id: userId })).data,

  // Spécifiques blog
  listByBlog: async (blogId) => (await api.get(`/blogs/${blogId}/comments`)).data,
  createForBlog: async (blogId, payload) => (await api.post(`/blogs/${blogId}/comments`, payload)).data,

  // Spécifiques service
  listByService: async (serviceId) => (await api.get(`/services/${serviceId}/comments`)).data,
  createForService: async (serviceId, payload) => (await api.post(`/services/${serviceId}/comments`, payload)).data,
};

export default commentsApi;