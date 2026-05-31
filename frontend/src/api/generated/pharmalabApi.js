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
    video_url: '',
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

const MOCK_STORAGE_KEYS = {
  users: 'pharmalab:mock:users',
  session: 'pharmalab:mock:session',
  requests: 'pharmalab:mock:requests',
  nextRequestId: 'pharmalab:mock:next-request-id',
  nextItemId: 'pharmalab:mock:next-item-id',
}

function readStorage(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function makeApiError(status, detail) {
  return Promise.reject({
    response: {
      status,
      data: { detail, error: detail },
    },
  })
}

function ensureMockUsers() {
  const users = readStorage(MOCK_STORAGE_KEYS.users, null)
  if (users?.length) {
    if (!users.some((user) => user.username === 'moderator')) {
      users.push({
        id: users.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
        username: 'moderator',
        email: 'moderator@pharmalab.local',
        password: 'moderator123',
        is_moderator: true,
        created_at: new Date().toISOString(),
      })
      writeStorage(MOCK_STORAGE_KEYS.users, users)
    }
    return users
  }

  const seededUsers = [
    {
      id: 1,
      username: 'moderator',
      email: 'moderator@pharmalab.local',
      password: 'moderator123',
      is_moderator: true,
      created_at: new Date().toISOString(),
    },
  ]
  writeStorage(MOCK_STORAGE_KEYS.users, seededUsers)
  return seededUsers
}

function saveMockUsers(users) {
  writeStorage(MOCK_STORAGE_KEYS.users, users)
}

function publicUser(user) {
  if (!user) return null
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    is_moderator: Boolean(user.is_moderator),
    created_at: user.created_at,
  }
}

function getMockUser() {
  const session = readStorage(MOCK_STORAGE_KEYS.session, null)
  if (!session?.userId) return null
  return ensureMockUsers().find((user) => user.id === session.userId) || null
}

function requireMockUser() {
  const user = getMockUser()
  if (!user) return null
  return user
}

function mockOk(data) {
  return Promise.resolve({ data })
}

function nextId(key, initialValue = 1) {
  const current = Number(localStorage.getItem(key) || initialValue)
  localStorage.setItem(key, String(current + 1))
  return current
}

function readMockRequests() {
  return readStorage(MOCK_STORAGE_KEYS.requests, [])
}

function saveMockRequests(requests) {
  writeStorage(MOCK_STORAGE_KEYS.requests, requests)
}

function getMockSubstance(id) {
  return mockSubstances.find((substance) => String(substance.id) === String(id))
}

function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}

function buildMockItem(requestId, substance, quantity, itemId) {
  const numericQuantity = Number(quantity || 1)
  const total = Number(substance.price) * numericQuantity
  return {
    id: itemId,
    request: requestId,
    substance: substance.id,
    substance_name: substance.name,
    substance_cas: substance.cas,
    substance_price: substance.price,
    substance_price_display: substance.price_display,
    substance_image_url: substance.image_url,
    quantity: numericQuantity,
    unit: substance.unit,
    mm_value: `MM-${substance.molecular_weight}`,
    order_number: 1,
    is_main: false,
    item_comment: '',
    calculated_value: formatMoney(total),
    item_total: formatMoney(total),
    item_total_display: `${formatMoney(total)} ₽`,
  }
}

function recalculateMockRequest(request) {
  const activeItems = request.items || []
  request.items = activeItems.map((item, index) => {
    const substance = getMockSubstance(item.substance)
    const total = substance ? Number(substance.price) * Number(item.quantity || 0) : Number(item.item_total || 0)
    return {
      ...item,
      order_number: index + 1,
      calculated_value: formatMoney(total),
      item_total: formatMoney(total),
      item_total_display: `${formatMoney(total)} ₽`,
    }
  })
  request.items_count = request.items.length
  request.total_amount = formatMoney(request.items.reduce((sum, item) => sum + Number(item.item_total || 0), 0))
  return request
}

function serializeMockRequest(request) {
  return recalculateMockRequest({
    ...request,
    items: [...(request.items || [])].sort((a, b) => Number(a.id) - Number(b.id)),
  })
}

function findMockDraft(requests, userId) {
  return requests.find((request) => request.user === userId && request.status === 'draft')
}

function createMockDraft(requests, user) {
  const request = {
    id: nextId(MOCK_STORAGE_KEYS.nextRequestId),
    user: user.id,
    user_username: user.username,
    status: 'draft',
    created_at: new Date().toISOString(),
    formed_at: null,
    completed_at: null,
    moderator: null,
    moderator_username: '',
    total_amount: '0.00',
    delivery_address: '',
    comments: '',
    items: [],
    items_count: 0,
  }
  requests.push(request)
  return request
}

