"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Baby, Home, Sparkles, Heart, Package, Printer, Scissors } from "lucide-react";

export function OrderSuccessClientAdmin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderNumber = searchParams.get("orderNumber");

  return (
    // Fundo Creme
    <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center p-6 font-sans text-[#5D4037]">
      
      {/* Cartão Principal */}
      <div className="w-full max-w-lg bg-white border border-[#D7CCC8] shadow-xl rounded-sm relative overflow-hidden">
        
        {/* Faixa Decorativa Superior */}
        <div className="h-2 bg-[#E53935] w-full border-b border-dashed border-[#B71C1C]/30"></div>

        <div className="p-10 text-center">
            
            {/* Ícone de Sucesso */}
            <div className="mx-auto mb-6 flex items-center justify-center w-20 h-20 bg-[#E8F5E9] rounded-full border border-[#C8E6C9] shadow-sm relative">
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 border border-[#C8E6C9]">
                    <Sparkles className="w-4 h-4 text-[#2E7D32]" />
                </div>
                <CheckCircle2 className="w-10 h-10 text-[#2E7D32]" />
            </div>

            <div className="space-y-2 mb-8">
                <span className="inline-block px-3 py-1 bg-[#FFF8E1] border border-[#FFE0B2] rounded-sm text-[10px] font-bold text-[#F57F17] uppercase tracking-widest">
                    Pedido Confirmado
                </span>
                <h1 className="text-3xl font-serif font-bold text-[#5D4037] leading-tight">
                    Pedido Registrado! <Heart className="inline-block w-6 h-6 text-[#E53935] fill-current" />
                </h1>
                <p className="text-[#8D6E63] text-sm">
                    O pedido foi salvo no sistema com sucesso.
                </p>
            </div>

            {/* Box do Número do Pedido (Estilo Ticket) */}
            {orderNumber && (
                <div className="bg-[#FAF7F5] border-2 border-dashed border-[#D7CCC8] p-6 rounded-sm mb-8 relative group">
                    {/* Detalhes de "corte" nas laterais */}
                    <div className="absolute top-1/2 -left-2 w-4 h-4 bg-white rounded-full border-r-2 border-dashed border-[#D7CCC8]"></div>
                    <div className="absolute top-1/2 -right-2 w-4 h-4 bg-white rounded-full border-l-2 border-dashed border-[#D7CCC8]"></div>

                    <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 text-[#8D6E63] text-xs font-bold uppercase tracking-widest">
                            <Package size={14} /> Código do Pedido
                        </div>
                        <p className="text-4xl font-mono font-bold text-[#5D4037] tracking-tighter">
                            {orderNumber}
                        </p>
                    </div>
                </div>
            )}

            {/* Próximos Passos */}
            <div className="bg-[#EFEBE9]/50 p-4 rounded-sm border border-[#D7CCC8] mb-8 text-left">
                <div className="flex gap-3">
                    <div className="p-2 bg-white rounded-full border border-[#D7CCC8] h-fit">
                        <Scissors size={16} className="text-[#E53935]" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#5D4037] text-sm">O que acontece agora?</h3>
                        <p className="text-xs text-[#8D6E63] mt-1 leading-relaxed">
                            O pedido entrou na fila de produção. Você pode acompanhar o status pelo painel administrativo ou imprimir a ficha de produção agora mesmo.
                        </p>
                    </div>
                </div>
            </div>

            {/* Ações */}
            <div className="flex flex-col gap-3">
                <Button
                    className="w-full bg-[#E53935] hover:bg-[#C62828] text-white h-12 text-xs font-bold uppercase tracking-widest rounded-sm shadow-md transition-all hover:-translate-y-1"
                    onClick={() => router.push("/admin/orders")}
                >
                    <Package className="mr-2 h-4 w-4" />
                    Ir para Lista de Pedidos
                </Button>
                
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        variant="outline"
                        className="h-10 text-xs font-bold uppercase tracking-wider border-[#D7CCC8] text-[#5D4037] hover:bg-[#FAF7F5] rounded-sm"
                        onClick={() => router.push("/admin/products")}
                    >
                        <Baby className="mr-2 h-4 w-4" />
                        Produtos
                    </Button>
                    <Button
                        variant="outline"
                        className="h-10 text-xs font-bold uppercase tracking-wider border-[#D7CCC8] text-[#5D4037] hover:bg-[#FAF7F5] rounded-sm"
                        onClick={() => router.push("/admin")}
                    >
                        <Home className="mr-2 h-4 w-4" />
                        Início
                    </Button>
                </div>
            </div>

        </div>
        
        {/* Rodapé Decorativo */}
        <div className="bg-[#FAF7F5] p-3 text-center border-t border-[#D7CCC8]">
            <p className="text-[10px] text-[#A1887F] font-serif italic">
                Ateliê com Carinho • Sistema de Gestão
            </p>
        </div>
      </div>
    </div>
  );
}