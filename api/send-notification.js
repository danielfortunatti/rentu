import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

const esc = (s) => String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

function emailLayout(title, bodyHtml) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #fafafa;">
      <div style="background: linear-gradient(135deg, #0d9478, #14b894); padding: 24px 30px; border-radius: 16px 16px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;">Rentu</h1>
        <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 14px;">${esc(title)}</p>
      </div>
      <div style="background: white; padding: 30px; border: 1px solid #e5e5e5; border-top: none; border-radius: 0 0 16px 16px;">
        ${bodyHtml}
      </div>
      <p style="color: #999; font-size: 11px; text-align: center; margin-top: 20px;">Rentu — Arriendos directos, sin intermediarios.</p>
    </div>
  `
}

function ctaButton(text, url) {
  return `<a href="${esc(url)}" style="display: inline-block; background: #14b894; color: white; padding: 12px 28px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px;">${esc(text)}</a>`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const { type, to, userId, data } = req.body

  if (!type || !data) {
    return res.status(400).json({ error: 'Faltan campos requeridos: type, data' })
  }

  // Resolver email: usar "to" directo o buscar por userId
  let recipientEmail = to
  if (!recipientEmail && userId) {
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId)
    recipientEmail = userData?.user?.email
  }
  if (!recipientEmail) {
    return res.status(400).json({ error: 'Se requiere "to" (email) o "userId" para enviar la notificación' })
  }

  try {
    let subject = ''
    let html = ''

    switch (type) {
      case 'new-contact': {
        subject = `Alguien consultó por tu propiedad: ${data.propertyTitle}`
        html = emailLayout('Nueva consulta recibida', `
          <h2 style="color: #1a1a2e; margin: 0 0 12px; font-size: 20px;">Tienes un nuevo interesado</h2>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Alguien se interesó en tu propiedad <strong>${esc(data.propertyTitle)}</strong> y te contactó por WhatsApp.
          </p>
          <div style="background: #f8f9fa; padding: 16px 20px; border-radius: 10px; border: 1px solid #eee; margin-bottom: 16px;">
            <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>Nombre:</strong> ${esc(data.contactName)}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>Teléfono:</strong> ${esc(data.contactPhone || 'No proporcionado')}</p>
          </div>
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Responde lo antes posible para no perder al interesado.
          </p>
          ${ctaButton('Ver mi propiedad', 'https://rentu.cl')}
        `)
        break
      }

      case 'property-published': {
        subject = `Tu propiedad fue publicada: ${data.propertyTitle}`
        html = emailLayout('Propiedad publicada', `
          <h2 style="color: #1a1a2e; margin: 0 0 12px; font-size: 20px;">Tu propiedad ya está en línea</h2>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            <strong>${esc(data.propertyTitle)}</strong> ya es visible para miles de personas buscando arriendo.
          </p>
          <div style="background: #f8f9fa; padding: 16px 20px; border-radius: 10px; border: 1px solid #eee; margin-bottom: 16px;">
            <p style="margin: 4px 0; font-size: 14px; color: #333;">Los interesados te contactarán por WhatsApp o recibirás un email cuando alguien consulte.</p>
          </div>
          ${data.propertyUrl ? ctaButton('Ver publicación', data.propertyUrl) : ''}
        `)
        break
      }

      case 'payment-confirmed': {
        subject = 'Pago confirmado en Rentu'
        html = emailLayout('Pago confirmado', `
          <h2 style="color: #1a1a2e; margin: 0 0 12px; font-size: 20px;">Tu pago fue procesado correctamente</h2>
          <p style="color: #555; font-size: 14px; line-height: 1.6; margin: 0 0 20px;">
            Se confirmó el pago por la propiedad <strong>${esc(data.propertyTitle)}</strong>.
          </p>
          <div style="background: #f8f9fa; padding: 16px 20px; border-radius: 10px; border: 1px solid #eee; margin-bottom: 16px;">
            <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>Propiedad:</strong> ${esc(data.propertyTitle)}</p>
            <p style="margin: 4px 0; font-size: 14px; color: #333;"><strong>Monto:</strong> $${Number(data.amount).toLocaleString('es-CL')}</p>
          </div>
          <p style="color: #555; font-size: 14px; line-height: 1.6;">
            Gracias por usar Rentu.
          </p>
          ${ctaButton('Ir a Rentu', 'https://rentu.cl')}
        `)
        break
      }

      default:
        return res.status(400).json({ error: `Tipo de notificación no válido: ${type}` })
    }

    const result = await resend.emails.send({
      from: 'Rentu <notificaciones@rentu.cl>',
      to: recipientEmail,
      subject,
      html,
    })

    return res.status(200).json({ success: true, id: result.data?.id || result.id })
  } catch (error) {
    console.error('Error enviando notificación:', error)
    return res.status(500).json({ error: error.message })
  }
}
