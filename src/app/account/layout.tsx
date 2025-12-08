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

type AccountLayoutProps = {
  children: ReactNode;
};

const accountNavItems = [
  { href: "/account/orders", label: "Meus pedidos" },
  // se quiser outras coisas depois: dados pessoais, endereços, etc
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-slate-500">Carregando sua conta...</p>
      </div>
    );
  }

  if (status === "blocked") return null;

  return (
    <div className="min-h-screen bg-rose-50/40">
      {/* Topo da conta */}
      <header className="border-b border-rose-100 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Minha conta
            </span>
            <span className="text-sm font-medium text-slate-800">
              Acompanhe seus pedidos com carinho
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session && (
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-700">
                  {session.name}
                </span>
                <span className="text-[11px] text-slate-500">
                  {session.email}
                </span>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="border-rose-200 text-xs text-rose-700 hover:bg-rose-50"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>

        {/* Navegação da conta */}
        <nav className="mx-auto max-w-6xl px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto py-1 text-xs">
            {accountNavItems.map((item) => (
              <button
                key={item.href}
                className={cn(
                  "rounded-full px-3 py-1",
                  pathname === item.href
                    ? "bg-rose-500 text-white"
                    : "bg-rose-50 text-rose-700 hover:bg-rose-100"
                )}
                onClick={() => router.push(item.href)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
