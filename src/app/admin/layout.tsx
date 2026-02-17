"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { AuthSession } from "@/lib/auth";
import { getSession, isAdmin, clearAuthSession } from "@/lib/auth";
import { applyAuthFromStorage, setAuthToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { LogOut, Scissors } from "lucide-react";

type AdminLayoutProps = {
  children: ReactNode;
};

const adminNavItems = [
  { href: "/admin", label: "Visão Geral" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/production", label: "Produção" },
  { href: "/admin/stock", label: "Estoque" },
  { href: "/admin/customers", label: "Clientes" },
  { href: "/admin/reports", label: "Relatórios" },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

  useEffect(() => {
    applyAuthFromStorage();
    const s = getSession();

    if (!s) {
      setStatus("blocked");
      router.replace(`/auth/login?from=${encodeURIComponent(pathname || "/admin")}`);
      return;
    }
  
    if (!isAdmin(s)) {
      setStatus("blocked");
      router.replace(`/auth/login?from=${encodeURIComponent(pathname || "/admin")}`);
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

  if (status === "checking" || status === "blocked") return null;

  return (
    // Fundo Creme (Mesa de Trabalho)
    <div className="min-h-screen bg-[#FAF7F5] font-sans text-[#5D4037]">
      
      {/* Header Estilo Papelaria */}
      <header className="bg-white border-b-2 border-dashed border-[#D7CCC8] sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          
          {/* Logo / Título */}
          <div className="flex items-center gap-3">
            <div className="bg-[#FAF7F5] p-2 rounded-full border border-[#D7CCC8]">
                <Scissors className="h-5 w-5 text-[#E53935]" />
            </div>
            <div className="flex flex-col">
                <span className="text-lg font-serif font-bold text-[#5D4037] leading-none">
                Painel do Ateliê
                </span>
                <span className="text-[10px] uppercase tracking-widest text-[#8D6E63] font-bold">
                Arte com Carinho
                </span>
            </div>
          </div>

          {/* Usuário e Logout */}
          <div className="flex items-center gap-4">
            {session && (
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-bold text-[#5D4037]">
                  {session.name}
                </span>
                <span className="text-[10px] text-[#E53935] font-bold uppercase tracking-wider bg-[#FFEBEE] px-2 py-0.5 rounded-sm">
                  {String(session.role)}
                </span>
              </div>
            )}

            <Button
              size="sm"
              variant="outline"
              className="h-8 border-[#D7CCC8] text-[#8D6E63] hover:text-[#E53935] hover:bg-[#FAF7F5] uppercase text-[10px] font-bold tracking-widest rounded-sm"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-3 w-3" /> Sair
            </Button>
          </div>
        </div>

        {/* Navegação (Tabs / Pastas) */}
        <nav className="mx-auto max-w-7xl px-6">
          <div className="flex gap-1 overflow-x-auto pt-2 scrollbar-hide">
            {adminNavItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));
                return (
                <button
                    key={item.href}
                    className={cn(
                    "px-5 py-2.5 text-xs font-bold uppercase tracking-wide rounded-t-lg border-t-2 border-x-2 transition-all relative top-[2px]",
                    isActive
                        ? "bg-[#FAF7F5] border-[#D7CCC8] text-[#E53935] z-10 border-b-[#FAF7F5]"
                        : "bg-white text-[#8D6E63] border-transparent hover:bg-[#F5F5F5]"
                    )}
                    onClick={() => router.push(item.href)}
                >
                    {item.label}
                </button>
                );
            })}
          </div>
        </nav>
      </header>

      {/* Conteúdo Principal (Folha de Papel) */}
      <main className="mx-auto max-w-7xl p-6 md:p-8">
        {children}
      </main>
    </div>
  );
}