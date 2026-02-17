"use client";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getSession, clearAuthSession, type AuthSession } from "@/lib/auth";
import { applyAuthFromStorage, setAuthToken } from "@/lib/api";
import { cn } from "@/lib/utils";
import { 
  UserCircle2, LogOut, Heart, Sparkles, ShoppingBag, MapPin, UserCog,
  Scissors, MessageCircle 
} from "lucide-react";

type AccountLayoutProps = {
  children: ReactNode;
};

const accountNavItems = [
  { href: "/account/orders", label: "Meus Pedidos", icon: ShoppingBag },
  { href: "/account/profile", label: "Meus Dados", icon: UserCog },
  { href: "/account/addresses", label: "Endereços", icon: MapPin },
];

export default function AccountLayout({ children }: AccountLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<"checking" | "allowed" | "blocked">("checking");

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
      <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#D7CCC8] border-r-[#E53935] mb-4"></div>
          <p className="text-sm font-bold text-[#8D6E63] uppercase tracking-widest">
            Abrindo seu ateliê...
          </p>
        </div>
      </div>
    );
  }

  if (status === "blocked") return null;

  return (
    // FUNDO CREME
    <div className="min-h-screen bg-[#FAF7F5] font-sans text-[#5D4037]">
      
      {/* HEADER DA CONTA */}
      <header className="sticky top-0 z-40 bg-[#FAF7F5]/90 backdrop-blur-md border-b-2 border-dashed border-[#D7CCC8]">
        <div className="mx-auto max-w-6xl px-6">
          
          {/* Top bar */}
          <div className="flex flex-col md:flex-row items-center justify-between py-6 gap-4">
            
            {/* Título / Boas-vindas */}
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full border border-[#D7CCC8] bg-white p-2 shadow-sm flex items-center justify-center">
                <Scissors size={24} className="text-[#E53935]" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl font-bold text-[#5D4037]">
                  Minha Conta
                </span>
                <span className="text-xs font-medium text-[#8D6E63] flex items-center gap-1">
                  <Heart className="h-3 w-3 text-[#E53935] fill-current" />
                  Bem-vindo(a) ao seu espaço
                </span>
              </div>
            </div>

            {/* Ações do Usuário */}
            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
              {session && (
                <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-sm border border-[#D7CCC8] shadow-sm">
                  <div className="rounded-full bg-[#FAF7F5] p-1">
                    <UserCircle2 className="h-5 w-5 text-[#8D6E63]" />
                  </div>
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-bold text-[#5D4037] max-w-[150px] truncate">
                      {session.name}
                    </div>
                  </div>
                </div>
              )}
              
              <button
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#E53935] hover:bg-[#FFEBEE] rounded-sm transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          </div>

          {/* Navegação (Tabs) */}
          <nav className="pb-0 pt-2 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1 min-w-max">
              {accountNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className={cn(
                      "flex items-center gap-2 px-6 py-3 text-sm font-bold transition-all border-t-2 border-x-2 rounded-t-lg relative top-[2px]",
                      isActive
                        ? "bg-white border-[#D7CCC8] border-b-white text-[#E53935] z-10"
                        : "bg-[#F5F5F5] border-transparent text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#EFEBE9]"
                    )}
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

      {/* ÁREA DE CONTEÚDO PRINCIPAL */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="bg-white border-x border-b border-[#D7CCC8] p-6 md:p-8 min-h-[500px] shadow-sm rounded-b-sm rounded-tr-sm relative -top-[2px] z-0">
           {children}
        </div>
      </main>

      {/* Footer de Ajuda */}
      <footer className="mx-auto max-w-6xl px-6 pb-12">
        <div className="rounded-sm bg-[#FFF8E1] border border-[#FFE0B2] p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded-full border border-[#FFE0B2]">
                <Sparkles className="h-5 w-5 text-[#FFB300]" />
              </div>
              <div>
                <p className="text-sm font-bold text-[#5D4037]">
                  Precisa de ajuda com algum pedido?
                </p>
                <p className="text-xs text-[#8D6E63]">
                  Nossa equipe de suporte artesanal está pronta para te atender.
                </p>
              </div>
            </div>
            
            <button
              className="flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest hover:bg-[#128C7E] transition-all rounded-sm shadow-md"
              onClick={() => window.open('https://wa.me/5541999932625', '_blank')}
            >
              <MessageCircle className="h-4 w-4" />
              Chamar no WhatsApp
            </button>
        </div>
      </footer>
    </div>
  );
}