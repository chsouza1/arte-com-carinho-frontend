"use client";

import { ReactNode, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { getAuthSession, isAdmin, AuthSession } from "@/lib/auth";
import { cn } from "@/lib/utils";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const s = getAuthSession();
    if (!s || !isAdmin(s)) {
      router.replace("/auth/login");
    } else {
      setSession(s);
      setReady(true);
    }
  }, [router]);

  if (!ready) {
    return null; // ou um skeleton bonitinho se quiser
  }

  const tabs = [
    { href: "/admin", label: "Visão geral" },
    { href: "/admin/products", label: "Produtos" },
    { href: "/admin/orders", label: "Pedidos" },
    { href: "/admin/reports", label: "Relatórios" }, // futura tela
  ];

  return (
    <div className="bg-gradient-to-br from-[#FFF7F2] to-[#FFE4DC]">
      {/* Barra de navegação do admin */}
      <div className="border-b border-rose-100 bg-white/90">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wide text-rose-500">
              Painel administrativo
            </span>
            <span className="text-sm text-slate-600">
              Olá, {session?.name}. Organize o ateliê com carinho.
            </span>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  "rounded-full px-3 py-1 font-medium transition",
                  pathname === tab.href
                    ? "bg-rose-500 text-white shadow-sm"
                    : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                )}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Conteúdo das páginas admin */}
      <div className="mx-auto min-h-[calc(100vh-140px)] max-w-6xl px-4 py-6">
        {children}
      </div>
    </div>
  );
}
