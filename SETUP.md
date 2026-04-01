# Rentu - Setup & Deployment Guide

Complete setup documentation for the Rentu rental property platform (Chilean market).

---

## 1. Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm** (comes with Node.js)
- **Git**

### Third-Party Accounts

| Service | Purpose | Tier |
|---------|---------|------|
| [Supabase](https://supabase.com) | Database, auth, storage, realtime | Free tier works |
| [Vercel](https://vercel.com) | Hosting & serverless API functions | Free tier works |
| [Flow.cl](https://www.flow.cl) | Payment processing (Chile) | Merchant account required |
| [Resend](https://resend.com) | Transactional emails | Free tier (100 emails/day) |
| [Google reCAPTCHA](https://www.google.com/recaptcha/) | Spam protection (v3) | Free |

---

## 2. Local Development Setup

```bash
git clone <repo-url>
cd rentu
cp .env.example .env
# Fill in your environment variables (see Section 3)
npm install
npm run dev
```

The dev server starts at `http://localhost:5173` by default.

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server (Vite) |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |

---

## 3. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

| Variable | Side | Description |
|----------|------|-------------|
| `VITE_SUPABASE_URL` | Client | Your Supabase project URL (e.g. `https://xxxxx.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase anon/public key (safe for client-side use) |
| `SUPABASE_SERVICE_KEY` | Server | Supabase service role key. Used only in Vercel serverless functions (`/api`). Never expose to the client. |
| `FLOW_API_KEY` | Server | Flow.cl API key for payment creation |
| `FLOW_SECRET_KEY` | Server | Flow.cl secret key for HMAC signing |
| `RESEND_API_KEY` | Server | Resend API key for transactional emails |
| `VITE_RECAPTCHA_SITE_KEY` | Client | Google reCAPTCHA v3 site key |
| `RECAPTCHA_SECRET_KEY` | Server | Google reCAPTCHA v3 secret key |
| `VITE_ADMIN_EMAILS` | Client | Comma-separated admin email addresses (e.g. `admin@rentu.cl,owner@rentu.cl`) |

> **Note:** Variables prefixed with `VITE_` are exposed to the browser. Variables without the prefix are only available in Vercel serverless functions (`/api` directory).

---

## 4. Supabase Setup

### 4.1 Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Choose a region close to Chile (e.g. South America - São Paulo)
3. Copy the **Project URL** and **anon key** from Settings > API

### 4.2 Database Schema

Run the following SQL in the Supabase SQL Editor (Dashboard > SQL Editor > New query):

```sql
-- ============================================
-- PROPERTIES
-- ============================================
CREATE TABLE properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL,                          -- e.g. 'Departamento', 'Casa', 'Oficina'
  tipo_arriendo TEXT,                          -- e.g. 'Mensual', 'Diario', 'Temporal'
  comuna TEXT NOT NULL,
  direccion TEXT,
  precio INTEGER NOT NULL,
  precio_anterior INTEGER,                     -- for showing price drops
  gasto_comun INTEGER DEFAULT 0,
  m2 INTEGER,
  habitaciones INTEGER DEFAULT 1,
  banos INTEGER DEFAULT 1,
  piso INTEGER,
  estacionamiento BOOLEAN DEFAULT FALSE,
  bodega BOOLEAN DEFAULT FALSE,
  mascotas BOOLEAN DEFAULT FALSE,
  amoblado TEXT DEFAULT 'sin',                 -- 'sin', 'semi', 'completo'
  estado TEXT DEFAULT 'Buen estado',           -- property condition
  amenities TEXT[] DEFAULT '{}',               -- array of amenity strings
  cercanias TEXT[] DEFAULT '{}',               -- nearby points of interest
  descripcion TEXT,
  telefono TEXT,
  email TEXT,
  google_maps_link TEXT,
  lat DOUBLE PRECISION,
  lng DOUBLE PRECISION,
  video_url TEXT,
  disponible_desde DATE,
  activa BOOLEAN DEFAULT TRUE,
  destacada BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_properties_user_id ON properties(user_id);
CREATE INDEX idx_properties_comuna ON properties(comuna);
CREATE INDEX idx_properties_activa ON properties(activa);
CREATE INDEX idx_properties_destacada ON properties(destacada);

-- ============================================
-- PROPERTY PHOTOS
-- ============================================
CREATE TABLE property_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_photos_property_id ON property_photos(property_id);

-- ============================================
-- FAVORITES
-- ============================================
CREATE TABLE favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_property_id ON favorites(property_id);

-- ============================================
-- REVIEWS (user-to-user ratings)
-- ============================================
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reviewer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewed_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reviews_reviewed_user_id ON reviews(reviewed_user_id);

-- ============================================
-- TENANT PROFILES
-- ============================================
CREATE TABLE tenant_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ocupacion TEXT,
  ingresos_rango TEXT,
  tiene_mascotas BOOLEAN DEFAULT FALSE,
  tipo_mascota TEXT,
  fumador BOOLEAN DEFAULT FALSE,
  personas_hogar INTEGER DEFAULT 1,
  referencias TEXT,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- VERIFICATIONS (identity verification)
-- ============================================
CREATE TABLE verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  rut TEXT,
  cedula_frente_url TEXT,
  cedula_dorso_url TEXT,
  situacion_laboral TEXT,
  liquidacion_url TEXT,
  ref_arrendador_nombre TEXT,
  ref_arrendador_telefono TEXT,
  estado TEXT DEFAULT 'pendiente',             -- 'pendiente', 'verificado_basico', 'verificado_completo'
  score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,                          -- 'destacar_7', 'destacar_30', 'destacar_90', 'corredor_*'
  monto INTEGER NOT NULL,
  commerce_order TEXT,
  flow_token TEXT,
  estado TEXT DEFAULT 'pendiente',             -- 'pendiente', 'completado', 'fallido'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_estado ON payments(estado);

-- ============================================
-- SAVED SEARCHES
-- ============================================
CREATE TABLE saved_searches (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT,
  filters JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_saved_searches_user_id ON saved_searches(user_id);

-- ============================================
-- NOTIFICATIONS
-- ============================================
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT,                                   -- e.g. 'saved-search-match'
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- ============================================
-- CONTACTS (property inquiries)
-- ============================================
CREATE TABLE contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  email TEXT,
  telefono TEXT,
  mensaje TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_contacts_owner_id ON contacts(owner_id);

-- ============================================
-- NEWSLETTER
-- ============================================
CREATE TABLE newsletter (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTACT MESSAGES (general site contact form)
-- ============================================
CREATE TABLE contact_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT,
  email TEXT,
  asunto TEXT,
  mensaje TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- REPORTS (flagged properties)
-- ============================================
CREATE TABLE reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- PROPERTY VIEWS (analytics)
-- ============================================
CREATE TABLE property_views (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_views_property_id ON property_views(property_id);

-- ============================================
-- PROPERTY CONTACTS (analytics - contact clicks)
-- ============================================
CREATE TABLE property_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_property_contacts_property_id ON property_contacts(property_id);
```

### 4.3 Storage Buckets

In the Supabase Dashboard, go to **Storage** and create two buckets:

| Bucket Name | Public | Purpose |
|-------------|--------|---------|
| `property-photos` | Yes | Property images and videos |
| `verification-docs` | Yes | Identity verification documents |

For each bucket, set the policy to allow authenticated users to upload:

```sql
-- Allow authenticated users to upload to property-photos
CREATE POLICY "Allow authenticated uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'property-photos');

CREATE POLICY "Allow public reads" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'property-photos');

-- Same for verification-docs
CREATE POLICY "Allow authenticated verification uploads" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'verification-docs');

CREATE POLICY "Allow public verification reads" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'verification-docs');
```

### 4.4 Enable Realtime

Go to **Database > Replication** and enable realtime for the `notifications` table. This powers the live notification bell in the navbar.

### 4.5 Authentication Settings

1. Go to **Authentication > URL Configuration**
2. Set **Site URL** to your production URL (e.g. `https://rentu.cl`)
3. Add **Redirect URLs**:
   - `https://rentu.cl` (production)
   - `http://localhost:5173` (local development)
4. Under **Providers**, enable:
   - Email (enabled by default)
   - Google (optional, requires Google OAuth credentials)

### 4.6 Row Level Security (RLS)

Enable RLS on all tables and add appropriate policies. At minimum:

```sql
-- Users can read all active properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read active properties" ON properties
  FOR SELECT USING (activa = true);
CREATE POLICY "Users can manage own properties" ON properties
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Users can manage their own favorites
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own favorites" ON favorites
  FOR ALL TO authenticated
  USING (auth.uid() = user_id);

-- Public can read reviews, authenticated can insert
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read reviews" ON reviews
  FOR SELECT USING (true);
CREATE POLICY "Authenticated can create reviews" ON reviews
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = reviewer_user_id);
```

Extend similar policies for all other tables based on your security requirements.

---

## 5. Vercel Deployment

### 5.1 Import Project

1. Go to [vercel.com](https://vercel.com) and click **Add New Project**
2. Import from your GitHub repository
3. Vercel will auto-detect the Vite framework

### 5.2 Build Settings

These are already configured in `vercel.json`, but verify:

| Setting | Value |
|---------|-------|
| Framework | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### 5.3 Environment Variables

Add ALL environment variables from Section 3 in Vercel's dashboard (Settings > Environment Variables). Make sure to add both `VITE_*` (client-side) and server-only variables.

**Important:** For the server-side API functions, also add:
- `SUPABASE_URL` (same value as `VITE_SUPABASE_URL` -- the API functions check both names)

### 5.4 Custom Domain

1. Go to Settings > Domains
2. Add your domain (e.g. `rentu.cl`)
3. Configure DNS records as instructed by Vercel

### 5.5 SPA Routing

The `vercel.json` already includes a rewrite rule that sends all non-API routes to `index.html`:

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

This ensures React Router works correctly on page refresh.

---

## 6. Flow.cl Payment Setup

### 6.1 Create Merchant Account

1. Register at [flow.cl](https://www.flow.cl)
2. Complete merchant verification (requires Chilean RUT and bank account)
3. Get your **API Key** and **Secret Key** from the merchant dashboard

### 6.2 Configure URLs

In Flow.cl merchant settings, configure:

| Setting | Value |
|---------|-------|
| Confirmation URL | `https://yourdomain.com/api/payment-confirm` |
| Return URL | `https://yourdomain.com/pago-exitoso` |

- **Confirmation URL** is called server-to-server by Flow when payment status changes
- **Return URL** is where the user is redirected after completing payment

### 6.3 Payment Types & Prices

The platform uses fixed server-side prices (defined in `/api/create-payment.js`):

| Type | Price (CLP) | Description |
|------|-------------|-------------|
| `destacar_7` | $2,990 | Feature listing for 7 days |
| `destacar_30` | $9,990 | Feature listing for 30 days |
| `destacar_90` | $19,990 | Feature listing for 90 days |
| `corredor_publicacion` | $14,990 | Single broker listing |
| `corredor_mensual` | $29,990 | Broker monthly (5 properties) |
| `corredor_ilimitado` | $59,990 | Broker unlimited monthly |

All prices include IVA (Chilean VAT).

---

## 7. Project Structure

```
rentu/
├── api/                          # Vercel serverless functions
│   ├── create-payment.js         # Creates Flow.cl payment
│   ├── payment-confirm.js        # Flow.cl payment webhook
│   ├── send-email.js             # Send emails via Resend
│   ├── send-notification.js      # Push notifications
│   ├── send-search-alerts.js     # Alert users on saved search matches
│   ├── verify-recaptcha.js       # reCAPTCHA verification
│   ├── expire-listings.js        # Cron: expire old listings
│   ├── delete-account.js         # Account deletion endpoint
│   ├── og.js                     # Open Graph image generation
│   └── og-property.js            # Per-property OG image
├── public/                       # Static assets (logos, sitemap, robots.txt)
├── src/
│   ├── components/               # Reusable UI components
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── PropertyCard.jsx
│   │   ├── AuthModal.jsx         # Login/signup modal
│   │   ├── ContractGenerator.jsx # PDF lease contract generator
│   │   ├── PropertyMap.jsx       # Leaflet map for property detail
│   │   ├── SearchMap.jsx         # Leaflet map for search results
│   │   ├── NotificationBell.jsx  # Realtime notifications
│   │   ├── ReviewSection.jsx     # User reviews/ratings
│   │   ├── PriceEstimator.jsx    # Market price estimator
│   │   ├── RentCalculator.jsx    # Rent affordability calculator
│   │   ├── CompareDrawer.jsx     # Side-by-side property compare
│   │   ├── Recommendations.jsx   # AI-style property suggestions
│   │   ├── CookieBanner.jsx
│   │   └── ...
│   ├── pages/                    # Route-level page components
│   │   ├── Home.jsx
│   │   ├── Search.jsx            # Property search with filters
│   │   ├── PropertyDetail.jsx
│   │   ├── PublishProperty.jsx   # Multi-step property listing form
│   │   ├── EditProperty.jsx
│   │   ├── MyProperties.jsx      # Landlord dashboard
│   │   ├── Favorites.jsx
│   │   ├── Admin.jsx             # Admin panel
│   │   ├── Pricing.jsx           # Plans & pricing page
│   │   ├── TenantProfile.jsx     # Renter profile builder
│   │   ├── Verification.jsx      # Identity verification
│   │   ├── Compare.jsx
│   │   ├── ComunaLanding.jsx     # SEO landing pages per neighborhood
│   │   ├── Terminos.jsx          # Terms of service
│   │   ├── Privacidad.jsx        # Privacy policy
│   │   └── ...
│   ├── hooks/                    # Custom React hooks
│   │   ├── useDarkMode.js
│   │   ├── useToast.js
│   │   ├── useRecentlyViewed.js
│   │   └── useScrollReveal.jsx
│   ├── lib/
│   │   └── supabase.js           # Supabase client + all DB operations
│   ├── data/
│   │   ├── comunas.js            # Chilean communes, property types, amenities
│   │   └── properties.js         # Seed/demo data
│   └── utils/                    # Utility functions
│       ├── geocode.js            # Address geocoding
│       ├── comunaCenters.js      # Lat/lng for Chilean communes
│       ├── googleMapsLink.js     # Parse Google Maps URLs
│       ├── imageCompressor.js    # Client-side image compression
│       ├── recaptcha.js          # reCAPTCHA helpers
│       └── ufConverter.js        # UF (Chilean unit) converter
├── vercel.json                   # Vercel config with SPA rewrites
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.js
```

---

## 8. Monetization

The platform has **3 revenue streams**:

### 1. Featured Listings (Primary)
Landlords pay to make their property appear first in search results with a "Featured" badge.

| Duration | Price |
|----------|-------|
| 7 days | $2,990 CLP |
| 30 days | $9,990 CLP |
| 90 days | $19,990 CLP |

### 2. Broker Plans
Professional property managers (corredores) pay to publish listings with enhanced features.

| Plan | Price |
|------|-------|
| Per listing | $14,990 CLP |
| Monthly (5 properties) | $29,990 CLP/month |
| Unlimited | $59,990 CLP/month |

### 3. Free Tier (Growth)
Individual landlords publish for free, driving platform adoption and creating inventory that attracts tenants. This free base makes the platform competitive against established players.

All prices include IVA. Payments are processed through Flow.cl (Chilean payment gateway supporting debit/credit cards).

---

## 9. Key Features

### For Tenants (Renters)
- Advanced property search with 15+ filters (type, price, rooms, commune, amenities, etc.)
- Interactive map search with Leaflet/OpenStreetMap
- Save favorite properties
- Save search criteria with email alerts for new matches
- Renter profile builder (occupation, income range, references)
- Identity verification system (Chilean cedula, RUT validation)
- Side-by-side property comparison tool
- Rent affordability calculator
- Market price estimator
- Recently viewed properties
- Smart property recommendations
- Moving checklist
- Safety tips for renters
- Dark mode

### For Landlords
- Free property listing with up to 10 photos + video
- Multi-step guided publishing form with map pin placement
- Google Maps link import for location
- Property management dashboard with analytics (views, contacts, favorites)
- PDF lease contract generator (Chilean legal format)
- Featured listing upgrades via Flow.cl payments
- Email notifications on new inquiries
- reCAPTCHA v3 spam protection

### For Admins
- Admin panel with platform statistics
- Manage all listings (activate/deactivate/feature/delete)
- View all payments and revenue
- Review reported properties
- Admin access controlled by email whitelist (`VITE_ADMIN_EMAILS`)

### Platform Features
- SEO-optimized with per-page meta tags (react-helmet-async)
- Per-commune landing pages for SEO
- Open Graph image generation for social sharing
- Sitemap.xml and robots.txt
- Cookie consent banner
- Legal pages (Terms of Service, Privacy Policy) compliant with Chilean law
- Responsive design (mobile-first)
- Dark mode across all components
- Google OAuth login
- Real-time notifications via Supabase Realtime
- Newsletter signup
- General contact form
- Branded mascot character

### Tech Stack
- **Frontend:** React 18 + Vite 5 + Tailwind CSS 3
- **Backend:** Supabase (PostgreSQL + Auth + Storage + Realtime)
- **Payments:** Flow.cl (Chilean gateway)
- **Email:** Resend
- **Maps:** Leaflet + OpenStreetMap
- **PDF:** jsPDF (contract generation)
- **Deploy:** Vercel (SPA + serverless functions)

---

## 10. Post-Setup Checklist

- [ ] All environment variables set in `.env` (local) and Vercel (production)
- [ ] Supabase tables created via SQL
- [ ] Storage buckets created (`property-photos`, `verification-docs`)
- [ ] Realtime enabled on `notifications` table
- [ ] Authentication redirect URLs configured
- [ ] Flow.cl confirmation/return URLs pointing to your domain
- [ ] Google reCAPTCHA v3 configured for your domain
- [ ] `VITE_ADMIN_EMAILS` set with at least one admin email
- [ ] `npm run build` compiles without errors
- [ ] Custom domain configured in Vercel (if applicable)
- [ ] Test a property listing end-to-end
- [ ] Test a payment flow end-to-end (use Flow.cl sandbox first)
