export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { token, action } = req.body || {}

  if (!token) {
    return res.status(400).json({ success: false, error: 'Token no proporcionado' })
  }

  const secretKey = process.env.RECAPTCHA_SECRET_KEY
  if (!secretKey) {
    // Sin secret key configurada, permitir continuar (degradación elegante)
    return res.status(200).json({ success: true, score: null })
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      return res.status(200).json({ success: false, score: 0 })
    }

    // Verificar que la acción coincida (si se proporcionó)
    if (action && data.action && data.action !== action) {
      return res.status(200).json({ success: false, score: data.score || 0 })
    }

    // Score threshold: 0.5 (debajo = probable bot)
    const score = data.score || 0
    if (score < 0.5) {
      return res.status(200).json({ success: false, score })
    }

    return res.status(200).json({ success: true, score })
  } catch {
    // Error de red con Google, permitir continuar
    return res.status(200).json({ success: true, score: null })
  }
}
