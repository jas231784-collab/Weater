import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Header } from '@/components/header';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect('/auth/login?callbackUrl=/admin');
  }

  if (session.user?.role !== 'admin') {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-6">{children}</main>
    </div>
  );
}
