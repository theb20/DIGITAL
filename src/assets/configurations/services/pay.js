import api from '../api/api_axios.js';

const paymentService = {

  createPayment(data) {
    return  api.post("/payments/create", data);
  },

  verifyPayment(link) {
    return api.get(`/payments/verify/${link}`);
  },

  confirmPayment(id) {
    return api.post("/payments/confirm", { id });
  }
};

export default paymentService;
