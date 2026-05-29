import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function normalizeList(data) {
  return data?.results || data || []
}

export const authApi = {
  register: (payload) => apiClient.post('/auth/register/', payload),
  login: (payload) => apiClient.post('/auth/login/', payload),
  logout: () => apiClient.post('/auth/logout/'),
  me: () => apiClient.get('/auth/me/'),
  updateProfile: (payload) => apiClient.patch('/auth/profile/', payload),
  changePassword: (payload) => apiClient.post('/auth/change-password/', payload),
}

export const substancesApi = {
  list: (params = {}) => apiClient.get('/substances/', { params }),
  retrieve: (id) => apiClient.get(`/substances/${id}/`),
}

export const requestsApi = {
  list: (params = {}) => apiClient.get('/requests/', { params }).then((response) => ({
    ...response,
    data: normalizeList(response.data),
  })),
  retrieve: (id) => apiClient.get(`/requests/${id}/`),
  create: (payload) => apiClient.post('/requests/', payload),
  update: (id, payload) => apiClient.patch(`/requests/${id}/`, payload),
  submit: (id) => apiClient.put(`/requests/${id}/submit/`),
  complete: (id) => apiClient.put(`/requests/${id}/complete/`),
  reject: (id) => apiClient.put(`/requests/${id}/reject/`),
  remove: (id) => apiClient.delete(`/requests/${id}/`),
  cart: () => apiClient.get('/requests/cart/'),
}

export const requestItemsApi = {
  create: (payload) => apiClient.post('/request-items/', payload),
  update: (id, payload) => apiClient.patch(`/request-items/${id}/`, payload),
  remove: (id) => apiClient.delete(`/request-items/${id}/`),
}
