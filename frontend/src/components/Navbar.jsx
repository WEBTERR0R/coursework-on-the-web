import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getCart, getCurrentUser } from '../services/api'

function AppNavbar() {
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState(null)

  const fetchData = async () => {
    try {
      const userData = await getCurrentUser()
      if (userData && !userData.error) {
        setUser(userData)
      } else {
        setUser(null)
      }
      const cart = await getCart()
      setCartCount(cart.items_count || 0)
    } catch (error) {
      console.error('Ошибка загрузки данных', error)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout/', {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Ошибка выхода:', error)
    }
    setUser(null)
    setCartCount(0)
    window.location.href = '/'
  }

  return (
    <header className="app-header">
      <div className="header-left">
        <Link to="/" className="logo">PharmaLab</Link>
        <nav className="main-nav">
          <Link to="/" className="nav-link">Каталог</Link>
          <a href="http://127.0.0.1:8000/admin/" className="nav-link" target="_blank" rel="noopener noreferrer">
            Админ панель
          </a>
        </nav>
      </div>
      <div className="header-right">
        <Link to="/cart" className="cart-link">
          <span className="cart-icon">🛒</span>
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </Link>
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ color: '#0b3b5f', fontWeight: '500' }}>{user.username}</span>
            <button onClick={handleLogout} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc2626' }}>
              Выйти
            </button>
          </div>
        ) : (
          <Link to="/login" className="nav-link">Войти</Link>
        )}
      </div>
    </header>
  )
}

export default AppNavbar