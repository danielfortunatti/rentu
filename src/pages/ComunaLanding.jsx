import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useParams, Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { getProperties } from '../lib/supabase'
import { comunas } from '../data/comunas'
import { formatPrice } from '../data/properties'
import { SkeletonCard } from '../components/SkeletonLoader'

const comunaInfo = {
  'Providencia': { population: '142.000', avg_rent: 650000, metro: true, safety: 4, walkability: 5, nearby: ['Metro Pedro de Valdivia', 'Costanera Center', 'Parque Balmaceda'] },
  'Las Condes': { population: '294.000', avg_rent: 850000, metro: true, safety: 5, walkability: 4, nearby: ['Mall Parque Arauco', 'Clínica Las Condes', 'Parque Araucano'] },
  'Ñuñoa': { population: '246.000', avg_rent: 550000, metro: true, safety: 4, walkability: 5, nearby: ['Plaza Ñuñoa', 'Estadio Nacional', 'Metro Ñuñoa'] },
  'Santiago Centro': { population: '404.000', avg_rent: 420000, metro: true, safety: 3, walkability: 5, nearby: ['Plaza de Armas', 'Cerro Santa Lucía', 'Metro U. de Chile'] },
  'La Florida': { population: '366.000', avg_rent: 380000, metro: true, safety: 3, walkability: 3, nearby: ['Mall Plaza Vespucio', 'Metro La Florida', 'Parque La Florida'] },
  'Maipú': { population: '521.000', avg_rent: 350000, metro: true, safety: 3, walkability: 3, nearby: ['Mall Arauco Maipú', 'Templo Bahá\'í', 'Metro Santiago Bueras'] },
  'Vitacura': { population: '85.000', avg_rent: 1100000, metro: false, safety: 5, walkability: 3, nearby: ['Parque Bicentenario', 'Alonso de Córdova', 'Clínica Alemana'] },
  'Viña del Mar': { population: '334.000', avg_rent: 500000, metro: false, safety: 4, walkability: 4, nearby: ['Reloj de Flores', 'Casino Viña', 'Playa Reñaca'] },
  'Valparaíso': { population: '296.000', avg_rent: 400000, metro: false, safety: 3, walkability: 4, nearby: ['Ascensores', 'Plaza Sotomayor', 'Cerro Alegre'] },
  'Concepción': { population: '223.000', avg_rent: 350000, metro: false, safety: 3, walkability: 4, nearby: ['Mall del Centro', 'Universidad de Concepción', 'Plaza Independencia'] },
}

function StarRating({ score, label }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <svg key={i} className={`w-4 h-4 ${i <= score ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">{label}</span>
    </div>
  )
}

function NeighborhoodStats({ info }) {
  if (!info) return null
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 -mt-6 relative z-10 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
        <h2 className="font-display font-bold text-lg text-gray-800 dark:text-gray-100 mb-5">Datos del barrio</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          {/* Population */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{info.population} hab.</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Población aprox.</p>
            </div>
          </div>
          {/* Average rent */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{formatPrice(info.avg_rent)}/mes</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Arriendo promedio (2D)</p>
            </div>
          </div>
          {/* Metro */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H18.75m-7.5-2.25h-3V4.125C8.25 3.504 8.754 3 9.375 3h5.25c.621 0 1.125.504 1.125 1.125V12m-9 0H3.375A1.125 1.125 0 002.25 13.125v1.5" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{info.metro ? 'Si' : 'No'}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Acceso a Metro</p>
            </div>
          </div>
          {/* Safety */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <StarRating score={info.safety} label="Seguridad" />
            </div>
          </div>
          {/* Walkability */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
              </svg>
            </div>
            <div>
              <StarRating score={info.walkability} label="Caminabilidad" />
            </div>
          </div>
          {/* Nearby */}
          <div className="flex items-start gap-3 col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21" />
              </svg>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {info.nearby.map(place => (
                <span key={place} className="text-xs px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">{place}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

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
  const neighborhoodInfo = comunaInfo[data?.title] || comunaInfo[comunaName] || null

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

      <NeighborhoodStats info={neighborhoodInfo} />

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
          {neighborhoodInfo && (
            <>
              <h3 className="font-display text-lg text-gray-800 dark:text-gray-100">Vivir en {data?.title || comunaName}: lo que debes saber</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {data?.title || comunaName} cuenta con una población aproximada de {neighborhoodInfo.population} habitantes
                y un arriendo promedio de {formatPrice(neighborhoodInfo.avg_rent)} mensuales para un departamento de 2 dormitorios.
                {neighborhoodInfo.metro
                  ? ` La comuna tiene acceso directo a la red de Metro, lo que facilita el transporte hacia el resto de la ciudad.`
                  : ` Aunque no cuenta con estaciones de Metro, la comuna dispone de buenas alternativas de transporte público y vías de acceso.`}
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                Entre los puntos de referencia cercanos se encuentran {neighborhoodInfo.nearby.join(', ')}.
                Esto hace de {data?.title || comunaName} una comuna atractiva tanto para quienes buscan
                cercanía a servicios como para quienes valoran la vida de barrio.
              </p>
            </>
          )}
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
