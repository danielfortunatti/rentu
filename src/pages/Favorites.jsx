import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { getFavorites } from '../lib/supabase'
import PropertyCard from '../components/PropertyCard'

export default function Favorites({ user }) {
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await getFavorites(user.id)
      const mapped = (data || []).map(fav => {
        const p = fav.properties
        if (!p) return null
        return {
          ...p,
          fotos: p.property_photos?.sort((a, b) => (a.position || 0) - (b.position || 0)).map(ph => ph.url) || [],
          gastoComun: p.gasto_comun,
          fechaPublicacion: p.created_at,
        }
      }).filter(Boolean)
      setFavorites(mapped)
      setLoading(false)
    }
    load()
  }, [user])

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Mis favoritos | Rentu</title>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mb-2">Mis favoritos</h1>
        <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Propiedades que guardaste para ver después.</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            {/* Heart illustration */}
            <svg className="w-28 h-28 mx-auto mb-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 120 120" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M60 95 L25 60 A20 20 0 0 1 60 40 A20 20 0 0 1 95 60 Z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M50 55 l5 5 10-10" className="text-brand-400 dark:text-brand-600" stroke="currentColor" opacity="0.5" />
            </svg>
            <h3 className="font-display font-semibold text-xl text-gray-700 dark:text-gray-200 mb-2">Aún no tienes favoritos</h3>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-8 max-w-xs mx-auto">Explora propiedades y guarda las que te gusten para verlas después.</p>
            <Link to="/buscar" className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              Explorar propiedades
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map(prop => <PropertyCard key={prop.id} property={prop} />)}
          </div>
        )}
      </div>
    </div>
  )
}
