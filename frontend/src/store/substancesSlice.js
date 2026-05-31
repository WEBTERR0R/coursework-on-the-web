import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { API_BASE_URL, substancesApi } from '../api/generated/pharmalabApi'
import { findSimilarSubstances } from '../services/embeddings'

function getErrorMessage(error, fallback) {
  if (!error?.response && error?.message) {
    return `${fallback}. API недоступен: ${API_BASE_URL}`
  }
  return error?.response?.data?.error || error?.response?.data?.detail || fallback
}

const FILTERS_STORAGE_KEY = 'pharmalab.catalogFilters'

const defaultFilters = {
  search: '',
  price_from: '',
  price_to: '',
}

function loadSavedFilters() {
  if (typeof window === 'undefined') return defaultFilters

  try {
    const saved = window.localStorage.getItem(FILTERS_STORAGE_KEY)
    if (!saved) return defaultFilters
    const parsed = JSON.parse(saved)
    return {
      search: parsed.search || '',
      price_from: parsed.price_from || '',
      price_to: parsed.price_to || '',
    }
  } catch {
    return defaultFilters
  }
}

function saveFilters(filters) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(FILTERS_STORAGE_KEY, JSON.stringify(filters))
}

const initialState = {
  items: [],
  current: null,
  similar: [],
  filters: loadSavedFilters(),
  status: 'idle',
  currentStatus: 'idle',
  similarStatus: 'idle',
  error: null,
}

export const fetchSubstances = createAsyncThunk('substances/fetchList', async (filters = {}, { rejectWithValue }) => {
  try {
    const response = await substancesApi.list({
      search: filters.search || undefined,
      price_from: filters.price_from || undefined,
      price_to: filters.price_to || undefined,
    })
    return response.data?.results || response.data || []
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки каталога'))
  }
})

export const fetchSubstance = createAsyncThunk('substances/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const response = await substancesApi.retrieve(id)
    return response.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки товара'))
  }
})

export const buildSimilarSubstances = createAsyncThunk(
  'substances/buildSimilar',
  async (_, { getState }) => {
    const { current, items } = getState().substances
    return findSimilarSubstances(current, items)
  },
)

const substancesSlice = createSlice({
  name: 'substances',
  initialState,
  reducers: {
    setCatalogFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
      saveFilters(state.filters)
    },
    resetCatalogFilters(state) {
      state.filters = defaultFilters
      saveFilters(defaultFilters)
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubstances.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchSubstances.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items = action.payload
        state.error = null
      })
      .addCase(fetchSubstances.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(fetchSubstance.pending, (state) => {
        state.currentStatus = 'loading'
        state.current = null
        state.error = null
      })
      .addCase(fetchSubstance.fulfilled, (state, action) => {
        state.currentStatus = 'idle'
        state.current = action.payload
        state.error = null
      })
      .addCase(fetchSubstance.rejected, (state, action) => {
        state.currentStatus = 'failed'
        state.error = action.payload
      })
      .addCase(buildSimilarSubstances.pending, (state) => {
        state.similarStatus = 'loading'
      })
      .addCase(buildSimilarSubstances.fulfilled, (state, action) => {
        state.similarStatus = 'idle'
        state.similar = action.payload
      })
      .addCase(buildSimilarSubstances.rejected, (state) => {
        state.similarStatus = 'failed'
        state.similar = []
      })
  },
})

export const { resetCatalogFilters, setCatalogFilters } = substancesSlice.actions
export default substancesSlice.reducer
