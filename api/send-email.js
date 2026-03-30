import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

// Sanitizar HTML para evitar inyección
const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Rate limiting simple en memoria
const rateLimitMap = new Map()
function checkRateLimit(key, maxPerMinute = 5) {
  const now = Date.now()
  const entries = rateLimitMap.get(key) || []
  const recent = entries.filter(t => now - t < 60000)
  if (recent.length >= maxPerMinute) return false
  recent.push(now)
  rateLimitMap.set(key, recent)
  return true
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { type, data, authToken } = req.body

  // Verificar autenticación para emails que no sean welcome
  if (type !== 'welcome') {
    if (!authToken) {
      return res.status(401).json({ error: 'No autorizado' })
    }
    const { data: { user }, error } = await supabase.auth.getUser(authToken)
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' })
    }
    // Rate limit por usuario
    if (!checkRateLimit(user.id, 10)) {
      return res.status(429).json({ error: 'Demasiadas solicitudes. Intenta de nuevo en un minuto.' })
    }
  }

  try {
    let emailConfig = {}

    switch (type) {
      case 'welcome':
        emailConfig = {
          from: 'Rentu <noreply@rentu.cl>',
          to: data.email,
          subject: 'Bienvenido a Rentu',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0d9478, #14b894); padding: 30px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 28px;">Rentu</h1>
                <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">Tu plataforma de arriendos en Chile</p>
              </div>
              <h2 style="color: #1a1a2e;">Hola${data.name ? ' ' + esc(data.name) : ''}!</h2>
              <p style="color: #555; line-height: 1.6;">Bienvenido a Rentu. Ya puedes:</p>
              <ul style="color: #555; line-height: 2;">
                <li>Publicar propiedades en arriendo gratis</li>
                <li>Buscar arriendos por comuna y precio</li>
                <li>Generar contratos de arriendo en PDF</li>
                <li>Contactar directamente por WhatsApp</li>
              </ul>
              <a href="https://rentu.cl" style="display: inline-block; background: #14b894; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 16px;">Explorar arriendos</a>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Rentu - Arriendos directos, sin intermediarios.</p>
            </div>
          `,
        }
        break

      case 'new-contact':
        emailConfig = {
          from: 'Rentu <noreply@rentu.cl>',
          to: data.ownerEmail,
          subject: `Nueva consulta por tu propiedad: ${esc(data.propertyTitle)}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0d9478, #14b894); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Nueva consulta</h1>
              </div>
              <p style="color: #555;">Alguien esta interesado en tu propiedad <strong>${esc(data.propertyTitle)}</strong>:</p>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>Nombre:</strong> ${esc(data.contactName)}</p>
                <p style="margin: 4px 0;"><strong>Email:</strong> ${esc(data.contactEmail)}</p>
                <p style="margin: 4px 0;"><strong>Telefono:</strong> ${esc(data.contactPhone || 'No proporcionado')}</p>
                <p style="margin: 4px 0;"><strong>Mensaje:</strong> ${esc(data.message || 'Sin mensaje')}</p>
              </div>
              <p style="color: #555;">Respondele lo antes posible para no perder el interesado.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Rentu - Arriendos directos, sin intermediarios.</p>
            </div>
          `,
        }
        break

      case 'saved-search-alert':
        emailConfig = {
          from: 'Rentu <noreply@rentu.cl>',
          to: data.email,
          subject: `Nueva propiedad que coincide con tu búsqueda: ${esc(data.propertyTitle)}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0d9478, #14b894); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Nueva propiedad para ti</h1>
              </div>
              <p style="color: #555;">Se publicó una propiedad que coincide con tu búsqueda <strong>"${esc(data.searchName)}"</strong>:</p>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>${esc(data.propertyTitle)}</strong></p>
                <p style="margin: 4px 0;">${esc(data.comuna)} — $${Number(data.precio).toLocaleString('es-CL')}/mes</p>
                <p style="margin: 4px 0;">${esc(data.tipo)} · ${data.habitaciones || '—'} dorm · ${data.m2 || '—'} m²</p>
              </div>
              <a href="https://rentu-cl.vercel.app/propiedad/${esc(data.propertyId)}" style="display: inline-block; background: #14b894; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 8px;">Ver propiedad</a>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Recibes este email porque tienes alertas activas en Rentu. Las alertas están incluidas en tu plan destacado.</p>
            </div>
          `,
        }
        break

      case 'property-published':
        emailConfig = {
          from: 'Rentu <noreply@rentu.cl>',
          to: data.email,
          subject: 'Tu propiedad fue publicada',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #0d9478, #14b894); padding: 20px; border-radius: 16px; text-align: center; margin-bottom: 20px;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Publicada!</h1>
              </div>
              <h2 style="color: #1a1a2e;">Tu propiedad ya esta en linea</h2>
              <div style="background: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
                <p style="margin: 4px 0;"><strong>${esc(data.propertyTitle)}</strong></p>
                <p style="margin: 4px 0;">${esc(data.comuna)} — $${Number(data.precio).toLocaleString('es-CL')}/mes</p>
              </div>
              <p style="color: #555;">Los interesados te contactaran por WhatsApp o recibiras un email cuando alguien consulte.</p>
              <p style="color: #999; font-size: 12px; margin-top: 30px;">Rentu - Arriendos directos, sin intermediarios.</p>
            </div>
          `,
        }
        break

      default:
        return res.status(400).json({ error: 'Tipo de email no valido' })
    }

    const result = await resend.emails.send(emailConfig)
    return res.status(200).json({ success: true, id: result.id })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
