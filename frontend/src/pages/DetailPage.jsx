import React, { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSubstance, getSubstances } from '../services/api'
import Breadcrumbs from '../components/Breadcrumbs'

const DEFAULT_IMAGE = 'https://via.placeholder.com/800x450?text=No+Image'

function DetailPage() {
  const { id } = useParams()
  const [substance, setSubstance] = useState(null)
  const [similarServices, setSimilarServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [similarLoading, setSimilarLoading] = useState(false)
  const [error, setError] = useState(null)

  // Загрузка текущей субстанции
  useEffect(() => {
    const fetchSubstance = async () => {
      setLoading(true)
      try {
        const data = await getSubstance(id)
        setSubstance(data)
        setError(null)
      } catch (err) {
        setError('Ошибка загрузки данных')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSubstance()
  }, [id])

  // Упрощённая загрузка похожих услуг (по ключевым словам)
  const loadSimilarServices = useCallback(async (currentSubstance, allSubstances) => {
    setSimilarLoading(true)
    try {
      console.log('Всего субстанций для поиска похожих:', allSubstances.length)
      
      // Извлекаем ключевые слова из названия и описания
      const textForKeywords = `${currentSubstance.name} ${currentSubstance.description || ''}`.toLowerCase()
      const keywords = textForKeywords.split(/[\s,\.\-\(\)]+/).filter(k => k.length > 3)
      
      console.log('Ключевые слова:', keywords)
      
      const similar = allSubstances
        .filter(s => s.id !== currentSubstance.id) // исключаем текущую
        .map(s => {
          let score = 0
          const nameLower = s.name.toLowerCase()
          const descLower = (s.description || '').toLowerCase()
          
          keywords.forEach(keyword => {
            if (nameLower.includes(keyword)) score += 3
            if (descLower.includes(keyword)) score += 1
          })
          
          return { ...s, similarity: score }
        })
        .filter(s => s.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 4) // показываем до 4 похожих
      
      console.log('Найдено похожих:', similar.length)
      setSimilarServices(similar)
    } catch (err) {
      console.error('Ошибка при поиске похожих услуг:', err)
    } finally {
      setSimilarLoading(false)
    }
  }, [])

  // Загрузка всех субстанций для поиска похожих
  useEffect(() => {
    if (substance) {
      const fetchAllForSimilar = async () => {
        try {
          console.log('Загрузка всех субстанций для поиска похожих...')
          const allSubstances = await getSubstances()
          console.log('Получено субстанций:', allSubstances?.length || 0)
          
          if (allSubstances && allSubstances.length > 1) {
            await loadSimilarServices(substance, allSubstances)
          } else {
            console.log('Недостаточно субстанций для поиска похожих')
            // Если нет других субстанций, показываем заглушку
            setSimilarServices([])
          }
        } catch (err) {
          console.error('Ошибка загрузки списка для похожих услуг:', err)
          setSimilarServices([])
        }
      }
      fetchAllForSimilar()
    }
  }, [substance, loadSimilarServices])

  if (loading) {
    return (
      <main className="main-container">
        <div className="text-center">Загрузка...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="main-container">
        <div className="text-center" style={{ color: 'red' }}>{error}</div>
      </main>
    )
  }

  if (!substance) {
    return (
      <main className="main-container">
        <div className="text-center">Субстанция не найдена</div>
      </main>
    )
  }

  const imageUrl = substance.image_url || DEFAULT_IMAGE

  return (
    <main className="main-container">
      <Breadcrumbs />
      
      <article className="detail-container">
        <div className="detail-image-wrapper">
          <img 
            src={imageUrl} 
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
            <p>Применяется в производстве лекарственных препаратов. Соответствует требованиям фармакопеи и стандартам надлежащей производственной практики.</p>
            
            <h3>Срок годности</h3>
            <p>{substance.shelf_life || 24} месяцев</p>
          </div>
          
          <button className="add-to-request-btn">Добавить в заявку</button>
        </div>
      </article>
      
      {/* Блок похожих услуг */}
      <div className="similar-services">
        <h2 className="section-title">Похожие субстанции</h2>
        
        {similarLoading && <div className="text-center">Поиск похожих...</div>}
        
        {!similarLoading && similarServices.length === 0 && (
          <div className="text-center" style={{ color: '#64748b', padding: '2rem' }}>
            Нет похожих субстанций
          </div>
        )}
        
        {!similarLoading && similarServices.length > 0 && (
          <div className="services-grid" style={{ marginTop: '1.5rem' }}>
            {similarServices.map(service => (
              <article key={service.id} className="service-card">
                <Link to={`/substance/${service.id}`} className="card-link">
                  <div className="card-img">
                    <img 
                      src={service.image_url || DEFAULT_IMAGE} 
                      alt={service.name}
                      onError={(e) => { e.target.src = DEFAULT_IMAGE }}
                    />
                  </div>
                  <div className="card-body">
                    <h3 className="card-title">{service.name}</h3>
                    <div className="card-price">{service.price_display || `${service.price} ₽`}</div>
                    <div className="card-cas">CAS: {service.cas}</div>
                    {service.similarity > 0 && (
                      <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem' }}>
                        Совпадение: {Math.round(service.similarity * 10)}%
                      </div>
                    )}
                  </div>
                </Link>
                <div className="card-footer">
                  <button className="add-to-request-btn">В заявку</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default DetailPage