import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Breadcrumbs from '../components/Breadcrumbs'
import { changePassword, clearAuthMessage, updateProfile } from '../store/authSlice'

function ProfilePage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, status, error, message } = useSelector((state) => state.auth)
  const [profileDraft, setProfileDraft] = useState({})
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('')
  const [localError, setLocalError] = useState('')
  const loading = status === 'loading'
  const username = profileDraft.username ?? user?.username ?? ''
  const email = profileDraft.email ?? user?.email ?? ''

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/profile' },
          authMessage: 'Войдите, чтобы открыть личный кабинет',
        },
      })
    }
  }, [navigate, user])

  const handleProfileSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')
    dispatch(clearAuthMessage())
    dispatch(updateProfile({ username, email })).then(() => {
      setProfileDraft({})
    })
  }

  const handlePasswordSubmit = async (event) => {
    event.preventDefault()
    setLocalError('')
    dispatch(clearAuthMessage())

    if (newPassword !== newPasswordConfirm) {
      setLocalError('Новые пароли не совпадают')
      return
    }

    const result = await dispatch(changePassword({
      old_password: oldPassword,
      new_password: newPassword,
      new_password_confirm: newPasswordConfirm,
    }))

    if (changePassword.fulfilled.match(result)) {
      setOldPassword('')
      setNewPassword('')
      setNewPasswordConfirm('')
    }
  }

  return (
    <main className="main-container">
      <Breadcrumbs />
      <h1 className="page-title">Личный кабинет</h1>

      {(localError || error) && <div className="alert-danger">{localError || error}</div>}
      {message && <div className="success-alert">{message}</div>}

      <div className="profile-grid">
        <form className="profile-card" onSubmit={handleProfileSubmit}>
          <h2>Данные пользователя</h2>
          <label className="profile-field">
            <span>Логин</span>
            <input
              className="search-input"
              value={username}
              onChange={(event) => setProfileDraft((prev) => ({ ...prev, username: event.target.value }))}
              required
            />
          </label>
          <label className="profile-field">
            <span>Email</span>
            <input
              className="search-input"
              type="email"
              value={email}
              onChange={(event) => setProfileDraft((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <button className="add-to-request-btn" type="submit" disabled={loading}>
            Сохранить
          </button>
        </form>

        <form className="profile-card" onSubmit={handlePasswordSubmit}>
          <h2>Смена пароля</h2>
          <label className="profile-field">
            <span>Текущий пароль</span>
            <input
              className="search-input"
              type="password"
              value={oldPassword}
              onChange={(event) => setOldPassword(event.target.value)}
              required
            />
          </label>
          <label className="profile-field">
            <span>Новый пароль</span>
            <input
              className="search-input"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
              minLength="6"
            />
          </label>
          <label className="profile-field">
            <span>Повторите новый пароль</span>
            <input
              className="search-input"
              type="password"
              value={newPasswordConfirm}
              onChange={(event) => setNewPasswordConfirm(event.target.value)}
              required
              minLength="6"
            />
          </label>
          <button className="add-to-request-btn" type="submit" disabled={loading}>
            Обновить пароль
          </button>
        </form>
      </div>
    </main>
  )
}

export default ProfilePage
