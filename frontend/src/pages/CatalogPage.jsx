import React, { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getSubstances, getCart, addToRequest } from '../services/api'
import SubstanceCard from '../components/SubstanceCard'
import HeroVideo from '../components/HeroVideo'
import Breadcrumbs from '../components/Breadcrumbs'

function CatalogPage() {
  const [substances, setSubstances] = useState([])
  const [loading, setLoading] = useState(true)
  const [cartCount, setCartCount] = useState(0)
  const [cartTotal, setCartTotal] = useState(0)
  const [error, setError] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  
  const searchParams = new URLSearchParams(location.search)
  const searchQuery = searchParams.get('search') || ''
  const priceFromParam = searchParams.get('price_from') || ''
  const priceToParam = searchParams.get('price_to') || ''

  const fetchSubstances = useCallback(async () => {
    try {
      const data = await getSubstances(searchQuery, priceFromParam, priceToParam)
      setSubstances(data || [])
      setError(null)
    } catch (err) {
      setError('Ошибка загрузки данных')
      console.error(err)
    }
  }, [searchQuery, priceFromParam, priceToParam])

  const fetchCart = useCallback(async () => {
    try {
      const cartData = await getCart()
      setCartCount(cartData?.items_count || 0)
      setCartTotal(cartData?.total_amount || 0)
    } catch (err) {
      console.error('Ошибка загрузки корзины', err)
    }
  }, [])

  const fetchAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchSubstances(), fetchCart()])
    setLoading(false)
  }, [fetchSubstances, fetchCart])

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
    try {
      await addToRequest(substanceId)
      await fetchCart()
    } catch (error) {
      console.error('Ошибка добавления:', error)
      if (error.message === 'Необходима авторизация') {
        navigate('/login')
      }
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
            
            {loading && <div className="text-center">Загрузка...</div>}
            {error && <div className="text-center" style={{ color: 'red' }}>{error}</div>}
            
            {!loading && !error && (
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
            
            {!loading && !error && substances.length === 0 && (
              <div className="text-center">Ничего не найдено</div>
            )}
          </div>
          
          <aside className="request-sidebar-card">
            <div className="request-header">
              <span className="request-title">Заявка</span>
              <span className="request-badge">{cartCount}</span>
            </div>
            <div className="request-id">
              ID: {cartCount > 0 ? '#35' : 'не создана'}
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
                </div>
                <div className="request-calculation">{Number(cartTotal).toFixed(2)} ₽</div>
                <button 
                  onClick={() => navigate('/cart')} 
                  className="request-link"
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