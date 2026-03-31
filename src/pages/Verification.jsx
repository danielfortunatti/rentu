import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { createVerification, getVerification, uploadVerificationDoc } from '../lib/supabase'

// Validar RUT chileno
function validarRut(rut) {
  if (!rut || typeof rut !== 'string') return false
  const clean = rut.replace(/[.\-]/g, '').toUpperCase()
  if (clean.length < 2) return false
  const body = clean.slice(0, -1)
  const dv = clean.slice(-1)
  if (!/^\d+$/.test(body)) return false
  let sum = 0
  let mul = 2
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul
    mul = mul === 7 ? 2 : mul + 1
  }
  const expected = 11 - (sum % 11)
  const dvExpected = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected)
  return dv === dvExpected
}

const rangosIngreso = [
  'Menos de $400.000',
  '$400.000 - $600.000',
  '$600.000 - $800.000',
  '$800.000 - $1.200.000',
  '$1.200.000 - $1.800.000',
  '$1.800.000 - $2.500.000',
  'Más de $2.500.000',
]

const situacionesLaborales = [
  'Empleado',
  'Independiente',
  'Estudiante',
  'Jubilado',
  'Otro',
]

function calculateScore(data) {
  let score = 0
  if (data.cedula_frente_url) score += 20
  if (data.cedula_dorso_url) score += 20
  if (data.rut && validarRut(data.rut)) score += 10
  if (data.situacion_laboral) score += 15
  if (data.liquidacion_url) score += 10
  if (data.ref_arrendador_nombre && data.ref_arrendador_telefono) score += 15
  if (data.ref_personal_nombre && data.ref_personal_telefono) score += 10
  return score
}

function ShieldIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  )
}

function FileUploadField({ label, accept, file, onChange, existingUrl, id }) {
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</label>
      {existingUrl && !file && (
        <div className="mb-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          Archivo ya subido
        </div>
      )}
      <input
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files[0])}
        className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-900/30 dark:file:text-brand-400 cursor-pointer"
      />
    </div>
  )
}

