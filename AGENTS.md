# AGENTS.md

Guide for AI agents working in this codebase.

## Project Overview

Premium weather and currency exchange dashboard built with Next.js 16 (App Router), featuring:
- Google OAuth authentication via NextAuth.js v5
- Stripe subscription management
- Supabase (PostgreSQL) database
- OpenWeatherMap API for weather data
- NBRB API for currency exchange rates
- shadcn/ui components with Tailwind CSS

## Essential Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Environment Setup

Required environment variables (see `.env.example`):
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase credentials
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
- `OPENWEATHERMAP_API_KEY` - Weather API key
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Stripe credentials
- `ADMIN_EMAILS` - Comma-separated admin email addresses

For local Stripe webhooks:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes (auth, weather, currency, stripe, admin)
│   │   ├── auth/[...nextauth]/route.ts  # NextAuth handler
│   │   ├── weather/route.ts             # Weather API proxy
│   │   ├── currency/route.ts            # Currency rates API
│   │   ├── stripe/checkout/route.ts     # Stripe checkout
│   │   ├── webhooks/stripe/route.ts     # Stripe webhooks
│   │   └── admin/users/route.ts         # Admin user management
│   ├── dashboard/        # Protected dashboard pages
│   ├── admin/            # Admin panel (role-protected)
│   ├── auth/error/       # Auth error pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui components (button, card, dialog, etc.)
│   ├── header.tsx        # App header with navigation
│   ├── providers.tsx     # Session & theme providers
│   └── *.tsx             # Feature components
├── hooks/
│   ├── use-weather.ts    # Weather data fetching hook
│   └── use-currency.ts   # Currency rates fetching hook
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── utils.ts          # Utility functions (cn helper)
│   └── supabase/
│       ├── client.ts     # Browser Supabase client
│       └── server.ts     # Server Supabase client
└── types/
    ├── index.ts          # App types (WeatherData, User, etc.)
    ├── database.ts       # Supabase database types
    └── next-auth.d.ts    # NextAuth type extensions
```

## Code Conventions

### Path Aliases
- `@/*` maps to `./src/*`
- Example: `import { Button } from '@/components/ui/button'`

### Server vs Client Components
- Components are Server Components by default
- Add `"use client"` at the top for client components (hooks, event handlers, browser APIs)
- Pages using `useSession` or interactive features need `"use client"`

### Authentication Pattern
```tsx
// Server Component - check session
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  if (!session) redirect('/api/auth/signin');
  // ...
}

// Client Component - use session hook
import { useSession } from 'next-auth/react';

export default function ClientPage() {
  const { data: session } = useSession();
  // ...
}
```

### Supabase Pattern
```tsx
// Server-side (API routes, Server Components)
import { createClient } from '@/lib/supabase/server';

const supabase = await createClient();
const { data, error } = await supabase.from('users').select('*');
```

### API Routes
- Use `NextRequest` and `NextResponse` from 'next/server'
- Always check authentication for protected routes
- Return JSON errors with appropriate status codes

```tsx
export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ...
}
```

### Custom Hooks Pattern
- Return object with data, loading, error states
- Use `useCallback` for stable function references
- Handle errors with try/catch and update state

```tsx
export function useFeature() {
  const [state, setState] = useState({ data: null, loading: false, error: null });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const res = await fetch('/api/endpoint');
      const data = await res.json();
      setState({ data, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error.message });
    }
  }, []);

  return { ...state, fetchData };
}
```

### UI Components
- shadcn/ui components in `src/components/ui/`
- Use `cn()` utility for conditional class merging
- Components use Radix UI primitives with Tailwind styling

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  image TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_status TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  blocked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
);
```

## Key Gotchas

1. **NextAuth v5 Beta**: Uses new `NextAuth()` pattern with `handlers`, `signIn`, `signOut`, `auth` exports - not the older `NextAuth()` function call pattern.

2. **Session Type Extension**: NextAuth types are extended in `src/types/next-auth.d.ts` to include custom user properties (`id`, `subscription_status`, `role`).

3. **Admin Authorization**: Admin access is email-based via `ADMIN_EMAILS` environment variable, not database-driven.

4. **Stripe Webhooks**: Must be forwarded locally using Stripe CLI for development testing.

5. **Supabase SSR**: Uses `@supabase/ssr` package with cookie-based auth. The server client handles cookie setting in a try/catch to ignore errors from Server Components.

6. **Premium Features**: Controlled by `subscription_status` field - check `session?.user?.subscription_status === 'premium'`.

7. **Weather API**: Forecast data is processed from 3-hour intervals to daily summaries in `processForecastToDaily()`.

8. **Currency API**: Uses National Bank of Belarus (NBRB) API - rates are daily official rates.
