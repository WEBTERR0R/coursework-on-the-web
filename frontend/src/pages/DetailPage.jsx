import { useState, useEffect, useCallback } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Breadcrumbs from '../components/Breadcrumbs'
import { IS_GUEST_APP } from '../config/runtime'
import { addItemToCart } from '../store/cartSlice'
import { buildSimilarSubstances, fetchSubstance, fetchSubstances } from '../store/substancesSlice'

const DEFAULT_IMAGE = `${import.meta.env.BASE_URL || '/'}mock/generic-substance.svg`

function DetailPage() {
  const { id } = useParams()
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const [addingId, setAddingId] = useState(null)
  const {
    current: substance,
    similar: similarServices,
    currentStatus,
    status: listStatus,
    similarStatus,
    error,
  } = useSelector((state) => state.substances)
  const loading = currentStatus === 'loading'
  const similarLoading = listStatus === 'loading' || similarStatus === 'loading'

  const redirectToLogin = useCallback(() => {
    navigate('/login', {
      state: {
        from: {
          pathname: location.pathname,
          search: location.search
        },
        authMessage: 'Войдите или зарегистрируйтесь, чтобы купить товар'
      }
    })
  }, [location.pathname, location.search, navigate])

  const handleAddToCart = async (substanceId) => {
    if (addingId) return

    setAddingId(substanceId)
    const result = await dispatch(addItemToCart({ substanceId }))
    if (addItemToCart.rejected.match(result) && result.payload === 'Необходима авторизация') {
      redirectToLogin()
    }
    setAddingId(null)
  }

  useEffect(() => {
    dispatch(fetchSubstance(id))
    dispatch(fetchSubstances({}))
  }, [dispatch, id])

  useEffect(() => {
    if (substance) {
      dispatch(buildSimilarSubstances())
    }
  }, [dispatch, substance, listStatus])

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
        <div className="detail-media-panel">
          <div className="detail-image-wrapper">
            <img 
              src={imageUrl} 
              alt={substance.name}
              className="detail-image"
              onError={(e) => { e.target.src = DEFAULT_IMAGE }}
            />
          </div>
          {substance.video_url && (
            <div className="detail-video-wrapper">
              <video className="detail-video" controls preload="metadata">
                <source src={substance.video_url} type="video/mp4" />
                Ваш браузер не поддерживает видео
              </video>
            </div>
          )}
          <div className="detail-media-caption">
            <span>Субстанция</span>
            <strong>{substance.pharmacopoeia || 'USP, EP'}</strong>
          </div>
        </div>
        
        <div className="detail-content">
          <div className="detail-heading">
            <span className="detail-eyebrow">Фармацевтическая субстанция</span>
            <h1 className="detail-title">{substance.name}</h1>
          </div>
          
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
            <div className="meta-item">
              <span className="meta-label">Срок годности</span>
              <span className="meta-value">{substance.shelf_life || 24} месяцев</span>
            </div>
          </div>
          
          <div className="detail-description">
            <section className="detail-info-section">
              <h3>Описание</h3>
              <p>{substance.description || 'Описание отсутствует'}</p>
            </section>
            <section className="detail-info-section">
              <h3>Применение</h3>
              <p>Применяется в производстве лекарственных препаратов. Соответствует требованиям фармакопеи и стандартам надлежащей производственной практики.</p>
            </section>
          </div>

          {!IS_GUEST_APP && <div className="detail-purchase-panel">
            <div>
              <span className="purchase-label">Стоимость</span>
              <strong className="purchase-price">{substance.price_display || `${substance.price} ₽`}</strong>
            </div>
            <button
              className="add-to-request-btn detail-buy-btn"
              onClick={() => handleAddToCart(substance.id)}
              disabled={addingId === substance.id}
            >
              {addingId === substance.id ? 'Добавление...' : 'Купить'}
            </button>
          </div>}
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
                {!IS_GUEST_APP && <div className="card-footer">
                  <button
                    className="add-to-request-btn"
                    onClick={() => handleAddToCart(service.id)}
                    disabled={addingId === service.id}
                  >
                    {addingId === service.id ? 'Добавление...' : 'Купить'}
                  </button>
                </div>}
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

export default DetailPage
