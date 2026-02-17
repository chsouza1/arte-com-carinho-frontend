"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrderDetail } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ShoppingBag, 
  Heart, 
  ArrowRight,
  MessageCircle,
  Copy,
  Check,
  Scissors,
  Smartphone,
  Gift
} from "lucide-react";
import confetti from "canvas-confetti";

// --- CONSTANTES ---
const WHATSAPP_NUMBER = "5541999932625"; // Atualizado conforme seu contexto
const PIX_KEY = "simonearmin@hotmail.com";

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("id") || searchParams.get("orderId");
  const { data: order } = useOrderDetail(orderId);
  const [copied, setCopied] = useState(false);

  // Efeito de Confete (Mantido, pois celebra a compra)
  useEffect(() => {
    if (order) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      
      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        // Cores personalizadas: Vermelho, Dourado e Creme
        confetti({ ...defaults, particleCount, colors: ['#E53935', '#FFD700', '#FAF7F5'], origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, colors: ['#E53935', '#FFD700', '#FAF7F5'], origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [order]);

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppLink = () => {
    if (!order) return "#";
    
    // Formatação da Mensagem para o WhatsApp
    const itemsList = order.items
      ?.map((item: any) => `• ${item.quantity}x ${item.productName || "Peça Personalizada"}`)
      .join("\n") || "";
      
    const totalValue = Number(order.total || 0).toLocaleString("pt-BR", { 
        style: "currency", 
        currency: "BRL" 
    });

    const message = 
`*Olá, Simone!* ❤️
Acabei de fazer o pedido *#${order.code || order.id}* no site.

*🛒 Minhas Escolhas:*
${itemsList}

*💰 Total:* ${totalValue}
*💳 Pagamento:* ${order.paymentMethod === 'PIX' ? 'Pix' : 'A Combinar'}

*📝 Detalhes do Pedido:*
${order.notes || "Sem observações extras."}

*⚠️ Comprovante:*
Estou enviando o comprovante dos 50% para iniciar a produção! 👇`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    // FUNDO CREME
    <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center p-4 sm:p-6 font-sans text-[#5D4037]">
      
      {/* CARTÃO PRINCIPAL ESTILO PAPELARIA */}
      <div className="w-full max-w-lg bg-white relative rounded-sm shadow-xl border border-[#D7CCC8] overflow-hidden">
        
        {/* Detalhe Superior (Fita/Costura) */}
        <div className="h-2 bg-[#E53935] w-full border-b border-dashed border-[#B71C1C]/30"></div>

        {/* CABEÇALHO */}
        <div className="text-center pt-10 pb-6 px-8 bg-[url('/paper-texture.png')]">
            <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-[#FFEBEE] rounded-full animate-ping opacity-75"></div>
                <div className="relative bg-[#E53935] text-white p-4 rounded-full shadow-lg border-4 border-white">
                    <Heart className="h-8 w-8 fill-current animate-pulse" />
                </div>
            </div>
            
            <h1 className="text-3xl font-serif font-bold text-[#5D4037] mb-2">
              Pedido Recebido!
            </h1>
            <p className="text-[#8D6E63] font-medium italic">
              Obrigada por escolher a Arte com Carinho.
            </p>
        </div>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="px-8 pb-10 space-y-8">
            
            {order ? (
                <>
                    {/* CARTÃO DE PEDIDO (TICKET) */}
                    <div className="bg-[#FAF7F5] border-2 border-dashed border-[#D7CCC8] p-6 rounded-sm text-center relative">
                        {/* Recorte decorativo */}
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-[#D7CCC8]"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-[#D7CCC8]"></div>

                        <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest mb-1">Número do Pedido</p>
                        <p className="text-3xl font-serif font-bold text-[#5D4037] tracking-tight">#{order.code ?? order.id}</p>
                    </div>

                    {/* ÁREA DE PAGAMENTO (PIX) */}
                    <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-[#FFF8E1] p-4 rounded-sm border border-[#FFE0B2]">
                            <div className="bg-[#FFECB3] p-2 rounded-full text-[#F57F17]">
                                <Scissors size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-[#5D4037] mb-1">Para iniciar a produção...</h3>
                                <p className="text-xs text-[#8D6E63] leading-relaxed">
                                    Como são peças personalizadas, preciso da confirmação de <strong>50% do valor</strong> para comprar os materiais e começar a bordar.
                                </p>
                            </div>
                        </div>

                        {/* Caixa do Pix */}
                        <div className="border border-[#D7CCC8] rounded-sm p-4 bg-white shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider flex items-center gap-1">
                                    <Gift size={12} /> Chave Pix (E-mail)
                                </span>
                                {copied && <span className="text-xs font-bold text-green-600 flex items-center gap-1"><CheckCircle2 size={12} /> Copiado!</span>}
                            </div>
                            
                            <div className="flex gap-2">
                                <div className="flex-1 bg-[#FAF7F5] border border-[#EFEBE9] p-3 rounded-sm font-mono text-sm text-[#5D4037] truncate font-bold select-all">
                                    {PIX_KEY}
                                </div>
                                <Button 
                                    onClick={handleCopyPix}
                                    className="bg-[#5D4037] hover:bg-[#3E2723] text-white px-4 rounded-sm"
                                >
                                    <Copy size={16} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* BOTÃO WHATSAPP (AÇÃO PRINCIPAL) */}
                    <a 
                        href={getWhatsAppLink()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-center py-4 rounded-sm shadow-md transition-all hover:-translate-y-1 active:translate-y-0 group"
                    >
                        <div className="flex items-center justify-center gap-2 text-lg font-bold uppercase tracking-wide">
                            <MessageCircle size={24} className="group-hover:animate-bounce" />
                            Enviar Comprovante
                        </div>
                        <span className="text-[10px] font-medium opacity-90 block mt-1">
                            Vou te atender pessoalmente no WhatsApp!
                        </span>
                    </a>
                </>
            ) : (
                <div className="text-center py-10">
                    <Loader2 className="h-8 w-8 text-[#D7CCC8] animate-spin mx-auto mb-4" />
                    <p className="text-[#8D6E63]">Buscando seu pedido no ateliê...</p>
                </div>
            )}

            {/* AÇÕES SECUNDÁRIAS */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-dashed border-[#D7CCC8]">
                <Button
                    variant="outline"
                    className="h-auto py-3 border-[#D7CCC8] text-[#8D6E63] hover:text-[#5D4037] hover:bg-[#FAF7F5] text-xs font-bold uppercase tracking-widest rounded-sm"
                    onClick={() => router.push("/account/orders")}
                >
                    <ShoppingBag size={16} className="mr-2" />
                    Meus Pedidos
                </Button>
                <Button
                    variant="ghost"
                    className="h-auto py-3 text-[#8D6E63] hover:text-[#E53935] hover:bg-[#FFEBEE] text-xs font-bold uppercase tracking-widest rounded-sm"
                    onClick={() => router.push("/")}
                >
                    <ArrowRight size={16} className="mr-2" />
                    Voltar a Loja
                </Button>
            </div>
        </div>

        {/* Rodapé Decorativo */}
        <div className="bg-[#FAF7F5] py-3 text-center border-t border-[#D7CCC8]">
            <p className="text-[10px] text-[#A1887F] font-serif italic">
                Feito à mão com amor em cada ponto.
            </p>
        </div>
      </div>

      <div className="hidden">
        <Check />
      </div>
    </div>
  );
}

// Componente Loader2 manual caso não tenha no lucide-react importado
function Loader2({ className }: { className?: string }) {
    return (
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={className}
        >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
    )
}