import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { requestsApi } from '../api/generated/pharmalabApi'

function getErrorMessage(error, fallback) {
  return error?.response?.data?.error || error?.response?.data?.detail || fallback
}

function sortRequestItems(items = []) {
  return [...items].sort((a, b) => {
    const firstId = Number(a.id)
    const secondId = Number(b.id)

    if (Number.isFinite(firstId) && Number.isFinite(secondId)) {
      return firstId - secondId
    }

    return String(a.id).localeCompare(String(b.id))
  })
}

function normalizeRequest(request) {
  if (!request) return request
  return {
    ...request,
    items: sortRequestItems(request.items),
  }
}

const initialState = {
  items: [],
  current: null,
  filters: {
    formed_from: '',
    formed_to: '',
    status: '',
  },
  status: 'idle',
  currentStatus: 'idle',
  error: null,
}

export const fetchRequests = createAsyncThunk('requests/fetchList', async (filters = {}, { rejectWithValue }) => {
  try {
    const response = await requestsApi.list({
      formed_from: filters.formed_from || undefined,
      formed_to: filters.formed_to || undefined,
      status: filters.status || undefined,
    })
    return response.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки заявок'))
  }
})

export const fetchRequestById = createAsyncThunk('requests/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await requestsApi.retrieve(id)
    return normalizeRequest(response.data)
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки заявки'))
  }
})

const requestsSlice = createSlice({
  name: 'requests',
  initialState,
  reducers: {
    setRequestFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetRequestFilters(state) {
      state.filters = initialState.filters
    },
    clearCurrentRequest(state) {
      state.current = null
      state.currentStatus = 'idle'
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRequests.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchRequests.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items = action.payload
      })
      .addCase(fetchRequests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchRequestById.pending, (state) => {
        state.currentStatus = 'loading'
        state.error = null
      })
      .addCase(fetchRequestById.fulfilled, (state, action) => {
        state.currentStatus = 'idle'
        state.current = action.payload
      })
      .addCase(fetchRequestById.rejected, (state, action) => {
        state.currentStatus = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearCurrentRequest, resetRequestFilters, setRequestFilters } = requestsSlice.actions
export default requestsSlice.reducer
