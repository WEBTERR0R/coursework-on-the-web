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
  const location = useLocation()
  const navigate = useNavigate()
  
  const searchParams = new URLSearchParams(location.search)
  const searchQuery = searchParams.get('search') || ''

  const fetchSubstances = useCallback(async () => {
    try {
      const substancesData = await getSubstances(searchQuery)
      setSubstances(substancesData || [])
      setError(null)
    } catch (err) {
      setError('Ошибка загрузки данных')
    }
  }, [searchQuery])

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
    if (searchInput.trim()) {
      navigate(`/?search=${encodeURIComponent(searchInput)}`)
    } else {
      navigate('/')
    }
  }

  const handleAddToCart = async (substanceId) => {
    try {
      await addToRequest(substanceId)
      // Обновляем корзину после добавления
      await fetchCart()
    } catch (error) {
      console.error('Ошибка добавления:', error)
      if (error.message === 'Необходима авторизация') {
        navigate('/login', { state: { from: { pathname: '/' } } })
      } else {
        alert(error.message)
      }
    }
  }

  return (
    <>
      <HeroVideo />
      <main className="main-container">
        <Breadcrumbs />
        
        <div className="catalog-layout">
          <div style={{ flex: 1 }}>
            <h1 className="page-title">Каталог действующих веществ</h1>
            
            <form onSubmit={handleSearch} style={{ marginBottom: '2rem', maxWidth: '400px' }}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Поиск по названию или CAS..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ width: '100%' }}
              />
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