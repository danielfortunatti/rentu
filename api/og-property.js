import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  const { id } = req.query

  if (!id) {
    return res.redirect(301, '/og-image.png')
  }

  try {
    const { data: property } = await supabase
      .from('properties')
      .select('titulo, comuna, precio, tipo, habitaciones, banos, m2, property_photos (url, position)')
      .eq('id', isNaN(Number(id)) ? id : Number(id))
      .single()

    if (!property) {
      return res.redirect(301, '/og-image.png')
    }

    const photo = property.property_photos
      ?.sort((a, b) => (a.position || 0) - (b.position || 0))?.[0]?.url

    const price = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(property.precio)

    // Generate a simple HTML-based OG image using SVG
    const html = `
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#0a1628"/>
          <stop offset="100%" stop-color="#0d2137"/>
        </linearGradient>
        <linearGradient id="brand" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#08c4ac"/>
          <stop offset="100%" stop-color="#049e8d"/>
        </linearGradient>
        <clipPath id="photoClip">
          <rect x="40" y="40" width="500" height="550" rx="20"/>
        </clipPath>
      </defs>
      <!-- Background -->
      <rect width="1200" height="630" fill="url(#bg)"/>
      <!-- Photo -->
      ${photo ? `<image href="${photo}" x="40" y="40" width="500" height="550" clip-path="url(#photoClip)" preserveAspectRatio="xMidYMid slice"/>` : ''}
      ${!photo ? '<rect x="40" y="40" width="500" height="550" rx="20" fill="#1a2332"/>' : ''}
      <!-- Content area -->
      <rect x="580" y="40" width="580" height="550" rx="20" fill="#111827" opacity="0.6"/>
      <!-- Price badge -->
      <rect x="610" y="70" width="240" height="50" rx="12" fill="url(#brand)"/>
      <text x="730" y="103" font-family="Arial,sans-serif" font-size="24" font-weight="bold" fill="white" text-anchor="middle">${price}/mes</text>
      <!-- Title -->
      <text x="610" y="170" font-family="Arial,sans-serif" font-size="32" font-weight="bold" fill="white">
        ${property.titulo?.length > 28 ? property.titulo.slice(0, 28) + '...' : property.titulo || 'Propiedad'}
      </text>
      <!-- Location -->
      <text x="610" y="210" font-family="Arial,sans-serif" font-size="20" fill="#9ca3af">${property.comuna || ''} · ${property.tipo || ''}</text>
      <!-- Stats -->
      <text x="610" y="280" font-family="Arial,sans-serif" font-size="18" fill="#6b7280">${property.m2 || '—'} m²</text>
      <text x="750" y="280" font-family="Arial,sans-serif" font-size="18" fill="#6b7280">${property.habitaciones || '—'} dorm</text>
      <text x="880" y="280" font-family="Arial,sans-serif" font-size="18" fill="#6b7280">${property.banos || '—'} baños</text>
      <!-- Divider -->
      <rect x="610" y="310" width="520" height="1" fill="#1f2937"/>
      <!-- Branding -->
      <text x="610" y="540" font-family="Arial,sans-serif" font-size="16" fill="#4b5563">rentu-cl.vercel.app</text>
      <text x="610" y="570" font-family="Arial,sans-serif" font-size="22" font-weight="bold" fill="#08c4ac">Rentu</text>
      <text x="680" y="570" font-family="Arial,sans-serif" font-size="14" fill="#6b7280">Arriendos sin comisiones</text>
    </svg>`

    res.setHeader('Content-Type', 'image/svg+xml')
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=3600')
    return res.status(200).send(html)
  } catch {
    return res.redirect(301, '/og-image.png')
  }
}
