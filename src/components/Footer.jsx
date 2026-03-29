import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer aria-label="Pie de página" className="relative bg-gray-950 text-gray-400 overflow-hidden">
      {/* Top decorative border */}
      <div className="h-px bg-gradient-to-r from-transparent via-brand-500/40 to-transparent" />

      {/* Background effects */}
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-brand-600/5 rounded-full blur-[100px]" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-[80px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          {/* Brand column */}
          <div className="md:col-span-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <img src="/mascot-icon.svg" alt="Rentu logo" className="w-9 h-9 transition-transform duration-300 group-hover:scale-110" />
              <span className="font-display font-bold text-lg text-white">
                Ren<span className="text-brand-400">tu</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed text-gray-500 max-w-xs">
              Una plataforma simple para encontrar y publicar arriendos en Chile. Sin intermediarios, sin comisiones.
            </p>

            {/* Social icons */}
            <div className="flex items-center gap-2 mt-6">
              {[
                { href: 'https://www.instagram.com/rentu_cl/', label: 'Instagram', icon: <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/> },
                { href: 'https://www.tiktok.com/@rentu_cl', label: 'TikTok', icon: <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48V13a8.28 8.28 0 005.58 2.17v-3.45a4.85 4.85 0 01-3.77-1.26V6.69h3.77z"/> },
                { href: 'https://www.facebook.com/profile.php?id=61576469498498', label: 'Facebook', icon: <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/> },
              ].map(social => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="w-10 h-10 rounded-xl bg-white/5 hover:bg-brand-600/20 border border-white/5 hover:border-brand-500/30 flex items-center justify-center text-gray-500 hover:text-brand-400 transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">{social.icon}</svg>
                </a>
              ))}
            </div>
          </div>

          {/* Links columns */}
          <div className="md:col-span-2">
            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-widest mb-5">Explorar</h4>
            <ul className="space-y-3">
              {[
                { to: '/buscar', label: 'Buscar arriendos' },
                { to: '/publicar', label: 'Publicar propiedad' },
                { to: '/como-funciona', label: 'Cómo funciona' },
                { to: '/tips-seguridad', label: 'Tips de seguridad' },
                { to: '/checklist-mudanza', label: 'Checklist mudanza' },
              ].map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-gray-500 hover:text-brand-400 transition-colors duration-200">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-widest mb-5">Comunas populares</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-3">
              {['Providencia', 'Las Condes', 'Ñuñoa', 'Santiago Centro', 'Viña del Mar', 'La Florida'].map(comuna => (
                <li key={comuna}>
                  <Link to={`/buscar?comuna=${encodeURIComponent(comuna)}`} className="text-sm text-gray-500 hover:text-brand-400 transition-colors duration-200">{comuna}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="font-display font-semibold text-white text-xs uppercase tracking-widest mb-5">Contacto</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                <span className="text-sm text-gray-500">contacto@rentu.cl</span>
              </li>
              <li className="flex items-center gap-2.5">
                <svg className="w-4 h-4 text-gray-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                <span className="text-sm text-gray-500">Santiago, Chile</span>
              </li>
            </ul>

            {/* Legal identification */}
            <div className="mt-5 pt-4 border-t border-white/5">
              <p className="text-xs text-gray-600 leading-relaxed">Rentu SpA</p>

              <p className="text-xs text-gray-600 leading-relaxed">Santiago, Región Metropolitana, Chile</p>
            </div>

            {/* Newsletter teaser */}
            <div className="mt-8 p-4 rounded-xl bg-white/5 border border-white/5">
              <p className="text-xs text-gray-400 font-medium mb-1">Publica tu primera propiedad</p>
              <p className="text-[11px] text-gray-600 mb-3">Es gratis y toma menos de 5 minutos</p>
              <Link to="/publicar" className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                Comenzar ahora
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">&copy; {new Date().getFullYear()} Rentu. Todos los derechos reservados.</p>
          <div className="flex items-center gap-5">
            <Link to="/terminos" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Términos</Link>
            <Link to="/privacidad" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
