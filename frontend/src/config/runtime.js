export const IS_GUEST_APP = import.meta.env.VITE_TAURI_GUEST === 'true'
export const IS_MOCK_MODE = import.meta.env.VITE_USE_MOCK === 'true' || import.meta.env.MODE === 'pages'

export const ROUTER_BASENAME = (() => {
  const base = import.meta.env.BASE_URL || '/'
  if (base === '/' || base === './') return '/'
  return base.endsWith('/') ? base.slice(0, -1) : base
})()
