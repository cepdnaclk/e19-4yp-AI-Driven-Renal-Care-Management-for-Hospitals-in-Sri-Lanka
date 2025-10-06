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
    container.className = 'toast-container'
    document.body.appendChild(container)
  }
  return container
}

const variantIcons: Record<Variant, string> = {
  success: 'bi-check-circle-fill',
  info: 'bi-info-circle-fill',
  warning: 'bi-exclamation-triangle-fill',
  danger: 'bi-x-circle-fill'
}

export function showToast(message: string, options: Options = {}) {
  const { duration = 4000, variant = 'info' } = options
  const container = ensureContainer()

  // Build toast with improved structure
  const toast = document.createElement('div')
  toast.setAttribute('role', 'status')
  toast.setAttribute('aria-live', 'polite')
  toast.className = `toast-notification toast-${variant}`

  // Icon area
  const iconArea = document.createElement('div')
  iconArea.className = 'toast-icon'
  iconArea.innerHTML = `<i class="bi ${variantIcons[variant]}"></i>`

  // Content area
  const contentArea = document.createElement('div')
  contentArea.className = 'toast-content'
  contentArea.textContent = message

  // Close button
  const closeBtn = document.createElement('button')
  closeBtn.setAttribute('aria-label', 'Close notification')
  closeBtn.className = 'toast-close-btn'
  closeBtn.innerHTML = '<i class="bi bi-x"></i>'

  // Progress bar
  const progressBar = document.createElement('div')
  progressBar.className = 'toast-progress'
  const progressInner = document.createElement('div')
  progressInner.className = 'toast-progress-inner'
  progressBar.appendChild(progressInner)

  // Assemble toast
  toast.appendChild(iconArea)
  toast.appendChild(contentArea)
  toast.appendChild(closeBtn)
  toast.appendChild(progressBar)

  // Insert at the top
  container.insertBefore(toast, container.firstChild)

  // Animation and timing logic
  let start = Date.now()
  let remaining = duration
  let timeout: ReturnType<typeof setTimeout>

  const hide = () => {
    toast.classList.add('toast-hiding')
    setTimeout(() => {
      try { container.removeChild(toast) } catch { /* ignore */ }
    }, 300)
  }

  const startTimer = (ms: number) => {
    if (timeout) clearTimeout(timeout)
    start = Date.now()
    remaining = ms
    progressInner.style.transition = `width ${remaining}ms linear`
    requestAnimationFrame(() => {
      progressInner.style.width = '0%'
    })
    timeout = setTimeout(hide, remaining)
  }

  // Show toast with animation
  requestAnimationFrame(() => {
    toast.classList.add('toast-showing')
    startTimer(duration)
  })

  // Event handlers
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    if (timeout) clearTimeout(timeout)
    hide()
  })

  toast.addEventListener('click', () => {
    if (timeout) clearTimeout(timeout)
    hide()
  })

  // Pause on hover
  toast.addEventListener('mouseenter', () => {
    if (!timeout) return
    const elapsed = Date.now() - start
    const newRemaining = Math.max(remaining - elapsed, 0)
    const currentPct = Math.max(0, 100 * (1 - elapsed / remaining))
    progressInner.style.transition = 'none'
    progressInner.style.width = `${currentPct}%`
    if (timeout) clearTimeout(timeout)
    remaining = newRemaining
    toast.classList.add('toast-paused')
  })

  // Resume on leave
  toast.addEventListener('mouseleave', () => {
    if (remaining <= 0) return
    startTimer(remaining)
    toast.classList.remove('toast-paused')
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
