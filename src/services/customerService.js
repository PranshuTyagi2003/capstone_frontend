import api from './api';

export const customerService = {
  getAllCustomers: async (params = {}) => {
    const response = await api.get('/customers', { params });
    return response.data;
  },

  getCustomerById: async (id) => {
    const response = await api.get(`/customers/${id}`);
    return response.data;
  },

  createCustomer: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  updateCustomer: async (id, customerData) => {
    const response = await api.put(`/customers/${id}`, customerData);
    return response.data;
  },

  deleteCustomer: async (id) => {
    await api.delete(`/customers/${id}`);
  },

  getCustomerStatus: async (id) => {
    const response = await api.get(`/customers/${id}/status`);
    return response.data;
  },
};
