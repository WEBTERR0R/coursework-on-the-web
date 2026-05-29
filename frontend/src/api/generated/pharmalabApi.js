import axios from 'axios'
import { IS_MOCK_MODE } from '../../config/runtime'

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'
const APP_BASE_URL = import.meta.env.BASE_URL || '/'

function assetUrl(path) {
  return `${APP_BASE_URL}${path.replace(/^\//, '')}`
}

const mockImageByCas = {
  '50-78-2': 'aspirin.svg',
  '103-90-2': 'paracetamol.svg',
  '15687-27-1': 'ibuprofen.svg',
  '73-78-9': 'lidocaine.svg',
}

function makeMockSubstance(id, data) {
  const price = Number(data.price).toFixed(2)
  return {
    id,
    unit: 'кг',
    is_active: true,
    storage_conditions: 'Хранить в сухом, защищённом от света месте при температуре 15-25°C',
    image_url: assetUrl(`/mock/${mockImageByCas[data.cas] || 'generic-substance.svg'}`),
    price: price,
    price_display: `${price} ₽/кг`,
    ...data,
  }
}

const mockSubstances = [
  makeMockSubstance(1, {
    name: 'Парацетамол',
    cas: '103-90-2',
    description: 'Анальгетик и антипиретик. Используется для производства обезболивающих и жаропонижающих препаратов.',
    full_description: 'Фармацевтическая субстанция парацетамола. Белый кристаллический порошок, чистота >= 99.5%.',
    price: '4500.00',
    molecular_weight: '151.16',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP, BP',
  }),
  makeMockSubstance(2, {
    name: 'Ацетилсалициловая кислота',
    cas: '50-78-2',
    description: 'НПВС, антиагрегант. Используется для производства противовоспалительных и антиагрегантных препаратов.',
    full_description: 'Фармацевтическая субстанция ацетилсалициловой кислоты. Белый кристаллический порошок, чистота >= 99.8%.',
    price: '3800.00',
    molecular_weight: '180.16',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(3, {
    name: 'Ибупрофен',
    cas: '15687-27-1',
    description: 'НПВС, анальгетик. Используется для производства обезболивающих и противовоспалительных препаратов.',
    full_description: 'Фармацевтическая субстанция ибупрофена. Белый кристаллический порошок, чистота >= 99.6%.',
    price: '5200.00',
    molecular_weight: '206.28',
    shelf_life: 24,
    pharmacopoeia: 'USP, EP, JP',
  }),
  makeMockSubstance(4, {
    name: 'Амоксициллин',
    cas: '26787-78-0',
    description: 'Антибиотик пенициллинового ряда. Используется для производства антибактериальных препаратов.',
    full_description: 'Фармацевтическая субстанция амоксициллина для капсул, таблеток и порошков для суспензий.',
    price: '8500.00',
    molecular_weight: '365.40',
    shelf_life: 24,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(5, {
    name: 'Омепразол',
    cas: '73590-58-6',
    description: 'Ингибитор протонной помпы. Используется для производства противоязвенных препаратов.',
    full_description: 'Фармацевтическая субстанция омепразола для капсул с кишечнорастворимыми гранулами.',
    price: '9800.00',
    molecular_weight: '345.42',
    shelf_life: 24,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(6, {
    name: 'Лозартан калия',
    cas: '114798-26-4',
    description: 'Блокатор рецепторов ангиотензина II. Используется для производства антигипертензивных препаратов.',
    full_description: 'Фармацевтическая субстанция лозартана калия для таблетированных лекарственных форм.',
    price: '7200.00',
    molecular_weight: '422.91',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(7, {
    name: 'Аторвастатин кальция',
    cas: '134523-00-5',
    description: 'Гиполипидемическое средство. Используется для производства статинов для снижения холестерина.',
    full_description: 'Фармацевтическая субстанция аторвастатина кальция для производства таблеток.',
    price: '12500.00',
    molecular_weight: '1155.36',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(8, {
    name: 'Симвастатин',
    cas: '79902-63-9',
    description: 'Гиполипидемическое средство. Используется для производства статинов.',
    full_description: 'Фармацевтическая субстанция симвастатина. Белый кристаллический порошок.',
    price: '9800.00',
    molecular_weight: '418.57',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(9, {
    name: 'Метформин',
    cas: '657-24-9',
    description: 'Гипогликемическое средство. Используется для производства противодиабетических препаратов.',
    full_description: 'Фармацевтическая субстанция метформина гидрохлорида для производства таблеток.',
    price: '3500.00',
    molecular_weight: '165.62',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP, BP',
  }),
  makeMockSubstance(10, {
    name: 'Лизиноприл',
    cas: '83915-83-7',
    description: 'Ингибитор АПФ. Используется для производства антигипертензивных препаратов.',
    full_description: 'Фармацевтическая субстанция лизиноприла. Белый кристаллический порошок.',
    price: '6800.00',
    molecular_weight: '405.49',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(11, {
    name: 'Амлодипин',
    cas: '88150-42-9',
    description: 'Блокатор кальциевых каналов. Используется для производства антигипертензивных препаратов.',
    full_description: 'Фармацевтическая субстанция амлодипина безилата для производства таблеток.',
    price: '5600.00',
    molecular_weight: '567.05',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(12, {
    name: 'Клопидогрел',
    cas: '113665-84-2',
    description: 'Антиагрегант. Используется для производства препаратов для профилактики тромбозов.',
    full_description: 'Фармацевтическая субстанция клопидогрела бисульфата для таблетированных форм.',
    price: '15800.00',
    molecular_weight: '419.90',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(13, {
    name: 'Цетиризин',
    cas: '83881-51-0',
    description: 'Антигистаминное средство. Используется для производства противоаллергических препаратов.',
    full_description: 'Фармацевтическая субстанция цетиризина дигидрохлорида для таблеток и сиропов.',
    price: '4200.00',
    molecular_weight: '461.81',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(14, {
    name: 'Лоратадин',
    cas: '79794-75-5',
    description: 'Антигистаминное средство. Используется для производства противоаллергических препаратов.',
    full_description: 'Фармацевтическая субстанция лоратадина для производства таблеток и сиропов.',
    price: '4900.00',
    molecular_weight: '382.88',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(15, {
    name: 'Сальбутамол',
    cas: '18559-94-9',
    description: 'Бронходилататор. Используется для производства препаратов для лечения астмы и ХОБЛ.',
    full_description: 'Фармацевтическая субстанция сальбутамола сульфата для ингаляторов, таблеток и сиропов.',
    price: '11200.00',
    molecular_weight: '576.70',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
  makeMockSubstance(16, {
    name: 'Карбамазепин',
    cas: '298-46-4',
    description: 'Противосудорожное средство. Используется для производства антиэпилептических препаратов.',
    full_description: 'Фармацевтическая субстанция карбамазепина. Белый или почти белый кристаллический порошок.',
    price: '6200.00',
    molecular_weight: '236.27',
    shelf_life: 36,
    pharmacopoeia: 'USP, EP',
  }),
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
