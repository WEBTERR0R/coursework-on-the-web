import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SubstanceCard from '../components/SubstanceCard'
import HeroVideo from '../components/HeroVideo'
import Breadcrumbs from '../components/Breadcrumbs'
import { addItemToCart, fetchCart } from '../store/cartSlice'
import { fetchSubstances, setCatalogFilters } from '../store/substancesSlice'

function CatalogPage() {
  const [searchInput, setSearchInput] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { items: substances, status, error } = useSelector((state) => state.substances)
  const cart = useSelector((state) => state.cart)
  const cartCount = cart.items_count || 0
  const cartQuantity = cart.total_quantity || 0
  const cartTotal = cart.total_amount || 0
  
  const searchParams = new URLSearchParams(location.search)
  const searchQuery = searchParams.get('search') || ''
  const priceFromParam = searchParams.get('price_from') || ''
  const priceToParam = searchParams.get('price_to') || ''

  const fetchAll = useCallback(async () => {
    const filters = {
      search: searchQuery,
      price_from: priceFromParam,
      price_to: priceToParam,
    }
    dispatch(setCatalogFilters(filters))
    await Promise.all([
      dispatch(fetchSubstances(filters)),
      dispatch(fetchCart()),
    ])
  }, [dispatch, searchQuery, priceFromParam, priceToParam])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchInput.trim()) params.append('search', searchInput.trim())
    if (priceFrom) params.append('price_from', priceFrom)
    if (priceTo) params.append('price_to', priceTo)
    navigate(`/?${params.toString()}`)
  }

  const handleAddToCart = async (substanceId) => {
    const result = await dispatch(addItemToCart({ substanceId }))
    if (addItemToCart.rejected.match(result) && result.payload === 'Необходима авторизация') {
      navigate('/login', {
        state: {
          from: {
            pathname: location.pathname,
            search: location.search
          },
          authMessage: 'Войдите или зарегистрируйтесь, чтобы купить товар'
        }
      })
    }
  }

  const handleReset = () => {
    setSearchInput('')
    setPriceFrom('')
    setPriceTo('')
    navigate('/')
  }

  return (
    <>
      <HeroVideo />
      <main className="main-container">
        <Breadcrumbs />
        
        <div className="catalog-layout">
          <div style={{ flex: 1 }}>
            <h1 className="page-title">Каталог действующих веществ</h1>
            
            <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div style={{ flex: 2, minWidth: '200px' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}>Поиск по названию или CAS</label>
                <input 
                  type="text" 
                  className="search-input" 
                  placeholder="Например: парацетамол"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}>Цена от (₽)</label>
                <input 
                  type="number" 
                  className="search-input" 
                  placeholder="1000"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ flex: 1, minWidth: '120px' }}>
                <label style={{ display: 'block', marginBottom: '0.25rem', fontSize: '0.875rem', color: '#64748b' }}>Цена до (₽)</label>
                <input 
                  type="number" 
                  className="search-input" 
                  placeholder="5000"
                  value={priceTo}
                  onChange={(e) => setPriceTo(e.target.value)}
                  style={{ width: '100%' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button type="submit" className="add-to-request-btn" style={{ width: 'auto', padding: '0.625rem 1.5rem' }}>
                  Применить
                </button>
                <button type="button" onClick={handleReset} style={{ background: '#e2e8f0', color: '#1e293b', border: 'none', borderRadius: '10px', padding: '0.625rem 1.5rem', cursor: 'pointer' }}>
                  Сбросить
                </button>
              </div>
            </form>
            
            {status === 'loading' && <div className="loader-block">Загрузка каталога...</div>}
            {error && <div className="text-center" style={{ color: 'red' }}>{error}</div>}
            
            {status !== 'loading' && !error && (
              <div className="services-grid">
                {substances.map(substance => (
                  <SubstanceCard 
                    key={substance.id} 
                    substance={substance} 
                    onAddToCart={() => handleAddToCart(substance.id)}
                  />
                ))}
              </div>
            )}
            
            {status !== 'loading' && !error && substances.length === 0 && (
              <div className="text-center">Ничего не найдено</div>
            )}
          </div>
          
          <aside className="request-sidebar-card">
            <div className="request-header">
              <span className="request-title">Заявка</span>
              <span className="request-badge">{cartCount}</span>
            </div>
            
            {cartCount === 0 ? (
              <div className="empty-cart-message">
                <p>Заявка пуста</p>
                <p className="empty-cart-subtext">Добавьте вещества из каталога</p>
              </div>
            ) : (
              <>
                <div className="request-stats">
                  <div className="stat-row">
                    <span>Позиций:</span>
                    <strong>{cartCount}</strong>
                  </div>
                  <div className="stat-row">
                    <span>Количество:</span>
                    <strong>{cartQuantity}</strong>
                  </div>
                </div>
                <div className="request-calculation">{Number(cartTotal).toFixed(2)} ₽</div>
                <button 
                  onClick={() => navigate(cart.request_id ? `/requests/${cart.request_id}` : '/cart')} 
                  className="request-link"
                  disabled={!cart.request_id}
                >
                  Перейти в заявку
                </button>
              </>
            )}
          </aside>
        </div>
      </main>
    </>
  )
}

export default CatalogPage
