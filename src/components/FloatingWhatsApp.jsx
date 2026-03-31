import { useState } from 'react'

export default function FloatingWhatsApp() {
  const [showTooltip, setShowTooltip] = useState(false)
  const gmailUrl = 'https://mail.google.com/mail/?view=cm&to=rentu.contacto@gmail.com&su=Consulta%20desde%20Rentu'

  return (
    <div className="fixed bottom-6 right-6 z-[60]">
      {showTooltip && (
        <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 p-3 w-48 animate-fadeIn">
          <p className="text-xs text-gray-600 dark:text-gray-300 font-medium">¿Necesitas ayuda?</p>
          <p className="text-[10px] text-gray-400 mt-0.5">Escríbenos por email</p>
          <div className="absolute bottom-[-6px] right-6 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 transform rotate-45" />
        </div>
      )}
      <a
        href={gmailUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 bg-brand-600 hover:bg-brand-500 rounded-full shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all hover:scale-110 active:scale-95 cursor-pointer"
        aria-label="Contactar por email"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-400 rounded-full animate-ping" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-brand-400 rounded-full" />
      </a>
    </div>
  )
}
