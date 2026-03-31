import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import { comunas, comunasByRegion, tiposPropiedad, tiposArriendo, amenitiesEdificio, cercaniasOptions, estadoPropiedad, amobladoOptions } from '../data/comunas'
import { createProperty, uploadPhoto } from '../lib/supabase'
import { compressImage } from '../utils/imageCompressor'
import { getRecaptchaToken, verifyRecaptcha } from '../utils/recaptcha'
import { geocodeAddress } from '../utils/geocode'
import { comunaCenters } from '../utils/comunaCenters'
import { extractCoordsFromGoogleMapsUrl, isGoogleMapsUrl } from '../utils/googleMapsLink'

// Custom branded pin icon for the publish map
const publishPinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width: 28px; height: 28px;
    background: #049e8d;
    border: 3px solid #fff;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    box-shadow: 0 3px 10px rgba(4,158,141,0.4);
    display: flex; align-items: center; justify-content: center;
  ">
    <svg style="transform: rotate(45deg); width: 12px; height: 12px;" viewBox="0 0 24 24" fill="white">
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -28],
})

// Recenter map when coordinates change from geocoding
function RecenterOnGeocode({ lat, lng, zoom }) {
  const map = useMap()
  useEffect(() => {
    map.setView([lat, lng], zoom || 16)
  }, [lat, lng, zoom, map])
  return null
}

// Clickable marker: click on map to reposition pin
function ClickableMarker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return <Marker position={position} icon={publishPinIcon} />
}

// Self-contained clickable map preview component
function ClickableMapPreview({ lat, lng, onPositionChange, isFromComuna }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2 p-2.5 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 rounded-lg">
        <svg className="w-4 h-4 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <p className="text-sm text-gray-700 dark:text-gray-200">
          {isFromComuna
            ? <><strong>Selecciona la ubicación exacta</strong> haciendo clic en el mapa donde se encuentra tu propiedad.</>
            : <><strong>Verifica la ubicación.</strong> Si no es precisa, haz clic en el mapa para corregirla.</>
          }
        </p>
      </div>
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: 380 }}>
        <MapContainer
          center={[lat, lng]}
          zoom={16}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
        >
          <RecenterOnGeocode lat={lat} lng={lng} zoom={isFromComuna ? 14 : 17} />
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickableMarker position={[lat, lng]} onPositionChange={onPositionChange} />
        </MapContainer>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        Coordenadas: {lat.toFixed(6)}, {lng.toFixed(6)}
      </p>
    </div>
  )
}

