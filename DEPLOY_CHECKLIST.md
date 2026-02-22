# Чек-лист деплоя (Vercel + Supabase)

**URL проекта:** https://weater-eta.vercel.app

Шаг 3 (Google OAuth в Supabase) уже сделан. GOOGLE_CLIENT_ID и GOOGLE_CLIENT_SECRET в Vercel не нужны — они задаются только в Supabase (Providers → Google).

---

## Шаг 1: Переменные окружения в Vercel

1. Открой [Vercel](https://vercel.com) → проект **Weater** → **Settings** → **Environment Variables**.
2. Добавь переменные (для **Production**):

| Name | Значение / где взять |
|------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → [Settings → API](https://supabase.com/dashboard/project/_/settings/api) → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Там же → anon public |
| `SUPABASE_SERVICE_ROLE_KEY` | Там же → service_role key |
| **`NEXT_PUBLIC_SITE_URL`** | **Обязательно:** `https://weater-eta.vercel.app` — без этого возврат после входа через Google сломается |
| **`WEATHERAPI_API_KEY`** | **Для погоды и прогноза:** ключ с [weatherapi.com](https://www.weatherapi.com/) (Sign Up → API Key). Без него запросы к `/api/weather` и `/api/weather/cities` возвращают 500 |
| `ADMIN_EMAILS` | Твой email, например `admin@example.com` |

3. Сохрани и сделай **Redeploy** (Deployments → … → Redeploy).

---

## Шаг 2: Supabase → URL Configuration (обязательно для входа через Google)

Если после входа через Google просто возвращает на страницу входа — почти всегда не совпадает URL в Supabase.

1. Открой [Supabase Dashboard](https://supabase.com/dashboard) → свой проект.
2. **Authentication** → **URL Configuration**.
3. Укажи **ровно** так:

**Site URL:**
```
https://weater-eta.vercel.app
```

**Redirect URLs** — в списке должны быть (добавь, если нет):
```
https://weater-eta.vercel.app/**
https://weater-eta.vercel.app/auth/callback
```

4. **Save**.

---

## Если «Войти через Google» возвращает на страницу входа

- В **Vercel** есть переменная **`NEXT_PUBLIC_SITE_URL`** = `https://weater-eta.vercel.app` (без слэша в конце). Без неё приложение подставляет другой URL для возврата после логина.
- В **Supabase** → **Authentication** → **URL Configuration** в **Redirect URLs** обязательно есть строка `https://weater-eta.vercel.app/auth/callback`. Иначе Supabase не разрешит редирект на твой сайт после Google и сессия не сохранится.
- После смены переменных в Vercel — сделай **Redeploy**. После смены URL в Supabase — просто сохрани, перезапуск не нужен.