export default function Verification({ user }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [dicomModalOpen, setDicomModalOpen] = useState(false)
  const [dicomEmail, setDicomEmail] = useState('')
  const [dicomEmailSaved, setDicomEmailSaved] = useState(false)

  // Form data
  const [form, setForm] = useState({
    nombre: '',
    rut: '',
    situacion_laboral: '',
    rango_ingreso: '',
    empleador: '',
    ref_arrendador_nombre: '',
    ref_arrendador_telefono: '',
    ref_personal_nombre: '',
    ref_personal_telefono: '',
    notas: '',
  })

  // File states
  const [cedulaFrente, setCedulaFrente] = useState(null)
  const [cedulaDorso, setCedulaDorso] = useState(null)
  const [liquidacion, setLiquidacion] = useState(null)

  // Existing URLs from DB
  const [existingUrls, setExistingUrls] = useState({})
  const [existingScore, setExistingScore] = useState(null)
  const [existingEstado, setExistingEstado] = useState(null)

  // RUT validation
  const [rutError, setRutError] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await getVerification(user.id)
      if (data) {
        setForm({
          nombre: data.nombre || '',
          rut: data.rut || '',
          situacion_laboral: data.situacion_laboral || '',
          rango_ingreso: data.rango_ingreso || '',
          empleador: data.empleador || '',
          ref_arrendador_nombre: data.ref_arrendador_nombre || '',
          ref_arrendador_telefono: data.ref_arrendador_telefono || '',
          ref_personal_nombre: data.ref_personal_nombre || '',
          ref_personal_telefono: data.ref_personal_telefono || '',
          notas: data.notas || '',
        })
        setExistingUrls({
          cedula_frente_url: data.cedula_frente_url,
          cedula_dorso_url: data.cedula_dorso_url,
          selfie_url: data.selfie_url,
          liquidacion_url: data.liquidacion_url,
        })
        if (data.score != null) setExistingScore(data.score)
        if (data.estado) setExistingEstado(data.estado)
      }
      setLoading(false)
    }
    load()
  }, [user.id])

  const update = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
    if (key === 'rut') {
      setRutError(value && !validarRut(value) ? 'RUT inválido' : '')
    }
  }

  const uploadFile = async (file, docType) => {
    if (!file) return null
    const { url, error } = await uploadVerificationDoc(file, user.id, docType)
    if (error) {
      setError(`Error subiendo ${docType}: ${error.message || error}`)
      return null
    }
    return url
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError('')

    try {
      // Upload files
      const cedulaFrenteUrl = cedulaFrente ? await uploadFile(cedulaFrente, 'cedula_frente') : existingUrls.cedula_frente_url
      const cedulaDorsoUrl = cedulaDorso ? await uploadFile(cedulaDorso, 'cedula_dorso') : existingUrls.cedula_dorso_url
      const liquidacionUrl = liquidacion ? await uploadFile(liquidacion, 'liquidacion') : existingUrls.liquidacion_url

      const verificationData = {
        ...form,
        cedula_frente_url: cedulaFrenteUrl || null,
        cedula_dorso_url: cedulaDorsoUrl || null,
        selfie_url: null,
        liquidacion_url: liquidacionUrl || null,
      }

      const score = calculateScore(verificationData)
      verificationData.score = score
      // Auto-verify when all required docs are present (RUT + carnet front + carnet back)
      const hasAllRequired = verificationData.rut && validarRut(verificationData.rut) && verificationData.cedula_frente_url && verificationData.cedula_dorso_url
      verificationData.estado = hasAllRequired ? 'verificado_basico' : 'pendiente'

      const { data, error: saveError } = await createVerification(user.id, verificationData)
      if (saveError) {
        setError(saveError.message || 'Error al guardar la verificación')
        setSaving(false)
        return
      }

      setExistingScore(score)
      setExistingEstado(verificationData.estado)
      setExistingUrls({
        cedula_frente_url: cedulaFrenteUrl,
        cedula_dorso_url: cedulaDorsoUrl,
        liquidacion_url: liquidacionUrl,
      })
      setStep(4)
    } catch (err) {
      setError('Error inesperado. Intenta de nuevo.')
    }
    setSaving(false)
  }

  const inputClass = "w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const totalSteps = 4
  const progressPercent = step === 4 ? 100 : ((step - 1) / (totalSteps - 1)) * 100

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <Helmet>
        <title>Verificación de identidad | Rentu</title>
        <meta name="description" content="Verifica tu identidad para generar confianza con los arrendadores en Rentu." />
      </Helmet>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-brand-50 dark:bg-brand-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldIcon className="w-7 h-7 text-brand-600 dark:text-brand-400" />
          </div>
          <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-gray-100 mb-2">Verificación de identidad</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">Completa los pasos para obtener tu insignia de verificación y aumentar tu confianza ante los arrendadores.</p>
        </div>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {['Identidad', 'Empleo', 'Referencias', 'Resultado'].map((label, i) => (
              <button
                key={label}
                onClick={() => { if (i + 1 < step) setStep(i + 1) }}
                className={`text-xs font-medium transition-colors ${
                  step === i + 1
                    ? 'text-brand-600 dark:text-brand-400'
                    : step > i + 1
                      ? 'text-brand-500/60 dark:text-brand-500/50 cursor-pointer hover:text-brand-600'
                      : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-3 mb-6 text-sm text-red-600 dark:text-red-400">{error}</div>
        )}

        {/* Step 1: Identidad */}
        {step === 1 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-gray-100">Paso 1: Identidad</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Sube tu carnet de identidad (frente y reverso) para verificar tu identidad.</p>

            <div>
              <label htmlFor="nombre" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                value={form.nombre}
                onChange={e => update('nombre', e.target.value)}
                placeholder="Ej: Juan Pérez González"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="rut" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">RUT</label>
              <input
                id="rut"
                type="text"
                value={form.rut}
                onChange={e => update('rut', e.target.value)}
                placeholder="Ej: 12.345.678-5"
                className={`${inputClass} ${rutError ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : ''}`}
              />
              {rutError && <p className="text-xs text-red-500 mt-1">{rutError}</p>}
            </div>

            <FileUploadField
              id="cedula-frente"
              label="Carnet de identidad (frente)"
              accept="image/*"
              file={cedulaFrente}
              onChange={setCedulaFrente}
              existingUrl={existingUrls.cedula_frente_url}
            />

            <FileUploadField
              id="cedula-dorso"
              label="Carnet de identidad (reverso)"
              accept="image/*"
              file={cedulaDorso}
              onChange={setCedulaDorso}
              existingUrl={existingUrls.cedula_dorso_url}
            />

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 text-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Empleo/Ingresos */}
        {step === 2 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-gray-100">Paso 2: Empleo e ingresos</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Esta información ayuda a los arrendadores a evaluar tu capacidad de pago.</p>

            <div>
              <label htmlFor="situacion-laboral" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Situación laboral</label>
              <select
                id="situacion-laboral"
                value={form.situacion_laboral}
                onChange={e => update('situacion_laboral', e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar...</option>
                {situacionesLaborales.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="rango-ingreso" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Rango de ingreso mensual</label>
              <select
                id="rango-ingreso"
                value={form.rango_ingreso}
                onChange={e => update('rango_ingreso', e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar...</option>
                {rangosIngreso.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            <div>
              <label htmlFor="empleador" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Empresa / Empleador <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
              <input
                id="empleador"
                type="text"
                value={form.empleador}
                onChange={e => update('empleador', e.target.value)}
                placeholder="Ej: Empresa S.A."
                className={inputClass}
              />
            </div>

            <FileUploadField
              id="liquidacion"
              label={<>Última liquidación de sueldo <span className="text-gray-400 font-normal normal-case">(opcional, PDF o imagen)</span></>}
              accept="image/*,.pdf"
              file={liquidacion}
              onChange={setLiquidacion}
              existingUrl={existingUrls.liquidacion_url}
            />

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all text-sm"
              >
                Anterior
              </button>
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 text-sm"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Referencias */}
        {step === 3 && (
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm space-y-5">
            <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-gray-100">Paso 3: Referencias</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Provee referencias para fortalecer tu perfil de confianza.</p>

            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Arrendador anterior</p>
              <div>
                <label htmlFor="ref-arrendador-nombre" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                <input
                  id="ref-arrendador-nombre"
                  type="text"
                  value={form.ref_arrendador_nombre}
                  onChange={e => update('ref_arrendador_nombre', e.target.value)}
                  placeholder="Nombre del arrendador anterior"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="ref-arrendador-telefono" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Teléfono</label>
                <input
                  id="ref-arrendador-telefono"
                  type="tel"
                  value={form.ref_arrendador_telefono}
                  onChange={e => update('ref_arrendador_telefono', e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className={inputClass}
                />
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-4 space-y-4">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referencia personal</p>
              <div>
                <label htmlFor="ref-personal-nombre" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Nombre</label>
                <input
                  id="ref-personal-nombre"
                  type="text"
                  value={form.ref_personal_nombre}
                  onChange={e => update('ref_personal_nombre', e.target.value)}
                  placeholder="Nombre de referencia personal"
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="ref-personal-telefono" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Teléfono</label>
                <input
                  id="ref-personal-telefono"
                  type="tel"
                  value={form.ref_personal_telefono}
                  onChange={e => update('ref_personal_telefono', e.target.value)}
                  placeholder="+56 9 1234 5678"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="notas" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Notas adicionales <span className="text-gray-400 font-normal normal-case">(opcional)</span></label>
              <textarea
                id="notas"
                value={form.notas}
                onChange={e => update('notas', e.target.value)}
                placeholder="Cualquier información adicional que quieras compartir..."
                rows={3}
                className={inputClass}
              />
            </div>

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold rounded-xl transition-all text-sm"
              >
                Anterior
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Guardando...
                  </span>
                ) : 'Completar verificación'}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Resultado */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-8 shadow-sm text-center">
              <h2 className="font-display font-semibold text-lg text-gray-800 dark:text-gray-100 mb-6">Tu Score de Confianza</h2>

              {/* Score circle */}
              <div className="relative w-36 h-36 mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${(existingScore / 100) * 327} 327`}
                    className={existingScore >= 50 ? 'text-green-500' : 'text-amber-500'}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display font-bold text-4xl text-gray-800 dark:text-gray-100">{existingScore}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">/100</span>
                </div>
              </div>

              {/* Badge */}
              {existingEstado === 'verificado_basico' || existingEstado === 'verificado_completo' ? (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
                  <ShieldIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-semibold text-green-700 dark:text-green-400">Verificacion completada</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                  <svg className="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-semibold text-amber-700 dark:text-amber-400">Completa los campos obligatorios (RUT + carnet) para verificarte</span>
                </div>
              )}

              {/* Score breakdown */}
              <div className="mt-6 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-xl p-4 text-left">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">Desglose del puntaje</p>
                <div className="space-y-2">
                  {[
                    { label: 'Carnet de identidad (frente)', points: 20, done: !!existingUrls.cedula_frente_url },
                    { label: 'Carnet de identidad (reverso)', points: 20, done: !!existingUrls.cedula_dorso_url },
                    { label: 'RUT validado', points: 10, done: form.rut && validarRut(form.rut) },
                    { label: 'Información laboral', points: 15, done: !!form.situacion_laboral },
                    { label: 'Comprobante de ingresos', points: 10, done: !!existingUrls.liquidacion_url },
                    { label: 'Referencia de arrendador', points: 15, done: !!(form.ref_arrendador_nombre && form.ref_arrendador_telefono) },
                    { label: 'Referencia personal', points: 10, done: !!(form.ref_personal_nombre && form.ref_personal_telefono) },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {item.done ? (
                          <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="9" /></svg>
                        )}
                        <span className={item.done ? 'text-gray-700 dark:text-gray-200' : 'text-gray-400 dark:text-gray-500'}>{item.label}</span>
                      </div>
                      <span className={`text-xs font-medium ${item.done ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`}>+{item.points}</span>
                    </div>
                  ))}
                </div>
              </div>

              {existingScore < 100 && (
                <p className="mt-4 text-xs text-gray-400 dark:text-gray-500">
                  Puedes volver a completar los pasos faltantes para mejorar tu score.
                </p>
              )}
            </div>

            {/* Dicom CTA */}
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center shrink-0">
                  <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-semibold text-gray-800 dark:text-gray-100 mb-1">Verificación Completa con Dicom</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Obtén la insignia dorada con un informe completo de Dicom/Equifax. Genera máxima confianza con los arrendadores.</p>
                  <p className="text-lg font-display font-bold text-gray-800 dark:text-gray-100 mb-3">$14.990 <span className="text-xs text-gray-400 font-normal">IVA incluido</span></p>
                  <button
                    onClick={() => setDicomModalOpen(true)}
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition-all shadow-md shadow-amber-500/20 text-sm"
                  >
                    Obtener verificación Dicom
                  </button>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Link to="/perfil-arrendatario" className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 font-medium">
                Volver a mi perfil
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Dicom Modal */}
      {dicomModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setDicomModalOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-2xl max-w-md w-full p-6" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-gray-800 dark:text-gray-100">Verificación Completa Dicom</h3>
              <button onClick={() => setDicomModalOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" aria-label="Cerrar modal">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                La verificación completa incluye:
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Consulta al registro de Dicom (Equifax Chile)
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Historial crediticio completo
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Registro de morosidades vigentes
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-brand-500 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  Insignia dorada "Verificado Dicom" en tu perfil
                </li>
              </ul>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
                <p className="text-xs text-amber-700 dark:text-amber-400">
                  Próximamente disponible. Estamos finalizando la integración con Equifax Chile.
                </p>
              </div>
            </div>

            {!dicomEmailSaved ? (
              <div className="space-y-3">
                <label htmlFor="dicom-email" className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Déjanos tu email y te avisamos cuando esté disponible
                </label>
                <input
                  id="dicom-email"
                  type="email"
                  value={dicomEmail}
                  onChange={e => setDicomEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className={inputClass}
                />
                <button
                  onClick={() => {
                    if (dicomEmail) {
                      setDicomEmailSaved(true)
                    }
                  }}
                  disabled={!dicomEmail}
                  className="w-full px-5 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Notificarme cuando esté disponible
                </button>
              </div>
            ) : (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 text-center">
                <svg className="w-8 h-8 text-green-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                <p className="text-sm font-semibold text-green-700 dark:text-green-400">Te notificaremos a {dicomEmail}</p>
                <p className="text-xs text-green-600/70 dark:text-green-500 mt-1">Cuando la verificación Dicom esté disponible.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
