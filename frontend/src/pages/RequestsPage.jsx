import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Breadcrumbs from '../components/Breadcrumbs'
import { fetchRequests, setRequestFilters } from '../store/requestsSlice'

const STATUS_LABELS = {
  draft: 'Черновик',
  formed: 'Сформирована',
  completed: 'Завершена',
  rejected: 'Отклонена',
  deleted: 'Удалена',
}

function formatDate(value) {
  if (!value) return '—'
  return new Date(value).toLocaleDateString('ru-RU')
}

function RequestsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const { items, filters, status, error } = useSelector((state) => state.requests)
  const cart = useSelector((state) => state.cart)

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/requests' },
          authMessage: 'Войдите, чтобы посмотреть свои заявки',
        },
      })
      return
    }

    dispatch(fetchRequests(filters))
  }, [dispatch, filters, navigate, user])

  const handleFilterChange = (field, value) => {
    dispatch(setRequestFilters({ [field]: value }))
  }

  return (
    <main className="main-container">
      <Breadcrumbs />
      <div className="page-heading-row">
        <h1 className="page-title">Мои заявки</h1>
        <button
          className={`request-link ${cart.request_id ? '' : 'disabled'}`}
          onClick={() => cart.request_id && navigate(`/requests/${cart.request_id}`)}
          disabled={!cart.request_id}
        >
          {cart.request_id ? 'Открыть черновик' : 'Черновика нет'}
        </button>
      </div>

      <section className="toolbar-panel">
        <label className="filter-group">
          <span className="filter-label">Дата формирования от</span>
          <input
            className="filter-input"
            type="date"
            value={filters.formed_from}
            onChange={(event) => handleFilterChange('formed_from', event.target.value)}
          />
        </label>
        <label className="filter-group">
          <span className="filter-label">Дата формирования до</span>
          <input
            className="filter-input"
            type="date"
            value={filters.formed_to}
            onChange={(event) => handleFilterChange('formed_to', event.target.value)}
          />
        </label>
        <label className="filter-group">
          <span className="filter-label">Статус</span>
          <select
            className="filter-input"
            value={filters.status}
            onChange={(event) => handleFilterChange('status', event.target.value)}
          >
            <option value="">Все</option>
            <option value="draft">Черновик</option>
            <option value="formed">Сформирована</option>
            <option value="completed">Завершена</option>
            <option value="rejected">Отклонена</option>
          </select>
        </label>
      </section>

      {status === 'loading' && <div className="loader-block">Загрузка заявок...</div>}
      {error && <div className="alert-danger">{error}</div>}

      {status !== 'loading' && !error && (
        <div className="table-card">
          <table className="requests-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Статус</th>
                <th>Позиций</th>
                <th>Сумма</th>
                <th>Создана</th>
                <th>Сформирована</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">Заявок пока нет</td>
                </tr>
              ) : (
                items.map((request, index) => (
                  <tr key={request.id}>
                    <td>
                      <span className="request-list-number">Заявка {index + 1}</span>
                    </td>
                    <td><span className={`status-pill status-${request.status}`}>{STATUS_LABELS[request.status] || request.status}</span></td>
                    <td>{request.items_count || request.items?.length || 0}</td>
                    <td>{Number(request.total_amount || 0).toFixed(2)} ₽</td>
                    <td>{formatDate(request.created_at)}</td>
                    <td>{formatDate(request.formed_at)}</td>
                    <td>
                      <Link className="table-action" to={`/requests/${request.id}`}>Открыть</Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  )
}

export default RequestsPage
