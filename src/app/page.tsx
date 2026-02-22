import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Crown, Check, Zap, Bell, Map, MapPin } from 'lucide-react';

export default async function HomePage() {
  const session = await auth();
  
  if (session) {
    redirect('/dashboard');
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="container py-8 md:py-12">
        <nav className="flex items-center justify-between mb-16">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            WeatherFX
          </span>
          <div className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Войти</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Регистрация</Button>
            </Link>
          </div>
        </nav>

        <section className="text-center space-y-6 py-12">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Погода и курсы валют
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              НБРБ
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Актуальная погода и официальные курсы валют Национального банка Республики Беларусь в одном месте.
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/auth/register">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600">
                Начать бесплатно
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline">
                Подробнее
              </Button>
            </Link>
          </div>
        </section>

        <section id="features" className="py-12 space-y-8">
          <h2 className="text-3xl font-bold text-center">Возможности</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <Zap className="h-10 w-10 text-yellow-500 mb-2" />
                <CardTitle>Погода онлайн</CardTitle>
                <CardDescription>
                  Текущая погода и прогноз по городам мира
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <MapPin className="h-10 w-10 text-blue-500 mb-2" />
                <CardTitle>Курсы валют НБРБ</CardTitle>
                <CardDescription>
                  Официальные курсы Национального банка Беларуси
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <Bell className="h-10 w-10 text-green-500 mb-2" />
                <CardTitle>Премиум</CardTitle>
                <CardDescription>
                  Расширенный прогноз, без рекламы и другие преимущества
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        <section className="py-12 space-y-8">
          <h2 className="text-3xl font-bold text-center">Тарифы</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Бесплатно</CardTitle>
                <CardDescription>Базовые возможности</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">0 ₽<span className="text-lg text-muted-foreground">/мес</span></div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Текущая погода</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Прогноз на 5 дней</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Курсы валют НБРБ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Конвертер валют</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block mt-6">
                  <Button className="w-full" variant="outline">
                    Начать
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="border-yellow-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="h-3 w-3" />
                  Премиум
                </span>
              </div>
              <CardHeader>
                <CardTitle>Премиум</CardTitle>
                <CardDescription>Все возможности без ограничений</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold mb-6">$9.99<span className="text-lg text-muted-foreground">/мес</span></div>
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Всё из тарифа «Бесплатно»</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Прогноз на 7 дней</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Несколько городов</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Приоритетная поддержка</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-5 w-5 text-green-500" />
                    <span>Без рекламы</span>
                  </li>
                </ul>
                <Link href="/auth/register" className="block mt-6">
                  <Button className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
                    Подключить
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </main>
  );
}
