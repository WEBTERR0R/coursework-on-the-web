import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { authApi } from '../api/generated/pharmalabApi'

const initialState = {
  user: null,
  status: 'idle',
  error: null,
  message: null,
  initialized: false,
}

function getErrorMessage(error, fallback) {
  const data = error?.response?.data
  if (typeof data === 'string') return data
  if (data?.error) return data.error
  if (data?.detail) return data.detail
  if (Array.isArray(data?.non_field_errors)) return data.non_field_errors[0]
  if (data && typeof data === 'object') {
    const firstValue = Object.values(data)[0]
    if (Array.isArray(firstValue)) return firstValue[0]
    if (typeof firstValue === 'string') return firstValue
  }
  return fallback
}

function persistUser(user) {
  if (user) {
    localStorage.setItem('user', JSON.stringify(user))
    localStorage.setItem('isAuthenticated', 'true')
  } else {
    localStorage.removeItem('user')
    localStorage.removeItem('isAuthenticated')
  }
}

export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { rejectWithValue }) => {
  try {
    const response = await authApi.me()
    return response.data
  } catch (error) {
    if (error?.response?.status === 401 || error?.response?.status === 403) {
      return null
    }
    return rejectWithValue(getErrorMessage(error, 'Ошибка проверки сессии'))
  }
})

export const loginUser = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.login(payload)
    return response.data.user
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Неверное имя пользователя или пароль'))
  }
})

export const registerUser = createAsyncThunk('auth/register', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.register(payload)
    return response.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка регистрации'))
  }
})

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  try {
    await authApi.logout()
  } catch {
    // чистим интерфейс даже если сервер уже сбросил сессию
  }
})

export const updateProfile = createAsyncThunk('auth/updateProfile', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.updateProfile(payload)
    return response.data
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка сохранения профиля'))
  }
})

export const changePassword = createAsyncThunk('auth/changePassword', async (payload, { rejectWithValue }) => {
  try {
    const response = await authApi.changePassword(payload)
    return response.data.message || 'Пароль обновлен'
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Ошибка смены пароля'))
  }
})

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearAuthMessage(state) {
      state.error = null
      state.message = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.status = 'idle'
        state.initialized = true
        state.user = action.payload
        persistUser(action.payload)
      })
      .addCase(bootstrapAuth.rejected, (state, action) => {
        state.status = 'failed'
        state.initialized = true
        state.error = action.payload
        state.user = null
        persistUser(null)
      })
      .addCase(loginUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
        state.message = 'Вход выполнен'
        persistUser(action.payload)
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(registerUser.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.status = 'idle'
        state.message = 'Регистрация успешна'
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null
        state.status = 'idle'
        state.error = null
        state.message = null
        persistUser(null)
      })
      .addCase(updateProfile.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = 'idle'
        state.user = action.payload
        state.message = 'Профиль сохранен'
        persistUser(action.payload)
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(changePassword.pending, (state) => {
        state.status = 'loading'
        state.error = null
        state.message = null
      })
      .addCase(changePassword.fulfilled, (state, action) => {
        state.status = 'idle'
        state.message = action.payload
      })
      .addCase(changePassword.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
  },
})

export const { clearAuthMessage } = authSlice.actions
export default authSlice.reducer
