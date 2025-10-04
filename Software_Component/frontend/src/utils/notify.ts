type Variant = 'success' | 'info' | 'warning' | 'danger'

interface Options {
  duration?: number // ms
  variant?: Variant
}

const containerId = 'app-toast-container'

function ensureContainer() {
  let container = document.getElementById(containerId)
  if (!container) {
    container = document.createElement('div')
    container.id = containerId
    Object.assign(container.style, {
      position: 'fixed',
      top: '1rem',
      right: '1rem',
      zIndex: '1060',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      pointerEvents: 'none'
    })
    document.body.appendChild(container)
  }
  return container
}

const variantStyles: Record<Variant, {bg: string; color: string}> = {
  success: { bg: '#d1e7dd', color: '#0f5132' },
  info: { bg: '#cff4fc', color: '#055160' },
  warning: { bg: '#fff3cd', color: '#664d03' },
  danger: { bg: '#f8d7da', color: '#842029' }
}

export function showToast(message: string, options: Options = {}) {
  const { duration = 3000, variant = 'info' } = options
  const container = ensureContainer()

  // Build toast: content + close button + progress
  const toast = document.createElement('div')
  toast.setAttribute('role', 'status')
  toast.setAttribute('aria-live', 'polite')
  toast.style.pointerEvents = 'auto'
  toast.style.minWidth = '260px'
  toast.style.maxWidth = '480px'
  toast.style.padding = '0.9rem 1.1rem'
  toast.style.borderRadius = '0.5rem'
  toast.style.boxShadow = '0 0.75rem 1.25rem rgba(0,0,0,0.18)'
  toast.style.fontSize = '1rem'
  toast.style.lineHeight = '1.4'
  toast.style.transition = 'transform 180ms ease, opacity 180ms ease'
  toast.style.transform = 'translateY(-6px)'
  toast.style.opacity = '0'
  toast.style.position = 'relative'

  const styles = variantStyles[variant]
  toast.style.background = styles.bg
  toast.style.color = styles.color

  // content wrapper
  const content = document.createElement('div')
  content.style.display = 'flex'
  content.style.alignItems = 'center'
  content.style.gap = '0.5rem'
  content.style.paddingRight = '1.6rem' // space for close button
  content.textContent = message

  // close button
  const closeBtn = document.createElement('button')
  closeBtn.setAttribute('aria-label', 'Close')
  closeBtn.innerHTML = '&times;'
  Object.assign(closeBtn.style, {
    position: 'absolute',
    top: '6px',
    right: '8px',
    border: 'none',
    background: 'transparent',
    color: styles.color,
    fontSize: '1.2rem',
    lineHeight: '1',
    padding: '0',
    cursor: 'pointer'
  })

  // progress bar container
  const progressWrap = document.createElement('div')
  progressWrap.style.position = 'absolute'
  progressWrap.style.left = '0'
  progressWrap.style.right = '0'
  progressWrap.style.bottom = '0'
  progressWrap.style.height = '6px'
  progressWrap.style.borderRadius = '0 0 0.5rem 0.5rem'
  progressWrap.style.overflow = 'hidden'
  progressWrap.style.background = 'rgba(0,0,0,0.06)'

  const innerBar = document.createElement('div')
  innerBar.style.height = '100%'
  innerBar.style.width = '100%'
  innerBar.style.background = 'rgba(0,0,0,0.12)'
  innerBar.style.transformOrigin = 'left center'
  innerBar.style.transition = `width ${duration}ms linear`

  progressWrap.appendChild(innerBar)

  toast.appendChild(content)
  toast.appendChild(closeBtn)
  toast.appendChild(progressWrap)

  // Insert at the top
  container.insertBefore(toast, container.firstChild)

  // show + start progress
  let start = Date.now()
  let remaining = duration
  let timeout: ReturnType<typeof setTimeout>

  const hide = () => {
    toast.style.transform = 'translateY(-6px)'
    toast.style.opacity = '0'
    setTimeout(() => {
      try { container.removeChild(toast) } catch { /* ignore */ }
    }, 200)
  }

  const startTimer = (ms: number) => {
    // ensure any existing timer is cleared
    if (timeout) clearTimeout(timeout)
    start = Date.now()
    remaining = ms
    // trigger transition to 0 width over remaining ms
    innerBar.style.transition = `width ${remaining}ms linear`
    // force layout then set to 0 to animate
    requestAnimationFrame(() => {
      innerBar.style.width = '0%'
    })
    timeout = setTimeout(hide, remaining)
  }

  // Kick off
  requestAnimationFrame(() => {
    toast.style.transform = 'translateY(0)'
    toast.style.opacity = '1'
    // start progress animation
    startTimer(duration)
  })

  // close button dismiss
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    if (timeout) clearTimeout(timeout)
    hide()
  })

  // clicking the toast (outside close) dismisses early too
  toast.addEventListener('click', () => {
    if (timeout) clearTimeout(timeout)
    hide()
  })

  // Pause on hover: compute elapsed and freeze progress
  toast.addEventListener('mouseenter', () => {
    if (!timeout) return
    const elapsed = Date.now() - start
    const newRemaining = Math.max(remaining - elapsed, 0)
    // freeze progress bar: compute current width percentage
    const currentPct = Math.max(0, 100 * (1 - elapsed / remaining))
    innerBar.style.transition = 'none'
    innerBar.style.width = `${currentPct}%`
    if (timeout) clearTimeout(timeout)
    // set remaining to newRemaining for resume
    remaining = newRemaining
  })

  // Resume on leave
  toast.addEventListener('mouseleave', () => {
    // if already finished, don't restart
    if (remaining <= 0) return
    startTimer(remaining)
  })

  return {
    dismiss: hide
  }
}

export const toast = {
  success: (m: string, o?: Options) => showToast(m, { variant: 'success', ...(o || {}) }),
  info: (m: string, o?: Options) => showToast(m, { variant: 'info', ...(o || {}) }),
  warn: (m: string, o?: Options) => showToast(m, { variant: 'warning', ...(o || {}) }),
  error: (m: string, o?: Options) => showToast(m, { variant: 'danger', ...(o || {}) })
}

export default showToast
