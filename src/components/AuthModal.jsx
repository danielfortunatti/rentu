import { useState } from 'react'
import { Link } from 'react-router-dom'
import { signIn, signUp, signInWithGoogle, resendVerificationEmail, supabase } from '../lib/supabase'
import { getRecaptchaToken, verifyRecaptcha } from '../utils/recaptcha'

export default function AuthModal({ isOpen, onClose, onAuth }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (mode === 'register' && !acceptTerms) {
      setError('Debes aceptar los Términos y la Política de Privacidad para registrarte.')
      setLoading(false)
      return
    }

    // reCAPTCHA v3
    const recaptchaAction = mode === 'login' ? 'login' : 'signup'
    const token = await getRecaptchaToken(recaptchaAction)
    if (token) {
      const verification = await verifyRecaptcha(token, recaptchaAction)
      if (!verification.success) {
        setError('Verificación de seguridad fallida. Intenta de nuevo.')
        setLoading(false)
        return
      }
    }

    if (mode === 'login') {
      const { data, error } = await signIn(email, password)
      if (error) { setError(error.message); setLoading(false); return }
      onAuth(data.user)
      setLoading(false)
      onClose()
    } else {
      const { data, error } = await signUp(email, password, name)
      if (error) { setError(error.message); setLoading(false); return }
      setLoading(false)
      setVerificationSent(true)
    }
  }

  const handleResend = async () => {
    setResending(true)
    setResendSuccess(false)
    setError('')
    const { error } = await resendVerificationEmail(email)
    if (error) {
      setError(error.message)
    } else {
      setResendSuccess(true)
      setTimeout(() => setResendSuccess(false), 4000)
    }
    setResending(false)
  }

  const handleGoogle = async () => {
    if (mode === 'register' && !acceptTerms) {
      setError('Debes aceptar los Términos y la Política de Privacidad para registrarte.')
      return
    }
    const { error } = await signInWithGoogle()
    if (error) setError(error.message)
  }

  const resetModal = () => {
    setVerificationSent(false)
    setMode('login')
    setError('')
    setEmail('')
    setPassword('')
    setName('')
    setAcceptTerms(false)
    setResendSuccess(false)
  }

  const inputClass = "w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10"

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={mode === 'login' ? 'Iniciar sesión' : 'Crear cuenta'}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => { onClose(); resetModal() }} aria-label="Cerrar modal" />
      <div className="relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl w-full max-w-md p-7 shadow-2xl">
        <button onClick={() => { onClose(); resetModal() }} aria-label="Cerrar" className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>

        {verificationSent ? (
          <div className="text-center py-4">
            <div className="w-16 h-16 bg-brand-50 border border-brand-200 rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-8 h-8 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
            </div>
            <h2 className="font-display font-bold text-xl text-gray-800 mb-2">Verifica tu email</h2>
            <p className="text-sm text-gray-500 leading-relaxed mb-6">
              Te enviamos un email de verificación a <span className="font-semibold text-gray-700">{email}</span>. Revisa tu bandeja de entrada para activar tu cuenta.
            </p>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">{error}</div>}
            {resendSuccess && <div className="bg-brand-50 border border-brand-200 rounded-xl p-3 mb-4 text-sm text-brand-700">Email reenviado correctamente.</div>}

            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full py-3 bg-brand-50 hover:bg-brand-100 border border-brand-200 text-brand-700 font-semibold rounded-xl transition-all disabled:opacity-50 mb-3"
            >
              {resending ? 'Reenviando...' : 'Reenviar email'}
            </button>

            <button
              onClick={resetModal}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium"
            >
              Volver al inicio de sesión
            </button>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-14 h-14 bg-gradient-to-br from-brand-400 to-brand-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/20">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h2 className="font-display font-bold text-xl text-gray-800">{mode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu cuenta'}</h2>
              <p className="text-sm text-gray-500 mt-1">{mode === 'login' ? 'Ingresa a tu cuenta de Rentu' : 'Regístrate gratis en Rentu'}</p>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-sm text-red-600">{error}</div>}

            <button onClick={handleGoogle} className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium text-sm rounded-xl transition-colors mb-4 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continuar con Google
            </button>

            <div className="flex items-center gap-3 mb-4"><div className="flex-1 h-px bg-gray-200" /><span className="text-xs text-gray-400">o</span><div className="flex-1 h-px bg-gray-200" /></div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Nombre</label><input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Tu nombre" className={inputClass} /></div>}
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label><input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" className={inputClass} /></div>
              <div><label className="block text-xs font-semibold text-gray-500 mb-1.5">Contraseña</label><input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className={inputClass} /></div>

              {mode === 'register' && (
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="w-4 h-4 mt-0.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500" />
                  <span className="text-xs text-gray-500 leading-relaxed">
                    Acepto los <a href="/terminos" target="_blank" className="text-brand-600 hover:underline">Términos y Condiciones</a> y la <a href="/privacidad" target="_blank" className="text-brand-600 hover:underline">Política de Privacidad</a> de Rentu.
                  </span>
                </label>
              )}

              <button type="submit" disabled={loading} className="w-full py-3 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md shadow-brand-500/20">{loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Registrarme'}</button>
            </form>

            {mode === 'login' && (
              <p className="text-center text-xs text-gray-400 mt-2">
                <button onClick={async () => {
                  if (!email) { setError('Escribe tu email primero'); return }
                  setLoading(true)
                  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin })
                  if (error) setError(error.message)
                  else setError('Te enviamos un email para restablecer tu contraseña. Revisa tu bandeja de entrada.')
                  setLoading(false)
                }} className="text-brand-600 hover:text-brand-700 font-medium">Olvidé mi contraseña</button>
              </p>
            )}

            <p className="text-center text-sm text-gray-500 mt-3">
              {mode === 'login' ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}{' '}
              <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setAcceptTerms(false) }} className="text-brand-600 hover:text-brand-700 font-semibold">{mode === 'login' ? 'Regístrate' : 'Inicia sesión'}</button>
            </p>
          </>
        )}
      </div>
    </div>
  )
}
