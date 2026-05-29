import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { bootstrapAuth, logoutUser } from '../store/authSlice'
import { CART_UPDATED_EVENT, fetchCart } from '../store/cartSlice'

function CartIcon() {
  return (
    <svg className="cart-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6.2 6.5h15.1l-1.7 8.1a2 2 0 0 1-2 1.6H8.8a2 2 0 0 1-2-1.6L5.2 3.8H2.8" />
      <path d="M9.2 20.2h.1" />
      <path d="M17.2 20.2h.1" />
    </svg>
  )
}

function getCartBadgeCount(cart) {
  return cart.total_quantity ?? cart.items_count ?? 0
}

function formatCartCount(count) {
  const amount = Number(count)
  if (!Number.isFinite(amount)) return '0'
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2)
}

function AppNavbar() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const authInitialized = useSelector((state) => state.auth.initialized)
  const cart = useSelector((state) => state.cart)
  const cartCount = getCartBadgeCount(cart)

  useEffect(() => {
    dispatch(bootstrapAuth()).then(() => {
      dispatch(fetchCart())
    })
  }, [dispatch])

  useEffect(() => {
    const handleCartUpdated = () => {
      dispatch(fetchCart())
    }

    window.addEventListener(CART_UPDATED_EVENT, handleCartUpdated)

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, handleCartUpdated)
    }
  }, [dispatch])

  const handleLogout = () => {
    dispatch(logoutUser()).then(() => {
      navigate('/')
    })
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">PharmaLab</Link>
        <nav className="main-nav">
          <Link to="/" className="nav-link">Каталог</Link>
          {user && <Link to="/requests" className="nav-link">Мои заявки</Link>}
          {user?.is_moderator && <Link to="/moderator/requests" className="nav-link">Модерация</Link>}
          {user && <Link to="/profile" className="nav-link">Личный кабинет</Link>}
        </nav>
      </div>
      <div className="header-right">
        <Link to="/cart" className="cart-link" aria-label={`Корзина: ${formatCartCount(cartCount)}`}>
          <CartIcon />
          {cartCount > 0 && <span className="cart-count">{formatCartCount(cartCount)}</span>}
        </Link>
        {user ? (
          <div className="user-menu">
            <Link to="/profile" className="user-name">{user.username}</Link>
            <button onClick={handleLogout} className="logout-btn">
              Выйти
            </button>
          </div>
        ) : (
          authInitialized && <Link to="/login" className="nav-link">Войти</Link>
        )}
      </div>
    </header>
  )
}

export default AppNavbar
