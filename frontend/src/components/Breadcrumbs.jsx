import { Link, useLocation } from 'react-router-dom'

function Breadcrumbs() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter(x => x)
  
  const pathNames = {
    'substance': 'Субстанция',
    'cart': 'Корзина',
    'requests': 'Заявки',
    'moderator': 'Модерация',
    'profile': 'Личный кабинет',
    'login': 'Вход',
    'register': 'Регистрация',
  }
  
  return (
    <div className="breadcrumbs" style={{ padding: '1rem 0', fontSize: '0.875rem', color: '#64748b' }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#0b3b5f' }}>Главная</Link>
      
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const displayName = pathNames[name] || (/^\d+$/.test(name) ? 'Просмотр' : name)
        
        return (
          <span key={routeTo}>
            <span style={{ margin: '0 0.5rem' }}>/</span>
            {isLast ? (
              <span style={{ color: '#64748b' }}>{displayName}</span>
            ) : (
              <Link to={routeTo} style={{ textDecoration: 'none', color: '#0b3b5f' }}>{displayName}</Link>
            )}
          </span>
        )
      })}
    </div>
  )
}

export default Breadcrumbs
