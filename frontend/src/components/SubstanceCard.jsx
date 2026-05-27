import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { addToRequest } from '../services/api'

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image'

function SubstanceCard({ substance, onAddToCart }) {
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (adding) return
    
    setAdding(true)
    try {
      const result = await addToRequest(substance.id)
      // Вызываем callback для обновления корзины
      if (onAddToCart) {
        onAddToCart()
      }
    } catch (error) {
      console.error('Ошибка добавления:', error)
      if (error.message === 'Необходима авторизация') {
        // Перенаправляем на логин
        window.location.href = '/login'
      } else {
        alert(error.message)
      }
    } finally {
      setAdding(false)
    }
  }

  return (
    <article className="service-card">
      <Link to={`/substance/${substance.id}`} className="card-link">
        <div className="card-img">
          <img 
            src={substance.image_url || DEFAULT_IMAGE} 
            alt={substance.name}
            onError={(e) => { e.target.src = DEFAULT_IMAGE }}
          />
        </div>
        <div className="card-body">
          <h3 className="card-title">{substance.name}</h3>
          <div className="card-price">{substance.price_display || `${substance.price} ₽`}</div>
          <div className="card-cas">CAS: {substance.cas}</div>
        </div>
      </Link>
      <div className="card-footer">
        <button 
          className="add-to-request-btn" 
          onClick={handleAddToCart}
          disabled={adding}
        >
          {adding ? 'Добавление...' : 'В заявку'}
        </button>
      </div>
    </article>
  )
}

export default SubstanceCard