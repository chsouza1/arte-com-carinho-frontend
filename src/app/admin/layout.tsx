// src/app/admin/layout.tsx
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { AuthSession } from "@/lib/auth";
import {
  getSession,
  isAdmin,
  clearAuthSession,
} from "@/lib/auth";
import { applyAuthFromStorage, setAuthToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AdminLayoutProps = {
  children: ReactNode;
};

const adminNavItems = [
  { href: "/admin", label: "Visão geral" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/reports", label: "Relatórios" },
  { href: "/admin/stock", label: "Estoque" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">(
    "checking"
  );

  useEffect(() => {
    // aplica token com base no storage
    applyAuthFromStorage();

    const s = getSession();
    console.log("[ADMIN LAYOUT] sessão lida:", s);


    if (!s) {
      setStatus("blocked");
      const from = pathname || "/admin";
      router.replace(`/auth/login?from=${encodeURIComponent(from)}`);
      return;
    }

  
    if (!isAdmin(s)) {
      console.warn("[ADMIN LAYOUT] sessão não admin/employee, role=", s.role);
      setStatus("blocked");
      const from = pathname || "/admin";
      router.replace(`/auth/login?from=${encodeURIComponent(from)}`);
      return;
    }

    // sessão válida
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
        <p className="text-sm text-slate-500">
          Carregando painel do ateliê...
        </p>
      </div>
    );
  }

  if (status === "blocked") {
    // já está redirecionando pro login
    return null;
  }

  // se chegou aqui, TEM sessão e é admin/employee
  return (
    <div className="min-h-screen bg-rose-50/40">
      {/* Topo */}
      <header className="border-b border-rose-100 bg-white/90">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Painel do ateliê
            </span>
            <span className="text-sm font-medium text-slate-800">
              Arte com Carinho — gestão de pedidos e estoque
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session && (
              <div className="flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-700">
                  {session.name}
                </span>
                <span className="text-[11px] uppercase tracking-wide text-rose-500">
                  {String(session.role)}
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

        {/* Navegação interna */}
        <nav className="mx-auto max-w-6xl px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto py-1 text-xs">
            {adminNavItems.map((item) => (
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

      {/* Conteúdo */}
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}
