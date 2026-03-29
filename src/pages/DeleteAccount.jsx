import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function DeleteAccount({ user }) {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [deleted, setDeleted] = useState(false)
  const navigate = useNavigate()

  const canDelete = confirmText === 'ELIMINAR'

  async function handleDelete() {
    if (!canDelete) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Error al eliminar la cuenta')
      }

      await supabase.auth.signOut()
      setDeleted(true)
      setTimeout(() => navigate('/'), 3000)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (deleted) {
    return (
      <div className="min-h-screen bg-warm-50 pt-20 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-10 shadow-sm border border-gray-100 max-w-md mx-4">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-800 mb-2">Cuenta eliminada</h2>
          <p className="text-gray-500 text-sm">Tu cuenta ha sido eliminada exitosamente. Serás redirigido al inicio en unos segundos.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-50 pt-20">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-gray-900 mb-2">Eliminar cuenta</h1>
        <p className="text-gray-500 text-sm mb-8">Esta acción es permanente y no se puede deshacer.</p>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Warning */}
          <div className="bg-red-50 border-b border-red-100 px-6 py-5">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-800 mb-1">Atención: esta acción es irreversible</h3>
                <p className="text-sm text-red-700">Al eliminar tu cuenta se borrarán permanentemente:</p>
                <ul className="mt-2 text-sm text-red-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    Todas tus propiedades publicadas y sus fotos
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    Tus favoritos guardados
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    Valoraciones que hayas recibido
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    Tu perfil de arrendatario
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1 h-1 bg-red-400 rounded-full" />
                    Historial de pagos y contactos
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Confirmation */}
          <div className="px-6 py-6 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escribe <span className="font-bold text-red-600">ELIMINAR</span> para confirmar
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={e => setConfirmText(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/10"
                autoComplete="off"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={!canDelete || loading}
              className={`w-full py-3 text-sm font-semibold rounded-xl transition-all ${
                canDelete && !loading
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Eliminando cuenta...
                </span>
              ) : 'Eliminar mi cuenta permanentemente'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
