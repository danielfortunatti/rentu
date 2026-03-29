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
    <div className="min-h-screen bg-warm-50 pt-20">
      <Helmet>
        <title>Mis favoritos | Rentu</title>
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">Mis favoritos</h1>
        <p className="text-gray-500 text-sm mb-8">Propiedades que guardaste para ver después.</p>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </div>
            <h3 className="font-display font-semibold text-gray-700 text-lg mb-2">No tienes favoritos aún</h3>
            <p className="text-gray-400 text-sm mb-6">Busca arriendos y guarda los que te gusten.</p>
            <Link to="/buscar" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Buscar arriendos</Link>
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
