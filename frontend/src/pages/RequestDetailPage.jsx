import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import Breadcrumbs from '../components/Breadcrumbs'
import {
  fetchCart,
  removeCartItem,
  submitDraftRequest,
  updateCartItemQuantity,
  updateDraftRequest,
} from '../store/cartSlice'
import { fetchRequestById } from '../store/requestsSlice'

const STATUS_LABELS = {
  draft: 'Черновик',
  formed: 'Сформирована',
  completed: 'Завершена',
  rejected: 'Отклонена',
}

function formatCurrency(value) {
  const amount = Number(value)
  return `${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'} ₽`
}

function getItemTotalDisplay(item) {
  if (item.item_total_display) return item.item_total_display
  const total = Number(item.item_total ?? item.calculated_value ?? item.substance_price * item.quantity)
  return formatCurrency(total)
}

function RequestDetailPage() {
  const { id } = useParams()
  const requestId = Number(id)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)
  const cart = useSelector((state) => state.cart)
  const { current, currentStatus, error } = useSelector((state) => state.requests)
  const [draftFields, setDraftFields] = useState({})
  const [localMessage, setLocalMessage] = useState('')

  useEffect(() => {
    if (!user) {
      navigate('/login', {
        state: {
          from: { pathname: `/requests/${id}` },
          authMessage: 'Войдите, чтобы открыть заявку',
        },
      })
      return
    }

    dispatch(fetchRequestById(requestId))
    dispatch(fetchCart())
  }, [dispatch, id, navigate, requestId, user])

  const request = useMemo(() => {
    if (cart.request_id === requestId && cart.request_status === 'draft') {
      return {
        id: cart.request_id,
        status: cart.request_status,
        items: cart.items,
        items_count: cart.items_count,
        total_amount: cart.total_amount,
        delivery_address: cart.delivery_address,
        comments: cart.comments,
      }
    }
    return current
  }, [cart, current, requestId])

  const isDraft = request?.status === 'draft'
  const isBusy = cart.status === 'loading' || currentStatus === 'loading'
  const deliveryAddress = draftFields.delivery_address ?? request?.delivery_address ?? ''
  const comments = draftFields.comments ?? request?.comments ?? ''

  const handleQuantityChange = async (item, delta) => {
    const currentQuantity = parseInt(item.quantity, 10) || 1
    const newQuantity = currentQuantity + delta
    if (!isDraft || newQuantity < 1) return
    await dispatch(updateCartItemQuantity({ itemId: item.id, quantity: newQuantity }))
    dispatch(fetchRequestById(requestId))
  }

  const handleRemove = async (itemId) => {
    if (!isDraft) return
    await dispatch(removeCartItem(itemId))
    dispatch(fetchRequestById(requestId))
  }

  const handleSave = async () => {
    if (!isDraft) return
    const result = await dispatch(updateDraftRequest({
      requestId,
      payload: {
        delivery_address: deliveryAddress,
        comments,
      },
    }))
    if (updateDraftRequest.fulfilled.match(result)) {
      setLocalMessage('Заявка сохранена')
      setDraftFields({})
      dispatch(fetchRequestById(requestId))
    }
  }

  const handleSubmit = async () => {
    if (!isDraft) return
    const result = await dispatch(submitDraftRequest({
      requestId,
      payload: {
        delivery_address: deliveryAddress,
        comments,
      },
    }))
    if (submitDraftRequest.fulfilled.match(result)) {
      navigate('/requests')
    }
  }

  if (isBusy && !request) {
    return (
      <main className="main-container">
        <div className="loader-block">Загрузка заявки...</div>
      </main>
    )
  }

  if (error && !request) {
    return (
      <main className="main-container">
        <div className="alert-danger">{error}</div>
      </main>
    )
  }

  if (!request) {
    return (
      <main className="main-container">
        <div className="text-center">Заявка не найдена</div>
      </main>
    )
  }

  return (
    <main className="main-container">
      <Breadcrumbs />
      <div className="page-heading-row">
        <div>
          <h1 className="page-title">Заявка</h1>
          <span className={`status-pill status-${request.status}`}>{STATUS_LABELS[request.status] || request.status}</span>
        </div>
        <Link to="/requests" className="table-action">К списку заявок</Link>
      </div>

      {localMessage && <div className="success-alert">{localMessage}</div>}
      {cart.error && <div className="alert-danger">{cart.error}</div>}

      <section className="request-edit-grid">
        <label className="profile-field">
          <span>Адрес доставки</span>
          <input
            className="search-input"
            value={deliveryAddress}
            onChange={(event) => setDraftFields((prev) => ({ ...prev, delivery_address: event.target.value }))}
            disabled={!isDraft}
            placeholder="Город, улица, дом"
          />
        </label>
        <label className="profile-field">
          <span>Комментарий</span>
          <textarea
            className="profile-textarea"
            value={comments}
            onChange={(event) => setDraftFields((prev) => ({ ...prev, comments: event.target.value }))}
            disabled={!isDraft}
            placeholder="Дополнительные пожелания"
          />
        </label>
      </section>

      <div className="request-list">
        <h2>Позиции заявки</h2>
        {request.items?.length ? request.items.map((item) => (
          <div key={item.id} className="request-item-row">
            <div className="item-fields">
              <span className="item-name">{item.substance_name}</span>
              <span className="item-cas">CAS: {item.substance_cas}</span>
              <div className="item-quantity">
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item, -1)}
                  disabled={!isDraft || isBusy || (parseInt(item.quantity, 10) || 1) <= 1}
                  aria-label={`Уменьшить количество ${item.substance_name}`}
                >-</button>
                <span className="quantity-value">{parseInt(item.quantity, 10) || 1}</span>
                <button
                  type="button"
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(item, 1)}
                  disabled={!isDraft || isBusy}
                  aria-label={`Увеличить количество ${item.substance_name}`}
                >+</button>
              </div>
              <span className="item-price">{getItemTotalDisplay(item)}</span>
            </div>
            {isDraft && (
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="remove-btn"
                disabled={isBusy}
              >
                x
              </button>
            )}
          </div>
        )) : (
          <div className="text-center">В заявке нет позиций</div>
        )}
      </div>

      <div className="request-summary-card">
        <div className="summary-title">Итоговая сумма</div>
        <div className="summary-value">{formatCurrency(request.total_amount)}</div>
      </div>

      {isDraft && (
        <div className="action-row">
          <button className="add-to-request-btn action-btn" onClick={handleSave} disabled={isBusy}>
            Сохранить черновик
          </button>
          <button className="add-to-request-btn action-btn success-btn" onClick={handleSubmit} disabled={isBusy || !request.items?.length}>
            Сформировать заявку
          </button>
        </div>
      )}
    </main>
  )
}

export default RequestDetailPage
