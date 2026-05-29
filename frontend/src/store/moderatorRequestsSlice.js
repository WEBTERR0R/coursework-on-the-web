import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { requestsApi } from '../api/generated/pharmalabApi'

function getErrorMessage(error, fallback) {
  return error?.response?.data?.error || error?.response?.data?.detail || fallback
}

const initialState = {
  items: [],
  filters: {
    formed_from: '',
    formed_to: '',
    status: '',
    creator: '',
  },
  status: 'idle',
  actionStatus: 'idle',
  error: null,
  lastUpdated: null,
}

export const fetchModeratorRequests = createAsyncThunk('moderatorRequests/fetchList', async (filters = {}, { rejectWithValue }) => {
  try {
    const response = await requestsApi.list({
      formed_from: filters.formed_from || undefined,
      formed_to: filters.formed_to || undefined,
      status: filters.status || undefined,
    })
    return response.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка загрузки заявок для модерации'))
  }
})

export const completeRequest = createAsyncThunk('moderatorRequests/complete', async (requestId, { rejectWithValue }) => {
  try {
    const response = await requestsApi.complete(requestId)
    return response.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка завершения заявки'))
  }
})

export const rejectRequest = createAsyncThunk('moderatorRequests/reject', async (requestId, { rejectWithValue }) => {
  try {
    const response = await requestsApi.reject(requestId)
    return response.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка отклонения заявки'))
  }
})

export const deleteRequest = createAsyncThunk('moderatorRequests/delete', async (requestId, { rejectWithValue }) => {
  try {
    await requestsApi.remove(requestId)
    return requestId
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка удаления заявки'))
  }
})

const moderatorRequestsSlice = createSlice({
  name: 'moderatorRequests',
  initialState,
  reducers: {
    setModeratorRequestFilters(state, action) {
      state.filters = { ...state.filters, ...action.payload }
    },
    resetModeratorRequestFilters(state) {
      state.filters = initialState.filters
    },
    clearModeratorRequestError(state) {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    const upsertRequest = (state, request) => {
      const index = state.items.findIndex((item) => item.id === request.id)
      if (index >= 0) {
        state.items[index] = request
      } else {
        state.items.unshift(request)
      }
    }

    builder
      .addCase(fetchModeratorRequests.pending, (state) => {
        if (state.status === 'idle') {
          state.status = 'loading'
        }
        state.error = null
      })
      .addCase(fetchModeratorRequests.fulfilled, (state, action) => {
        state.status = 'idle'
        state.items = action.payload
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(fetchModeratorRequests.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(completeRequest.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(completeRequest.fulfilled, (state, action) => {
        state.actionStatus = 'idle'
        upsertRequest(state, action.payload)
      })
      .addCase(completeRequest.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(rejectRequest.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(rejectRequest.fulfilled, (state, action) => {
        state.actionStatus = 'idle'
        upsertRequest(state, action.payload)
      })
      .addCase(rejectRequest.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
      .addCase(deleteRequest.pending, (state) => {
        state.actionStatus = 'loading'
        state.error = null
      })
      .addCase(deleteRequest.fulfilled, (state, action) => {
        state.actionStatus = 'idle'
        state.items = state.items.filter((request) => request.id !== action.payload)
      })
      .addCase(deleteRequest.rejected, (state, action) => {
        state.actionStatus = 'failed'
        state.error = action.payload
      })
  },
})

export const {
  clearModeratorRequestError,
  resetModeratorRequestFilters,
  setModeratorRequestFilters,
} = moderatorRequestsSlice.actions

export default moderatorRequestsSlice.reducer
