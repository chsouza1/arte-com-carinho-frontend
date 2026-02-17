"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { Store, UserCircle2, ShoppingBag, Menu, X, LogOut, Heart, Scissors } from "lucide-react";

import type { AuthSession } from "@/lib/auth";
import { getAuthSession, clearAuthSession, isAdmin } from "@/lib/auth";
import { useCartStore } from "@/lib/cart"; 
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const navItems = [
  { href: "/", label: "Início" },
  { href: "/products", label: "Peças" }, // Mudado de "Produtos" para "Peças" (mais artesanal)
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
    // HEADER: Fundo Creme (#FAF7F5) com borda pontilhada imitando costura
    <header className="sticky top-0 z-50 bg-[#FAF7F5]/90 backdrop-blur-md border-b-2 border-dashed border-[#D7CCC8]">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
        
        {/* LOGO E IDENTIDADE */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative p-1 border border-[#D7CCC8] rounded-full bg-white group-hover:border-[#E53935] transition-colors">
            <Image
              src="/logo.jpg" // Certifique-se que o logo existe ou use um placeholder
              alt="Arte com Carinho"
              width={42}
              height={42}
              className="rounded-full object-cover"
              priority
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-xl font-serif font-bold text-[#5D4037] tracking-tight group-hover:text-[#E53935] transition-colors">
              Arte com Carinho
            </span>
            <span className="text-xs font-medium text-[#8D6E63] italic flex items-center gap-1">
              By Simone <Heart className="h-2 w-2 fill-[#E53935] text-[#E53935]" />
            </span>
          </div>
        </Link>

        {/* NAVEGAÇÃO DESKTOP */}
        <nav className="hidden items-center gap-6 lg:flex">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-2 py-1 text-sm font-medium transition-all group",
                  active
                    ? "text-[#E53935] font-bold"
                    : "text-[#5D4037] hover:text-[#E53935]"
                )}
              >
                {item.label}
                {/* Linha pontilhada animada no hover ou active */}
                <span className={cn(
                  "absolute bottom-0 left-0 h-[2px] w-full border-b-2 border-dashed border-[#E53935] transition-all duration-300",
                  active ? "opacity-100" : "opacity-0 group-hover:opacity-50"
                )}></span>
              </Link>
            );
          })}

          {admin && (
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "ml-2 h-9 rounded-full border border-[#8D6E63] text-[#5D4037] hover:bg-[#5D4037] hover:text-white transition-all text-xs uppercase tracking-widest",
                pathname?.startsWith("/admin") && "bg-[#5D4037] text-white"
              )}
              onClick={() => router.push("/admin")}
            >
              <Store className="mr-2 h-3 w-3" />
              Painel
            </Button>
          )}
        </nav>

        {/* ÍCONES E AÇÕES */}
        <div className="flex items-center gap-4">
          
          {/* Carrinho de Compras */}
          <button
            className="relative p-2 text-[#5D4037] hover:text-[#E53935] transition-colors group"
            onClick={() => router.push("/cart")}
            aria-label="Carrinho"
          >
            <ShoppingBag className="h-6 w-6 stroke-[1.5px]" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#E53935] px-1 text-[10px] font-bold text-white shadow-sm group-hover:scale-110 transition-transform">
                {cartCount}
              </span>
            )}
          </button>

          {/* Usuário Desktop */}
          <div className="hidden lg:flex items-center gap-3 pl-4 border-l border-dashed border-[#D7CCC8]">
            {session ? (
              <>
                <div className="flex flex-col items-end text-right mr-1">
                    <span className="text-xs font-bold text-[#5D4037] max-w-[100px] truncate">{session.name}</span>
                    <button onClick={() => router.push("/account/orders")} className="text-[10px] text-[#8D6E63] hover:underline">Meus Pedidos</button>
                </div>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 rounded-full p-0 hover:bg-[#EFEBE9] text-[#5D4037]"
                  onClick={handleLogout}
                  title="Sair"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                className="h-9 rounded-full bg-[#5D4037] px-6 text-xs font-bold text-white uppercase tracking-widest hover:bg-[#E53935] transition-colors shadow-sm"
                onClick={() => router.push("/auth/login")}
              >
                Entrar
              </Button>
            )}
          </div>

          {/* MENU MOBILE */}
          <div className="lg:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <button
                  className="p-2 text-[#5D4037] hover:bg-[#EFEBE9] rounded-md transition-colors"
                  aria-label="Abrir menu"
                >
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[300px] bg-[#FAF7F5] border-l border-[#D7CCC8] p-0">
                <div className="flex flex-col h-full">
                    {/* Header do Menu */}
                    <div className="p-6 border-b border-dashed border-[#D7CCC8] bg-[#F5F5F5]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-full bg-white border border-[#D7CCC8] overflow-hidden p-0.5">
                                <Image src="/logo.jpg" alt="Logo" width={40} height={40} className="rounded-full" />
                            </div>
                            <div>
                                <h3 className="font-serif text-[#5D4037] font-bold">Arte com Carinho</h3>
                                <p className="text-xs text-[#8D6E63]">Ateliê & Enxoval</p>
                            </div>
                        </div>
                        {session && (
                            <div className="bg-white p-3 rounded-lg border border-[#EFEBE9]">
                                <p className="text-sm font-bold text-[#5D4037] truncate">{session.name}</p>
                                <p className="text-xs text-[#A1887F] truncate mb-2">{session.email}</p>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="w-full text-xs h-7 border-[#D7CCC8] text-[#5D4037]"
                                    onClick={() => go("/account/orders")}
                                >
                                    Meus Pedidos
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Links */}
                    <div className="flex-1 p-6 space-y-2">
                        {navItems.map((item) => (
                            <button
                                key={item.href}
                                onClick={() => go(item.href)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition-colors border",
                                    pathname === item.href
                                        ? "bg-white border-[#E53935] text-[#E53935] font-bold shadow-sm"
                                        : "bg-transparent border-transparent text-[#5D4037] hover:bg-white hover:border-[#D7CCC8]"
                                )}
                            >
                                {item.label}
                                {pathname === item.href && <Heart className="h-3 w-3 fill-current" />}
                            </button>
                        ))}

                        {admin && (
                             <button
                                onClick={() => go("/admin")}
                                className="w-full flex items-center gap-2 px-4 py-3 rounded-lg text-sm bg-[#5D4037] text-white mt-4"
                             >
                                <Store className="h-4 w-4" /> Painel do Ateliê
                             </button>
                        )}
                    </div>

                    {/* Footer / Logout */}
                    <div className="p-6 border-t border-dashed border-[#D7CCC8]">
                        {session ? (
                            <button 
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm text-[#E53935] font-bold hover:underline"
                            >
                                <LogOut className="h-4 w-4" /> Sair da conta
                            </button>
                        ) : (
                            <Button
                                className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-bold"
                                onClick={() => go("/auth/login")}
                            >
                                Entrar / Cadastrar
                            </Button>
                        )}
                    </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}