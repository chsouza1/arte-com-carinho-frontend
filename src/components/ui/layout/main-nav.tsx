"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Store, UserCircle2, ShoppingBag, Menu, X, LogOut, Heart, Sparkles } from "lucide-react";

import type { AuthSession } from "@/lib/auth";
import { getAuthSession, clearAuthSession, isAdmin } from "@/lib/auth";
import { useCartStore } from "@/lib/cart"; 
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/products", label: "Produtos" },
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();

  const cartCount = useCartStore((state) => state.getTotalItems());

  const [session, setSession] = useState<AuthSession | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const admin = useMemo(() => isAdmin(session), [session]);

  useEffect(() => {
    setSession(getAuthSession());
  }, [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    setSession(null);
    setMobileOpen(false);
    router.push("/");
    router.refresh();
  };

  const go = (href: string) => {
    setMobileOpen(false);
    router.push(href);
  };

  return (
    <header className="sticky top-0 z-50 border-b-2 border-rose-200/50 bg-white/80 backdrop-blur-xl shadow-lg shadow-rose-100/20">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-md opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <Image
              src="/logo.jpg"
              alt="Arte com Carinho"
              width={48}
              height={48}
              className="relative rounded-full ring-4 ring-white shadow-lg group-hover:scale-105 transition-transform"
              priority
            />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500">
              Arte com Carinho
            </span>
            <span className="text-xs font-semibold text-rose-500 flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Ateliê & enxoval bordado
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-3 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-2xl px-5 py-2.5 text-sm font-bold transition-all",
                  active
                    ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30"
                    : "text-slate-700 hover:bg-rose-50 border-2 border-transparent hover:border-rose-200"
                )}
              >
                {item.label}
              </Link>
            );
          })}

          {admin && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "ml-2 h-10 rounded-2xl border-2 border-purple-200 text-sm font-bold text-purple-700 hover:bg-purple-50 transition-all",
                pathname?.startsWith("/admin") && "bg-gradient-to-r from-purple-100 to-violet-100 border-purple-300"
              )}
              onClick={() => router.push("/admin")}
            >
              <Store className="mr-2 h-4 w-4" />
              Painel do Ateliê
            </Button>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {/* Cart */}
          <button
            className={cn(
              "relative flex h-11 w-11 items-center justify-center rounded-2xl border-2 bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200 hover:from-rose-100 hover:to-pink-100 transition-all shadow-md hover:shadow-lg hover:scale-105 active:scale-95",
              pathname === "/cart" && "ring-2 ring-rose-400 bg-gradient-to-br from-rose-100 to-pink-100"
            )}
            onClick={() => router.push("/cart")}
            aria-label="Carrinho"
          >
            <ShoppingBag className="h-5 w-5 text-rose-700" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-1.5 text-[10px] font-black text-white shadow-lg shadow-rose-500/40 animate-pulse">
                {cartCount}
              </span>
            )}
          </button>

          {/* Desktop user */}
          <div className="hidden lg:flex items-center gap-3">
            {session ? (
              <>
                <button
                  className="flex items-center gap-2 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 px-4 py-2.5 text-sm font-bold text-slate-800 hover:from-blue-100 hover:to-sky-100 transition-all shadow-md hover:shadow-lg"
                  onClick={() => router.push("/account/orders")}
                >
                  <UserCircle2 className="h-5 w-5 text-blue-600" />
                  <span className="max-w-[140px] truncate">{session.name}</span>
                </button>

                <Button
                  size="sm"
                  variant="outline"
                  className="h-10 rounded-2xl border-2 border-rose-200 text-sm font-bold text-rose-700 hover:bg-rose-50 transition-all"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="h-10 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
                onClick={() => router.push("/auth/login")}
              >
                Entrar
              </Button>
            )}
          </div>

          {/* Mobile menu */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="flex h-11 w-11 items-center justify-center rounded-2xl border-2 border-rose-200 bg-white hover:bg-rose-50 transition-all shadow-md"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-6 w-6 text-rose-700" />
                </button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[340px] bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 border-l-4 border-rose-300">
                {/* Header do menu mobile */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-rose-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-rose-400 to-pink-400 rounded-full blur-md opacity-40"></div>
                      <Image
                        src="/logo.jpg"
                        alt="Arte com Carinho"
                        width={48}
                        height={48}
                        className="relative rounded-full ring-4 ring-white shadow-lg"
                      />
                    </div>
                    <div className="leading-tight">
                      <div className="text-sm font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                        Arte com Carinho
                      </div>
                      <div className="text-xs font-semibold text-rose-500 flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        Ateliê & enxoval
                      </div>
                    </div>
                  </div>

                  <button
                    className="rounded-full p-2 hover:bg-rose-100 transition-colors"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Fechar"
                  >
                    <X className="h-6 w-6 text-rose-700" />
                  </button>
                </div>

                {/* Links de navegação */}
                <div className="space-y-3 mb-6">
                  {navItems.map((item) => {
                    const active = pathname === item.href;
                    return (
                      <button
                        key={item.href}
                        onClick={() => go(item.href)}
                        className={cn(
                          "w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition-all border-2 shadow-md",
                          active
                            ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white border-transparent shadow-lg shadow-rose-500/30"
                            : "bg-white/90 text-slate-700 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                        )}
                      >
                        {item.label}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => go("/cart")}
                    className="w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition-all border-2 border-rose-200 bg-white/90 hover:bg-rose-50 hover:border-rose-300 shadow-md flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <ShoppingBag className="h-4 w-4 text-rose-600" />
                      Carrinho
                    </span>
                    {cartCount > 0 && (
                      <span className="flex h-6 min-w-[24px] items-center justify-center rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-2 text-xs font-black text-white shadow-lg">
                        {cartCount}
                      </span>
                    )}
                  </button>

                  {admin && (
                    <button
                      onClick={() => go("/admin")}
                      className={cn(
                        "w-full rounded-2xl px-5 py-4 text-left text-sm font-bold transition-all border-2 shadow-md flex items-center gap-2",
                        pathname?.startsWith("/admin")
                          ? "bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 border-purple-300"
                          : "bg-white/90 text-slate-700 border-rose-200 hover:bg-purple-50 hover:border-purple-300"
                      )}
                    >
                      <Store className="h-4 w-4" />
                      Painel do Ateliê
                    </button>
                  )}
                </div>

                {/* Card do usuário */}
                <div className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm p-5 shadow-xl">
                  {session ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b-2 border-rose-100">
                        <div className="rounded-full bg-gradient-to-br from-blue-100 to-sky-100 p-2">
                          <UserCircle2 className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-slate-900 truncate">
                            {session.name}
                          </div>
                          <div className="text-xs text-slate-500 truncate">
                            {session.email}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        className="w-full h-11 rounded-2xl border-2 border-blue-200 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-all"
                        onClick={() => go("/account/orders")}
                      >
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Meus pedidos
                      </Button>

                      <Button
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30"
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 pb-4 border-b-2 border-rose-100">
                        <Sparkles className="h-5 w-5 text-rose-500" />
                        <div className="text-sm font-semibold text-slate-700">
                          Entre para acompanhar seus pedidos
                        </div>
                      </div>
                      <Button
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30"
                        onClick={() => go("/auth/login")}
                      >
                        Entrar
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}