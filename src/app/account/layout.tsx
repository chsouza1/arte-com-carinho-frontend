// src/app/account/layout.tsx
"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { AuthSession } from "@/lib/auth";
import { getSession, clearAuthSession } from "@/lib/auth";
import { applyAuthFromStorage, setAuthToken } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { UserCircle2, LogOut, Heart, Sparkles, ShoppingBag } from "lucide-react";

type AccountLayoutProps = {
  children: ReactNode;
};

const accountNavItems = [
  { href: "/account/orders", label: "Meus pedidos", icon: ShoppingBag },
];

export default function AccountLayout({ children }: AccountLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">(
    "checking"
  );

  useEffect(() => {
    applyAuthFromStorage();
    const s = getSession();
    if (!s) {
      setStatus("blocked");
      const from = pathname || "/account/orders";
      router.replace(`/auth/login?from=${encodeURIComponent(from)}`);
      return;
    }
    setSession(s);
    setStatus("allowed");
  }, [router, pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setAuthToken(null);
    router.push("/");
  };

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent mb-4"></div>
          <p className="text-sm font-semibold text-slate-600">
            Carregando sua conta...
          </p>
        </div>
      </div>
    );
  }

  if (status === "blocked") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* Header da conta */}
      <header className="sticky top-0 z-40 border-b-2 border-rose-200/50 bg-white/80 backdrop-blur-xl shadow-lg shadow-rose-100/20">
        <div className="mx-auto max-w-7xl px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between py-5 border-b-2 border-rose-100">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
                <UserCircle2 size={28} className="text-rose-600" />
              </div>
              <div className="flex flex-col">
                <span className="inline-flex items-center gap-2 text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                  <Heart className="h-4 w-4 text-rose-500" />
                  Minha Conta
                </span>
                <span className="text-sm font-medium text-slate-600 mt-0.5">
                  Acompanhe seus pedidos com carinho
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {session && (
                <div className="hidden md:flex items-center gap-3 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 px-4 py-2.5 shadow-md">
                  <div className="rounded-full bg-white p-1.5 shadow-sm">
                    <UserCircle2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-800 max-w-[180px] truncate">
                      {session.name}
                    </div>
                    <div className="text-xs text-slate-600 max-w-[180px] truncate">
                      {session.email}
                    </div>
                  </div>
                </div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="h-10 rounded-2xl border-2 border-rose-200 px-4 text-sm font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-all"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </div>

          {/* Navegação */}
          <nav className="py-4">
            <div className="flex gap-3 overflow-x-auto">
              {accountNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <button
                    key={item.href}
                    className={cn(
                      "flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-bold transition-all whitespace-nowrap",
                      isActive
                        ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 scale-105"
                        : "bg-white border-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300 hover:scale-105"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {children}
      </main>

      {/* Footer interno (opcional) */}
      <footer className="mx-auto max-w-7xl px-6 py-6">
        <div className="rounded-3xl bg-white/80 backdrop-blur-sm border-2 border-rose-200 p-6 shadow-lg">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 p-2 shadow-sm">
                <Sparkles className="h-5 w-5 text-rose-600" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-800">
                  Precisa de ajuda?
                </p>
                <p className="text-xs text-slate-600">
                  Entre em contato conosco pelo WhatsApp
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-2xl border-2 border-emerald-200 px-5 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
              onClick={() => window.open('https://wa.me/5549999999999', '_blank')}
            >
              <Heart className="mr-2 h-4 w-4" />
              Falar com o ateliê
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}