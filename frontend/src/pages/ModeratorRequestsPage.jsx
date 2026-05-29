import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Breadcrumbs from '../components/Breadcrumbs'
import {
  completeRequest,
  deleteRequest,
  fetchModeratorRequests,
  rejectRequest,
  setModeratorRequestFilters,
} from '../store/moderatorRequestsSlice'

const POLLING_INTERVAL_MS = 60000

const STATUS_LABELS = {
  draft: 'Черновик',
  formed: 'Сформирована',
  completed: 'Завершена',
  rejected: 'Отклонена',
  deleted: 'Удалена',
}

function formatDateTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function ModeratorRequestsPage() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state) => state.auth.user)
  const {
    actionStatus,
    error,
    filters,
    items,
    lastUpdated,
    status,
  } = useSelector((state) => state.moderatorRequests)
  const isActionBusy = actionStatus === 'loading'
  const backendFilters = useMemo(() => ({
    formed_from: filters.formed_from,
    formed_to: filters.formed_to,
    status: filters.status,
  }), [filters.formed_from, filters.formed_to, filters.status])

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: '/moderator/requests' },
          authMessage: 'Войдите под учетной записью модератора',
        },
      })
      return
    }

    if (!user.is_moderator) {
      navigate('/requests', { replace: true })
    }
  }, [navigate, user])

  useEffect(() => {
    if (!user?.is_moderator) return undefined

    dispatch(fetchModeratorRequests(backendFilters))
    const intervalId = window.setInterval(() => {
      dispatch(fetchModeratorRequests(backendFilters))
    }, POLLING_INTERVAL_MS)

    return () => window.clearInterval(intervalId)
  }, [backendFilters, dispatch, user])

  const filteredItems = useMemo(() => {
    const creator = filters.creator.trim().toLowerCase()
    if (!creator) return items
    return items.filter((request) => (
      request.user_username || ''
    ).toLowerCase().includes(creator))
  }, [filters.creator, items])

  const handleFilterChange = (field, value) => {
    dispatch(setModeratorRequestFilters({ [field]: value }))
  }

  const handleComplete = async (requestId) => {
    const result = await dispatch(completeRequest(requestId))
    if (completeRequest.fulfilled.match(result)) {
      dispatch(fetchModeratorRequests(backendFilters))
    }
  }

  const handleReject = async (requestId) => {
    const result = await dispatch(rejectRequest(requestId))
    if (rejectRequest.fulfilled.match(result)) {
      dispatch(fetchModeratorRequests(backendFilters))
    }
  }

  const handleDelete = async (requestId) => {
    const result = await dispatch(deleteRequest(requestId))
    if (deleteRequest.fulfilled.match(result)) {
      dispatch(fetchModeratorRequests(backendFilters))
    }
  }

  const openRequest = (requestId) => {
    navigate(`/requests/${requestId}`)
  }

  if (user && !user.is_moderator) {
    return (
      <main className="main-container">
        <div className="alert-danger">Раздел доступен только модератору</div>
      </main>
    )
  }

  return (
    <main className="main-container">
      <Breadcrumbs />
      <div className="page-heading-row">
        <div>
          <h1 className="page-title">Модерация заявок</h1>
          <p className="muted-text">
            Автообновление раз в минуту.
            {lastUpdated && ` Последнее обновление: ${formatDateTime(lastUpdated)}`}
          </p>
        </div>
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
        <label className="filter-group">
          <span className="filter-label">Создатель</span>
          <input
            className="filter-input"
            value={filters.creator}
            onChange={(event) => handleFilterChange('creator', event.target.value)}
            placeholder="Логин пользователя"
          />
        </label>
      </section>

      {status === 'loading' && <div className="loader-block">Загрузка заявок...</div>}
      {error && <div className="alert-danger">{error}</div>}

      {status !== 'loading' && (
        <div className="table-card">
          <table className="requests-table moderator-table">
            <thead>
              <tr>
                <th>Номер</th>
                <th>Создатель</th>
                <th>Статус</th>
                <th>Позиций</th>
                <th>Сумма</th>
                <th>Сформирована</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="7" className="table-empty">Заявки не найдены</td>
                </tr>
              ) : (
                filteredItems.map((request, index) => (
                  <tr
                    key={request.id}
                    className="clickable-row"
                    onClick={() => openRequest(request.id)}
                    tabIndex="0"
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') openRequest(request.id)
                    }}
                  >
                    <td>
                      <div className="request-number-cell">
                        <span>Заявка {index + 1}</span>
                      </div>
                    </td>
                    <td>{request.user_username || '—'}</td>
                    <td><span className={`status-pill status-${request.status}`}>{STATUS_LABELS[request.status] || request.status}</span></td>
                    <td>{request.items_count || request.items?.length || 0}</td>
                    <td>{Number(request.total_amount || 0).toFixed(2)} ₽</td>
                    <td>{formatDateTime(request.formed_at)}</td>
                    <td>
                      <div className="moderator-actions">
                        <button
                          type="button"
                          className="small-action-btn success-btn"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleComplete(request.id)
                          }}
                          disabled={isActionBusy || request.status !== 'formed'}
                        >
                          Завершить
                        </button>
                        <button
                          type="button"
                          className="small-action-btn danger-btn"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleReject(request.id)
                          }}
                          disabled={isActionBusy || request.status !== 'formed'}
                        >
                          Отклонить
                        </button>
                        <button
                          type="button"
                          className="small-action-btn neutral-btn"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDelete(request.id)
                          }}
                          disabled={isActionBusy || !['completed', 'rejected'].includes(request.status)}
                        >
                          Удалить
                        </button>
                      </div>
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

export default ModeratorRequestsPage
