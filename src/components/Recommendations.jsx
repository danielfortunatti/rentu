import { useState, useEffect } from 'react'
import PropertyCard from './PropertyCard'
import { SkeletonCard } from './SkeletonLoader'
import { supabase } from '../lib/supabase'

export default function Recommendations({ user }) {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }

    async function loadRecommendations() {
      // Get user's favorite comunas from their favorites and saved searches
      const [{ data: favs }, { data: searches }] = await Promise.all([
        supabase
          .from('favorites')
          .select('properties:property_id (comuna, tipo, precio)')
          .eq('user_id', user.id)
          .limit(10),
        supabase
          .from('saved_searches')
          .select('filters')
          .eq('user_id', user.id)
          .limit(5),
      ])

      // Extract preferred comunas and types
      const prefComunas = new Set()
      const prefTipos = new Set()
      let avgPrice = 0
      let priceCount = 0

      if (favs) {
        favs.forEach(f => {
          if (f.properties?.comuna) prefComunas.add(f.properties.comuna)
          if (f.properties?.tipo) prefTipos.add(f.properties.tipo)
          if (f.properties?.precio) { avgPrice += f.properties.precio; priceCount++ }
        })
      }

      if (searches) {
        searches.forEach(s => {
          if (s.filters?.comuna) prefComunas.add(s.filters.comuna)
          if (s.filters?.tipo) prefTipos.add(s.filters.tipo)
        })
      }

      if (priceCount > 0) avgPrice = Math.round(avgPrice / priceCount)

      // Build query for recommendations
      let query = supabase
        .from('properties')
        .select('*, property_photos (id, url, position)')
        .eq('activa', true)
        .order('created_at', { ascending: false })
        .limit(4)

      // Filter by preferred comunas if we have them
      if (prefComunas.size > 0) {
        query = query.in('comuna', [...prefComunas])
      }

      // Filter around price range if we have it
      if (avgPrice > 0) {
        query = query.gte('precio', Math.round(avgPrice * 0.7)).lte('precio', Math.round(avgPrice * 1.3))
      }

      const { data } = await query

      if (data && data.length > 0) {
        const mapped = data.map(p => ({
          ...p,
          fotos: p.property_photos?.sort((a, b) => (a.position || 0) - (b.position || 0)).map(ph => ph.url) || [],
          gastoComun: p.gasto_comun,
          fechaPublicacion: p.created_at,
        }))
        setProperties(mapped)
      }
      setLoading(false)
    }

    loadRecommendations()
  }, [user])

  if (!user || (!loading && properties.length === 0)) return null

  return (
    <section className="py-16 sm:py-20 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-gray-900 dark:text-gray-100">Para ti</h2>
            <p className="text-xs text-gray-400">Basado en tus búsquedas y favoritos</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {properties.map(property => <PropertyCard key={property.id} property={property} />)}
          </div>
        )}
      </div>
    </section>
  )
}
