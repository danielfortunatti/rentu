import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProperty, updateProperty } from '../lib/supabase'
import { comunas, tiposPropiedad, amenitiesEdificio, cercaniasOptions, estadoPropiedad, amobladoOptions } from '../data/comunas'

export default function EditProperty({ user }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState(null)

  useEffect(() => {
    async function load() {
      const { data } = await getProperty(Number(id))
      if (!data || (user && data.user_id !== user.id)) {
        navigate('/buscar')
        return
      }
      setForm({
        titulo: data.titulo || '', tipo: data.tipo || '', comuna: data.comuna || '',
        direccion: data.direccion || '', precio: data.precio || '', gastoComun: data.gasto_comun || '',
        m2: data.m2 || '', habitaciones: data.habitaciones || 1, banos: data.banos || 1,
        piso: data.piso || '', estacionamiento: data.estacionamiento || false,
        bodega: data.bodega || false, mascotas: data.mascotas || false,
        amoblado: data.amoblado || 'sin', estado: data.estado || 'Buen estado',
        amenities: data.amenities || [], cercanias: data.cercanias || [],
        descripcion: data.descripcion || '', telefono: data.telefono || '',
        lat: data.lat || '', lng: data.lng || '',
      })
      setLoading(false)
    }
    load()
  }, [id, user])

  if (loading || !form) return <div className="min-h-screen bg-warm-50 pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))
  const toggleArray = (key, value) => {
    setForm(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    const updates = {
      titulo: form.titulo, tipo: form.tipo, comuna: form.comuna,
      direccion: form.direccion, precio: Number(form.precio), gasto_comun: Number(form.gastoComun) || 0,
      m2: Number(form.m2) || null, habitaciones: Number(form.habitaciones), banos: Number(form.banos),
      piso: Number(form.piso) || null, estacionamiento: form.estacionamiento, bodega: form.bodega,
      mascotas: form.mascotas, amoblado: form.amoblado, estado: form.estado,
      amenities: form.amenities, cercanias: form.cercanias,
      descripcion: form.descripcion, telefono: form.telefono,
      lat: Number(form.lat) || null, lng: Number(form.lng) || null,
    }
    const { error: err } = await updateProperty(Number(id), updates)
    if (err) { setError('Error al guardar: ' + err.message); setSaving(false); return }
    setSuccess(true)
    setSaving(false)
    setTimeout(() => navigate(`/propiedad/${id}`), 1500)
  }

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"
  const chipClass = (active) => `px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer ${active ? 'bg-brand-50 border-brand-300 text-brand-700' : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-gray-300'}`

  return (
    <div className="min-h-screen bg-warm-50 pt-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Editar propiedad</h1>
        <p className="text-gray-500 text-sm mb-8">Modifica los datos de tu publicación.</p>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-sm text-red-600">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-sm text-green-600">Propiedad actualizada. Redirigiendo...</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Título</label><input type="text" required value={form.titulo} onChange={e => update('titulo', e.target.value)} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo</label><select required value={form.tipo} onChange={e => update('tipo', e.target.value)} className={inputClass}><option value="">Seleccionar</option>{tiposPropiedad.map(t => <option key={t} value={t}>{t}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Comuna</label><select required value={form.comuna} onChange={e => update('comuna', e.target.value)} className={inputClass}><option value="">Seleccionar</option>{comunas.map(c => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dirección</label><input type="text" required value={form.direccion} onChange={e => update('direccion', e.target.value)} className={inputClass} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Arriendo mensual (CLP)</label><input type="number" required value={form.precio} onChange={e => update('precio', e.target.value)} className={inputClass} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Gasto común (CLP)</label><input type="number" value={form.gastoComun} onChange={e => update('gastoComun', e.target.value)} className={inputClass} /></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">m2</label><input type="number" value={form.m2} onChange={e => update('m2', e.target.value)} className={inputClass} /></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Dormitorios</label><select value={form.habitaciones} onChange={e => update('habitaciones', e.target.value)} className={inputClass}>{[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Baños</label><select value={form.banos} onChange={e => update('banos', e.target.value)} className={inputClass}>{[1,2,3,4].map(n => <option key={n} value={n}>{n}</option>)}</select></div>
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Piso</label><input type="number" value={form.piso} onChange={e => update('piso', e.target.value)} className={inputClass} /></div>
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
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Descripción</label><textarea rows={4} value={form.descripcion} onChange={e => update('descripcion', e.target.value)} className={`${inputClass} resize-none`} /></div>
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">WhatsApp</label><input type="tel" required value={form.telefono} onChange={e => update('telefono', e.target.value)} className={inputClass} /></div>

          <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ubicación en mapa (opcional)</h3>
            <p className="text-xs text-gray-400 mb-3">Busca tu dirección en Google Maps, haz clic derecho en la ubicación y copia las coordenadas.</p>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-xs text-gray-500 mb-1">Latitud</label><input type="text" value={form.lat} onChange={e => update('lat', e.target.value)} placeholder="-33.4372" className={inputClass} /></div>
              <div><label className="block text-xs text-gray-500 mb-1">Longitud</label><input type="text" value={form.lng} onChange={e => update('lng', e.target.value)} placeholder="-70.6506" className={inputClass} /></div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Amenities</label>
            <div className="flex flex-wrap gap-2">
              {amenitiesEdificio.map(a => (
                <button key={a.key} type="button" onClick={() => toggleArray('amenities', a.key)} className={chipClass(form.amenities.includes(a.key))}>{a.icon} {a.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Cercanías</label>
            <div className="flex flex-wrap gap-2">
              {cercaniasOptions.map(c => (
                <button key={c.key} type="button" onClick={() => toggleArray('cercanias', c.key)} className={chipClass(form.cercanias.includes(c.key))}>{c.icon} {c.label}</button>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => navigate(`/propiedad/${id}`)} className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
