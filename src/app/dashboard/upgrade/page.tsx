import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import UpgradeClient from '@/components/upgrade-client';

export default async function UpgradePage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/login?callbackUrl=/dashboard/upgrade');
  }

  if (session.user?.subscription_status === 'premium') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Upgrade to Premium</h1>
          <p className="text-muted-foreground">
            Unlock all features and get the most out of WeatherFX
          </p>
        </div>
      </div>

      <UpgradeClient />
    </div>
  );
}