function filteredMockRequests(requests, user, params = {}) {
  let result = user.is_moderator
    ? requests.filter((request) => request.status !== 'deleted')
    : requests.filter((request) => request.user === user.id && request.status !== 'deleted')

  if (params.status) {
    result = result.filter((request) => request.status === params.status)
  }
  if (params.formed_from) {
    result = result.filter((request) => request.formed_at && request.formed_at.slice(0, 10) >= params.formed_from)
  }
  if (params.formed_to) {
    result = result.filter((request) => request.formed_at && request.formed_at.slice(0, 10) <= params.formed_to)
  }

  return result.map(serializeMockRequest).sort((a, b) => Number(b.id) - Number(a.id))
}

function mockRegister(payload) {
  const username = String(payload.username || '').trim()
  const email = String(payload.email || '').trim()
  const password = String(payload.password || '')
  const passwordConfirm = String(payload.password_confirm || payload.passwordConfirm || '')

  if (!username || !email || !password) {
    return makeApiError(400, 'Заполните все поля')
  }
  if (password.length < 6) {
    return makeApiError(400, 'Пароль должен быть не короче 6 символов')
  }
  if (passwordConfirm && password !== passwordConfirm) {
    return makeApiError(400, 'Пароли не совпадают')
  }

  const users = ensureMockUsers()
  if (users.some((user) => user.username.toLowerCase() === username.toLowerCase())) {
    return makeApiError(400, 'Пользователь с таким именем уже существует')
  }
  if (users.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    return makeApiError(400, 'Пользователь с таким email уже существует')
  }

  const user = {
    id: users.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1,
    username,
    email,
    password,
    is_moderator: false,
    created_at: new Date().toISOString(),
  }
  users.push(user)
  saveMockUsers(users)
  return mockOk(publicUser(user))
}

function mockLogin(payload) {
  const username = String(payload.username || '').trim()
  const password = String(payload.password || '')
  const user = ensureMockUsers().find((item) => (
    item.username.toLowerCase() === username.toLowerCase() && item.password === password
  ))
  if (!user) return makeApiError(401, 'Неверное имя пользователя или пароль')
  writeStorage(MOCK_STORAGE_KEYS.session, { userId: user.id })
  return mockOk({ message: 'Успешный вход', user: publicUser(user) })
}

function mockMe() {
  const user = getMockUser()
  return user ? mockOk(publicUser(user)) : unauthorized()
}

function mockLogout() {
  localStorage.removeItem(MOCK_STORAGE_KEYS.session)
  return mockOk({ message: 'Успешный выход' })
}

function mockUpdateProfile(payload) {
  const currentUser = requireMockUser()
  if (!currentUser) return unauthorized()
  const users = ensureMockUsers()
  const userIndex = users.findIndex((user) => user.id === currentUser.id)
  const username = String(payload.username || '').trim()
  const email = String(payload.email || '').trim()

  if (!username || !email) return makeApiError(400, 'Заполните имя пользователя и email')
  if (users.some((user) => user.id !== currentUser.id && user.username.toLowerCase() === username.toLowerCase())) {
    return makeApiError(400, 'Пользователь с таким именем уже существует')
  }
  if (users.some((user) => user.id !== currentUser.id && user.email.toLowerCase() === email.toLowerCase())) {
    return makeApiError(400, 'Пользователь с таким email уже существует')
  }

  users[userIndex] = { ...users[userIndex], username, email }
  saveMockUsers(users)

  const requests = readMockRequests().map((request) => (
    request.user === currentUser.id ? { ...request, user_username: username } : request
  ))
  saveMockRequests(requests)

  return mockOk(publicUser(users[userIndex]))
}

function mockChangePassword(payload) {
  const currentUser = requireMockUser()
  if (!currentUser) return unauthorized()
  const oldPassword = String(payload.old_password || '')
  const newPassword = String(payload.new_password || '')
  const confirm = String(payload.new_password_confirm || '')
  if (currentUser.password !== oldPassword) return makeApiError(400, 'Текущий пароль указан неверно')
  if (newPassword.length < 6) return makeApiError(400, 'Новый пароль должен быть не короче 6 символов')
  if (newPassword !== confirm) return makeApiError(400, 'Новые пароли не совпадают')

  const users = ensureMockUsers()
  const userIndex = users.findIndex((user) => user.id === currentUser.id)
  users[userIndex] = { ...users[userIndex], password: newPassword }
  saveMockUsers(users)
  return mockOk({ message: 'Пароль успешно изменен' })
}

