# Настройка Supabase и Google OAuth

## Обязательно: URL и ключ Supabase

Для работы клиента Supabase нужны **Project URL** и **anon key** (или Publishable key).  
Без них появится ошибка: *"Your project's URL and Key are required to create a Supabase client!"*

Где взять: [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект → **Settings** → **API**  
- **Project URL** → в `.env`: `NEXT_PUBLIC_SUPABASE_URL`  
- **anon public** (или Publishable key) → в `.env`: `NEXT_PUBLIC_SUPABASE_ANON_KEY` или `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY`

Ссылка: https://supabase.com/dashboard/project/_/settings/api

---

## Настройка Google OAuth

По [документации Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google).

### Шаг 1: Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth client ID**
5. Выберите тип **Web application**
6. Укажите:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `https://ibnuxabtzljibixqciqc.supabase.co/auth/v1/callback`
7. Сохраните и скопируйте **Client ID** и **Client Secret**

### Шаг 2: Supabase — провайдер Google

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект
2. **Authentication** → **Providers** → **Google**
3. Включите провайдер (**Enabled**)
4. Вставьте **Client ID** и **Client Secret** из Google Cloud Console
5. Нажмите **Save**

### Шаг 3: Supabase — URL Configuration (обязательно)

Без правильных URL авторизация не сработает. Настройте **Site URL** и **Redirect URLs**.

1. В Supabase: **Authentication** → **URL Configuration**
2. **Site URL** — основной адрес приложения:
   - локально: `http://localhost:3000`
   - прод (Vercel): `https://your-app.vercel.app` или ваш домен
3. **Redirect URLs** — разрешённые адреса возврата после входа. Добавьте (подставьте свой домен для продакшена):
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`
   - для Vercel: `https://your-app.vercel.app/**` и `https://your-app.vercel.app/auth/callback`

Итог: **Site URL** и **Redirect URLs** должны соответствовать тому, где крутится приложение (localhost или Vercel).

## Проверка

После настройки при нажатии «Sign in with Google» вы должны перейти на страницу Google, затем вернуться в приложение.
