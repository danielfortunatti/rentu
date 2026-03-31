import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams, Link } from 'react-router-dom'
import PropertyCard from '../components/PropertyCard'
import CompareDrawer from '../components/CompareDrawer'
import { SkeletonCard } from '../components/SkeletonLoader'
import { getProperties, saveSearch, getSavedSearches, deleteSavedSearch } from '../lib/supabase'
import { comunas, comunasByRegion, tiposPropiedad, amenitiesEdificio, cercaniasOptions, amobladoOptions, estadoPropiedad } from '../data/comunas'

const SearchMap = lazy(() => import('../components/SearchMap'))

const PAGE_SIZE = 12

export default function Search({ user }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [properties, setProperties] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [compareList, setCompareList] = useState([])
  const [filters, setFilters] = useState({
    comuna: searchParams.get('comuna') || '', tipo: searchParams.get('tipo') || '',
    precioMin: searchParams.get('precioMin') || '', precioMax: searchParams.get('precioMax') || '',
    habitaciones: searchParams.get('habitaciones') || '', banos: searchParams.get('banos') || '', gastoMax: searchParams.get('gastoMax') || '',
    estacionamiento: searchParams.get('estacionamiento') === 'true', bodega: searchParams.get('bodega') === 'true', mascotas: searchParams.get('mascotas') === 'true', amoblado: searchParams.get('amoblado') || '',
    m2Min: searchParams.get('m2Min') || '', m2Max: searchParams.get('m2Max') || '', estado: searchParams.get('estado') || '', pisoMin: searchParams.get('pisoMin') || '', publicadoEn: searchParams.get('publicadoEn') || '',
    amenities: [], cercanias: [],
  })
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'destacados')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'map'
  const [showFilters, setShowFilters] = useState(false)
  const [showMoreAmenities, setShowMoreAmenities] = useState(false)
  const [showMoreCercanias, setShowMoreCercanias] = useState(false)
  const debounceRef = useRef(null)

  // Saved searches state
  const [savedSearches, setSavedSearches] = useState([])
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [searchName, setSearchName] = useState('')
  const [savingSearch, setSavingSearch] = useState(false)
  const [showSavedSearches, setShowSavedSearches] = useState(false)
  const savedSearchesRef = useRef(null)

  // Load saved searches
  useEffect(() => {
    if (user) {
      getSavedSearches(user.id).then(({ data }) => setSavedSearches(data))
    }
  }, [user])

  // Close saved searches dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (savedSearchesRef.current && !savedSearchesRef.current.contains(e.target)) setShowSavedSearches(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleSaveSearch = async () => {
    if (!user || !searchName.trim()) return
    setSavingSearch(true)
    const { data, error } = await saveSearch(user.id, filters, searchName.trim())
    if (!error && data) {
      setSavedSearches(prev => [data, ...prev])
    }
    setSearchName('')
    setShowSaveInput(false)
    setSavingSearch(false)
  }

  const handleDeleteSavedSearch = async (id) => {
    await deleteSavedSearch(id)
    setSavedSearches(prev => prev.filter(s => s.id !== id))
  }

  const handleApplySavedSearch = (savedFilters) => {
    const applied = { ...filters, ...savedFilters }
    setFilters(applied)
    setPage(1)
    setShowSavedSearches(false)
    fetchProperties(1, applied, sortBy, search)
  }

  const fetchProperties = useCallback(async (currentPage, currentFilters, currentSort, currentSearch) => {
    setLoading(true)
    const { data, count } = await getProperties({
      page: currentPage,
      pageSize: PAGE_SIZE,
      sortBy: currentSort,
      search: currentSearch,
      ...currentFilters,
    })
    const mapped = (data || []).map(p => ({
      ...p,
      fotos: p.property_photos?.sort((a, b) => a.position - b.position).map(ph => ph.url) || [],
      gastoComun: p.gasto_comun,
      fechaPublicacion: p.created_at,
      amenities: p.amenities || [],
      cercanias: p.cercanias || [],
    }))
    setProperties(mapped)
    setTotalCount(count || 0)
    setLoading(false)
  }, [])

  // Initial load
  useEffect(() => {
    fetchProperties(page, filters, sortBy, search)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Debounced fetch on filter/sort/search changes
  const debouncedFetch = useCallback((newPage, newFilters, newSort, newSearch) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchProperties(newPage, newFilters, newSort, newSearch)
    }, 300)
  }, [fetchProperties])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  // Sync filters to URL
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.comuna) params.set('comuna', filters.comuna)
    if (filters.tipo) params.set('tipo', filters.tipo)
    if (filters.precioMin) params.set('precioMin', filters.precioMin)
    if (filters.precioMax) params.set('precioMax', filters.precioMax)
    if (filters.habitaciones) params.set('habitaciones', filters.habitaciones)
    if (filters.banos) params.set('banos', filters.banos)
    if (filters.gastoMax) params.set('gastoMax', filters.gastoMax)
    if (filters.estacionamiento) params.set('estacionamiento', 'true')
    if (filters.bodega) params.set('bodega', 'true')
    if (filters.mascotas) params.set('mascotas', 'true')
    if (filters.amoblado) params.set('amoblado', filters.amoblado)
    if (filters.m2Min) params.set('m2Min', filters.m2Min)
    if (filters.m2Max) params.set('m2Max', filters.m2Max)
    if (filters.estado) params.set('estado', filters.estado)
    if (filters.pisoMin) params.set('pisoMin', filters.pisoMin)
    if (filters.publicadoEn) params.set('publicadoEn', filters.publicadoEn)
    if (search) params.set('q', search)
    if (sortBy !== 'destacados') params.set('sort', sortBy)
    setSearchParams(params, { replace: true })
  }, [filters, search, sortBy, setSearchParams])

  // Compare functionality
  const toggleCompare = (property) => {
    setCompareList(prev => {
      const exists = prev.find(p => p.id === property.id)
      if (exists) return prev.filter(p => p.id !== property.id)
      if (prev.length >= 3) return prev
      return [...prev, property]
    })
  }

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    setPage(1)
    debouncedFetch(1, newFilters, sortBy, search)
  }

  const toggleArrayFilter = (key, value) => {
    const newArr = filters[key].includes(value) ? filters[key].filter(v => v !== value) : [...filters[key], value]
    const newFilters = { ...filters, [key]: newArr }
    setFilters(newFilters)
    setPage(1)
    debouncedFetch(1, newFilters, sortBy, search)
  }

  const handleSortChange = (newSort) => {
    setSortBy(newSort)
    setPage(1)
    debouncedFetch(1, filters, newSort, search)
  }

  const handleSearchChange = (value) => {
    setSearch(value)
    setPage(1)
    debouncedFetch(1, filters, sortBy, value)
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
    fetchProperties(newPage, filters, sortBy, search)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const activeFilterCount = [filters.comuna, filters.tipo, filters.precioMin, filters.precioMax, filters.habitaciones, filters.banos, filters.gastoMax, filters.estacionamiento, filters.bodega, filters.mascotas, filters.amoblado, filters.m2Min, filters.m2Max, filters.estado, filters.pisoMin, filters.publicadoEn].filter(Boolean).length + filters.amenities.length + filters.cercanias.length

  const clearFilters = () => {
    const cleared = { comuna: '', tipo: '', precioMin: '', precioMax: '', habitaciones: '', banos: '', gastoMax: '', estacionamiento: false, bodega: false, mascotas: false, amoblado: '', m2Min: '', m2Max: '', estado: '', pisoMin: '', publicadoEn: '', amenities: [], cercanias: [] }
    setFilters(cleared)
    setSearch('')
    setPage(1)
    setShowFilters(false)
    fetchProperties(1, cleared, sortBy, '')
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const selectClass = "w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 appearance-none cursor-pointer"
  const chipClass = (active) => `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${active ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-200'}`

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Buscar arriendos en Chile | Rentu</title>
        <meta name="description" content="Busca departamentos y casas en arriendo en todo Chile. Filtra por comuna, precio, dormitorios y más." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-800 dark:text-gray-100">Buscar arriendos</h1>
            <p className="text-sm text-gray-500 mt-1">{loading ? 'Cargando...' : `${totalCount} propiedad${totalCount !== 1 ? 'es' : ''} encontrada${totalCount !== 1 ? 's' : ''}`}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFilters(!showFilters)} className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 hover:text-gray-800 shadow-sm relative">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
              Filtros
              {activeFilterCount > 0 && <span className="w-5 h-5 bg-brand-600 rounded-full text-xs flex items-center justify-center text-white font-bold">{activeFilterCount}</span>}
            </button>
            <select value={sortBy} onChange={e => handleSortChange(e.target.value)} aria-label="Ordenar resultados" className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-700 dark:text-gray-200 focus:outline-none appearance-none cursor-pointer shadow-sm">
              <option value="destacados">Destacados primero</option>
              <option value="precio-asc">Precio: menor a mayor</option>
              <option value="precio-desc">Precio: mayor a menor</option>
              <option value="recientes">Más recientes</option>
              <option value="m2-desc">Mayor superficie</option>
            </select>
            <div className="flex bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm overflow-hidden" role="group" aria-label="Vista de resultados">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${viewMode === 'list' ? 'bg-brand-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                aria-label="Vista de lista"
                aria-pressed={viewMode === 'list'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                <span className="hidden sm:inline">Lista</span>
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-brand-600 text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                aria-label="Vista de mapa"
                aria-pressed={viewMode === 'map'}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
                <span className="hidden sm:inline">Mapa</span>
              </button>
            </div>
          </div>
        </div>

        {/* Search input */}
        <div className="mb-6">
          <div className="relative max-w-xl">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Buscar por título o descripción..."
              aria-label="Buscar propiedades por título o descripción"
              className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 shadow-sm"
            />
            {search && (
              <button onClick={() => handleSearchChange('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-8">
          <aside aria-label="Filtros de búsqueda" className={`${showFilters ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 p-6 overflow-auto' : 'hidden'} lg:block lg:relative lg:bg-transparent lg:p-0 lg:w-72 lg:flex-shrink-0`}>
            <div className="lg:sticky lg:top-24 space-y-6 lg:bg-white dark:lg:bg-gray-800 lg:rounded-2xl lg:border lg:border-gray-100 dark:lg:border-gray-700 lg:p-5 lg:shadow-sm lg:max-h-[calc(100vh-120px)] lg:overflow-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-gray-800 dark:text-gray-100 flex items-center gap-2">Filtros {activeFilterCount > 0 && <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">{activeFilterCount}</span>}</h3>
                <button onClick={() => setShowFilters(false)} className="lg:hidden p-2 text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Ubicación y tipo</h4>
                <div><label className="block text-xs text-gray-500 mb-1.5">Comuna</label><select value={filters.comuna} onChange={e => updateFilter('comuna', e.target.value)} aria-label="Filtrar por comuna" className={selectClass}><option value="">Todas</option>{comunasByRegion.map(group => <optgroup key={group.region} label={group.region}>{group.comunas.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>)}</select></div>
                <div><label className="block text-xs text-gray-500 mb-1.5">Tipo</label><select value={filters.tipo} onChange={e => updateFilter('tipo', e.target.value)} aria-label="Filtrar por tipo de propiedad" className={selectClass}><option value="">Todos</option>{tiposPropiedad.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Precio arriendo</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs text-gray-500 mb-1.5">Mínimo</label><select value={filters.precioMin} onChange={e => updateFilter('precioMin', e.target.value)} aria-label="Precio mínimo" className={selectClass}><option value="">Sin mín.</option><option value="100000">$100K</option><option value="200000">$200K</option><option value="300000">$300K</option><option value="400000">$400K</option><option value="500000">$500K</option><option value="600000">$600K</option><option value="800000">$800K</option></select></div>
                  <div><label className="block text-xs text-gray-500 mb-1.5">Máximo</label><select value={filters.precioMax} onChange={e => updateFilter('precioMax', e.target.value)} aria-label="Precio máximo" className={selectClass}><option value="">Sin máx.</option><option value="400000">$400K</option><option value="600000">$600K</option><option value="800000">$800K</option><option value="1000000">$1M</option><option value="1500000">$1.5M</option><option value="2000000">$2M</option><option value="2500000">$2.5M</option><option value="3000000">$3M</option></select></div>
                </div>
                <div><label className="block text-xs text-gray-500 mb-1.5">Gasto común máx.</label><select value={filters.gastoMax} onChange={e => updateFilter('gastoMax', e.target.value)} aria-label="Gasto común máximo" className={selectClass}><option value="">Sin límite</option><option value="50000">$50.000</option><option value="80000">$80.000</option><option value="100000">$100.000</option><option value="150000">$150.000</option></select></div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Características</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs text-gray-500 mb-1.5">Dormitorios</label><select value={filters.habitaciones} onChange={e => updateFilter('habitaciones', e.target.value)} aria-label="Mínimo de dormitorios" className={selectClass}><option value="">Todos</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option><option value="4">4+</option></select></div>
                  <div><label className="block text-xs text-gray-500 mb-1.5">Baños</label><select value={filters.banos} onChange={e => updateFilter('banos', e.target.value)} aria-label="Mínimo de baños" className={selectClass}><option value="">Todos</option><option value="1">1+</option><option value="2">2+</option><option value="3">3+</option></select></div>
                </div>
                <div><label className="block text-xs text-gray-500 mb-1.5">Amoblado</label><select value={filters.amoblado} onChange={e => updateFilter('amoblado', e.target.value)} aria-label="Tipo de amoblado" className={selectClass}>{amobladoOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
                <div><label className="block text-xs text-gray-500 mb-1.5">Estado</label><select value={filters.estado} onChange={e => updateFilter('estado', e.target.value)} aria-label="Estado de la propiedad" className={selectClass}><option value="">Cualquiera</option>{estadoPropiedad.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                <div className="space-y-2.5">
                  {[['estacionamiento', 'Estacionamiento'], ['bodega', 'Bodega'], ['mascotas', 'Acepta mascotas']].map(([key, label]) => (
                    <label key={key} className="flex items-center gap-2.5 cursor-pointer group">
                      <input type="checkbox" checked={filters[key]} onChange={e => updateFilter(key, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500/20 cursor-pointer" />
                      <span className="text-sm text-gray-600 group-hover:text-gray-800">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Superficie</h4>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-xs text-gray-500 mb-1.5">m² mín.</label><select value={filters.m2Min} onChange={e => updateFilter('m2Min', e.target.value)} aria-label="Superficie mínima" className={selectClass}><option value="">Sin mín.</option><option value="20">20+</option><option value="30">30+</option><option value="40">40+</option><option value="50">50+</option><option value="60">60+</option><option value="80">80+</option><option value="100">100+</option><option value="150">150+</option></select></div>
                  <div><label className="block text-xs text-gray-500 mb-1.5">m² máx.</label><select value={filters.m2Max} onChange={e => updateFilter('m2Max', e.target.value)} aria-label="Superficie máxima" className={selectClass}><option value="">Sin máx.</option><option value="40">40</option><option value="60">60</option><option value="80">80</option><option value="100">100</option><option value="150">150</option><option value="200">200</option><option value="300">300+</option></select></div>
                </div>
                <div><label className="block text-xs text-gray-500 mb-1.5">Piso mínimo</label><select value={filters.pisoMin} onChange={e => updateFilter('pisoMin', e.target.value)} aria-label="Piso mínimo" className={selectClass}><option value="">Cualquiera</option><option value="1">1+</option><option value="2">2+</option><option value="5">5+</option><option value="10">10+</option><option value="15">15+</option><option value="20">20+</option></select></div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Publicación</h4>
                <div><label className="block text-xs text-gray-500 mb-1.5">Publicado en</label><select value={filters.publicadoEn} onChange={e => updateFilter('publicadoEn', e.target.value)} aria-label="Fecha de publicación" className={selectClass}><option value="">Cualquier fecha</option><option value="1">Últimas 24 horas</option><option value="7">Última semana</option><option value="30">Último mes</option></select></div>
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Equipamiento</h4>
                <div className="flex flex-wrap gap-1.5">
                  {amenitiesEdificio.slice(0, showMoreAmenities ? undefined : 6).map(a => (
                    <button key={a.key} type="button" onClick={() => toggleArrayFilter('amenities', a.key)} className={chipClass(filters.amenities.includes(a.key))}>{a.icon} {a.label}</button>
                  ))}
                </div>
                {amenitiesEdificio.length > 6 && <button onClick={() => setShowMoreAmenities(!showMoreAmenities)} className="text-xs text-brand-600 hover:text-brand-700 font-medium">{showMoreAmenities ? 'Ver menos' : `Ver todos (${amenitiesEdificio.length})`}</button>}
              </div>

              <div className="h-px bg-gray-100" />

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Alrededores</h4>
                <div className="flex flex-wrap gap-1.5">
                  {cercaniasOptions.slice(0, showMoreCercanias ? undefined : 6).map(c => (
                    <button key={c.key} type="button" onClick={() => toggleArrayFilter('cercanias', c.key)} className={chipClass(filters.cercanias.includes(c.key))}>{c.icon} {c.label}</button>
                  ))}
                </div>
                {cercaniasOptions.length > 6 && <button onClick={() => setShowMoreCercanias(!showMoreCercanias)} className="text-xs text-brand-600 hover:text-brand-700 font-medium">{showMoreCercanias ? 'Ver menos' : `Ver todos (${cercaniasOptions.length})`}</button>}
              </div>

              <button onClick={clearFilters} className="w-full py-2.5 text-sm text-brand-600 hover:text-brand-700 font-medium border border-brand-200 rounded-xl hover:bg-brand-50 transition-all">Limpiar todos los filtros</button>
            </div>
          </aside>

          <div className="flex-1">
            {/* Quick date filters */}
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { value: '', label: 'Todas las fechas' },
                { value: '1', label: 'Últimas 24h' },
                { value: '7', label: 'Última semana' },
                { value: '30', label: 'Último mes' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => updateFilter('publicadoEn', opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filters.publicadoEn === opt.value ? 'bg-brand-50 dark:bg-brand-900/30 border-brand-200 dark:border-brand-700 text-brand-700 dark:text-brand-400' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Saved searches bar */}
            {user && (
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setShowSaveInput(!showSaveInput)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium hover:bg-brand-100 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                    Guardar búsqueda
                  </button>
                )}

                {savedSearches.length > 0 && (
                  <div className="relative" ref={savedSearchesRef}>
                    <button
                      onClick={() => setShowSavedSearches(!showSavedSearches)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 font-medium hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" /></svg>
                      Mis búsquedas guardadas ({savedSearches.length})
                      <svg className={`w-3 h-3 transition-transform ${showSavedSearches ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                    </button>

                    {showSavedSearches && (
                      <div className="absolute left-0 mt-2 w-72 bg-white border border-gray-200 rounded-2xl shadow-2xl shadow-black/8 py-2 z-50 animate-fadeIn">
                        <p className="px-4 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-widest">Búsquedas guardadas</p>
                        {savedSearches.map(s => (
                          <div key={s.id} className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 group">
                            <button
                              onClick={() => handleApplySavedSearch(s.filters)}
                              className="text-sm text-gray-700 hover:text-brand-700 font-medium truncate flex-1 text-left"
                            >
                              {s.name}
                            </button>
                            <button
                              onClick={() => handleDeleteSavedSearch(s.id)}
                              className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                              title="Eliminar"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {showSaveInput && (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={searchName}
                      onChange={e => setSearchName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveSearch()}
                      placeholder="Nombre de la búsqueda..."
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 w-48"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveSearch}
                      disabled={!searchName.trim() || savingSearch}
                      className="px-3 py-1.5 bg-brand-600 text-white text-xs font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {savingSearch ? 'Guardando...' : 'Guardar'}
                    </button>
                    <button
                      onClick={() => { setShowSaveInput(false); setSearchName('') }}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-5">
                {filters.comuna && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">{filters.comuna}<button onClick={() => updateFilter('comuna', '')} className="hover:text-brand-900">×</button></span>}
                {filters.tipo && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">{filters.tipo}<button onClick={() => updateFilter('tipo', '')} className="hover:text-brand-900">×</button></span>}
                {filters.estacionamiento && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">Estacionamiento<button onClick={() => updateFilter('estacionamiento', false)} className="hover:text-brand-900">×</button></span>}
                {filters.mascotas && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">Mascotas<button onClick={() => updateFilter('mascotas', false)} className="hover:text-brand-900">×</button></span>}
                {filters.m2Min && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">Desde {filters.m2Min} m²<button onClick={() => updateFilter('m2Min', '')} className="hover:text-brand-900">×</button></span>}
                {filters.m2Max && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">Hasta {filters.m2Max} m²<button onClick={() => updateFilter('m2Max', '')} className="hover:text-brand-900">×</button></span>}
                {filters.estado && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">{filters.estado}<button onClick={() => updateFilter('estado', '')} className="hover:text-brand-900">×</button></span>}
                {filters.pisoMin && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">Piso {filters.pisoMin}+<button onClick={() => updateFilter('pisoMin', '')} className="hover:text-brand-900">×</button></span>}
                {filters.publicadoEn && <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-brand-50 border border-brand-200 rounded-lg text-xs text-brand-700 font-medium">{filters.publicadoEn === '1' ? 'Últimas 24h' : filters.publicadoEn === '7' ? 'Última semana' : 'Último mes'}<button onClick={() => updateFilter('publicadoEn', '')} className="hover:text-brand-900">×</button></span>}
              </div>
            )}

            {viewMode === 'map' ? (
              loading ? (
                <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
                  <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                    <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                    <span className="text-sm">Cargando mapa...</span>
                  </div>
                </div>
              ) : properties.length === 0 ? (
                <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                  {/* House + magnifying glass illustration */}
                  <svg className="w-28 h-28 mx-auto mb-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 120 120" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 65l30-25 30 25" />
                    <rect x="30" y="65" width="40" height="30" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="44" y="78" width="12" height="17" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="35" y="72" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                    <rect x="57" y="72" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="85" cy="50" r="16" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M96 61l10 10" />
                  </svg>
                  <h3 className="font-display font-semibold text-xl text-gray-700 dark:text-gray-200 mb-2">No encontramos propiedades con estos filtros</h3>
                  <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-sm mx-auto">Prueba con otros criterios para ver resultados en el mapa.</p>
                  <div className="flex flex-wrap justify-center gap-2 mb-6">
                    {filters.precioMax && (
                      <button onClick={() => { const updated = { ...filters, precioMax: '' }; setFilters(updated); setPage(1); fetchProperties(1, updated, sortBy, search) }} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-medium rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">Ampliar rango de precio</button>
                    )}
                    {filters.comuna && (
                      <button onClick={() => { const updated = { ...filters, comuna: '' }; setFilters(updated); setPage(1); fetchProperties(1, updated, sortBy, search) }} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-medium rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">Probar otra comuna</button>
                    )}
                    {(filters.habitaciones || filters.banos || filters.estacionamiento || filters.bodega || filters.mascotas) && (
                      <button onClick={() => { const updated = { ...filters, habitaciones: '', banos: '', estacionamiento: false, bodega: false, mascotas: false }; setFilters(updated); setPage(1); fetchProperties(1, updated, sortBy, search) }} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-medium rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">Quitar algunos filtros</button>
                    )}
                  </div>
                  <button onClick={clearFilters} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors">Limpiar todos los filtros</button>
                  {filters.comuna && (
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">¿Eres propietario?</p>
                      <Link to="/publicar" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium hover:underline">
                        Sé el primero en publicar en {filters.comuna}
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <Suspense fallback={
                  <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 flex items-center justify-center" style={{ height: 'calc(100vh - 200px)', minHeight: '400px' }}>
                    <div className="flex items-center gap-3 text-gray-400 dark:text-gray-500">
                      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Cargando mapa...</span>
                    </div>
                  </div>
                }>
                  <SearchMap properties={properties} />
                </Suspense>
              )
            ) : loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map(i => <SkeletonCard key={i} />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-16 px-6 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
                {/* House + magnifying glass illustration */}
                <svg className="w-28 h-28 mx-auto mb-6 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 120 120" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20 65l30-25 30 25" />
                  <rect x="30" y="65" width="40" height="30" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="44" y="78" width="12" height="17" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="35" y="72" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="57" y="72" width="8" height="8" rx="1" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="85" cy="50" r="16" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M96 61l10 10" />
                </svg>
                <h3 className="font-display font-semibold text-xl text-gray-700 dark:text-gray-200 mb-2">No encontramos propiedades con estos filtros</h3>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-6 max-w-sm mx-auto">Intenta ajustar tus criterios de búsqueda para encontrar más opciones.</p>

                {/* Suggestion chips */}
                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {filters.precioMax && (
                    <button onClick={() => { const updated = { ...filters, precioMax: '' }; setFilters(updated); setPage(1); fetchProperties(1, updated, sortBy, search) }} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-medium rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">Ampliar rango de precio</button>
                  )}
                  {filters.comuna && (
                    <button onClick={() => { const updated = { ...filters, comuna: '' }; setFilters(updated); setPage(1); fetchProperties(1, updated, sortBy, search) }} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-medium rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">Probar otra comuna</button>
                  )}
                  {(filters.habitaciones || filters.banos || filters.estacionamiento || filters.bodega || filters.mascotas) && (
                    <button onClick={() => { const updated = { ...filters, habitaciones: '', banos: '', estacionamiento: false, bodega: false, mascotas: false }; setFilters(updated); setPage(1); fetchProperties(1, updated, sortBy, search) }} className="px-3 py-1.5 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border border-brand-200 dark:border-brand-800 text-xs font-medium rounded-lg hover:bg-brand-100 dark:hover:bg-brand-900/40 transition-colors">Quitar algunos filtros</button>
                  )}
                </div>

                <button onClick={clearFilters} className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-xl shadow-sm transition-colors">Limpiar todos los filtros</button>

                {/* Owner CTA */}
                {filters.comuna && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">¿Eres propietario?</p>
                    <Link to="/publicar" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium hover:underline">
                      Sé el primero en publicar en {filters.comuna}
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {properties.map(property => (
                    <div key={property.id} className="relative">
                      <PropertyCard property={property} />
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCompare(property) }}
                        className={`absolute top-3 left-3 z-10 w-7 h-7 rounded-lg flex items-center justify-center transition-all text-xs ${compareList.find(p => p.id === property.id) ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' : 'bg-white/80 backdrop-blur-sm text-gray-500 hover:bg-white hover:text-indigo-600 shadow-sm'}`}
                        title="Agregar a comparación"
                        aria-label={`${compareList.find(p => p.id === property.id) ? 'Quitar de' : 'Agregar a'} comparación`}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      </button>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-10">
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page <= 1}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Anterior
                    </button>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Página <span className="font-semibold text-gray-700 dark:text-gray-200">{page}</span> de <span className="font-semibold text-gray-700 dark:text-gray-200">{totalPages}</span>
                    </span>
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page >= totalPages}
                      className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <CompareDrawer
        properties={compareList}
        onRemove={(id) => setCompareList(prev => prev.filter(p => p.id !== id))}
        onClear={() => setCompareList([])}
      />
    </div>
  )
}
