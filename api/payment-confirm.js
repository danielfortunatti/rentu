import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const FLOW_API_KEY = process.env.FLOW_API_KEY
const FLOW_SECRET_KEY = process.env.FLOW_SECRET_KEY
const FLOW_API_URL = 'https://www.flow.cl/api'

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

function signParams(params) {
  const sorted = Object.keys(params).sort().map(key => `${key}${params[key]}`).join('')
  return crypto.createHmac('sha256', FLOW_SECRET_KEY).update(sorted).digest('hex')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { token } = req.body

    const params = {
      apiKey: FLOW_API_KEY,
      token,
    }
    params.s = signParams(params)

    const response = await fetch(`${FLOW_API_URL}/payment/getStatus`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(params).toString(),
    })

    const data = await response.json()

    if (data.status === 2) { // Pagado
      // Actualizar pago buscando por commerce_order (no por flow_token)
      const { data: payment } = await supabase
        .from('payments')
        .update({ estado: 'completado', flow_token: token })
        .eq('commerce_order', data.commerceOrder)
        .select()
        .single()

      if (payment && payment.tipo === 'destacar') {
        await supabase
          .from('properties')
          .update({ destacada: true })
          .eq('id', payment.property_id)
      }
    }

    return res.status(200).json({ status: data.status })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
