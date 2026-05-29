import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCart } from '../store/cartSlice'
import { clearAuthMessage, loginUser } from '../store/authSlice'

function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const dispatch = useDispatch()
  const { error, status } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()
  const loading = status === 'loading'
  
  const fromState = location.state?.from
  const from = fromState
    ? `${fromState.pathname || '/'}${fromState.search || ''}`
    : '/'
  const authMessage = location.state?.authMessage || ''

  const handleSubmit = async (e) => {
    e.preventDefault()
    dispatch(clearAuthMessage())
    
    const result = await dispatch(loginUser({ username, password }))
    if (loginUser.fulfilled.match(result)) {
      await dispatch(fetchCart())
      navigate(from, { replace: true })
    }
  }

  return (
    <main className="main-container">
      <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div className="auth-card" style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Вход в аккаунт</h1>
          
          {authMessage && (
            <div style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {authMessage}
            </div>
          )}
          
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Имя пользователя</label>
              <input
                type="text"
                className="search-input"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Пароль</label>
              <input
                type="password"
                className="search-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            
            <button 
              type="submit" 
              className="add-to-request-btn"
              disabled={loading}
              style={{ width: '100%', marginBottom: '1rem' }}
            >
              {loading ? 'Вход...' : 'Войти'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#64748b' }}>Нет аккаунта? </span>
            <Link to="/register" state={location.state} style={{ color: '#0b3b5f', textDecoration: 'none' }}>Зарегистрироваться</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default LoginPage