export default function PublishProperty({ user }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    titulo: '', tipo: '', tipoArriendo: '', comuna: '', direccion: '', precio: '', gastoComun: '',
    m2: '', habitaciones: '1', banos: '1', piso: '', estacionamiento: false,
    bodega: false, mascotas: false, amoblado: 'sin', estado: 'Buen estado',
    amenities: [], cercanias: [], descripcion: '', telefono: '', email: '', googleMapsLink: '',
    disponibleDesde: '',
  })
  const [photoFiles, setPhotoFiles] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [coords, setCoords] = useState(null)
  const [mapsLinkError, setMapsLinkError] = useState('')

  // Extract coords from Google Maps link
  useEffect(() => {
    const link = form.googleMapsLink?.trim()
    if (!link) { setMapsLinkError(''); return }

    if (!isGoogleMapsUrl(link)) {
      setMapsLinkError('Pega un link de Google Maps válido')
      setCoords(null)
      return
    }

    const extracted = extractCoordsFromGoogleMapsUrl(link)
    if (extracted) {
      setCoords(extracted)
      setMapsLinkError('')
    } else {
      setMapsLinkError('No se pudo extraer la ubicación del link. Intenta con un link más largo (no el acortado)')
      setCoords(null)
    }
  }, [form.googleMapsLink])

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const toggleArray = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }))
  }

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files)
    setPhotoFiles(prev => [...prev, ...files])
    setPhotoPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))])
  }

  const removePhoto = (index) => {
    URL.revokeObjectURL(photoPreviews[index])
    setPhotoFiles(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index))
  }

  const validateStep = (s) => {
    if (s === 1) {
      if (!form.titulo || !form.tipo || !form.comuna || !form.direccion || !form.precio) {
        setError('Completa todos los campos obligatorios (*) antes de continuar.')
        return false
      }
    }
    if (s === 2) {
      if (!form.telefono) {
        setError('El número de WhatsApp es obligatorio.')
        return false
      }
    }
    if (s === 4) {
      if (photoPreviews.length < 4) {
        setError('Debes subir al menos 4 fotos de la propiedad.')
        return false
      }
    }
    setError('')
    return true
  }

  const nextStep = (current) => {
    if (validateStep(current)) setStep(current + 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (photoPreviews.length < 4) {
      setError('Debes subir al menos 4 fotos de la propiedad.')
      return
    }
    setLoading(true)
    setError('')

    // reCAPTCHA v3
    const token = await getRecaptchaToken('publish_property')
    if (token) {
      const verification = await verifyRecaptcha(token, 'publish_property')
      if (!verification.success) {
        setError('Verificación de seguridad fallida. Intenta de nuevo.')
        setLoading(false)
        return
      }
    }

    const propertyData = {
      user_id: user.id, titulo: form.titulo, tipo: form.tipo, tipo_arriendo: form.tipoArriendo || null, comuna: form.comuna,
      direccion: form.direccion, precio: Number(form.precio), gasto_comun: Number(form.gastoComun) || 0,
      m2: Number(form.m2) || null, habitaciones: Number(form.habitaciones), banos: Number(form.banos),
      piso: Number(form.piso) || null, estacionamiento: form.estacionamiento, bodega: form.bodega,
      mascotas: form.mascotas, amoblado: form.amoblado, estado: form.estado,
      amenities: form.amenities, cercanias: form.cercanias,
      descripcion: form.descripcion, telefono: form.telefono,
      email: form.email || null,
      disponible_desde: form.disponibleDesde || null,
      google_maps_link: form.googleMapsLink || null,
      ...(coords ? { lat: coords.lat, lng: coords.lng } : {}),
    }

    const { data: property, error: propError } = await createProperty(propertyData)
    if (propError) { setError('Error al publicar: ' + propError.message); setLoading(false); return }
    for (const file of photoFiles) {
      const compressed = await compressImage(file)
      await uploadPhoto(compressed, property.id)
    }
    photoPreviews.forEach(url => URL.revokeObjectURL(url))
    setLoading(false)
    setSubmitted(true)

    // Notificación por email (fire and forget)
    fetch('/api/send-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'property-published',
        to: user.email,
        data: {
          propertyTitle: form.titulo,
          propertyUrl: `${window.location.origin}/propiedad/${property.id}`,
        }
      })
    }).catch(() => {})
  }

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
  const chipClass = (active) => `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${active ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`

  if (submitted) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-brand-50 border border-brand-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-3">Propiedad publicada!</h2>
          <p className="text-gray-500 text-sm mb-6">Tu propiedad ya está visible para miles de personas buscando arriendo en {form.comuna}.</p>
          <button onClick={() => { setSubmitted(false); setStep(1); setForm({ titulo: '', tipo: '', comuna: '', direccion: '', precio: '', gastoComun: '', m2: '', habitaciones: '1', banos: '1', piso: '', estacionamiento: false, bodega: false, mascotas: false, amoblado: 'sin', estado: 'Buen estado', amenities: [], cercanias: [], descripcion: '', telefono: '', email: '', googleMapsLink: '', disponibleDesde: '' }); setPhotoFiles([]); setPhotoPreviews([]); setCoords(null) }} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Publicar otra</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Publicar propiedad gratis | Rentu</title>
        <meta name="description" content="Publica tu propiedad en arriendo gratis. Sin comisiones, contacto directo por WhatsApp." />
      </Helmet>
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">Publicar propiedad</h1>
        <p className="text-gray-500 text-sm mb-8">Completa los datos. Es 100% gratis.</p>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-sm text-red-600">{error}</div>}

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex items-center gap-2">
              <button onClick={() => { if (s < step) setStep(s) }} className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step === s ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30' : step > s ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-400'}`}>
                {step > s ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> : s}
              </button>
              {s < 4 && <div className={`w-10 sm:w-16 h-0.5 ${step > s ? 'bg-brand-300' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="font-display font-semibold text-lg text-gray-800 mb-4">Información básica</h3>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Título *</label><input type="text" required value={form.titulo} onChange={e => update('titulo', e.target.value)} placeholder="Ej: Departamento moderno en Providencia" className={inputClass} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo *</label><select required value={form.tipo} onChange={e => update('tipo', e.target.value)} className={inputClass}><option value="">Seleccionar</option>{tiposPropiedad.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Comuna *</label><select required value={form.comuna} onChange={e => update('comuna', e.target.value)} className={inputClass}><option value="">Seleccionar</option>{comunasByRegion.map(group => <optgroup key={group.region} label={group.region}>{group.comunas.map(c => <option key={c} value={c}>{c}</option>)}</optgroup>)}</select></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de arriendo</label><select value={form.tipoArriendo} onChange={e => update('tipoArriendo', e.target.value)} className={inputClass}><option value="">Seleccionar</option>{tiposArriendo.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dirección *</label><input type="text" required value={form.direccion} onChange={e => update('direccion', e.target.value)} placeholder="Ej: Av. Providencia 1234" className={inputClass} /></div>

              {/* Google Maps link */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Link de Google Maps</label>
                <div className="flex items-center gap-2 mb-2 p-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <svg className="w-4 h-4 text-brand-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  <p className="text-xs text-gray-600 dark:text-gray-300">
                    Busca tu propiedad en <strong>Google Maps</strong>, toca <strong>"Compartir"</strong> y pega el link aquí.
                  </p>
                </div>
                <input
                  type="url"
                  value={form.googleMapsLink}
                  onChange={e => update('googleMapsLink', e.target.value)}
                  placeholder="https://maps.app.goo.gl/... o https://www.google.com/maps/..."
                  className={inputClass}
                />
                {mapsLinkError && <p className="text-xs text-red-500 mt-1">{mapsLinkError}</p>}
                {form.googleMapsLink && isGoogleMapsUrl(form.googleMapsLink) && !mapsLinkError && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 mt-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    Link de Google Maps guardado
                  </div>
                )}
                {/* Preview del mapa usando la dirección (no coordenadas) */}
                {form.direccion && form.comuna && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Vista previa de la ubicación:</p>
                    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm" style={{ height: 250 }}>
                      <iframe
                        title="Vista previa de ubicación"
                        src={`https://maps.google.com/maps?q=${encodeURIComponent(form.direccion + ', ' + form.comuna + ', Chile')}&z=17&output=embed`}
                        style={{ width: '100%', height: '100%', border: 0 }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Arriendo mensual (CLP) *</label><input type="number" required value={form.precio} onChange={e => update('precio', e.target.value)} placeholder="650000" className={inputClass} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gasto común (CLP)</label><input type="number" value={form.gastoComun} onChange={e => update('gastoComun', e.target.value)} placeholder="85000" className={inputClass} /></div>
              </div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Disponible desde (opcional)</label><input type="date" value={form.disponibleDesde} onChange={e => update('disponibleDesde', e.target.value)} className={inputClass} /></div>
              <div className="flex justify-end"><button type="button" onClick={() => nextStep(1)} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Siguiente</button></div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="font-display font-semibold text-lg text-gray-800 mb-4">Características</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">m2</label><input type="number" value={form.m2} onChange={e => update('m2', e.target.value)} placeholder="65" className={inputClass} /></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dormitorios</label><select value={form.habitaciones} onChange={e => update('habitaciones', e.target.value)} className={inputClass}>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Baños</label><select value={form.banos} onChange={e => update('banos', e.target.value)} className={inputClass}>{[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Piso</label><input type="number" value={form.piso} onChange={e => update('piso', e.target.value)} placeholder="5" className={inputClass} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Estado</label><select value={form.estado} onChange={e => update('estado', e.target.value)} className={inputClass}>{estadoPropiedad.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
                <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Amoblado</label><select value={form.amoblado} onChange={e => update('amoblado', e.target.value)} className={inputClass}>{amobladoOptions.filter(o => o.value).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}</select></div>
              </div>
              <div className="flex flex-wrap items-center gap-5">
                {[['estacionamiento', 'Estacionamiento'], ['bodega', 'Bodega'], ['mascotas', 'Acepta mascotas']].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form[key]} onChange={e => update(key, e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" /><span className="text-sm text-gray-600">{label}</span></label>
                ))}
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Descripcion</label>
                <textarea rows={4} value={form.descripcion} onChange={e => update('descripcion', e.target.value)} placeholder="Describe tu propiedad..." className={`${inputClass} resize-none`} />
              </div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">WhatsApp *</label><input type="tel" required value={form.telefono} onChange={e => update('telefono', e.target.value)} placeholder="+56912345678" className={inputClass} /></div>
              <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Email de contacto (opcional)</label><input type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="correo@ejemplo.cl" className={inputClass} /></div>
              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Anterior</button>
                <button type="button" onClick={() => nextStep(2)} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Siguiente</button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h3 className="font-display font-semibold text-lg text-gray-800 mb-4">Equipamiento y alrededores</h3>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Equipamiento del edificio/condominio</label>
                <div className="flex flex-wrap gap-2">
                  {amenitiesEdificio.map(a => (
                    <button key={a.key} type="button" onClick={() => toggleArray('amenities', a.key)} className={chipClass(form.amenities.includes(a.key))}>
                      {a.icon} {a.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Alrededores</label>
                <div className="flex flex-wrap gap-2">
                  {cercaniasOptions.map(c => (
                    <button key={c.key} type="button" onClick={() => toggleArray('cercanias', c.key)} className={chipClass(form.cercanias.includes(c.key))}>
                      {c.icon} {c.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(2)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Anterior</button>
                <button type="button" onClick={() => nextStep(3)} className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl">Siguiente</button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <h3 className="font-display font-semibold text-lg text-gray-800 mb-4">Fotos, videos y publicación</h3>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Fotos *</label>
                <p className="text-xs text-gray-400 mb-3">Mínimo 4 fotos requeridas. Mientras más fotos, más interés genera tu publicación.</p>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-brand-400 transition-colors bg-white">
                  <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                  <span className="text-sm text-gray-500">Haz clic para subir fotos</span>
                  <span className="text-xs text-gray-400 mt-1">{photoPreviews.length}/4 mínimo</span>
                  <input type="file" multiple accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                </label>
                {photoPreviews.length > 0 && photoPreviews.length < 4 && (
                  <p className="text-xs text-amber-600 mt-2 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    Faltan {4 - photoPreviews.length} foto{4 - photoPreviews.length > 1 ? 's' : ''} más para publicar
                  </p>
                )}
                {photoPreviews.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-3">
                    {photoPreviews.map((url, i) => (
                      <div key={i} className="relative aspect-square rounded-xl overflow-hidden group">
                        <img src={url} alt={`Vista previa foto ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
                        <button type="button" onClick={() => removePhoto(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Video upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Video (opcional)</label>
                <p className="text-xs text-gray-400 mb-3">Sube un video corto de tu propiedad para atraer más interesados.</p>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:border-brand-400 transition-colors bg-white">
                  <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                  <span className="text-xs text-gray-500">Subir video (MP4, máx. 50MB)</span>
                  <input type="file" accept="video/mp4,video/webm" onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file && file.size > 50 * 1024 * 1024) {
                      alert('El video no puede superar los 50MB')
                      return
                    }
                    if (file) {
                      setForm(prev => ({ ...prev, videoFile: file }))
                    }
                  }} className="hidden" />
                </label>
                {form.videoFile && (
                  <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-brand-50 border border-brand-200 rounded-xl">
                    <svg className="w-4 h-4 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span className="text-xs text-brand-700 flex-1 truncate">{form.videoFile.name}</span>
                    <button type="button" onClick={() => setForm(prev => ({ ...prev, videoFile: null }))} className="text-brand-600 hover:text-red-500">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                <h4 className="font-display font-semibold text-gray-800 text-sm mb-3">Vista previa</h4>
                <div className="text-sm text-gray-500 space-y-1">
                  <p className="text-gray-700 font-medium">{form.titulo || 'Sin título'}</p>
                  <p>{form.tipo} en {form.comuna || '...'} — {form.direccion || '...'}</p>
                  <p className="font-display font-bold text-brand-600 text-lg">${Number(form.precio || 0).toLocaleString('es-CL')}/mes</p>
                  <p>{form.m2 || '?'} m2 - {form.habitaciones} dormitorio{form.habitaciones > 1 ? 's' : ''} - {form.banos} baño{form.banos > 1 ? 's' : ''} - {form.amoblado}</p>
                  {form.amenities.length > 0 && <p>Equipamiento: {form.amenities.map(a => amenitiesEdificio.find(x => x.key === a)?.label).filter(Boolean).join(', ')}</p>}
                  {form.cercanias.length > 0 && <p>Alrededores: {form.cercanias.map(c => cercaniasOptions.find(x => x.key === c)?.label).filter(Boolean).join(', ')}</p>}
                  <p>{photoPreviews.length} foto{photoPreviews.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(3)} className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Anterior</button>
                <button type="submit" disabled={loading} className="px-8 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25">
                  {loading ? 'Publicando...' : 'Publicar propiedad'}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