function mockRequestsList(params = {}) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  return mockOk(filteredMockRequests(readMockRequests(), user, params))
}

function mockRequestRetrieve(id) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  const request = readMockRequests().find((item) => String(item.id) === String(id) && item.status !== 'deleted')
  if (!request) return makeApiError(404, 'Заявка не найдена')
  if (!user.is_moderator && request.user !== user.id) return makeApiError(403, 'Нет доступа к заявке')
  return mockOk(serializeMockRequest(request))
}

function mockRequestCreate(payload = {}) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  const requests = readMockRequests()
  if (findMockDraft(requests, user.id)) return makeApiError(400, 'У вас уже есть черновик заявки')
  const request = createMockDraft(requests, user)
  request.delivery_address = payload.delivery_address || ''
  request.comments = payload.comments || ''
  saveMockRequests(requests)
  return mockOk(serializeMockRequest(request))
}

function mockRequestUpdate(id, payload = {}) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  const requests = readMockRequests()
  const request = requests.find((item) => String(item.id) === String(id) && item.status !== 'deleted')
  if (!request) return makeApiError(404, 'Заявка не найдена')
  if (request.user !== user.id && !user.is_moderator) return makeApiError(403, 'Нет доступа к заявке')
  if (request.status !== 'draft') return makeApiError(400, 'Редактировать можно только черновик')
  request.delivery_address = payload.delivery_address ?? request.delivery_address
  request.comments = payload.comments ?? request.comments
  saveMockRequests(requests)
  return mockOk(serializeMockRequest(request))
}

function mockRequestSubmit(id) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  const requests = readMockRequests()
  const request = requests.find((item) => String(item.id) === String(id) && item.status !== 'deleted')
  if (!request) return makeApiError(404, 'Заявка не найдена')
  if (request.user !== user.id) return makeApiError(403, 'Только создатель может сформировать заявку')
  if (request.status !== 'draft') return makeApiError(400, 'Можно сформировать только черновик')
  if (!request.items?.length) return makeApiError(400, 'Добавьте хотя бы одну позицию')
  request.status = 'formed'
  request.formed_at = new Date().toISOString()
  saveMockRequests(requests)
  return mockOk(serializeMockRequest(request))
}

function mockRequestModerate(id, nextStatus) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  if (!user.is_moderator) return makeApiError(403, 'Только модератор может изменить статус заявки')
  const requests = readMockRequests()
  const request = requests.find((item) => String(item.id) === String(id) && item.status !== 'deleted')
  if (!request) return makeApiError(404, 'Заявка не найдена')
  if (request.status !== 'formed') return makeApiError(400, 'Обработать можно только сформированную заявку')
  request.status = nextStatus
  request.completed_at = new Date().toISOString()
  request.moderator = user.id
  request.moderator_username = user.username
  saveMockRequests(requests)
  return mockOk(serializeMockRequest(request))
}

function mockRequestRemove(id) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  if (!user.is_moderator) return makeApiError(403, 'Только модератор может удалить заявку')
  const requests = readMockRequests()
  const request = requests.find((item) => String(item.id) === String(id) && item.status !== 'deleted')
  if (!request) return makeApiError(404, 'Заявка не найдена')
  if (!['completed', 'rejected'].includes(request.status)) {
    return makeApiError(400, 'Удалить можно только завершенную или отклоненную заявку')
  }
  request.status = 'deleted'
  saveMockRequests(requests)
  return mockOk({ message: 'Заявка удалена', request_id: request.id })
}

function mockCart() {
  const user = requireMockUser()
  if (!user) return mockOk({ request_id: null, items_count: 0 })
  const draft = findMockDraft(readMockRequests(), user.id)
  return mockOk({
    request_id: draft?.id || null,
    items_count: draft?.items?.length || 0,
  })
}

function mockItemCreate(payload) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  const substance = getMockSubstance(payload.substance)
  if (!substance) return makeApiError(404, 'Субстанция не найдена')
  const quantity = Number(payload.quantity || 1)
  if (!Number.isFinite(quantity) || quantity <= 0) return makeApiError(400, 'Количество должно быть больше нуля')

  const requests = readMockRequests()
  const draft = findMockDraft(requests, user.id) || createMockDraft(requests, user)
  const existingItem = draft.items.find((item) => String(item.substance) === String(substance.id))

  if (existingItem) {
    existingItem.quantity = Number(existingItem.quantity || 0) + quantity
  } else {
    draft.items.push(buildMockItem(draft.id, substance, quantity, nextId(MOCK_STORAGE_KEYS.nextItemId)))
  }

  recalculateMockRequest(draft)
  saveMockRequests(requests)
  const savedItem = draft.items.find((item) => String(item.substance) === String(substance.id))
  return mockOk({
    item: savedItem,
    request_id: draft.id,
    items_count: draft.items.length,
    total_amount: Number(draft.total_amount),
  })
}

