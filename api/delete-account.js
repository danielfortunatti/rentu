import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { user_id } = req.body

  if (!user_id) {
    return res.status(400).json({ error: 'user_id es requerido' })
  }

  try {
    // 1. Obtener IDs de propiedades del usuario para borrar fotos
    const { data: properties } = await supabaseAdmin
      .from('properties')
      .select('id')
      .eq('user_id', user_id)

    const propertyIds = (properties || []).map(p => p.id)

    // 2. Eliminar fotos de propiedades
    if (propertyIds.length > 0) {
      await supabaseAdmin
        .from('property_photos')
        .delete()
        .in('property_id', propertyIds)
    }

    // 3. Eliminar propiedades
    await supabaseAdmin
      .from('properties')
      .delete()
      .eq('user_id', user_id)

    // 4. Eliminar favoritos
    await supabaseAdmin
      .from('favorites')
      .delete()
      .eq('user_id', user_id)

    // 5. Eliminar valoraciones (recibidas y escritas)
    await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('reviewed_user_id', user_id)

    await supabaseAdmin
      .from('reviews')
      .delete()
      .eq('reviewer_user_id', user_id)

    // 6. Eliminar perfil de arrendatario
    await supabaseAdmin
      .from('tenant_profiles')
      .delete()
      .eq('user_id', user_id)

    // 7. Eliminar contactos
    await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('owner_id', user_id)

    // 8. Eliminar pagos
    await supabaseAdmin
      .from('payments')
      .delete()
      .eq('user_id', user_id)

    // 9. Eliminar búsquedas guardadas
    await supabaseAdmin
      .from('saved_searches')
      .delete()
      .eq('user_id', user_id)

    // 10. Eliminar usuario de auth usando service role
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id)

    if (deleteError) {
      console.error('Error eliminando usuario de auth:', deleteError)
      return res.status(500).json({ error: 'Error al eliminar la cuenta de autenticación' })
    }

    return res.status(200).json({ success: true })
  } catch (error) {
    console.error('Error en delete-account:', error)
    return res.status(500).json({ error: error.message })
  }
}
