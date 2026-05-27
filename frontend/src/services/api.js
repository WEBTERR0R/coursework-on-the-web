// Базовый URL
const API_BASE_URL = '/api'

// Получить список субстанций
export async function getSubstances(search = '') {
  const url = search ? `${API_BASE_URL}/substances/?search=${encodeURIComponent(search)}` : `${API_BASE_URL}/substances/`
  const response = await fetch(url, { credentials: 'include' })
  const data = await response.json()
  return data.results || data
}

// Получить одну субстанцию
export async function getSubstance(id) {
  const response = await fetch(`${API_BASE_URL}/substances/${id}/`, { credentials: 'include' })
  return response.json()
}

// Получить корзину (заявку-черновик)
export async function getCart() {
  try {
    const response = await fetch(`${API_BASE_URL}/requests/cart/`, { credentials: 'include' })
    if (response.status === 401) return { request_id: null, items_count: 0, items: [], total_amount: 0 }
    const data = await response.json()
    
    if (data.request_id) {
      const requestResponse = await fetch(`${API_BASE_URL}/requests/${data.request_id}/`, { credentials: 'include' })
      if (requestResponse.ok) {
        const requestData = await requestResponse.json()
        return {
          ...data,
          items: requestData.items || [],
          total_amount: requestData.total_amount || 0
        }
      }
    }
    return { ...data, items: [], total_amount: 0 }
  } catch (error) {
    return { request_id: null, items_count: 0, items: [], total_amount: 0 }
  }
}

// Добавить в заявку
export async function addToRequest(substanceId, quantity = 1) {
  const response = await fetch(`${API_BASE_URL}/request-items/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ substance: substanceId, quantity }),
    credentials: 'include',
  })
  if (response.status === 401) throw new Error('Необходима авторизация')
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Ошибка добавления')
  }
  const data = await response.json()
  return data
}

// Удалить позицию из заявки (по ID позиции)
export async function removeFromRequest(itemId) {
  const response = await fetch(`${API_BASE_URL}/request-items/${itemId}/`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Ошибка удаления')
  const data = await response.json()
  return data  // Возвращает { message, request_id, items_count, total_amount }
}

// Обновить количество (по ID позиции)
export async function updateRequestItemQuantity(itemId, quantity) {
  const response = await fetch(`${API_BASE_URL}/request-items/${itemId}/`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ quantity }),
    credentials: 'include',
  })
  if (!response.ok) throw new Error('Ошибка обновления')
  const data = await response.json()
  return data  // Возвращает { item, request_id, items_count, total_amount }
}

// Получить текущего пользователя
export async function getCurrentUser() {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me/`, { credentials: 'include' })
    if (response.ok) return response.json()
    return null
  } catch {
    return null
  }
}