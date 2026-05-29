import axios from 'axios'
import { IS_MOCK_MODE } from '../../config/runtime'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const APP_BASE_URL = import.meta.env.BASE_URL || '/'

function assetUrl(path) {
  return `${APP_BASE_URL}${path.replace(/^\//, '')}`
}

const mockSubstances = [
  {
    id: 1,
    name: 'Ацетилсалициловая кислота',
    cas: '50-78-2',
    price: '3800.00',
    price_display: '3800.00 ₽/кг',
    molecular_weight: '180.16',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
    description: 'НПВС, антиагрегант. Используется для производства противовоспалительных и антиагрегантных препаратов.',
    image_url: assetUrl('/mock/aspirin.svg'),
  },
  {
    id: 2,
    name: 'Парацетамол',
    cas: '103-90-2',
    price: '2950.00',
    price_display: '2950.00 ₽/кг',
    molecular_weight: '151.16',
    shelf_life: 48,
    pharmacopoeia: 'BP, EP',
    description: 'Анальгетик и антипиретик для лекарственных форм широкого применения.',
    image_url: assetUrl('/mock/paracetamol.svg'),
  },
  {
    id: 3,
    name: 'Ибупрофен',
    cas: '15687-27-1',
    price: '4200.00',
    price_display: '4200.00 ₽/кг',
    molecular_weight: '206.28',
    shelf_life: 36,
    pharmacopoeia: 'USP',
    description: 'Противовоспалительная субстанция для производства таблетированных и капсульных форм.',
    image_url: assetUrl('/mock/ibuprofen.svg'),
  },
  {
    id: 4,
    name: 'Лидокаин гидрохлорид',
    cas: '73-78-9',
    price: '6100.00',
    price_display: '6100.00 ₽/кг',
    molecular_weight: '270.80',
    shelf_life: 24,
    pharmacopoeia: 'EP',
    description: 'Местный анестетик фармакопейного качества для стерильных и нестерильных лекарственных форм.',
    image_url: assetUrl('/mock/lidocaine.svg'),
  },
]

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function normalizeList(data) {
  return data?.results || data || []
}

function unauthorized() {
  return Promise.reject({
    response: {
      status: 401,
      data: { detail: 'Необходима авторизация' },
    },
  })
}

function filterMockSubstances(params = {}) {
  const search = String(params.search || '').trim().toLowerCase()
  const hasPriceFrom = params.price_from !== undefined && params.price_from !== ''
  const hasPriceTo = params.price_to !== undefined && params.price_to !== ''
  const priceFrom = Number(params.price_from)
  const priceTo = Number(params.price_to)

  return mockSubstances.filter((item) => {
    const price = Number(item.price)
    const matchesSearch = !search
      || item.name.toLowerCase().includes(search)
      || item.cas.toLowerCase().includes(search)
    const matchesPriceFrom = !hasPriceFrom || !Number.isFinite(priceFrom) || price >= priceFrom
    const matchesPriceTo = !hasPriceTo || !Number.isFinite(priceTo) || price <= priceTo
    return matchesSearch && matchesPriceFrom && matchesPriceTo
  })
}

export const authApi = {
  register: (payload) => (IS_MOCK_MODE ? unauthorized() : apiClient.post('/auth/register/', payload)),
  login: (payload) => (IS_MOCK_MODE ? unauthorized() : apiClient.post('/auth/login/', payload)),
  logout: () => (IS_MOCK_MODE ? Promise.resolve({ data: {} }) : apiClient.post('/auth/logout/')),
  me: () => (IS_MOCK_MODE ? unauthorized() : apiClient.get('/auth/me/')),
  updateProfile: (payload) => (IS_MOCK_MODE ? unauthorized() : apiClient.patch('/auth/profile/', payload)),
  changePassword: (payload) => (IS_MOCK_MODE ? unauthorized() : apiClient.post('/auth/change-password/', payload)),
}

export const substancesApi = {
  list: (params = {}) => (
    IS_MOCK_MODE
      ? Promise.resolve({ data: { results: filterMockSubstances(params) } })
      : apiClient.get('/substances/', { params })
  ),
  retrieve: (id) => {
    if (!IS_MOCK_MODE) return apiClient.get(`/substances/${id}/`)
    const item = mockSubstances.find((substance) => String(substance.id) === String(id))
    if (item) return Promise.resolve({ data: item })
    return Promise.reject({ response: { status: 404, data: { detail: 'Субстанция не найдена' } } })
  },
}

export const requestsApi = {
  list: (params = {}) => (IS_MOCK_MODE ? Promise.resolve({ data: [] }) : apiClient.get('/requests/', { params }).then((response) => ({
    ...response,
    data: normalizeList(response.data),
  }))),
  retrieve: (id) => (IS_MOCK_MODE ? unauthorized() : apiClient.get(`/requests/${id}/`)),
  create: (payload) => (IS_MOCK_MODE ? unauthorized() : apiClient.post('/requests/', payload)),
  update: (id, payload) => (IS_MOCK_MODE ? unauthorized() : apiClient.patch(`/requests/${id}/`, payload)),
  submit: (id) => (IS_MOCK_MODE ? unauthorized() : apiClient.put(`/requests/${id}/submit/`)),
  complete: (id) => (IS_MOCK_MODE ? unauthorized() : apiClient.put(`/requests/${id}/complete/`)),
  reject: (id) => (IS_MOCK_MODE ? unauthorized() : apiClient.put(`/requests/${id}/reject/`)),
  remove: (id) => (IS_MOCK_MODE ? unauthorized() : apiClient.delete(`/requests/${id}/`)),
  cart: () => (IS_MOCK_MODE ? unauthorized() : apiClient.get('/requests/cart/')),
}

export const requestItemsApi = {
  create: (payload) => (IS_MOCK_MODE ? unauthorized() : apiClient.post('/request-items/', payload)),
  update: (id, payload) => (IS_MOCK_MODE ? unauthorized() : apiClient.patch(`/request-items/${id}/`, payload)),
  remove: (id) => (IS_MOCK_MODE ? unauthorized() : apiClient.delete(`/request-items/${id}/`)),
}
