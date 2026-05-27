import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (password !== passwordConfirm) {
      setError('Пароли не совпадают')
      return
    }
    
    setLoading(true)
    
    try {
      const response = await fetch('/api/auth/register/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, password_confirm: passwordConfirm }),
        credentials: 'include',
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Регистрация успешна! Перенаправление на страницу входа...')
        setTimeout(() => {
          navigate('/login')
        }, 2000)
      } else {
        setError(data.error || data.username?.[0] || 'Ошибка регистрации')
      }
    } catch (err) {
      setError('Ошибка соединения с сервером')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="main-container">
      <div className="auth-container" style={{ maxWidth: '400px', margin: '50px auto' }}>
        <div className="auth-card" style={{ background: 'white', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <h1 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Регистрация</h1>
          
          {error && (
            <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {error}
            </div>
          )}
          
          {success && (
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem' }}>
              {success}
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
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
              <input
                type="email"
                className="search-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%' }}
              />
            </div>
            
            <div style={{ marginBottom: '1rem' }}>
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
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Подтверждение пароля</label>
              <input
                type="password"
                className="search-input"
                value={passwordConfirm}
                onChange={(e) => setPasswordConfirm(e.target.value)}
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
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </form>
          
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#64748b' }}>Уже есть аккаунт? </span>
            <Link to="/login" style={{ color: '#0b3b5f', textDecoration: 'none' }}>Войти</Link>
          </div>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage