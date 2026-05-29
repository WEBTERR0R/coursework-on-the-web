import { authApi, requestItemsApi, requestsApi, substancesApi } from '../api/generated/pharmalabApi'
import { CART_UPDATED_EVENT } from '../store/cartSlice'

function notifyCartUpdated(detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail }))
  }
}

function getTotalQuantity(items = []) {
  return items.reduce((total, item) => {
    const quantity = Number(item.quantity)
    return total + (Number.isFinite(quantity) ? quantity : 0)
  }, 0)
}

export async function getSubstances(search = '', priceFrom = '', priceTo = '') {
  const response = await substancesApi.list({
    search: search || undefined,
    price_from: priceFrom || undefined,
    price_to: priceTo || undefined,
  })
  return response.data?.results || response.data || []
}

export async function getSubstance(id) {
  const response = await substancesApi.retrieve(id)
  return response.data
}

export async function getCart() {
  try {
    const cartResponse = await requestsApi.cart()
    const requestId = cartResponse.data?.request_id
    if (!requestId) {
      return { request_id: null, items_count: 0, total_quantity: 0, items: [], total_amount: 0 }
    }

    const requestResponse = await requestsApi.retrieve(requestId)
    const items = requestResponse.data?.items || []
    return {
      request_id: requestId,
      items_count: items.length,
      total_quantity: getTotalQuantity(items),
      items,
      total_amount: requestResponse.data?.total_amount || 0,
    }
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return { request_id: null, items_count: 0, total_quantity: 0, items: [], total_amount: 0 }
    }
    throw error
  }
}

export async function addToRequest(substanceId, quantity = 1) {
  try {
    const response = await requestItemsApi.create({ substance: substanceId, quantity: parseInt(quantity, 10) })
    notifyCartUpdated(response.data)
    return response.data
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      throw new Error('Необходима авторизация', { cause: error })
    }
    throw new Error(error?.response?.data?.error || 'Ошибка добавления в заявку', { cause: error })
  }
}

export async function removeFromRequest(itemId) {
  const response = await requestItemsApi.remove(itemId)
  notifyCartUpdated(response.data)
  return response.data
}

export async function updateRequestItemQuantity(itemId, quantity) {
  const response = await requestItemsApi.update(itemId, { quantity: parseInt(quantity, 10) })
  notifyCartUpdated(response.data)
  return response.data
}

export async function getCurrentUser() {
  try {
    const response = await authApi.me()
    return response.data
  } catch {
    return null
  }
}
