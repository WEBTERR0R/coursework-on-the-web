import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { substancesApi } from '../api/generated/pharmalabApi'

function getErrorMessage(error, fallback) {
  return error?.response?.data?.error || error?.response?.data?.detail || fallback
}

const initialState = {
  items: [],
  current: null,
  similar: [],
  filters: {
    search: '',
    price_from: '',
    price_to: '',
  },
  status: 'idle',
  currentStatus: 'idle',
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

const substancesSlice = createSlice({
  name: 'substances',
  initialState,
  reducers: {
    setCatalogFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetCatalogFilters(state) {
      state.filters = initialState.filters
    },
    buildSimilarSubstances(state) {
      if (!state.current) {
        state.similar = []
        return
      }

      const textForKeywords = `${state.current.name} ${state.current.description || ''}`.toLowerCase()
      const keywords = textForKeywords.split(/[\s,.\-()]+/).filter((keyword) => keyword.length > 3)

      state.similar = state.items
        .filter((item) => item.id !== state.current.id)
        .map((item) => {
          const name = item.name.toLowerCase()
          const description = (item.description || '').toLowerCase()
          const similarity = keywords.reduce((score, keyword) => {
            return score + (name.includes(keyword) ? 3 : 0) + (description.includes(keyword) ? 1 : 0)
          }, 0)
          return { ...item, similarity }
        })
        .filter((item) => item.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 4)
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
  },
})

export const { buildSimilarSubstances, resetCatalogFilters, setCatalogFilters } = substancesSlice.actions
export default substancesSlice.reducer
