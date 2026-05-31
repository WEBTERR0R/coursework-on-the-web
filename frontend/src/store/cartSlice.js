import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { requestItemsApi, requestsApi } from '../api/generated/pharmalabApi'

export const CART_UPDATED_EVENT = 'pharmalab:cart-updated'

function notifyCartUpdated(detail = {}) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT, { detail }))
  }
}

function normalizeCart(request) {
  const items = [...(request?.items || [])].sort((a, b) => {
    const firstId = Number(a.id)
    const secondId = Number(b.id)

    if (Number.isFinite(firstId) && Number.isFinite(secondId)) {
      return firstId - secondId
    }

    return String(a.id).localeCompare(String(b.id))
  })
  const totalQuantity = items.reduce((sum, item) => {
    const quantity = Number(item.quantity)
    return sum + (Number.isFinite(quantity) ? quantity : 0)
  }, 0)

  return {
    request_id: request?.id || null,
    items,
    items_count: items.length,
    total_quantity: totalQuantity,
    total_amount: request?.total_amount || 0,
    request_status: request?.status || null,
    delivery_address: request?.delivery_address || '',
    comments: request?.comments || '',
  }
}

function emptyCart() {
  return normalizeCart(null)
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data
  return data?.error || data?.detail || fallback
}

async function fetchDraftCart() {
  const cartResponse = await requestsApi.cart()
  const requestId = cartResponse.data?.request_id
  if (!requestId) return emptyCart()
  const requestResponse = await requestsApi.retrieve(requestId)
  return normalizeCart(requestResponse.data)
}

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue }) => {
  try {
    return await fetchDraftCart()
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return emptyCart()
    }
    return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки корзины'))
  }
})

export const addItemToCart = createAsyncThunk('cart/addItem', async ({ substanceId, quantity = 1 }, { rejectWithValue }) => {
  try {
    await requestItemsApi.create({ substance: substanceId, quantity })
    const cart = await fetchDraftCart()
    notifyCartUpdated(cart)
    return cart
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return rejectWithValue('Необходима авторизация')
    }
    return rejectWithValue(getErrorMessage(error, 'Ошибка добавления в корзину'))
  }
})

export const updateCartItemQuantity = createAsyncThunk('cart/updateItemQuantity', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    await requestItemsApi.update(itemId, { quantity })
    const cart = await fetchDraftCart()
    notifyCartUpdated(cart)
    return cart
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка обновления количества'))
  }
})

export const removeCartItem = createAsyncThunk('cart/removeItem', async (itemId, { rejectWithValue }) => {
  try {
    await requestItemsApi.remove(itemId)
    const cart = await fetchDraftCart()
    notifyCartUpdated(cart)
    return cart
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка удаления позиции'))
  }
})

export const updateDraftRequest = createAsyncThunk('cart/updateDraftRequest', async ({ requestId, payload }, { rejectWithValue }) => {
  try {
    await requestsApi.update(requestId, payload)
    const cart = await fetchDraftCart()
    notifyCartUpdated(cart)
    return cart
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка сохранения заявки'))
  }
})

export const submitDraftRequest = createAsyncThunk('cart/submitDraftRequest', async ({ requestId, payload }, { rejectWithValue }) => {
  try {
    if (payload) {
      await requestsApi.update(requestId, payload)
    }
    const response = await requestsApi.submit(requestId)
    notifyCartUpdated(emptyCart())
    return response.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка формирования заявки'))
  }
})

const initialState = {
  ...emptyCart(),
  status: 'idle',
  error: null,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart(state) {
      Object.assign(state, emptyCart(), { status: 'idle', error: null })
    },
    clearCartError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state) => {
      state.status = 'loading'
      state.error = null
    }
    const setCart = (state, action) => {
      Object.assign(state, action.payload, { status: 'idle', error: null })
    }
    const setError = (state, action) => {
      state.status = 'failed'
      state.error = action.payload
    }

    builder
      .addCase(fetchCart.pending, setLoading)
      .addCase(fetchCart.fulfilled, setCart)
      .addCase(fetchCart.rejected, setError)
      .addCase(addItemToCart.pending, setLoading)
      .addCase(addItemToCart.fulfilled, setCart)
      .addCase(addItemToCart.rejected, setError)
      .addCase(updateCartItemQuantity.pending, setLoading)
      .addCase(updateCartItemQuantity.fulfilled, setCart)
      .addCase(updateCartItemQuantity.rejected, setError)
      .addCase(removeCartItem.pending, setLoading)
      .addCase(removeCartItem.fulfilled, setCart)
      .addCase(removeCartItem.rejected, setError)
      .addCase(updateDraftRequest.pending, setLoading)
      .addCase(updateDraftRequest.fulfilled, setCart)
      .addCase(updateDraftRequest.rejected, setError)
      .addCase(submitDraftRequest.pending, setLoading)
      .addCase(submitDraftRequest.fulfilled, (state) => {
        Object.assign(state, emptyCart(), { status: 'idle', error: null })
      })
      .addCase(submitDraftRequest.rejected, setError)
  },
})

export const { clearCart, clearCartError } = cartSlice.actions
export default cartSlice.reducer
