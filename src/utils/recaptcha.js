const SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY

let scriptLoaded = false
let scriptLoading = false

function loadRecaptchaScript() {
  if (!SITE_KEY || scriptLoaded || scriptLoading) return
  scriptLoading = true
  const script = document.createElement('script')
  script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`
  script.async = true
  script.onload = () => { scriptLoaded = true }
  document.head.appendChild(script)
}

// Cargar script al importar el módulo (si la key existe)
loadRecaptchaScript()

/**
 * Obtiene un token de reCAPTCHA v3 para la acción indicada.
 * Retorna null si reCAPTCHA no está disponible (degradación elegante).
 */
export async function getRecaptchaToken(action) {
  if (!SITE_KEY) return null

  try {
    // Esperar a que grecaptcha esté disponible (máx 5s)
    if (!window.grecaptcha?.execute) {
      await new Promise((resolve, reject) => {
        let attempts = 0
        const interval = setInterval(() => {
          attempts++
          if (window.grecaptcha?.execute) {
            clearInterval(interval)
            resolve()
          } else if (attempts > 50) {
            clearInterval(interval)
            reject(new Error('timeout'))
          }
        }, 100)
      })
    }

    const token = await window.grecaptcha.execute(SITE_KEY, { action })
    return token
  } catch {
    return null
  }
}

/**
 * Verifica el token contra el endpoint serverless.
 * Retorna { success, score } o permite continuar si la verificación no está disponible.
 */
export async function verifyRecaptcha(token, action) {
  if (!token) return { success: true, score: null }

  try {
    const res = await fetch('/api/verify-recaptcha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, action }),
    })
    const data = await res.json()
    return data
  } catch {
    // Si el endpoint falla, permitir continuar (degradación elegante)
    return { success: true, score: null }
  }
}
