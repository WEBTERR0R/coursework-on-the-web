import React from 'react'
import { Link } from 'react-router-dom'

function Footer() {
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
          <a href="/admin/">Админ-панель</a>
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