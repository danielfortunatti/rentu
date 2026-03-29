import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getTenantProfile, upsertTenantProfile } from '../lib/supabase'
import { getRecaptchaToken, verifyRecaptcha } from '../utils/recaptcha'

const rangosIngreso = [
  'Menos de $400.000',
  '$400.000 - $600.000',
  '$600.000 - $800.000',
  '$800.000 - $1.200.000',
  '$1.200.000 - $1.800.000',
  '$1.800.000 - $2.500.000',
  'Más de $2.500.000',
]

export default function TenantProfile({ user }) {
  const [form, setForm] = useState({
    ocupacion: '', ingresos_rango: '', tiene_mascotas: false,
    tipo_mascota: '', fumador: false, personas_hogar: 1,
    referencias: '', descripcion: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await getTenantProfile(user.id)
      if (data) setForm(data)
      setLoading(false)
    }
    load()
  }, [user])

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    setError('')

    // reCAPTCHA v3
    const token = await getRecaptchaToken('save_tenant_profile')
    if (token) {
      const verification = await verifyRecaptcha(token, 'save_tenant_profile')
      if (!verification.success) {
        setSaving(false)
        setError('Verificación de seguridad fallida. Intenta de nuevo.')
        return
      }
    }

    await upsertTenantProfile(user.id, form)
    setSaving(false)
    setSuccess(true)
    setTimeout(() => setSuccess(false), 3000)
  }

  const inputClass = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"

  if (loading) return <div className="min-h-screen bg-warm-50 pt-20 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="min-h-screen bg-warm-50 pt-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl text-gray-900 mb-2">Perfil de arrendatario</h1>
        <p className="text-gray-500 text-sm mb-2">Completa tu perfil para postular a arriendos con 1 clic.</p>
        <p className="text-xs text-brand-600 bg-brand-50 border border-brand-200 rounded-lg p-2 mb-4">Los arrendadores ven tu perfil cuando les envías una solicitud. Un perfil completo genera más confianza.</p>

        <Link to="/verificacion" className="block bg-white dark:bg-gray-800 border border-brand-200 dark:border-brand-800 rounded-2xl p-4 mb-8 hover:border-brand-400 dark:hover:border-brand-600 transition-colors group">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/30 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">Completa tu verificación</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Aumenta tus chances de ser elegido por los arrendadores</p>
            </div>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-brand-500 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" /></svg>
          </div>
        </Link>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-6 text-sm text-red-600">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-6 text-sm text-green-600">Perfil guardado correctamente.</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Ocupación</label><input type="text" value={form.ocupacion} onChange={e => update('ocupacion', e.target.value)} placeholder="Ej: Ingeniero, Estudiante, Freelancer..." className={inputClass} /></div>

          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Rango de ingresos mensuales</label>
            <select value={form.ingresos_rango} onChange={e => update('ingresos_rango', e.target.value)} className={inputClass}>
              <option value="">Prefiero no decir</option>
              {rangosIngreso.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Personas en el hogar</label>
            <select value={form.personas_hogar} onChange={e => update('personas_hogar', Number(e.target.value))} className={inputClass}>
              {[1,2,3,4,5,6].map(n => <option key={n} value={n}>{n} persona{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.tiene_mascotas} onChange={e => update('tiene_mascotas', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-gray-600">Tengo mascotas</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.fumador} onChange={e => update('fumador', e.target.checked)} className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
              <span className="text-sm text-gray-600">Fumador</span>
            </label>
          </div>

          {form.tiene_mascotas && (
            <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Tipo de mascota</label><input type="text" value={form.tipo_mascota} onChange={e => update('tipo_mascota', e.target.value)} placeholder="Ej: Perro chico, 2 gatos..." className={inputClass} /></div>
          )}

          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Referencias</label><textarea rows={3} value={form.referencias} onChange={e => update('referencias', e.target.value)} placeholder="Ej: Nombre y teléfono de arrendador anterior, empleador, etc." className={`${inputClass} resize-none`} /></div>

          <div><label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sobre mí</label><textarea rows={3} value={form.descripcion} onChange={e => update('descripcion', e.target.value)} placeholder="Cuéntale al arrendador sobre ti: qué buscas, por qué te mudas, etc." className={`${inputClass} resize-none`} /></div>

          <button type="submit" disabled={saving} className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-brand-500/25">
            {saving ? 'Guardando...' : 'Guardar perfil'}
          </button>
        </form>
      </div>
    </div>
  )
}
