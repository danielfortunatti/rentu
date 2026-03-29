import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ============ AUTH ============
export async function signUp(email, password, name) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: window.location.origin
    }
  })
  return { data, error }
}

export async function resendVerificationEmail(email) {
  const { data, error } = await supabase.auth.resend({
    type: 'signup',
    email
  })
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { data, error }
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin }
  })
  return { data, error }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ============ PROPIEDADES ============
export async function getProperties({ page = 1, pageSize = 12, sortBy = 'destacados', search = '', ...filters } = {}) {
  let query = supabase.from('properties').select(`
    *,
    property_photos (id, url, position)
  `, { count: 'exact' }).eq('activa', true)

  // Text search
  if (search) {
    query = query.or(`titulo.ilike.%${search}%,descripcion.ilike.%${search}%`)
  }

  // Filters
  if (filters.comuna) {
    if (Array.isArray(filters.comuna)) {
      query = query.in('comuna', filters.comuna)
    } else {
      query = query.eq('comuna', filters.comuna)
    }
  }
  if (filters.tipo) query = query.eq('tipo', filters.tipo)
  if (filters.precioMin) query = query.gte('precio', Number(filters.precioMin))
  if (filters.precioMax) query = query.lte('precio', Number(filters.precioMax))
  if (filters.habitaciones) query = query.gte('habitaciones', Number(filters.habitaciones))
  if (filters.banos) query = query.gte('banos', Number(filters.banos))
  if (filters.gastoMax) query = query.lte('gasto_comun', Number(filters.gastoMax))
  if (filters.estacionamiento) query = query.eq('estacionamiento', true)
  if (filters.bodega) query = query.eq('bodega', true)
  if (filters.mascotas) query = query.eq('mascotas', true)
  if (filters.amoblado) query = query.eq('amoblado', filters.amoblado)
  if (filters.m2Min) query = query.gte('m2', Number(filters.m2Min))
  if (filters.m2Max) query = query.lte('m2', Number(filters.m2Max))
  if (filters.estado) query = query.eq('estado', filters.estado)
  if (filters.pisoMin) query = query.gte('piso', Number(filters.pisoMin))
  if (filters.publicadoEn) {
    const now = new Date()
    now.setDate(now.getDate() - Number(filters.publicadoEn))
    query = query.gte('created_at', now.toISOString())
  }
  if (filters.amenities && filters.amenities.length > 0) {
    query = query.contains('amenities', filters.amenities)
  }
  if (filters.cercanias && filters.cercanias.length > 0) {
    query = query.contains('cercanias', filters.cercanias)
  }

  // Sorting
  switch (sortBy) {
    case 'precio-asc': query = query.order('precio', { ascending: true }); break
    case 'precio-desc': query = query.order('precio', { ascending: false }); break
    case 'recientes': query = query.order('created_at', { ascending: false }); break
    case 'm2-desc': query = query.order('m2', { ascending: false, nullsFirst: false }); break
    case 'destacados':
    default:
      query = query.order('destacada', { ascending: false }).order('created_at', { ascending: false })
      break
  }

  // Pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query
  return { data: data || [], count: count || 0, error }
}

export async function getProperty(id) {
  const { data, error } = await supabase
    .from('properties')
    .select(`*, property_photos (id, url, position)`)
    .eq('id', id)
    .single()
  return { data, error }
}

export async function getFeaturedProperties() {
  const { data, error } = await supabase
    .from('properties')
    .select(`*, property_photos (id, url, position)`)
    .eq('activa', true)
    .eq('destacada', true)
    .order('created_at', { ascending: false })
    .limit(8)
  return { data: data || [], error }
}

export async function createProperty(propertyData) {
  const { data, error } = await supabase
    .from('properties')
    .insert(propertyData)
    .select()
    .single()
  return { data, error }
}

export async function updateProperty(propertyId, updates) {
  const { data, error } = await supabase
    .from('properties')
    .update(updates)
    .eq('id', propertyId)
    .select()
    .single()
  return { data, error }
}

