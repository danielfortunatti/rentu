import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getTenantProfile } from '../lib/supabase'

export default function PublicTenantProfile() {
  const { userId } = useParams()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const { data } = await getTenantProfile(userId)
        if (data) {
          setProfile(data)
        } else {
          setNotFound(true)
        }
      } catch {
        setNotFound(true)
      }
      setLoading(false)
    }
    load()
  }, [userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" role="status" aria-label="Cargando perfil" />
      </div>
    )
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20 flex items-center justify-center">
        <div className="text-center bg-white dark:bg-gray-800 rounded-2xl p-10 shadow-sm border border-gray-100 dark:border-gray-700 max-w-md mx-4">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-xl text-gray-800 dark:text-gray-100 mb-2">Este usuario no tiene perfil público</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">El perfil de arrendatario no existe o no ha sido completado.</p>
          <Link to="/buscar" className="text-brand-600 hover:text-brand-700 text-sm font-medium">Volver a buscar</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 dark:bg-gray-900 pt-20">
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 sm:p-8 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
              <svg className="w-7 h-7 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h1 className="font-display font-bold text-xl text-gray-900 dark:text-gray-100">Perfil de arrendatario</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">Verificado en Rentu</p>
            </div>
          </div>

          <div className="h-px bg-gray-100 dark:bg-gray-700 mb-6" />

          {/* Info grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {profile.ocupacion && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-1">Ocupación</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{profile.ocupacion}</p>
              </div>
            )}

            {profile.ingresos_rango && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-1">Rango de ingresos</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{profile.ingresos_rango}</p>
              </div>
            )}

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-1">Personas en el hogar</p>
              <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{profile.personas_hogar || 1} persona{(profile.personas_hogar || 1) > 1 ? 's' : ''}</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center gap-4">
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-1">Mascotas</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">
                  {profile.tiene_mascotas ? (profile.tipo_mascota || 'Sí') : 'No'}
                </p>
              </div>
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-600" />
              <div>
                <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-1">Fumador</p>
                <p className="text-sm text-gray-800 dark:text-gray-200 font-medium">{profile.fumador ? 'Sí' : 'No'}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          {profile.descripcion && (
            <div className="mb-6">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-2">Sobre mí</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">{profile.descripcion}</p>
            </div>
          )}

          {/* References */}
          {profile.referencias && (
            <div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-widest font-semibold mb-2">Referencias</p>
              <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">{profile.referencias}</p>
            </div>
          )}

          {/* Disclaimer */}
          <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 leading-relaxed">
              Este perfil fue creado por el usuario en Rentu. La información no ha sido verificada por la plataforma. Recomendamos solicitar documentación adicional antes de concretar un arriendo.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
