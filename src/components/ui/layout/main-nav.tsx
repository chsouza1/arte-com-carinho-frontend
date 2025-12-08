"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Baby, Store, UserCircle2, ShoppingBag } from "lucide-react";
import type { AuthSession } from "@/lib/auth";
import {
  getAuthSession,
  clearAuthSession,
  isAdmin,
} from "@/lib/auth";
import { getCartCount } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/products", label: "Produtos" },
];

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setSession(getAuthSession());
  }, [pathname]);

  useEffect(() => {
    // atualiza badge da sacola quando a rota muda
    if (typeof window === "undefined") return;
    setCartCount(getCartCount());
  }, [pathname]);

  const handleLogout = () => {
    clearAuthSession();
    router.push("/");
  };

  return (
    <header className="border-b border-rose-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-100">
            <Baby className="h-5 w-5 text-rose-500" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold text-slate-900">
              Arte com Carinho
            </span>
            <span className="text-[11px] text-rose-500">
              Ateliê & enxoval bordado
            </span>
          </div>
        </Link>

        {/* Navegação grande */}
        <nav className="hidden items-center gap-3 text-xs text-slate-600 sm:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-1 transition-colors",
                pathname === item.href
                  ? "bg-rose-100 font-semibold text-rose-700"
                  : "text-slate-600 hover:bg-rose-50"
              )}
            >
              {item.label}
            </Link>
          ))}

          {/* Painel admin */}
          {isAdmin(session) && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "flex items-center gap-1 border-rose-200 text-[11px] text-rose-600 hover:bg-rose-50",
                pathname?.startsWith("/admin") &&
                  "bg-rose-100 font-semibold text-rose-700"
              )}
              onClick={() => router.push("/admin")}
            >
              <Store className="h-3 w-3" />
              Painel do Ateliê
            </Button>
          )}
        </nav>

        {/* Lado direito: sacola + usuário / login */}
        <div className="flex items-center gap-3">
          {/* Sacola */}
          <button
            className={cn(
              "relative flex h-8 w-8 items-center justify-center rounded-full border border-rose-100 bg-rose-50 hover:bg-rose-100",
              pathname === "/cart" && "ring-2 ring-rose-300"
            )}
            onClick={() => router.push("/cart")}
          >
            <ShoppingBag className="h-4 w-4 text-rose-600" />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          {session ? (
            <div className="flex items-center gap-2">
              <button
                className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[11px] text-slate-700"
                onClick={() => router.push("/account/orders")}
              >
                <UserCircle2 className="h-3 w-3 text-rose-500" />
                <span className="max-w-[120px] truncate">
                  {session.name}
                </span>
              </button>
              <Button
                size="sm"
                variant="outline"
                className="border-rose-200 text-[10px] text-rose-600 hover:bg-rose-50"
                onClick={handleLogout}
              >
                Sair
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              className="bg-rose-500 text-[11px] font-semibold text-white hover:bg-rose-600"
              onClick={() => router.push("/auth/login")}
            >
              Entrar
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
