import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const FLOW_API_KEY = process.env.FLOW_API_KEY
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY
const FLOW_API_URL = 'https://www.flow.cl/api'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// Precios fijos — no se aceptan desde el cliente
const PRICES = {
  destacar: 2990,
  corredor: 5990,
}

const SUBJECTS = {
  destacar: 'Destacar propiedad en Rentu',
  corredor: 'Publicación de corredor en Rentu',
}

function signParams(params) {
  const sorted = Object.keys(params).sort().map(key => `${key}${params[key]}`).join('')
  return crypto.createHmac('sha256', FLOW_SECRET_KEY).update(sorted).digest('hex')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { propertyId, userId, type, email } = req.body

  // Validar tipo y obtener precio del servidor
  const amount = PRICES[type]
  if (!amount) {
    return res.status(400).json({ error: 'Tipo de pago no valido' })
  }

  try {
    const commerceOrder = `AY-${Date.now()}`

    const params = {
      apiKey: FLOW_API_KEY,
      commerceOrder,
      subject: SUBJECTS[type] || 'Pago en Rentu',
      currency: 'CLP',
      amount,
      email,
      urlConfirmation: `${req.headers.origin || 'https://rentu.cl'}/api/payment-confirm`,
      urlReturn: `${req.headers.origin || 'https://rentu.cl'}/pago-exitoso`,
    }

    params.s = signParams(params)

    // Guardar pago en DB con commerce_order
    await supabase.from('payments').insert({
      property_id: propertyId,
      user_id: userId,
      tipo: type,
      monto: amount,
      commerce_order: commerceOrder,
      estado: 'pendiente',
    })

    const response = await fetch(`${FLOW_API_URL}/payment/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    })

    const data = await response.json()

    if (data.url && data.token) {
      return res.status(200).json({
        paymentUrl: `${data.url}?token=${data.token}`,
        commerceOrder,
        token: data.token,
      })
    } else {
      return res.status(400).json({ error: data.message || 'Error al crear pago en Flow' })
    }
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
