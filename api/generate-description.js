import Anthropic from '@anthropic-ai/sdk'

function buildFallbackDescription(data) {
  const { tipo, comuna, habitaciones, banos, m2, estacionamiento, mascotas, amoblado, amenities, cercanias, estado, piso } = data

  const parts = []

  parts.push(`${tipo || 'Propiedad'} en arriendo ubicado en ${comuna || 'excelente ubicación'}.`)

  const features = []
  if (habitaciones) features.push(`${habitaciones} dormitorio${habitaciones > 1 ? 's' : ''}`)
  if (banos) features.push(`${banos} baño${banos > 1 ? 's' : ''}`)
  if (m2) features.push(`${m2} m² de superficie`)
  if (features.length > 0) parts.push(`Cuenta con ${features.join(', ')}.`)

  if (piso) parts.push(`Ubicado en el piso ${piso}.`)

  if (estado && estado !== 'Buen estado') parts.push(`Se encuentra en estado ${estado.toLowerCase()}.`)
  else if (estado === 'Buen estado') parts.push('Se encuentra en buen estado de conservación.')

  if (amoblado === 'amoblado') parts.push('Viene completamente amoblado, listo para habitar.')
  else if (amoblado === 'semi') parts.push('Viene semi-amoblado con lo esencial.')

  const extras = []
  if (estacionamiento) extras.push('estacionamiento')
  if (mascotas) extras.push('aceptación de mascotas')
  if (extras.length > 0) parts.push(`Incluye ${extras.join(' y ')}.`)

  if (amenities && amenities.length > 0) {
    const amenityLabels = {
      piscina: 'piscina', gimnasio: 'gimnasio', quincho: 'quincho', salon_eventos: 'salón de eventos',
      sala_cine: 'sala de cine', juegos_infantiles: 'juegos infantiles', lavanderia: 'lavandería',
      bicicletero: 'bicicletero', conserje: 'conserje 24/7', areas_verdes: 'áreas verdes',
      cowork: 'sala cowork', rooftop: 'rooftop',
    }
    const labels = amenities.map(a => amenityLabels[a] || a).filter(Boolean)
    if (labels.length > 0) parts.push(`El edificio ofrece ${labels.join(', ')}.`)
  }

  if (cercanias && cercanias.length > 0) {
    const cercaniaLabels = {
      metro: 'metro', paradero: 'paradero de bus', supermercado: 'supermercado', farmacia: 'farmacia',
      mall: 'centro comercial', colegio: 'colegios', hospital: 'centros de salud',
      parque: 'parques', restaurantes: 'restaurantes', banco: 'bancos',
    }
    const labels = cercanias.map(c => cercaniaLabels[c] || c).filter(Boolean)
    if (labels.length > 0) parts.push(`Cerca de ${labels.join(', ')}.`)
  }

  parts.push('Ideal para quienes buscan comodidad y buena ubicación. Agenda tu visita hoy.')

  return parts.join(' ')
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const data = req.body

  if (!data || !data.tipo || !data.comuna) {
    return res.status(400).json({ error: 'Se requiere al menos tipo y comuna' })
  }

  // Fallback if no API key
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(200).json({ description: buildFallbackDescription(data) })
  }

  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

    const propertyDetails = []
    propertyDetails.push(`Tipo: ${data.tipo}`)
    propertyDetails.push(`Comuna: ${data.comuna}`)
    if (data.habitaciones) propertyDetails.push(`Dormitorios: ${data.habitaciones}`)
    if (data.banos) propertyDetails.push(`Baños: ${data.banos}`)
    if (data.m2) propertyDetails.push(`Superficie: ${data.m2} m²`)
    if (data.piso) propertyDetails.push(`Piso: ${data.piso}`)
    if (data.estado) propertyDetails.push(`Estado: ${data.estado}`)
    if (data.amoblado) propertyDetails.push(`Amoblado: ${data.amoblado}`)
    if (data.estacionamiento) propertyDetails.push('Incluye estacionamiento')
    if (data.mascotas) propertyDetails.push('Acepta mascotas')
    if (data.amenities && data.amenities.length > 0) propertyDetails.push(`Amenities: ${data.amenities.join(', ')}`)
    if (data.cercanias && data.cercanias.length > 0) propertyDetails.push(`Cercanías: ${data.cercanias.join(', ')}`)

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 350,
      messages: [
        {
          role: 'user',
          content: `Escribe una descripción de arriendo de propiedad en español para Chile. Debe ser profesional pero cálida, entre 100 y 150 palabras. No uses emojis. No inventes datos que no estén en la información proporcionada. Menciona las características clave de forma natural y atractiva. No uses frases como "la mejor" o "#1". No incluyas precio. Escribe solo la descripción, sin título ni encabezados.

Datos de la propiedad:
${propertyDetails.join('\n')}`
        }
      ]
    })

    const description = message.content[0]?.text?.trim() || buildFallbackDescription(data)

    return res.status(200).json({ description })
  } catch (err) {
    console.error('Error generating description with AI:', err)
    // Fallback to template on error
    return res.status(200).json({ description: buildFallbackDescription(data) })
  }
}
