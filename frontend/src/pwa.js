import { IS_GUEST_APP } from './config/runtime'

if ('serviceWorker' in navigator && import.meta.env.PROD && !IS_GUEST_APP) {
  window.addEventListener('load', () => {
    const scope = import.meta.env.BASE_URL || '/'
    navigator.serviceWorker.register(`${scope}sw.js`, { scope }).catch(() => undefined)
  })
}
