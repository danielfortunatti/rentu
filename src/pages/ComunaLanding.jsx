import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { getProperties } from '../lib/supabase'
import { comunas } from '../data/comunas'
import { SkeletonCard } from '../components/SkeletonLoader'

const comunaData = {
  'providencia': { title: 'Providencia', desc: 'Zona céntrica con excelente conectividad, gastronomía y vida urbana. Una de las comunas más buscadas para arrendar en Santiago.' },
  'las-condes': { title: 'Las Condes', desc: 'Barrios residenciales premium con acceso a centros comerciales, parques y servicios de primer nivel.' },
  'nunoa': { title: 'Ñuñoa', desc: 'Vida de barrio auténtica con ferias, cafés, plazas y excelente conectividad por metro.' },
  'santiago-centro': { title: 'Santiago Centro', desc: 'El corazón de la capital con la mejor conectividad del país y precios accesibles.' },
  'vitacura': { title: 'Vitacura', desc: 'Comuna residencial de alto estándar con parques, centros comerciales y amplia oferta gastronómica.' },
  'la-florida': { title: 'La Florida', desc: 'Una de las comunas más grandes de Santiago, familiar y con buena conectividad.' },
  'maipu': { title: 'Maipú', desc: 'Comuna en constante crecimiento con proyectos nuevos y precios competitivos.' },
  'vina-del-mar': { title: 'Viña del Mar', desc: 'La ciudad jardín de Chile, con playa, casino y excelente calidad de vida.' },
  'valparaiso': { title: 'Valparaíso', desc: 'Ciudad patrimonial, bohemia y universitaria, con vistas al mar y cultura vibrante.' },
  'concepcion': { title: 'Concepción', desc: 'Capital del sur de Chile, centro universitario y comercial del Biobío.' },
  'temuco': { title: 'Temuco', desc: 'Puerta de entrada a la Araucanía, con mercados, universidades y naturaleza cercana.' },
  'la-serena': { title: 'La Serena', desc: 'Ciudad costera del norte con playas, cielos limpios y crecimiento inmobiliario.' },
  'antofagasta': { title: 'Antofagasta', desc: 'Capital minera de Chile con alta actividad económica y arriendos dinámicos.' },
  'puente-alto': { title: 'Puente Alto', desc: 'La comuna más poblada de Chile, con oferta variada y precios accesibles.' },
  'lo-barnechea': { title: 'Lo Barnechea', desc: 'Zona residencial precordillerana, naturaleza y tranquilidad cerca de la ciudad.' },
}

function slugToComuna(slug) {
  const normalizedSlug = slug.toLowerCase().replace(/-/g, ' ')
  return comunas.find(c =>
    c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ') === normalizedSlug
  ) || null
}

export default function ComunaLanding() {
  const { slug } = useParams()
  const comunaName = slugToComuna(slug)
  const data = comunaData[slug] || null
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    async function load() {
      if (!comunaName) { setLoading(false); return }
      const { data: results, count } = await getProperties({
        page: 1, pageSize: 12, sortBy: 'destacados', comuna: comunaName,
      })
      const mapped = (results || []).map(p => ({
        ...p,
        fotos: p.property_photos?.sort((a, b) => a.position - b.position).map(ph => ph.url) || [],
        gastoComun: p.gasto_comun,
        fechaPublicacion: p.created_at,
      }))
      setProperties(mapped)
      setTotalCount(count || 0)
      setLoading(false)
    }
    load()
  }, [comunaName])

  if (!comunaName) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display font-bold text-2xl text-gray-800 dark:text-gray-100 mb-4">Comuna no encontrada</h2>
          <Link to="/buscar" className="text-brand-600 hover:text-brand-700 text-sm font-medium">Buscar en todas las comunas</Link>
        </div>
      </div>
    )
  }

  const pageTitle = `Arriendos en ${data?.title || comunaName}`
  const pageDesc = data?.desc || `Encuentra departamentos y casas en arriendo en ${comunaName}. Publicaciones directas sin comisiones.`

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>{pageTitle} | Rentu</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={`https://rentu-cl.vercel.app/arriendos/${slug}`} />
      </Helmet>

      {/* Hero */}
      <section className="bg-gray-950 py-16 sm:py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-600/30 to-transparent" />
        </div>
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-300">Inicio</Link><span>/</span>
            <Link to="/buscar" className="hover:text-gray-300">Buscar</Link><span>/</span>
            <span className="text-gray-300">{data?.title || comunaName}</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white mb-4">
            Arriendos en {data?.title || comunaName}
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mb-6">{pageDesc}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
              {loading ? '...' : `${totalCount} propiedades disponibles`}
            </span>
          </div>
        </div>
      </section>

      {/* Properties */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1,2,3,4,5,6,7,8].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5" /></svg>
            <h3 className="font-display font-semibold text-lg text-gray-600 dark:text-gray-300 mb-2">Aún no hay propiedades en {comunaName}</h3>
            <p className="text-sm text-gray-400 mb-4">Sé el primero en publicar en esta comuna.</p>
            <Link to="/publicar" className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl transition-colors inline-block">Publicar propiedad</Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {properties.map(property => <PropertyCard key={property.id} property={property} />)}
            </div>
            {totalCount > 12 && (
              <div className="text-center mt-10">
                <Link
                  to={`/buscar?comuna=${encodeURIComponent(comunaName)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors"
                >
                  Ver todas las propiedades en {comunaName}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            )}
          </>
        )}

        {/* SEO content */}
        <div className="mt-16 prose prose-sm prose-gray max-w-3xl dark:prose-invert">
          <h2 className="font-display text-xl text-gray-800 dark:text-gray-100">Arriendo de departamentos y casas en {data?.title || comunaName}</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Encuentra las mejores opciones de arriendo en {data?.title || comunaName} con Rentu.
            Publicamos arriendos sin comisiones, con contacto directo por WhatsApp y generación
            de contrato de arriendo gratuito. Filtra por precio, dormitorios, mascotas,
            estacionamiento y mucho más.
          </p>
          <h3 className="font-display text-lg text-gray-800 dark:text-gray-100">Arrienda directo, sin intermediarios</h3>
          <p className="text-gray-500 dark:text-gray-400">
            En Rentu no cobramos comisión ni al arrendador ni al arrendatario.
            Conectamos a ambas partes directamente para que el proceso sea más rápido,
            transparente y económico. Todas las publicaciones en {data?.title || comunaName} incluyen
            fotos, ubicación exacta y contacto directo con el propietario.
          </p>
        </div>
      </section>
    </div>
  )
}
