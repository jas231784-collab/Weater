"use client";

import Link from "next/link";
import { useSession } from "@/hooks/use-session";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, User, Shield, Crown } from "lucide-react";

export function Header() {
  const { data: session, status, signOut } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            WeatherFX
          </span>
        </Link>

        <nav className="flex items-center space-x-4">
          {status === "loading" ? (
            <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
          ) : session ? (
            <>
              {session.user?.role === "admin" && (
                <Link href="/admin">
                  <Button variant="ghost" size="sm">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin
                  </Button>
                </Link>
              )}
              
              {session.user?.subscription_status === "premium" && (
                <Badge variant="premium" className="mr-2">
                  <Crown className="h-3 w-3 mr-1" />
                  Premium
                </Badge>
              )}

              <div className="flex items-center space-x-2 text-sm">
                {session.user?.image ? (
                  <img
                    src={session.user.image}
                    alt={session.user.name || "User"}
                    className="h-8 w-8 rounded-full"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <span className="hidden md:inline-block max-w-[100px] truncate">
                  {session.user?.name || session.user?.email}
                </span>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Link href="/auth/login">
              <Button size="sm">
                Войти
              </Button>
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
