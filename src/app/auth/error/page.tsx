import { auth } from '@/lib/auth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const errorMessage = params.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="max-w-lg w-full">
        <CardHeader>
          <CardTitle>Ошибка авторизации</CardTitle>
          <CardDescription>
            {errorMessage ? (
              <span className="text-destructive font-mono text-sm break-all">{errorMessage}</span>
            ) : (
              'Не удалось выполнить вход через Google'
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Убедитесь, что Google OAuth настроен в Supabase. См. инструкцию в файле{' '}
            <code className="bg-muted px-1 rounded">SUPABASE_GOOGLE_SETUP.md</code>
          </p>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Supabase → Authentication → Providers → Google: включён, указаны Client ID и Secret</li>
            <li>Google Cloud Console: Redirect URI = https://ibnuxabtzljibixqciqc.supabase.co/auth/v1/callback</li>
            <li>Supabase → URL Configuration: Site URL и Redirect URLs настроены</li>
          </ul>
          <div className="flex gap-3 pt-4">
            <Link href="/">
              <Button variant="outline">На главную</Button>
            </Link>
            <Link href="/auth/login">
              <Button>Повторить попытку</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
