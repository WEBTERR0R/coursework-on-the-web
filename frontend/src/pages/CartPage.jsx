import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCart, removeFromRequest, updateRequestItemQuantity } from '../services/api'

function CartPage() {
  const [cart, setCart] = useState({ items: [], items_count: 0, total_amount: 0, request_id: null })
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const navigate = useNavigate()

  const loadCart = useCallback(async () => {
    setLoading(true)
    try {
      const cartData = await getCart()
      setCart({
        items: cartData.items || [],
        items_count: cartData.items_count || 0,
        total_amount: cartData.total_amount || 0,
        request_id: cartData.request_id || null
      })
    } catch (error) {
      console.error('Ошибка загрузки корзины', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCart()
  }, [loadCart])

  const handleRemove = async (itemId) => {
    if (updating) return
    setUpdating(true)
    try {
      const result = await removeFromRequest(itemId)
      // Обновляем состояние корзины на основе ответа сервера
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        items_count: result.items_count || prev.items_count - 1,
        total_amount: result.total_amount || 0
      }))
    } catch (error) {
      console.error('Ошибка удаления', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleQuantityChange = async (itemId, newQuantity) => {
    if (newQuantity < 1 || updating) return
    setUpdating(true)
    try {
      const result = await updateRequestItemQuantity(itemId, newQuantity)
      // Обновляем состояние корзины на основе ответа сервера
      setCart(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        ),
        total_amount: result.total_amount || 0
      }))
    } catch (error) {
      console.error('Ошибка обновления количества', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleCheckout = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/cart' } } })
    } else {
      alert('Формирование заявки...')
    }
  }

  if (loading) {
    return (
      <main className="main-container">
        <h1 className="page-title">Корзина</h1>
        <div className="text-center">Загрузка...</div>
      </main>
    )
  }

  if (cart.items_count === 0) {
    return (
      <main className="main-container">
        <h1 className="page-title">Корзина</h1>
        <div className="empty-cart-message" style={{ textAlign: 'center', padding: '3rem' }}>
          <p>Заявка пуста</p>
          <Link to="/" className="add-to-request-btn" style={{ display: 'inline-block', width: 'auto', marginTop: '1rem' }}>
            Перейти в каталог
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="main-container">
      <h1 className="page-title">Заявка #{cart.request_id || 'Черновик'}</h1>
      
      <div className="request-list">
        <h2>Состав заявки</h2>
        
        {cart.items.map((item) => (
          <div key={item.id} className="request-item-row">
            <div className="item-fields">
              <span className="item-name">{item.substance_name}</span>
              <span className="item-cas">CAS: {item.substance_cas}</span>
              <div className="item-quantity">
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                  disabled={updating}
                  style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', width: '24px', cursor: 'pointer' }}
                >-</button>
                <span style={{ margin: '0 10px' }}>{item.quantity}</span>
                <button 
                  onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                  disabled={updating}
                  style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', width: '24px', cursor: 'pointer' }}
                >+</button>
              </div>
              <span className="item-price">{item.price_display || `${item.substance_price} ₽`}</span>
            </div>
            <div className="item-mm-field">м-м: {item.mm_value || '—'}</div>
            <button 
              onClick={() => handleRemove(item.id)} 
              className="remove-btn"
              disabled={updating}
              style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: '1.25rem', marginLeft: '1rem' }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      
      <div className="request-summary-card">
        <div className="summary-title">Итоговая сумма</div>
        <div className="summary-value">{Number(cart.total_amount).toFixed(2)} ₽</div>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Link to="/" className="add-to-request-btn" style={{ display: 'inline-block', width: 'auto' }}>
          Продолжить покупки
        </Link>
        <button className="add-to-request-btn" onClick={handleCheckout} style={{ background: '#2c7a4d', width: 'auto' }}>
          Оформить заказ
        </button>
      </div>
    </main>
  )
}

export default CartPage