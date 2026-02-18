import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Providers } from '@/components/providers';
import { Header } from '@/components/header';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login?callbackUrl=/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">{children}</main>
    </div>
  );
}
