// src/services/api.js

const API_BASE_URL = '/api'
const USE_MOCK = false

// Получить список субстанций с фильтрацией
export async function getSubstances(search = '', priceFrom = '', priceTo = '') {
  if (USE_MOCK) {
    const mockSubstances = [
      { id: 1, name: 'Парацетамол', cas: '103-90-2', price: '4500.00', price_display: '4 500 ₽/кг', description: 'Анальгетик и антипиретик', image_url: 'https://via.placeholder.com/300x200/0b3b5f/ffffff?text=Paracetamol', molecular_weight: '151.16', is_active: true },
      { id: 2, name: 'Ацетилсалициловая кислота', cas: '50-78-2', price: '3800.00', price_display: '3 800 ₽/кг', description: 'НПВС, антиагрегант', image_url: 'https://via.placeholder.com/300x200/2c7a4d/ffffff?text=Aspirin', molecular_weight: '180.16', is_active: true },
      { id: 3, name: 'Ибупрофен', cas: '15687-27-1', price: '5200.00', price_display: '5 200 ₽/кг', description: 'НПВС, анальгетик', image_url: 'https://via.placeholder.com/300x200/1e5a7d/ffffff?text=Ibuprofen', molecular_weight: '206.28', is_active: true },
      { id: 4, name: 'Амоксициллин', cas: '26787-78-0', price: '8500.00', price_display: '8 500 ₽/кг', description: 'Антибиотик', image_url: 'https://via.placeholder.com/300x200/072c46/ffffff?text=Amoxicillin', molecular_weight: '365.40', is_active: true },
      { id: 5, name: 'Омепразол', cas: '73590-58-6', price: '9800.00', price_display: '9 800 ₽/кг', description: 'Ингибитор протонной помпы', image_url: 'https://via.placeholder.com/300x200/334155/ffffff?text=Omeprazole', molecular_weight: '345.42', is_active: true },
      { id: 6, name: 'Лозартан калия', cas: '114798-26-4', price: '7200.00', price_display: '7 200 ₽/кг', description: 'Блокатор рецепторов', image_url: 'https://via.placeholder.com/300x200/0f172a/ffffff?text=Losartan', molecular_weight: '422.91', is_active: true },
    ]
    let substances = [...mockSubstances]
    if (search) {
      substances = substances.filter(s => 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.cas.includes(search)
      )
    }
    if (priceFrom) {
      substances = substances.filter(s => parseFloat(s.price) >= parseFloat(priceFrom))
    }
    if (priceTo) {
      substances = substances.filter(s => parseFloat(s.price) <= parseFloat(priceTo))
    }
    return substances
  }
  
  const params = new URLSearchParams()
  if (search) params.append('search', search)
  if (priceFrom) params.append('price_from', priceFrom)
  if (priceTo) params.append('price_to', priceTo)
  
  const url = params.toString() 
    ? `${API_BASE_URL}/substances/?${params.toString()}`
    : `${API_BASE_URL}/substances/`
    
  const response = await fetch(url, { credentials: 'include' })
  if (!response.ok) throw new Error('Ошибка загрузки субстанций')
  const data = await response.json()
  return data.results || data
}

// Получить одну субстанцию
export async function getSubstance(id) {
  if (USE_MOCK) {
    const mockSubstances = [
      { id: 1, name: 'Парацетамол', cas: '103-90-2', price: '4500.00', price_display: '4 500 ₽/кг', description: 'Анальгетик и антипиретик', image_url: 'https://via.placeholder.com/300x200/0b3b5f/ffffff?text=Paracetamol', molecular_weight: '151.16', is_active: true },
      { id: 2, name: 'Ацетилсалициловая кислота', cas: '50-78-2', price: '3800.00', price_display: '3 800 ₽/кг', description: 'НПВС, антиагрегант', image_url: 'https://via.placeholder.com/300x200/2c7a4d/ffffff?text=Aspirin', molecular_weight: '180.16', is_active: true },
    ]
    const substance = mockSubstances.find(s => s.id === parseInt(id))
    if (!substance) throw new Error('Субстанция не найдена')
    return substance
  }
  
  const response = await fetch(`${API_BASE_URL}/substances/${id}/`, { credentials: 'include' })
  if (!response.ok) throw new Error('Ошибка загрузки субстанции')
  return response.json()
}

// Получить корзину
export async function getCart() {
  if (USE_MOCK) {
    return { request_id: 35, items_count: 0, items: [], total_amount: 0 }
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/requests/cart/`, { credentials: 'include' })
    if (response.status === 401) {
      return { request_id: null, items_count: 0, items: [], total_amount: 0 }
    }
    const cartData = await response.json()
    
    if (cartData.request_id) {
      const requestResponse = await fetch(`${API_BASE_URL}/requests/${cartData.request_id}/`, { credentials: 'include' })
      if (requestResponse.ok) {
        const requestData = await requestResponse.json()
        return {
          request_id: cartData.request_id,
          items_count: requestData.items?.length || 0,
          items: requestData.items || [],
          total_amount: requestData.total_amount || 0
        }
      }
    }
    
    return { request_id: null, items_count: 0, items: [], total_amount: 0 }
  } catch (error) {
    console.error('Ошибка загрузки корзины:', error)
    return { request_id: null, items_count: 0, items: [], total_amount: 0 }
  }
}

// Добавить в заявку
export async function addToRequest(substanceId, quantity = 1) {
  if (USE_MOCK) {
    return { success: true, request_id: 35, items_count: 1, total_amount: 4500 }
  }
  
  const response = await fetch(`${API_BASE_URL}/request-items/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ substance: substanceId, quantity: parseInt(quantity, 10) }),
    credentials: 'include',
  })
  
  if (response.status === 401) throw new Error('Необходима авторизация')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Ошибка добавления в заявку')
  }
  
  const data = await response.json()
  return data
}

// Удалить из заявки
export async function removeFromRequest(itemId) {
  if (USE_MOCK) {
    return { success: true, request_id: 35, items_count: 0, total_amount: 0 }
  }
  
  const response = await fetch(`${API_BASE_URL}/request-items/${itemId}/`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Ошибка удаления')
  }
  
  const data = await response.json()
  return data
}

// Обновить количество
export async function updateRequestItemQuantity(itemId, quantity) {
  if (USE_MOCK) {
    return { success: true, request_id: 35, items_count: 1, total_amount: 4500 }
  }
  
  const intQuantity = parseInt(quantity, 10)
  
  const response = await fetch(`${API_BASE_URL}/request-items/${itemId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity: intQuantity }),
    credentials: 'include',
  })
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Ошибка обновления')
  }
  
  const data = await response.json()
  return data
}

// Получить текущего пользователя
export async function getCurrentUser() {
  if (USE_MOCK) {
    const user = localStorage.getItem('user')
    if (user) return JSON.parse(user)
    return null
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me/`, { credentials: 'include' })
    if (response.ok) return response.json()
    return null
  } catch {
    return null
  }
}