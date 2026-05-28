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
      setCart(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId),
        items_count: result.items_count || 0,
        total_amount: result.total_amount || 0
      }))
    } catch (error) {
      console.error('Ошибка удаления', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleQuantityChange = async (itemId, delta) => {
    if (updating) return
    
    // Находим текущий элемент
    const currentItem = cart.items.find(item => item.id === itemId)
    if (!currentItem) return
    
    // Вычисляем новое количество (целое число)
    const currentQuantity = parseInt(currentItem.quantity, 10) || 1
    const newQuantity = currentQuantity + delta
    
    if (newQuantity < 1) return
    
    setUpdating(true)
    try {
      const result = await updateRequestItemQuantity(itemId, newQuantity)
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
      console.error('Ошибка обновления', error)
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
                  onClick={() => handleQuantityChange(item.id, -1)}
                  disabled={updating}
                >-</button>
                <span>{parseInt(item.quantity, 10) || 1}</span>
                <button 
                  onClick={() => handleQuantityChange(item.id, +1)}
                  disabled={updating}
                >+</button>
              </div>
              <span className="item-price">{item.price_display || `${item.substance_price} ₽`}</span>
            </div>
            <div className="item-mm-field">м-м: {item.mm_value || '—'}</div>
            <button 
              onClick={() => handleRemove(item.id)} 
              className="remove-btn"
              disabled={updating}
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