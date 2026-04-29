import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5142/api' });

export const authApi = {
  login: (data) => api.post('/auth/login', data),
};
export const partsApi = {
  getAll: () => api.get('/parts'),
  create: (data) => api.post('/parts', data),
  update: (id, data) => api.put(`/parts/${id}`, data),
  delete: (id) => api.delete(`/parts/${id}`),
};
export const categoriesApi = {
  getAll: () => api.get('/partcategories'),
  create: (data) => api.post('/partcategories', data),
};
export const vendorsApi = {
  getAll: () => api.get('/vendors'),
  create: (data) => api.post('/vendors', data),
};
export const purchaseInvoicesApi = {
  getAll: () => api.get('/purchaseinvoices'),
  create: (data) => api.post('/purchaseinvoices', data),
};
export const customersApi = {
  getAll: () => api.get('/customers'),
  create: (data) => api.post('/customers', data),
};
export const salesInvoicesApi = {
  getAll: () => api.get('/salesinvoices'),
  create: (data) => api.post('/salesinvoices', data),
  getByCustomer: (customerId) => api.get(`/salesinvoices/customer/${customerId}`),
};
export default api;