export async function deleteProperty(propertyId) {
  await supabase.from('property_photos').delete().eq('property_id', propertyId)
  const { error } = await supabase.from('properties').delete().eq('id', propertyId)
  return { error }
}

export async function getMyProperties(userId) {
  const { data, error } = await supabase
    .from('properties')
    .select(`*, property_photos (id, url, position)`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

// ============ FAVORITOS ============
export async function addFavorite(userId, propertyId) {
  const { data, error } = await supabase
    .from('favorites')
    .insert({ user_id: userId, property_id: propertyId })
    .select()
    .single()
  return { data, error }
}

export async function removeFavorite(userId, propertyId) {
  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('user_id', userId)
    .eq('property_id', propertyId)
  return { error }
}

export async function getFavorites(userId) {
  const { data, error } = await supabase
    .from('favorites')
    .select(`*, properties:property_id (*, property_photos (id, url, position))`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function isFavorite(userId, propertyId) {
  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .maybeSingle()
  return !!data
}

// ============ VALORACIONES ============
export async function createReview(reviewData) {
  const { data, error } = await supabase
    .from('reviews')
    .insert(reviewData)
    .select()
    .single()
  return { data, error }
}

export async function getReviewsForUser(userId) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('reviewed_user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function getUserRating(userId) {
  const { data } = await supabase
    .from('reviews')
    .select('rating')
    .eq('reviewed_user_id', userId)
  if (!data || data.length === 0) return { avg: 0, count: 0 }
  const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length
  return { avg: Math.round(avg * 10) / 10, count: data.length }
}

// ============ PERFIL ARRENDATARIO ============
export async function getTenantProfile(userId) {
  const { data, error } = await supabase
    .from('tenant_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

export async function upsertTenantProfile(userId, profileData) {
  const { data, error } = await supabase
    .from('tenant_profiles')
    .upsert({ user_id: userId, ...profileData }, { onConflict: 'user_id' })
    .select()
    .single()
  return { data, error }
}

// ============ FOTOS ============
export async function uploadPhoto(file, propertyId) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${propertyId}/${Date.now()}.${fileExt}`

  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('property-photos')
    .upload(fileName, file)

  if (uploadError) return { error: uploadError }

  const { data: { publicUrl } } = supabase.storage
    .from('property-photos')
    .getPublicUrl(fileName)

  const { data, error } = await supabase
    .from('property_photos')
    .insert({ property_id: propertyId, url: publicUrl })
    .select()
    .single()

  return { data, error }
}

// ============ CONTACTOS ============
export async function createContact(contactData) {
  const { data, error } = await supabase
    .from('contacts')
    .insert(contactData)
    .select()
    .single()
  return { data, error }
}

export async function getMyContacts() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: [], error: 'No autenticado' }
  const { data, error } = await supabase
    .from('contacts')
    .select(`*, properties (titulo, comuna)`)
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

// ============ PAGOS ============
export async function createPayment(paymentData) {
  const { data, error } = await supabase
    .from('payments')
    .insert(paymentData)
    .select()
    .single()
  return { data, error }
}

export async function getMyPayments(userId) {
  const { data, error } = await supabase
    .from('payments')
    .select('*, properties:property_id (titulo, comuna)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

// ============ BÚSQUEDAS GUARDADAS ============
export async function saveSearch(userId, filters, name) {
  const { data, error } = await supabase
    .from('saved_searches')
    .insert({ user_id: userId, filters, name })
    .select()
    .single()
  return { data, error }
}

export async function getSavedSearches(userId) {
  const { data, error } = await supabase
    .from('saved_searches')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  return { data: data || [], error }
}

export async function deleteSavedSearch(id) {
  const { error } = await supabase
    .from('saved_searches')
    .delete()
    .eq('id', id)
  return { error }
}

// ============ ADMIN ============
export function isAdmin(user) {
  if (!user) return false
  const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',').map(e => e.trim()).filter(Boolean)
  return adminEmails.includes(user.email)
}

export async function getAllProperties(page = 1, pageSize = 20, search = '') {
  let query = supabase
    .from('properties')
    .select('*, property_photos (id, url, position)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (search) {
    query = query.ilike('titulo', `%${search}%`)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query
  return { data: data || [], count: count || 0, error }
}

export async function togglePropertyActive(id, activa) {
  const { data, error } = await supabase
    .from('properties')
    .update({ activa })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function togglePropertyFeatured(id, destacada) {
  const { data, error } = await supabase
    .from('properties')
    .update({ destacada })
    .eq('id', id)
    .select()
    .single()
  return { data, error }
}

export async function deletePropertyAdmin(id) {
  // Delete photos from storage first
  const { data: photos } = await supabase
    .from('property_photos')
    .select('url')
    .eq('property_id', id)

  if (photos && photos.length > 0) {
    const paths = photos.map(p => {
      const parts = p.url.split('/property-photos/')
      return parts.length > 1 ? parts[1] : null
    }).filter(Boolean)
    if (paths.length > 0) {
      await supabase.storage.from('property-photos').remove(paths)
    }
  }

  await supabase.from('property_photos').delete().eq('property_id', id)
  await supabase.from('favorites').delete().eq('property_id', id)
  await supabase.from('contacts').delete().eq('property_id', id)
  const { error } = await supabase.from('properties').delete().eq('id', id)
  return { error }
}

export async function getAllPayments(page = 1, pageSize = 20, estado = '') {
  let query = supabase
    .from('payments')
    .select('*, properties:property_id (titulo, comuna)', { count: 'exact' })
    .order('created_at', { ascending: false })

  if (estado) {
    query = query.eq('estado', estado)
  }

  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, count, error } = await query
  return { data: data || [], count: count || 0, error }
}

export async function getAdminStats() {
  // Total active properties
  const { count: totalActive } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .eq('activa', true)

  // Total properties
  const { count: totalProperties } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })

  // Unique users from properties
  const { data: usersData } = await supabase
    .from('properties')
    .select('user_id')
  const uniqueUsers = usersData ? new Set(usersData.map(p => p.user_id)).size : 0

  // Properties today
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const { count: todayCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString())

  // Properties this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  const { count: weekCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', weekAgo.toISOString())

  // Properties this month
  const monthAgo = new Date()
  monthAgo.setDate(monthAgo.getDate() - 30)
  const { count: monthCount } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', monthAgo.toISOString())

  // Completed payments
  const { data: payments } = await supabase
    .from('payments')
    .select('monto')
    .eq('estado', 'completado')
  const totalRevenue = payments ? payments.reduce((sum, p) => sum + (p.monto || 0), 0) : 0
  const totalPayments = payments ? payments.length : 0

  return {
    totalActive: totalActive || 0,
    totalProperties: totalProperties || 0,
    uniqueUsers,
    todayCount: todayCount || 0,
    weekCount: weekCount || 0,
    monthCount: monthCount || 0,
    totalRevenue,
    totalPayments
  }
}

// ============ VERIFICACIONES ============
export async function createVerification(userId, verificationData) {
  const { data, error } = await supabase
    .from('verifications')
    .upsert({ user_id: userId, ...verificationData, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
    .select()
    .single()
  return { data, error }
}

export async function getVerification(userId) {
  const { data, error } = await supabase
    .from('verifications')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()
  return { data, error }
}

export async function uploadVerificationDoc(file, userId, docType) {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${docType}_${Date.now()}.${fileExt}`
  const { data, error } = await supabase.storage
    .from('verification-docs')
    .upload(fileName, file)
  if (error) return { error }
  const { data: { publicUrl } } = supabase.storage
    .from('verification-docs')
    .getPublicUrl(fileName)
  return { url: publicUrl, error: null }
}
