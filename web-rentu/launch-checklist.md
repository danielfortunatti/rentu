# Rentu — Checklist de Lanzamiento

## Paso 1: Supabase (5 min)
- [ ] Crear tabla newsletter:
```sql
CREATE TABLE IF NOT EXISTS newsletter (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);
```

## Paso 2: Dominio (~$15.000 CLP)
- [ ] Ir a https://nic.cl
- [ ] Buscar y comprar rentu.cl
- [ ] En Vercel: Settings > Domains > Add rentu.cl
- [ ] Esperar propagación DNS (1-24 horas)

## Paso 3: Google Search Console (gratis, 10 min)
- [ ] Ir a https://search.google.com/search-console
- [ ] Agregar rentu.cl
- [ ] Verificar con meta tag (pedir código a Claude)
- [ ] Enviar sitemap: https://rentu.cl/sitemap.xml

## Paso 4: Redes sociales (10 min)
- [ ] Crear Instagram @rentu_cl
- [ ] Crear TikTok @rentu_cl
- [ ] Poner mascota como foto de perfil
- [ ] Bio: "Arriendos directos en Chile. Sin comisiones. Publica gratis."
- [ ] Link en bio: rentu-cl.vercel.app (o rentu.cl cuando esté listo)

## Paso 5: Contenido inicial (1 hora)
- [ ] Publicar Post 1 (presentación) en Instagram
- [ ] Generar imágenes con los prompts de image-prompts.md
- [ ] Programar 2-3 posts más para la semana

## Paso 6: Primeras propiedades (1-2 días)
- [ ] Publicar propiedades propias o de conocidos (mínimo 5)
- [ ] Contactar 10 dueños en grupos de Facebook de arriendos
- [ ] Mensaje: "Publica tu propiedad gratis en Rentu, sin comisiones"

## Paso 7: Difusión gratuita (continuo)
- [ ] Compartir en grupos de Facebook de arriendos
- [ ] Publicar en r/chile en Reddit
- [ ] Compartir en grupos de WhatsApp
- [ ] Pedir a amigos/familia que compartan

## Paso 8: Primeros ingresos (mes 2-3)
- [ ] Con 50+ propiedades, ofrecer "Destacar" a dueños
- [ ] Con corredores interesados, ofrecer plan corredor
- [ ] Meta: 10 propiedades destacadas = $29.900 CLP/mes

## Métricas a seguir
- Propiedades activas (ver en admin)
- Visitas (ver en Vercel Analytics)
- Usuarios registrados (ver en Supabase)
- Ingresos por destacar (ver en Flow.cl)
