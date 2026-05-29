import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart } from '../store/cartSlice'

function CartPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const cart = useSelector((state) => state.cart)
  const user = useSelector((state) => state.auth.user)

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/cart' },
          authMessage: 'Войдите, чтобы открыть корзину',
        },
      })
      return
    }

    dispatch(fetchCart()).then((result) => {
      const requestId = result.payload?.request_id
      if (requestId) {
        navigate(`/requests/${requestId}`, { replace: true })
      }
    })
  }, [dispatch, navigate, user])

  if (cart.status === 'loading') {
    return (
      <main className="main-container">
        <h1 className="page-title">Корзина</h1>
        <div className="loader-block">Загрузка корзины...</div>
      </main>
    )
  }

  return (
    <main className="main-container">
      <h1 className="page-title">Корзина</h1>
      <div className="empty-cart-message" style={{ textAlign: 'center', padding: '3rem' }}>
        <p>Корзина пуста</p>
        <Link to="/" className="add-to-request-btn" style={{ display: 'inline-block', width: 'auto', marginTop: '1rem' }}>
          Перейти в каталог
        </Link>
      </div>
    </main>
  )
}

export default CartPage
