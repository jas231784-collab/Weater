# Weather & Currency Dashboard

Premium weather and currency exchange dashboard built with Next.js 14+, featuring Google OAuth authentication, subscription management via Stripe, and an admin panel.

## Features

- **Weather Dashboard**: Current weather and 5-7 day forecast via OpenWeatherMap API
- **Currency Exchange**: Live exchange rates from National Bank of Belarus (NBRB) with converter
- **Authentication**: Google OAuth via Supabase Auth
- **Subscriptions**: Stripe integration for premium tier
- **Admin Panel**: User management with search, pagination, and role-based access
- **Dark Mode**: Theme switching with next-themes
- **Responsive Design**: Tailwind CSS with shadcn/ui components

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL)
- Supabase Auth
- Stripe
- OpenWeatherMap API
- NBRB Currency API

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### 3. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to Settings → API to get your URL and anon key
3. Run this SQL in the SQL Editor to create the users table:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due')),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  is_blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users
CREATE POLICY "Users can read own data" ON users
  FOR SELECT USING (auth.uid()::text = id::text OR email = auth.jwt() ->> 'email');

-- Create policy for service role (for API routes)
CREATE POLICY "Service role full access" ON users
  FOR ALL USING (auth.role() = 'service_role');
```

4. Get your service role key from Settings → API for server-side operations

### 4. Supabase Auth — Redirect URLs

По [документации Supabase](https://supabase.com/docs/guides/auth/redirect-urls):

1. В **Supabase Dashboard** перейдите в **Authentication → URL Configuration**
2. **Site URL** — базовый URL приложения:
   - Локально: `http://localhost:3000`
   - Продакшн: `https://yourdomain.com`
3. **Redirect URLs** — разрешённые адреса после входа. Добавьте:
   - `http://localhost:3000/**` — для локальной разработки (wildcard `**` покрывает все пути)
   - `http://localhost:3000/auth/callback` — явно для callback
   - Для продакшена: `https://yourdomain.com/**`

### 5. Google OAuth (Supabase)

1. В **Supabase Dashboard** откройте **Authentication → Providers → Google**
2. Включите Google и укажите Client ID и Secret из [Google Cloud Console](https://console.cloud.google.com)
3. В Google Cloud Console добавьте **Authorized redirect URI**: `https://ibnuxabtzljibixqciqc.supabase.co/auth/v1/callback`

### 6. OpenWeatherMap API

1. Sign up at [openweathermap.org](https://openweathermap.org/api)
2. Get your free API key
3. Add to `.env.local`

### 7. Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Create two products (Monthly and Yearly subscription)
3. Get your Secret Key from Developers → API Keys
4. Add price IDs to `.env.local`
5. For webhooks locally, install Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
6. Copy the webhook signing secret to `STRIPE_WEBHOOK_SECRET`

### 8. Admin Users

Add comma-separated admin email addresses to `ADMIN_EMAILS`:
```
ADMIN_EMAILS=admin@example.com,your-email@gmail.com
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Deployment (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Add all environment variables
4. Update `NEXT_PUBLIC_APP_URL` to your production URL
5. Add production redirect URL to Supabase Auth (e.g. `https://yourdomain.com/auth/callback`)
6. Create a Stripe webhook endpoint for production and add the secret

## Project Structure

```
src/
├── app/
│   ├── api/           # API routes (auth, weather, currency, stripe, admin)
│   ├── dashboard/     # Protected dashboard pages
│   ├── admin/         # Admin panel (role-protected)
│   └── auth/          # Auth error pages
├── components/
│   ├── ui/            # shadcn/ui components
│   └── ...            # Feature components
├── hooks/             # Custom React hooks
├── lib/
│   ├── auth.ts        # Supabase Auth helpers
│   ├── supabase/      # Supabase clients
│   └── utils.ts       # Utility functions
└── types/             # TypeScript types
```

## Premium Features

- 7-day weather forecast (free: 5 days)
- Currency converter (free: rates table only)
- Priority support badge

## License

MIT
