import axios from 'axios'

// Vite proxy: /api  →  http://localhost:5142/api
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      'Something went wrong'
    return Promise.reject(new Error(typeof msg === 'string' ? msg : JSON.stringify(msg)))
  }
)

/* Vendors */
export const vendorApi = {
  getAll: ()         => api.get('/Vendor'),
  create: (data)     => api.post('/Vendor', data),
  update: (id, data) => api.put(`/Vendor/${id}`, data),
  delete: (id)       => api.delete(`/Vendor/${id}`),
}

/* Purchase Invoices */
export const invoiceApi = {
  getAll:  ()     => api.get('/PurchaseInvoice'),
  create:  (data) => api.post('/PurchaseInvoice', data),
  delete:  (id)   => api.delete(`/PurchaseInvoice/${id}`),
  daily:   ()     => api.get('/PurchaseInvoice/daily'),
  monthly: ()     => api.get('/PurchaseInvoice/monthly'),
  yearly:  ()     => api.get('/PurchaseInvoice/yearly'),
}

/* Health check for sidebar indicator */
export const checkHealth = () =>
  api.get('/Vendor').then(() => true).catch(() => false)

export default api
