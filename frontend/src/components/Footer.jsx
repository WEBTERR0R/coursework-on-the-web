import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'

function Footer() {
  const user = useSelector((state) => state.auth.user)

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h4>PharmaLab</h4>
          <p>Фармацевтические субстанции высокого качества</p>
        </div>
        <div className="footer-section">
          <h4>Навигация</h4>
          <Link to="/">Каталог</Link>
          <Link to="/cart">Корзина</Link>
          {user && <Link to="/requests">Мои заявки</Link>}
          {user && <Link to="/profile">Личный кабинет</Link>}
          {user?.is_moderator && <Link to="/moderator/requests">Модерация</Link>}
          {!user && <Link to="/login">Вход</Link>}
          {!user && <Link to="/register">Регистрация</Link>}
        </div>
        <div className="footer-section">
          <h4>Контакты</h4>
          <p>info@pharmalab.ru</p>
          <p>+7 (495) 000-00-00</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 PharmaLab. Лабораторная работа</p>
      </div>
    </footer>
  )
}

export default Footer
