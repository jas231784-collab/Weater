# Настройка Google OAuth через Supabase

По [документации Supabase](https://supabase.com/docs/guides/auth/social-login/auth-google).

## Шаг 1: Google Cloud Console

1. Откройте [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте проект или выберите существующий
3. Перейдите в **APIs & Services** → **Credentials**
4. Нажмите **Create Credentials** → **OAuth client ID**
5. Выберите тип **Web application**
6. Укажите:
   - **Authorized JavaScript origins:** `http://localhost:3000`
   - **Authorized redirect URIs:** `https://ibnuxabtzljibixqciqc.supabase.co/auth/v1/callback`
7. Сохраните и скопируйте **Client ID** и **Client Secret**

## Шаг 2: Supabase Dashboard

1. Откройте [Supabase Dashboard](https://supabase.com/dashboard) → ваш проект
2. **Authentication** → **Providers** → **Google**
3. Включите провайдер ( toggle **Enabled** )
4. Вставьте **Client ID** и **Client Secret** из Google
5. Нажмите **Save**

## Шаг 3: URL Configuration в Supabase

1. **Authentication** → **URL Configuration**
2. **Site URL:** `http://localhost:3000`
3. **Redirect URLs** — добавьте:
   - `http://localhost:3000/**`
   - `http://localhost:3000/auth/callback`

## Проверка

После настройки при нажатии «Sign in with Google» вы должны перейти на страницу Google, затем вернуться в приложение.
