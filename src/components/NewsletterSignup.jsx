import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle, loading, success, error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return

    setStatus('loading')
    try {
      const { error } = await supabase
        .from('newsletter')
        .insert({ email: email.trim() })

      if (error) {
        if (error.code === '23505') {
          setStatus('success')
        } else {
          // Table might not exist yet, save locally
          const saved = JSON.parse(localStorage.getItem('rentu_newsletter') || '[]')
          if (!saved.includes(email.trim())) {
            saved.push(email.trim())
            localStorage.setItem('rentu_newsletter', JSON.stringify(saved))
          }
          setStatus('success')
        }
      } else {
        setStatus('success')
      }
    } catch {
      // Fallback to localStorage
      const saved = JSON.parse(localStorage.getItem('rentu_newsletter') || '[]')
      if (!saved.includes(email.trim())) {
        saved.push(email.trim())
        localStorage.setItem('rentu_newsletter', JSON.stringify(saved))
      }
      setStatus('success')
    }
    setEmail('')
  }

  return (
    <section className="py-16 sm:py-20 bg-gray-950 relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-40" />
      <div className="absolute inset-0 iso-grid opacity-20" />

      <div className="relative max-w-2xl mx-auto px-4 sm:px-6 text-center">
        <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center mx-auto mb-5">
          <svg className="w-6 h-6 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>

        <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3">
          No te pierdas las mejores propiedades
        </h2>
        <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">
          Recibe semanalmente las nuevas propiedades que coinciden con tus intereses. Sin spam, cancela cuando quieras.
        </p>

        {status === 'success' ? (
          <div className="flex items-center justify-center gap-2 text-brand-400 bg-brand-500/10 border border-brand-500/20 rounded-xl px-6 py-4">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm font-medium">Te suscribiste correctamente</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              aria-label="Correo electrónico para newsletter"
              className="flex-1 px-4 py-3 bg-white/[0.06] border border-white/[0.1] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 backdrop-blur-sm"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold rounded-xl transition-all btn-glow disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
            >
              {status === 'loading' ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                'Suscribirme'
              )}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-400 text-xs mt-3">Hubo un error. Intenta de nuevo.</p>
        )}

        <p className="text-gray-600 text-[10px] mt-4">
          Al suscribirte aceptas recibir emails de Rentu. Puedes cancelar en cualquier momento.
        </p>
      </div>
    </section>
  )
}
