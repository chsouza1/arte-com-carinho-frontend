"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ShoppingBag, Scissors } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAuthSession, clearAuthSession, isAdmin, AuthSession } from "@/lib/auth";
import { setAuthToken } from "@/lib/api";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<AuthSession | null>(null);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && pathname?.startsWith(href));

  useEffect(() => {
    const s = getAuthSession();
    setSession(s);
    if (s?.token) {
      setAuthToken(s.token);
    }
  }, []);

  function handleLogout() {
    clearAuthSession();
    setAuthToken(null);
    setSession(null);
    router.push("/");
  }

  const initials = session?.name
    ? session.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "";

  return (
    <header className="border-b border-rose-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100">
            <Scissors className="h-5 w-5 text-rose-500" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold tracking-wide text-rose-600">
              Arte com Carinho
            </span>
            <span className="text-xs text-slate-500">
              Bordados & enxoval de bebê
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 sm:flex">
          <Link
            href="/"
            className={cn(
              "transition hover:text-rose-600",
              isActive("/") && "text-rose-600"
            )}
          >
            Início
          </Link>
          <Link
            href="/products"
            className={cn(
              "transition hover:text-rose-600",
              isActive("/products") && "text-rose-600"
            )}
          >
            Produtos
          </Link>
          {session && (
            <Link
              href="/account/orders"
              className={cn(
                "transition hover:text-rose-600",
                isActive("/account") && "text-rose-600"
              )}
            >
              Meus pedidos
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-rose-50 text-rose-500 hover:bg-rose-100"
          >
            <ShoppingBag className="h-5 w-5" />
          </Link>

          {/* Se não estiver logado → botão Entrar */}
          {!session && (
            <Link href="/auth/login">
              <button className="inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-600">
                <span>Entrar</span>
              </button>
            </Link>
          )}

          {/* Se estiver logado → bolinha com iniciais + menu simples */}
          {session && (
            <div className="flex items-center gap-2">
              {isAdmin(session) && (
                <button
                  onClick={() => router.push("/admin")}
                  className="hidden rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-600 hover:bg-rose-100 sm:inline-flex"
                >
                  Painel admin
                </button>
              )}

              <div className="flex items-center gap-2 rounded-full border border-rose-100 bg-rose-50 px-2 py-1">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                  {initials}
                </div>
                <div className="hidden flex-col leading-tight sm:flex">
                  <span className="text-[11px] font-semibold text-slate-800">
                    {session.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-[10px] text-rose-500 hover:underline"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
