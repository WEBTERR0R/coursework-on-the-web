import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getSubstance } from '../services/api'
import Breadcrumbs from '../components/Breadcrumbs'

const DEFAULT_IMAGE = 'https://via.placeholder.com/800x450?text=No+Image'

function DetailPage() {
  const { id } = useParams()
  const [substance, setSubstance] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  useEffect(() => {
    const fetchSubstance = async () => {
      setLoading(true)
      try {
        const data = await getSubstance(id)
        setSubstance(data)
        setError(null)
      } catch (err) {
        setError('Ошибка загрузки данных')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubstance()
  }, [id])
  
  if (loading) return <main className="main-container">Загрузка...</main>
  if (error) return <main className="main-container">Ошибка: {error}</main>
  if (!substance) return <main className="main-container">Субстанция не найдена</main>
  
  return (
    <main className="main-container">
      <Breadcrumbs />
      
      <article className="detail-container">
        <div className="detail-image-wrapper">
          <img 
            src={substance.image_url || DEFAULT_IMAGE} 
            alt={substance.name}
            className="detail-image"
            onError={(e) => { e.target.src = DEFAULT_IMAGE }}
          />
        </div>
        
        <div className="detail-content">
          <h1 className="detail-title">{substance.name}</h1>
          
          <div className="detail-meta">
            <div className="meta-item">
              <span className="meta-label">CAS номер</span>
              <span className="meta-value">{substance.cas}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Цена</span>
              <span className="meta-value">{substance.price_display || `${substance.price} ₽`}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Мол. масса</span>
              <span className="meta-value">{substance.molecular_weight} г/моль</span>
            </div>
          </div>
          
          <div className="detail-description">
            <h3>Описание</h3>
            <p>{substance.description || 'Описание отсутствует'}</p>
            
            <h3>Применение</h3>
            <p>Применяется в производстве лекарственных препаратов.</p>
            
            <h3>Срок годности</h3>
            <p>{substance.shelf_life || 24} месяцев</p>
          </div>
          
          <button className="add-to-request-btn">Добавить в заявку</button>
        </div>
      </article>
    </main>
  )
}

export default DetailPage