import { configureStore } from '@reduxjs/toolkit'
import authReducer, { logoutUser } from './authSlice'
import cartReducer, { clearCart } from './cartSlice'
import moderatorRequestsReducer, { resetModeratorRequestFilters } from './moderatorRequestsSlice'
import requestsReducer, { resetRequestFilters } from './requestsSlice'
import substancesReducer, { resetCatalogFilters } from './substancesSlice'

const resetOnLogoutMiddleware = (store) => (next) => (action) => {
  const result = next(action)

  if (action.type === logoutUser.fulfilled.type) {
    store.dispatch(clearCart())
    store.dispatch(resetCatalogFilters())
    store.dispatch(resetModeratorRequestFilters())
    store.dispatch(resetRequestFilters())
  }

  return result
}

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    moderatorRequests: moderatorRequestsReducer,
    requests: requestsReducer,
    substances: substancesReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(resetOnLogoutMiddleware),
})
