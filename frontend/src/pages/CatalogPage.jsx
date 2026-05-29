import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import SubstanceCard from '../components/SubstanceCard'
import HeroVideo from '../components/HeroVideo'
import Breadcrumbs from '../components/Breadcrumbs'
import { IS_GUEST_APP } from '../config/runtime'
import { addItemToCart, fetchCart } from '../store/cartSlice'
import { fetchSubstances, resetCatalogFilters, setCatalogFilters } from '../store/substancesSlice'

function CatalogFilterForm({ initialFilters, onApply, onReset }) {
  const [searchInput, setSearchInput] = useState(initialFilters.search || '')
  const [priceFrom, setPriceFrom] = useState(initialFilters.price_from || '')
  const [priceTo, setPriceTo] = useState(initialFilters.price_to || '')

  const handleSearch = (e) => {
    e.preventDefault()
    onApply({
      search: searchInput.trim(),
      price_from: priceFrom,
      price_to: priceTo,
    })
  }

  const handleReset = () => {
    setSearchInput('')
    setPriceFrom('')
    setPriceTo('')
    onReset()
  }

  return (
    <form onSubmit={handleSearch} className="filter-form">
      <div className="filter-group filter-group-wide">
        <label className="filter-label">Поиск по названию или CAS</label>
        <input
          type="text"
          className="search-input"
          placeholder="Например: парацетамол"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label className="filter-label">Цена от (₽)</label>
        <input
          type="number"
          className="search-input"
          placeholder="1000"
          value={priceFrom}
          onChange={(e) => setPriceFrom(e.target.value)}
        />
      </div>
      <div className="filter-group">
        <label className="filter-label">Цена до (₽)</label>
        <input
          type="number"
          className="search-input"
          placeholder="5000"
          value={priceTo}
          onChange={(e) => setPriceTo(e.target.value)}
        />
      </div>
      <div className="filter-buttons">
        <button type="submit" className="add-to-request-btn filter-submit-btn">
          Применить
        </button>
        <button type="button" onClick={handleReset} className="btn-reset">
          Сбросить
        </button>
      </div>
    </form>
  )
}

function CatalogPage() {
  const dispatch = useDispatch()
  const location = useLocation()
  const navigate = useNavigate()
  const { items: substances, status, error, filters: savedFilters } = useSelector((state) => state.substances)
  const cart = useSelector((state) => state.cart)
  const cartCount = cart.items_count || 0
  const cartQuantity = cart.total_quantity || 0
  const cartTotal = cart.total_amount || 0
  
  const searchParams = new URLSearchParams(location.search)
  const searchQuery = searchParams.has('search') ? searchParams.get('search') : savedFilters.search
  const priceFromParam = searchParams.has('price_from') ? searchParams.get('price_from') : savedFilters.price_from
  const priceToParam = searchParams.has('price_to') ? searchParams.get('price_to') : savedFilters.price_to

  const fetchAll = useCallback(async () => {
    const filters = {
      search: searchQuery,
      price_from: priceFromParam,
      price_to: priceToParam,
    }
    if (
      savedFilters.search !== filters.search
      || savedFilters.price_from !== filters.price_from
      || savedFilters.price_to !== filters.price_to
    ) {
      dispatch(setCatalogFilters(filters))
    }
    await Promise.all([
      dispatch(fetchSubstances(filters)),
      IS_GUEST_APP ? Promise.resolve() : dispatch(fetchCart()),
    ])
  }, [
    dispatch,
    searchQuery,
    priceFromParam,
    priceToParam,
    savedFilters.search,
    savedFilters.price_from,
    savedFilters.price_to,
  ])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const handleSearch = (filters) => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.price_from) params.append('price_from', filters.price_from)
    if (filters.price_to) params.append('price_to', filters.price_to)
    dispatch(setCatalogFilters(filters))
    navigate(params.toString() ? `/?${params.toString()}` : '/')
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
    dispatch(resetCatalogFilters())
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
            
            <CatalogFilterForm
              key={`${searchQuery}-${priceFromParam}-${priceToParam}`}
              initialFilters={{
                search: searchQuery,
                price_from: priceFromParam,
                price_to: priceToParam,
              }}
              onApply={handleSearch}
              onReset={handleReset}
            />
            
            {status === 'loading' && <div className="loader-block">Загрузка каталога...</div>}
            {error && <div className="text-center" style={{ color: 'red' }}>{error}</div>}
            
            {status !== 'loading' && !error && (
              <div className="services-grid">
                {substances.map(substance => (
                  <SubstanceCard 
                    key={substance.id} 
                    substance={substance} 
                    onAddToCart={() => handleAddToCart(substance.id)}
                    canBuy={!IS_GUEST_APP}
                  />
                ))}
              </div>
            )}
            
            {status !== 'loading' && !error && substances.length === 0 && (
              <div className="text-center">Ничего не найдено</div>
            )}
          </div>
          
          {!IS_GUEST_APP && <aside className="request-sidebar-card">
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
          </aside>}
        </div>
      </main>
    </>
  )
}

export default CatalogPage
