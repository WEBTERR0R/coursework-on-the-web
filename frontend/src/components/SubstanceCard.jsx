import { useState } from 'react'
import { Link } from 'react-router-dom'

const DEFAULT_IMAGE = 'https://via.placeholder.com/300x200?text=No+Image'

function SubstanceCard({ substance, onAddToCart }) {
  const [adding, setAdding] = useState(false)

  const handleAddToCart = async (e) => {
    e.preventDefault()
    if (adding) return
    
    setAdding(true)
    try {
      await onAddToCart()
    } catch (error) {
      console.error('Ошибка добавления:', error)
    } finally {
      setAdding(false)
    }
  }

  const imageUrl = substance.image_url || DEFAULT_IMAGE

  return (
    <article className="service-card">
      <Link to={`/substance/${substance.id}`} className="card-link">
        <div className="card-img">
          <img 
            src={imageUrl} 
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
          {adding ? 'Добавление...' : 'Купить'}
        </button>
      </div>
    </article>
  )
}

export default SubstanceCard
