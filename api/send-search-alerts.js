import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { propertyId } = req.body
  if (!propertyId) {
    return res.status(400).json({ error: 'propertyId is required' })
  }

  try {
    // Get the property
    const { data: property } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single()

    if (!property || !property.destacada) {
      return res.status(200).json({ sent: 0, reason: 'Property not found or not featured' })
    }

    // Get all saved searches
    const { data: searches } = await supabase
      .from('saved_searches')
      .select('*, users:user_id (email)')

    if (!searches || searches.length === 0) {
      return res.status(200).json({ sent: 0 })
    }

    let sentCount = 0

    for (const search of searches) {
      const f = search.filters || {}
      const email = search.users?.email
      if (!email) continue

      // Check if property matches the saved search filters
      let matches = true
      if (f.comuna && f.comuna !== property.comuna) matches = false
      if (f.tipo && f.tipo !== property.tipo) matches = false
      if (f.precioMax && property.precio > Number(f.precioMax)) matches = false
      if (f.precioMin && property.precio < Number(f.precioMin)) matches = false
      if (f.habitaciones && property.habitaciones < Number(f.habitaciones)) matches = false
      if (f.banos && property.banos < Number(f.banos)) matches = false
      if (f.estacionamiento && !property.estacionamiento) matches = false
      if (f.mascotas && !property.mascotas) matches = false

      if (matches) {
        // Send email alert
        try {
          await fetch(`https://${req.headers.host}/api/send-email`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'saved-search-alert',
              data: {
                email,
                searchName: search.name,
                propertyTitle: property.titulo,
                propertyId: property.id,
                comuna: property.comuna,
                precio: property.precio,
                tipo: property.tipo,
                habitaciones: property.habitaciones,
                m2: property.m2,
              }
            })
          })

          // Also create in-app notification
          await supabase.from('notifications').insert({
            user_id: search.user_id,
            type: 'saved-search-match',
            message: `Nueva propiedad en ${property.comuna}: ${property.titulo} — $${property.precio?.toLocaleString('es-CL')}/mes`,
            data: { property_id: property.id },
          })

          sentCount++
        } catch {
          // Continue with next search
        }
      }
    }

    return res.status(200).json({ sent: sentCount })
  } catch (error) {
    return res.status(500).json({ error: error.message })
  }
}
