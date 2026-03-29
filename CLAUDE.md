# ArriendaYa — Instrucciones del Proyecto

## Stack
- React 18 + Vite 5 + Tailwind CSS 3
- Supabase (auth + DB), Resend (email), Flow.cl (pagos), Leaflet (mapas)
- Deploy: Vercel (SPA con rewrite a index.html)

## Reglas de desarrollo

### Diseño
- NO puede verse como página generada por IA: sin gradientes cliché, sin emojis decorativos en la UI principal, usar texturas orgánicas
- Tipografía: Bricolage Grotesque (display) + Outfit (body) — no cambiar
- Color principal: brand (#049e8d) — no cambiar
- Mantener dark mode funcional en todos los componentes nuevos
- La mascota verde es parte de la identidad — no eliminar

### Legal Chile (obligatorio)
- Todo precio debe indicar si incluye IVA
- El generador de contratos SIEMPRE debe mencionar la obligación de firmar ante notario
- No usar afirmaciones absolutas ("la más", "la mejor", "#1") sin respaldo verificable
- La política de privacidad debe cumplir con Ley 19.628 y prepararse para Ley 21.719 (dic 2026)
- Términos deben incluir derecho de retracto para servicios de pago (Ley 19.496)
- Footer, Términos y Privacidad deben mostrar razón social, RUT y dirección completa del titular

### SEO
- Cada página DEBE tener su propio `<title>` y `<meta description>` (usar react-helmet-async o equivalente)
- Mantener sitemap.xml y robots.txt actualizados cuando se agreguen nuevas rutas
- Imágenes deben tener alt text descriptivo

### Accesibilidad
- Todos los inputs y selects deben tener label o aria-label
- Ratio de contraste mínimo 4.5:1 para texto normal (WCAG AA)
- Componentes interactivos deben ser navegables con teclado
- Modales y banners deben tener role y aria-label apropiados

### Código
- Español para textos de la UI, inglés para nombres de variables y funciones
- No crear archivos de documentación (.md) salvo que se pida explícitamente
- Antes de agregar dependencias, verificar si ya hay una instalada que sirva (ej: Leaflet ya está)
- `npm run build` debe compilar sin errores antes de hacer deploy

## Auditoría pendiente
Hay un archivo `AUDITORIA.md` en la raíz del proyecto con una auditoría completa de errores, problemas legales, SEO, accesibilidad y comparación competitiva. Consultarlo cuando se trabaje en mejoras.
