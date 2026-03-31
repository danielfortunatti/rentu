import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function FloatingWhatsApp() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ nombre: '', email: '', asunto: 'Consulta general', mensaje: '' })
  const [status, setStatus] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nombre.trim() || !form.email.trim() || !form.mensaje.trim()) return
    setStatus('sending')
    try {
      const { error } = await supabase.from('contact_messages').insert({
        nombre: form.nombre,
        email: form.email,
        asunto: form.asunto,
        mensaje: form.mensaje,
        created_at: new Date().toISOString()
      })
      if (error) {
        console.warn('Error saving contact message (table may not exist yet):', error)
      }
      setStatus('sent')
      setForm({ nombre: '', email: '', asunto: 'Consulta general', mensaje: '' })
      setTimeout(() => { setStatus('idle'); setOpen(false) }, 3000)
    } catch (err) {
      console.error('Contact form error:', err)
      setStatus('error')
    }
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {/* Contact form */}
      {open && (
        <div className="absolute bottom-16 right-0 w-72 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn">
          <div className="bg-brand-600 px-4 py-3 flex items-center justify-between">
            <span className="text-white text-sm font-semibold">Contáctanos</span>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          {status === 'sent' ? (
            <div className="p-6 text-center">
              <svg className="w-10 h-10 text-brand-500 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">Mensaje enviado</p>
              <p className="text-xs text-gray-400 mt-1">Te responderemos pronto</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <input
                type="text"
                value={form.nombre}
                onChange={e => setForm(prev => ({ ...prev, nombre: e.target.value }))}
                placeholder="Tu nombre"
                required
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-brand-500 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                aria-label="Nombre"
              />
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Tu email"
                required
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-brand-500 text-gray-700 dark:text-gray-200 placeholder-gray-400"
                aria-label="Email"
              />
              <select
                value={form.asunto}
                onChange={e => setForm(prev => ({ ...prev, asunto: e.target.value }))}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-brand-500 text-gray-700 dark:text-gray-200"
                aria-label="Asunto"
              >
                <option value="Consulta general">Consulta general</option>
                <option value="Problema con mi cuenta">Problema con mi cuenta</option>
                <option value="Reportar un error">Reportar un error</option>
                <option value="Sugerencia">Sugerencia</option>
                <option value="Otro">Otro</option>
              </select>
              <textarea
                value={form.mensaje}
                onChange={e => setForm(prev => ({ ...prev, mensaje: e.target.value }))}
                placeholder="¿En qué podemos ayudarte?"
                required
                rows={3}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-brand-500 text-gray-700 dark:text-gray-200 placeholder-gray-400 resize-none"
                aria-label="Mensaje"
              />
              {status === 'error' && <p className="text-xs text-red-500">Error al enviar. Intenta de nuevo.</p>}
              <button
                type="submit"
                disabled={status === 'sending'}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {status === 'sending' ? 'Enviando...' : 'Enviar mensaje'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="group relative flex items-center justify-center w-14 h-14 bg-brand-600 hover:bg-brand-500 rounded-full shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Contactar soporte"
      >
        <svg className={`w-6 h-6 text-white transition-transform ${open ? 'rotate-45' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          )}
        </svg>
        {!open && (
          <>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-400 rounded-full" />
          </>
        )}
      </button>
    </div>
  )
}