function mockItemUpdate(id, payload) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  const quantity = Number(payload.quantity)
  if (!Number.isFinite(quantity) || quantity <= 0) return makeApiError(400, 'Количество должно быть больше нуля')

  const requests = readMockRequests()
  const request = requests.find((item) => item.items?.some((requestItem) => String(requestItem.id) === String(id)))
  if (!request) return makeApiError(404, 'Позиция не найдена')
  if (request.user !== user.id) return makeApiError(403, 'Нельзя изменять чужие заявки')
  if (request.status !== 'draft') return makeApiError(400, 'Нельзя изменять позиции в не черновой заявке')

  const item = request.items.find((requestItem) => String(requestItem.id) === String(id))
  item.quantity = quantity
  recalculateMockRequest(request)
  saveMockRequests(requests)
  return mockOk({
    item,
    request_id: request.id,
    items_count: request.items.length,
    total_amount: Number(request.total_amount),
  })
}

function mockItemRemove(id) {
  const user = requireMockUser()
  if (!user) return unauthorized()
  const requests = readMockRequests()
  const request = requests.find((item) => item.items?.some((requestItem) => String(requestItem.id) === String(id)))
  if (!request) return makeApiError(404, 'Позиция не найдена')
  if (request.user !== user.id) return makeApiError(403, 'Нельзя изменять чужие заявки')
  if (request.status !== 'draft') return makeApiError(400, 'Нельзя удалять позиции из не черновой заявки')

  request.items = request.items.filter((requestItem) => String(requestItem.id) !== String(id))
  recalculateMockRequest(request)
  saveMockRequests(requests)
  return mockOk({
    message: 'Позиция удалена из заявки',
    request_id: request.id,
    items_count: request.items.length,
    total_amount: Number(request.total_amount),
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
  register: (payload) => (IS_MOCK_MODE ? mockRegister(payload) : apiClient.post('/auth/register/', payload)),
  login: (payload) => (IS_MOCK_MODE ? mockLogin(payload) : apiClient.post('/auth/login/', payload)),
  logout: () => (IS_MOCK_MODE ? mockLogout() : apiClient.post('/auth/logout/')),
  me: () => (IS_MOCK_MODE ? mockMe() : apiClient.get('/auth/me/')),
  updateProfile: (payload) => (IS_MOCK_MODE ? mockUpdateProfile(payload) : apiClient.patch('/auth/profile/', payload)),
  changePassword: (payload) => (IS_MOCK_MODE ? mockChangePassword(payload) : apiClient.post('/auth/change-password/', payload)),
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
  list: (params = {}) => (IS_MOCK_MODE ? mockRequestsList(params) : apiClient.get('/requests/', { params }).then((response) => ({
    ...response,
    data: normalizeList(response.data),
  }))),
  retrieve: (id) => (IS_MOCK_MODE ? mockRequestRetrieve(id) : apiClient.get(`/requests/${id}/`)),
  create: (payload) => (IS_MOCK_MODE ? mockRequestCreate(payload) : apiClient.post('/requests/', payload)),
  update: (id, payload) => (IS_MOCK_MODE ? mockRequestUpdate(id, payload) : apiClient.patch(`/requests/${id}/`, payload)),
  submit: (id) => (IS_MOCK_MODE ? mockRequestSubmit(id) : apiClient.put(`/requests/${id}/submit/`)),
  complete: (id) => (IS_MOCK_MODE ? mockRequestModerate(id, 'completed') : apiClient.put(`/requests/${id}/complete/`)),
  reject: (id) => (IS_MOCK_MODE ? mockRequestModerate(id, 'rejected') : apiClient.put(`/requests/${id}/reject/`)),
  remove: (id) => (IS_MOCK_MODE ? mockRequestRemove(id) : apiClient.delete(`/requests/${id}/`)),
  cart: () => (IS_MOCK_MODE ? mockCart() : apiClient.get('/requests/cart/')),
}

export const requestItemsApi = {
  create: (payload) => (IS_MOCK_MODE ? mockItemCreate(payload) : apiClient.post('/request-items/', payload)),
  update: (id, payload) => (IS_MOCK_MODE ? mockItemUpdate(id, payload) : apiClient.patch(`/request-items/${id}/`, payload)),
  remove: (id) => (IS_MOCK_MODE ? mockItemRemove(id) : apiClient.delete(`/request-items/${id}/`)),
}
