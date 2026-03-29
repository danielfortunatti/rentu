# Auditoría v3 — ArriendaYa (final)

> **Fecha**: 26 de marzo de 2026
> **Sitio**: https://arriendaya.vercel.app

---

## Instrucciones para Claude

Quedan solo 3 problemas por resolver. El más importante es el og:image roto.

---

## Estado de auditorías anteriores (todo corregido)

| Item | Estado |
|------|--------|
| react-helmet-async + títulos dinámicos | ✅ |
| Cookie banner con "Solo esenciales" + role="dialog" | ✅ |
| Términos: razón social, retracto, disputas | ✅ |
| Privacidad: portabilidad, DPO, Ley 21.719, transferencias | ✅ |
| Footer con identificación legal | ✅ |
| ContractGenerator: aviso de notario | ✅ |
| JSON-LD (WebSite + Organization) | ✅ |
| sitemap.xml con lastmod + robots.txt | ✅ |
| noscript fallback | ✅ |
| mobile-web-app-capable | ✅ |
| aria-labels en selects (hero + filtros búsqueda) | ✅ |
| IVA incluido en precio | ✅ |
| Sin afirmaciones absolutas | ✅ |
| "Ver todas" visible en mobile | ✅ |
| reCAPTCHA badge oculto | ✅ |
| Meta description sin duplicados | ✅ |
| RUT placeholder eliminado | ✅ |
| 0 errores de consola | ✅ |

---

## 3 PROBLEMAS RESTANTES

### 1. [CRÍTICO] og:image roto — /api/og devuelve 404

**Archivos involucrados**:
- `index.html` líneas 21 y 30 → apuntan a `https://arriendaya.vercel.app/api/og`
- `api/og.jsx` → existe y el código es correcto (usa `@vercel/og` ImageResponse)
- `package.json` → tiene `@vercel/og: ^0.11.1` instalado
- `vercel.json` → el rewrite excluye `/api/` correctamente

**El problema**: El archivo `api/og.jsx` existe localmente y el código es válido, pero en producción la ruta `/api/og` devuelve 404. Esto significa que Vercel no está reconociendo el archivo como serverless function.

**Causa probable**: Vercel con framework "vite" puede tener problemas para detectar funciones en la carpeta `api/` cuando el archivo usa extensión `.jsx` con edge runtime. Las otras funciones API (`create-payment.js`, `send-email.js`, etc.) usan `.js` plano y probablemente funcionan bien.

**Soluciones posibles (probar en orden)**:

**Opción A — Cambiar la extensión de .jsx a .js**:
El JSX de `@vercel/og` en realidad se puede escribir sin extensión .jsx porque Vercel lo transpila automáticamente. Renombrar `api/og.jsx` → `api/og.js` y hacer deploy.

**Opción B — Cambiar de edge a Node.js runtime**:
Cambiar `export const config = { runtime: 'edge' }` por `export const config = { runtime: 'nodejs' }` o eliminar la línea de config completamente.

**Opción C — Si nada funciona, usar imagen estática**:
1. Abrir el sitio localmente, o usar cualquier herramienta de diseño
2. Crear una imagen PNG de 1200x630px con:
   - Fondo: gradiente oscuro (#0a1628 → #0d2137)
   - Logo ArriendaYa con el icono de casa
   - Texto: "Arriendos sin comisiones en Chile"
   - Badges: "Sin comisiones • Contacto directo • Contrato gratis"
3. Guardarla como `public/og-image.png`
4. Cambiar index.html:
```html
<meta property="og:image" content="https://arriendaya.vercel.app/og-image.png" />
<meta name="twitter:image" content="https://arriendaya.vercel.app/og-image.png" />
```
5. Eliminar las líneas de og:image:width, og:image:height, og:image:type (o actualizarlas al tamaño real de la imagen)

**Cómo verificar que funciona después del fix**:
1. Navegar a `https://arriendaya.vercel.app/api/og` (o `/og-image.png`) — debe mostrar la imagen
2. Usar https://www.opengraph.xyz/ para verificar cómo se ve el preview
3. Compartir el link en un chat de WhatsApp y confirmar que sale la imagen

### 2. [BAJO] Ley 21.719 falta en Términos

**Archivo**: `src/pages/Terminos.jsx`, sección 11 (Ley aplicable y jurisdicción)
**Estado**: Ya está mencionada en Privacidad.jsx (correcto), pero Términos no la referencia.
**Solución**: En la sección "Ley aplicable y jurisdicción" de Terminos.jsx, agregar al final del párrafo:
```
Estos Términos se adecuarán a la Ley N° 21.719 sobre Protección de Datos Personales
a partir de su entrada en vigencia en diciembre de 2026.
```

### 3. [BAJO] JSON-LD sameAs vacío

**Archivo**: `index.html`, dentro del bloque `<script type="application/ld+json">` del schema Organization
**Estado**: El array `sameAs` está vacío `[]`, pero el footer ya tiene los links reales.
**Solución**: Rellenar con las URLs de redes sociales:
```json
"sameAs": [
  "https://www.instagram.com/arriendaya_cl/",
  "https://www.tiktok.com/@arriendaya_cl",
  "https://www.facebook.com/profile.php?id=61576469498498"
]
```

---

## CHECKLIST FINAL

- [ ] `/api/og` devuelve una imagen (o `/og-image.png` existe y es accesible)
- [ ] Compartir URL en WhatsApp muestra preview con imagen
- [ ] Términos menciona Ley 21.719
- [ ] JSON-LD sameAs tiene las 3 URLs de redes sociales
- [ ] `npm run build` compila sin errores
