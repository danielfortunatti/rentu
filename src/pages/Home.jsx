import { useState, useEffect, useRef, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate, Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import { ScrollReveal, useCountUp } from '../hooks/useScrollReveal'
import { useMouseParallax, FloatingOrbs, InteractiveGrid } from '../hooks/useInteractive'
import Mascot from '../components/Mascot'
import RentCalculator from '../components/RentCalculator'
import NewsletterSignup from '../components/NewsletterSignup'
import PriceEstimator from '../components/PriceEstimator'
import Recommendations from '../components/Recommendations'
import { getFeaturedProperties, supabase } from '../lib/supabase'
import { comunas, comunasByRegion, tiposPropiedad } from '../data/comunas'
import RecentlyViewed from '../components/RecentlyViewed'
import Onboarding from '../components/Onboarding'

/* ─── DATA ─── */
const comunasDestacadas = [
  { nombre: 'Providencia', desc: 'Vida urbana y gastronomía', accent: '#08c4ac', pattern: 'M10,30 Q30,5 50,30 T90,30', shape: 'circle' },
  { nombre: 'Las Condes', desc: 'Barrios residenciales premium', accent: '#0ea5e9', pattern: 'M0,50 C20,20 40,80 60,50 S100,20 100,50', shape: 'hex' },
  { nombre: 'Ñuñoa', desc: 'Vida de barrio y cultura', accent: '#f59e0b', pattern: 'M10,80 Q25,10 50,50 T90,20', shape: 'diamond' },
  { nombre: 'Santiago Centro', desc: 'Conectividad y servicios', accent: '#6366f1', pattern: 'M0,0 L100,100 M100,0 L0,100', shape: 'square' },
  { nombre: 'Viña del Mar', desc: 'Playa y calidad de vida', accent: '#06b6d4', pattern: 'M0,50 Q25,0 50,50 T100,50', shape: 'wave' },
  { nombre: 'Valparaíso', desc: 'Patrimonio y bohemia', accent: '#ec4899', pattern: 'M50,10 L90,90 L10,90 Z', shape: 'triangle' },
  { nombre: 'La Florida', desc: 'Familiar y accesible', accent: '#22c55e', pattern: 'M20,20 H80 V80 H20 Z', shape: 'grid' },
  { nombre: 'Maipú', desc: 'Conectada y en crecimiento', accent: '#8b5cf6', pattern: 'M50,0 L100,50 L50,100 L0,50 Z', shape: 'diamond2' },
]

const tiposData = [
  { tipo: 'Departamento', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
  { tipo: 'Casa', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" /></svg> },
  { tipo: 'Estudio', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg> },
  { tipo: 'Habitación', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg> },
  { tipo: 'Pieza', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25V9m-3 0h12.5a1 1 0 011 1v10a1 1 0 01-1 1H5.25a1 1 0 01-1-1V10a1 1 0 011-1z" /></svg> },
  { tipo: 'Oficina', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg> },
  { tipo: 'Local comercial', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> },
  { tipo: 'Bodega', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" /></svg> },
  { tipo: 'Terreno', icon: <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 21h18M3 21l4-7 3 4 4-8 4 6" /><path strokeLinecap="round" strokeLinejoin="round" d="M14 7a2 2 0 100-4 2 2 0 000 4z" /></svg> },
]

const steps = [
  { num: '01', title: 'Publica tu propiedad', desc: 'Sube fotos, agrega los detalles y tu número de WhatsApp. Sin costos, sin compromisos.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /> },
  { num: '02', title: 'Encuentra lo que buscas', desc: 'Filtra por comuna, precio, dormitorios, mascotas, estacionamiento y más.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /> },
  { num: '03', title: 'Contacta y arrienda', desc: 'Habla directo con el dueño por WhatsApp. Genera tu modelo de contrato de arriendo gratis.', icon: <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /> },
]

/* ─── ABSTRACT COMUNA CARD ─── */
function ComunaCard({ comuna }) {
  const [hovered, setHovered] = useState(false)
  const cardRef = useRef(null)
  const [mouse, setMouse] = useState({ x: 50, y: 50 })

  const handleMove = useCallback((e) => {
    const rect = cardRef.current?.getBoundingClientRect()
    if (!rect) return
    setMouse({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }, [])

  return (
    <Link
      ref={cardRef}
      to={`/arriendos/${comuna.nombre.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-')}`}
      className="group relative overflow-hidden rounded-2xl aspect-[4/3] block glow-border"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMouse({ x: 50, y: 50 }) }}
      onMouseMove={handleMove}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gray-950 transition-colors duration-500" />

      {/* Animated SVG pattern */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id={`grad-${comuna.nombre}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={comuna.accent} stopOpacity={hovered ? 0.6 : 0.2} />
            <stop offset="100%" stopColor={comuna.accent} stopOpacity={hovered ? 0.3 : 0.05} />
          </linearGradient>
        </defs>
        <path
          d={comuna.pattern}
          fill="none"
          stroke={`url(#grad-${comuna.nombre})`}
          strokeWidth={hovered ? "2" : "0.8"}
          className="transition-all duration-700"
          vectorEffect="non-scaling-stroke"
        />
        {/* Geometric shapes */}
        <circle cx={mouse.x} cy={mouse.y} r={hovered ? "25" : "0"} fill={comuna.accent} fillOpacity="0.06" className="transition-all duration-500" />
        <circle cx="80" cy="20" r="12" fill={comuna.accent} fillOpacity={hovered ? 0.1 : 0.04} className="transition-all duration-500" />
        <circle cx="20" cy="70" r="8" fill={comuna.accent} fillOpacity={hovered ? 0.08 : 0.03} className="transition-all duration-500" />
      </svg>

      {/* Mouse-following spotlight */}
      <div
        className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(300px circle at ${mouse.x}% ${mouse.y}%, ${comuna.accent}15, transparent 70%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      {/* Accent line at top */}
      <div
        className="absolute top-0 left-0 h-[2px] transition-all duration-500"
        style={{
          width: hovered ? '100%' : '0%',
          background: `linear-gradient(90deg, transparent, ${comuna.accent}, transparent)`,
        }}
      />

      {/* Arrow */}
      <div className="absolute top-4 right-4 w-8 h-8 rounded-full border border-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:border-white/30" style={{ background: `${comuna.accent}20` }}>
        <svg className="w-3.5 h-3.5 text-white transition-transform duration-300 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
      </div>

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <div className="w-2 h-2 rounded-full mb-3 transition-all duration-300" style={{ background: comuna.accent, boxShadow: hovered ? `0 0 12px ${comuna.accent}` : 'none' }} />
        <h3 className="font-display font-bold text-white text-base sm:text-lg leading-tight">{comuna.nombre}</h3>
        <p className="text-white/70 text-xs mt-0.5 group-hover:text-white/80 transition-colors">{comuna.desc}</p>
      </div>
    </Link>
  )
}

/* ─── STEP CARD 3D ─── */
function StepCard({ item, index }) {
  const ref = useRef(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [hovered, setHovered] = useState(false)

  const handleMove = useCallback((e) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 10
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -10
    setTilt({ x, y })
  }, [])

  return (
    <ScrollReveal delay={index * 120} direction="up">
      <div
        ref={ref}
        className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 group cursor-default hover-shimmer"
        style={{
          transform: `perspective(800px) rotateX(${tilt.y}deg) rotateY(${tilt.x}deg)`,
          transition: hovered ? 'transform 0.1s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
        }}
        onMouseMove={handleMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }) }}
      >
        <span className="absolute top-6 right-6 font-display font-extrabold text-6xl text-gray-100 group-hover:text-brand-100 transition-colors duration-500 select-none" style={{ transform: 'translateZ(30px)' }}>{item.num}</span>

        <div style={{ transform: 'translateZ(40px)' }}>
          <div className="w-14 h-14 rounded-2xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:border-brand-600 group-hover:shadow-lg group-hover:shadow-brand-500/20 transition-all duration-300">
            <svg className="w-7 h-7 text-brand-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>{item.icon}</svg>
          </div>
          <h3 className="font-display font-bold text-lg text-gray-900 dark:text-gray-100 mb-2">{item.title}</h3>
          <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
        </div>

        {index < 2 && (
          <div className="hidden md:block absolute top-1/2 -right-3 w-6 border-t-2 border-dashed border-gray-200" />
        )}
      </div>
    </ScrollReveal>
  )
}

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ end, suffix = '', prefix = '' }) {
  const [ref, count] = useCountUp(end, 2200)
  return <span ref={ref} className="counter-glow">{prefix}{count}{suffix}</span>
}

/* ─── HOME PAGE ─── */
export default function Home({ user }) {
  const navigate = useNavigate()
  const [comuna, setComuna] = useState('')
  const [tipo, setTipo] = useState('')
  const [precioMax, setPrecioMax] = useState('')
  const [destacadas, setDestacadas] = useState([])
  const [showEstimator, setShowEstimator] = useState(false)
  const [loading, setLoading] = useState(true)
  const [activeCount, setActiveCount] = useState(null)
  const [heroRef, heroMouse] = useMouseParallax()

  useEffect(() => {
    async function load() {
      const { data } = await getFeaturedProperties()
      const mapped = (data || []).map(p => ({
        ...p,
        fotos: p.property_photos?.sort((a, b) => (a.position || 0) - (b.position || 0)).map(ph => ph.url) || [],
        gastoComun: p.gasto_comun,
        fechaPublicacion: p.created_at,
      }))
      setDestacadas(mapped)
      setLoading(false)
    }
    load()

    supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('activa', true)
      .then(({ count }) => {
        if (typeof count === 'number') setActiveCount(count)
      })
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (comuna) params.set('comuna', comuna)
    if (tipo) params.set('tipo', tipo)
    if (precioMax) params.set('precioMax', precioMax)
    navigate(`/buscar?${params.toString()}`)
  }

  const selectClass = "w-full bg-white/90 border border-gray-200/80 rounded-xl px-4 py-3.5 text-sm text-gray-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 appearance-none cursor-pointer hover:border-gray-300 transition-colors backdrop-blur-sm"

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900">
      <Helmet>
        <title>Rentu - Arriendos en Chile sin comisiones | Departamentos y casas</title>
        <meta name="description" content="Encuentra y publica arriendos en Chile. Sin intermediarios, sin comisiones. Contacto directo por WhatsApp." />
        <link rel="prefetch" href="/buscar" />
        <link rel="prefetch" href="/publicar" />
      </Helmet>

      {/* ══════════ HERO — DARK IMMERSIVE ══════════ */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center overflow-hidden bg-gray-950">
        {/* Interactive grid that follows mouse */}
        <InteractiveGrid mousePos={heroMouse} />

        {/* Floating orbs */}
        <FloatingOrbs count={4} />

        {/* Isometric subtle grid */}
        <div className="absolute inset-0 iso-grid opacity-30" />

        {/* Animated morph blob */}
        <div
          className="absolute w-[500px] h-[500px] animate-morph opacity-20"
          style={{
            background: 'linear-gradient(135deg, #08c4ac 0%, #20e0c5 50%, #049e8d 100%)',
            filter: 'blur(80px)',
            right: `${15 - heroMouse.x * 3}%`,
            top: `${20 - heroMouse.y * 3}%`,
            transition: 'right 0.3s ease-out, top 0.3s ease-out',
          }}
        />

        {/* Secondary blob */}
        <div
          className="absolute w-[300px] h-[300px] rounded-full opacity-10"
          style={{
            background: 'radial-gradient(circle, #20e0c5, transparent)',
            filter: 'blur(60px)',
            left: `${10 + heroMouse.x * 2}%`,
            bottom: `${15 + heroMouse.y * 2}%`,
            transition: 'left 0.3s ease-out, bottom 0.3s ease-out',
          }}
        />

        {/* Grain */}
        <div className="absolute inset-0 grain-overlay" />

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full py-20">
          <div className="max-w-2xl">

            {/* Badge */}
            <div className="hero-text-reveal" style={{ animationDelay: '0.1s' }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] backdrop-blur-md border border-white/[0.08] text-brand-300 text-xs font-semibold tracking-wider uppercase mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-400" />
                </span>
                Arriendos directos en Chile
              </span>
            </div>

            {/* Heading */}
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-[3.5rem] text-white leading-[1.06] mb-6 hero-text-reveal" style={{ animationDelay: '0.25s' }}>
              Encuentra y publica tu arriendo ideal,{' '}
              <span className="text-gradient-animated">sin intermediarios</span>
            </h1>

            {/* Sub */}
            <p className="text-gray-400 text-lg leading-relaxed max-w-xl mb-10 hero-text-reveal" style={{ animationDelay: '0.4s' }}>
              Genera tu contrato de referencia al instante. Publica gratis, contacta por WhatsApp y arrienda directo con el dueño.
            </p>

            {/* 3D Search Box */}
            <div className="hero-search-reveal" style={{ animationDelay: '0.55s' }}>
              <form
                onSubmit={handleSearch}
                className="relative rounded-2xl p-2.5 sm:p-3 border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl shadow-2xl shadow-black/30"
              >
                {/* Inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.05] to-transparent pointer-events-none" />

                <div className="relative grid grid-cols-1 sm:grid-cols-4 gap-2 sm:gap-2.5">
                  <select value={comuna} onChange={e => setComuna(e.target.value)} className={selectClass} aria-label="Seleccionar comuna">
                    <option value="">Comuna</option>
                    {comunasByRegion.map(group => <optgroup key={group.region} label={group.region}>{group.comunas.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>)}
                  </select>
                  <select value={tipo} onChange={e => setTipo(e.target.value)} className={selectClass} aria-label="Tipo de propiedad">
                    <option value="">Tipo</option>
                    {tiposPropiedad.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <select value={precioMax} onChange={e => setPrecioMax(e.target.value)} className={selectClass} aria-label="Precio máximo">
                    <option value="">Precio max.</option>
                    <option value="400000">$400.000</option>
                    <option value="600000">$600.000</option>
                    <option value="800000">$800.000</option>
                    <option value="1000000">$1.000.000</option>
                    <option value="1500000">$1.500.000</option>
                    <option value="2000000">$2.000.000</option>
                    <option value="2500000">$2.500.000</option>
                    <option value="3000000">$3.000.000</option>
                  </select>
                  <button type="submit" className="bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-semibold rounded-xl px-6 py-3.5 text-sm transition-all btn-glow flex items-center justify-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Buscar
                  </button>
                </div>
              </form>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-6 text-sm hero-text-reveal" style={{ animationDelay: '0.7s' }}>
              {['Publicar es gratis', 'Contacto directo', 'Contrato incluido'].map(text => (
                <span key={text} className="flex items-center gap-1.5 text-gray-600">
                  <svg className="w-4 h-4 text-brand-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {text}
                </span>
              ))}
            </div>
          </div>

          {/* Interactive mascot — desktop only */}
          <Mascot mousePos={heroMouse} />
        </div>

        {/* Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-warm-50 dark:from-gray-900 to-transparent" />
      </section>

      {/* ══════════ STATS BAR ══════════ */}
      <section className="relative -mt-1 bg-gray-900 overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-50" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { value: activeCount !== null ? `${activeCount}+` : '$0', label: activeCount !== null ? 'Propiedades activas' : 'Costo por publicar' },
              { value: '0%', label: 'Comisión' },
              { value: 'Directo', label: 'Contacto por WhatsApp' },
              { value: 'PDF', label: 'Modelo de contrato gratis' },
            ].map((s, i) => (
              <ScrollReveal key={s.label} delay={i * 100} direction="up">
                <div className="text-center group cursor-default">
                  <span className="font-display font-extrabold text-3xl sm:text-4xl text-white block group-hover:text-brand-300 transition-colors duration-300 counter-glow">
                    {s.value}
                  </span>
                  <p className="text-gray-500 text-xs mt-1 tracking-wide uppercase">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ RECENTLY VIEWED ══════════ */}
      <RecentlyViewed />

      {/* ══════════ COMUNAS — ABSTRACT GEOMETRIC ══════════ */}
      <section className="py-20 sm:py-24 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-2">Ubicaciones</p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100">Explora por comuna</h2>
                <p className="text-gray-400 text-sm mt-1.5">Las zonas más buscadas para arrendar en Chile</p>
              </div>
              <Link to="/buscar" className="hidden sm:flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium animated-underline group">
                Ver todas <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {comunasDestacadas.map((c, i) => (
              <ScrollReveal key={c.nombre} delay={i * 60} direction="scale">
                <ComunaCard comuna={c} />
              </ScrollReveal>
            ))}
          </div>
          <Link to="/buscar" className="sm:hidden mt-4 block text-center text-sm text-brand-600 font-medium py-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl hover:bg-brand-100 transition-colors">
            Ver todas las comunas
          </Link>
        </div>
      </section>

      {/* ══════════ PROPIEDADES DESTACADAS ══════════ */}
      {destacadas.length > 0 && (
        <section className="py-20 sm:py-24 bg-white dark:bg-gray-800/50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-96 h-96 bg-brand-100/30 dark:bg-brand-900/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2" />

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
            <ScrollReveal>
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-2">Nuevas</p>
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100">Publicaciones recientes</h2>
                  <p className="text-gray-400 text-sm mt-1.5">Propiedades disponibles ahora</p>
                </div>
                <Link to="/buscar" className="hidden sm:flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium animated-underline group">
                  Ver todas <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {destacadas.map((property, i) => (
                <ScrollReveal key={property.id} delay={i * 80} direction="up">
                  <PropertyCard property={property} />
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════ COMO FUNCIONA — 3D TILT CARDS ══════════ */}
      <section className="py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-warm-50 via-white to-warm-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-16">
              <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-2">Proceso</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100">Así de simple</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">Publicar o encontrar un arriendo toma minutos</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((item, i) => <StepCard key={item.num} item={item} index={i} />)}
          </div>
        </div>
      </section>

      {/* ══════════ CALCULADORA DE ARRIENDO ══════════ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-gray-800/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-100/20 dark:bg-brand-900/10 rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-100/15 dark:bg-brand-900/8 rounded-full blur-[100px] -translate-x-1/3 translate-y-1/3" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-2">Herramienta</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100">¿Cuánto puedes pagar de arriendo?</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">Calcula el rango de arriendo ideal según tu ingreso mensual</p>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={100}>
            <RentCalculator />
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ POR QUE RENTU — SPOTLIGHT ══════════ */}
      <section className="py-20 sm:py-24 bg-white dark:bg-gray-800/50 relative overflow-hidden">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-brand-100/20 dark:bg-brand-900/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <ScrollReveal direction="left">
                <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-3">Ventajas</p>
                <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100 mb-8">Por qué elegir Rentu</h2>
              </ScrollReveal>

              <div className="space-y-5">
                {[
                  { title: 'Sin comisiones ocultas', desc: 'No cobramos comisión ni al arrendador ni al arrendatario. La publicación es 100% gratis.' },
                  { title: 'Contacto directo por WhatsApp', desc: 'Habla directamente con el dueño de la propiedad. Sin formularios, sin esperas.' },
                  { title: 'Contrato de arriendo legal', desc: 'Genera un contrato basado en la Ley 18.101 en PDF, gratis e inmediato.' },
                  { title: 'Filtros avanzados', desc: 'Busca por comuna, precio, dormitorios, mascotas, estacionamiento, equipamiento y alrededores.' },
                ].map((item, i) => (
                  <ScrollReveal key={item.title} delay={i * 100} direction="left">
                    <div className="flex gap-4 group cursor-default">
                      <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center flex-shrink-0 group-hover:bg-brand-600 group-hover:border-brand-600 group-hover:shadow-lg group-hover:shadow-brand-500/20 transition-all duration-300">
                        <svg className="w-5 h-5 text-brand-600 group-hover:text-white transition-colors duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-gray-900 dark:text-gray-100 text-sm mb-1">{item.title}</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* 3D Abstract visual instead of fake image */}
            <ScrollReveal direction="right">
              <div className="relative hidden lg:flex items-center justify-center h-[420px]">
                {/* Animated circles background */}
                <div className="absolute w-80 h-80 rounded-full border border-brand-200/30 animate-spin" style={{ animationDuration: '25s' }} />
                <div className="absolute w-60 h-60 rounded-full border border-brand-300/20 animate-spin" style={{ animationDuration: '18s', animationDirection: 'reverse' }} />
                <div className="absolute w-40 h-40 rounded-full border border-brand-400/15 animate-spin" style={{ animationDuration: '12s' }} />

                {/* Center card */}
                <div className="relative z-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl shadow-brand-900/8 border border-gray-100 dark:border-gray-700 p-8 w-64">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/30">
                    <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2z" />
                    </svg>
                  </div>
                  <h4 className="font-display font-bold text-gray-900 dark:text-gray-100 mb-1">Rentu</h4>
                  <p className="text-xs text-gray-400 mb-4">Tu plataforma de arriendos</p>

                  <div className="space-y-3">
                    {['Sin comisiones', 'Contacto directo', 'Contrato gratis'].map((t, i) => (
                      <div key={t} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-brand-50 flex items-center justify-center">
                          <svg className="w-3 h-3 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-xs text-gray-600">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating mini cards */}
                <div className="absolute -top-2 -right-4 bg-white rounded-xl shadow-xl shadow-black/6 border border-gray-100 p-3 animate-float z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full relative">
                      <span className="absolute inset-0 bg-green-400 rounded-full animate-ping" />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-700">Publicaciones activas</span>
                  </div>
                </div>

                <div className="absolute -bottom-3 -left-6 bg-white rounded-xl shadow-xl shadow-black/6 border border-gray-100 p-3 animate-float-slow z-20">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center">
                      <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-gray-800">100% gratis</p>
                      <p className="text-[9px] text-gray-400">Sin costos ocultos</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════ TIPOS DE PROPIEDAD ══════════ */}
      <section className="py-20 sm:py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-warm-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6">
          <ScrollReveal>
            <div className="text-center mb-12">
              <p className="text-brand-600 text-xs font-semibold tracking-widest uppercase mb-2">Categorías</p>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 dark:text-gray-100">¿Qué tipo de arriendo buscas?</h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {tiposData.map((t, i) => (
              <ScrollReveal key={t.tipo} delay={i * 70} direction="scale">
                <Link
                  to={`/buscar?tipo=${encodeURIComponent(t.tipo)}`}
                  className="block bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 text-center overflow-hidden hover:border-brand-200 dark:hover:border-brand-700 hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center text-gray-400 group-hover:text-brand-600 group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 group-hover:border-brand-100 dark:group-hover:border-brand-800 group-hover:scale-110 transition-all duration-300">
                    {t.icon}
                  </div>
                  <span className="font-display font-semibold text-sm text-gray-700 dark:text-gray-200 group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{t.tipo}</span>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ CTA ══════════ */}
      <section className="py-20 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="scale">
            <div className="relative bg-gray-950 rounded-[2rem] overflow-hidden px-8 sm:px-14 py-16 sm:py-20">
              <FloatingOrbs count={3} />
              <div className="absolute inset-0 iso-grid opacity-20" />
              <div className="absolute inset-0 grain-overlay" />

              <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
                <div className="max-w-xl">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-white leading-snug mb-4">
                    Publica tu propiedad y llega a miles de personas
                  </h2>
                  <p className="text-gray-500 text-sm sm:text-base leading-relaxed">
                    Sin costo, sin comisiones. Los interesados te contactan directo por WhatsApp. Tú decides a quién arrendar.
                  </p>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={() => navigate('/publicar')}
                    className="inline-flex items-center gap-2.5 px-8 py-4 bg-white hover:bg-gray-50 text-gray-900 font-bold rounded-xl text-sm sm:text-base transition-all btn-shine group shadow-2xl shadow-black/20"
                  >
                    Publicar gratis
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </button>
                  <button
                    onClick={() => setShowEstimator(true)}
                    className="inline-flex items-center gap-2.5 px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all border border-white/10"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Estimar precio de arriendo
                  </button>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ RECOMMENDATIONS ══════════ */}
      <Recommendations user={user} />

      {/* ══════════ MASCOT VIDEO CTA ══════════ */}
      <section className="py-16 sm:py-20 bg-warm-50 dark:bg-gray-900 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <ScrollReveal direction="up">
            <div className="relative bg-gray-950 rounded-3xl overflow-hidden border border-gray-800/50">
              <div className="absolute inset-0 mesh-gradient opacity-30" />
              <div className="relative flex flex-col md:flex-row items-center gap-6 p-8 sm:p-10">
                {/* Video */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 flex-shrink-0 rounded-2xl overflow-hidden">
                  <video
                    src="/mascot-hero.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    aria-label="Mascota Rentu entrando a su nuevo hogar"
                  />
                </div>
                {/* Text */}
                <div className="text-center md:text-left">
                  <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
                    Tu próximo hogar te espera
                  </h2>
                  <p className="text-gray-400 text-sm mb-6 max-w-md">
                    Miles de propiedades publicadas por sus dueños. Sin intermediarios, sin comisiones. Encuentra tu lugar ideal hoy.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    <button onClick={() => navigate('/buscar')} className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl text-sm transition-all btn-glow">
                      Buscar arriendo
                    </button>
                    <button onClick={() => navigate('/publicar')} className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-sm transition-all border border-white/10">
                      Publicar gratis
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ══════════ NEWSLETTER ══════════ */}
      <NewsletterSignup />

      {/* ══════════ PRICE ESTIMATOR MODAL ══════════ */}
      {showEstimator && <PriceEstimator onClose={() => setShowEstimator(false)} />}

      <Onboarding />
    </div>
  )
}
