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
  Gift
} from "lucide-react";
import confetti from "canvas-confetti";


const WHATSAPP_NUMBER = "5541999932625";
const PIX_MANUAL_FALLBACK = "simonearmin@hotmail.com";

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("id") || searchParams.get("orderId");
  
  const { data: order, refetch } = useOrderDetail(orderId);
  
  const [copied, setCopied] = useState(false);
  const [pixData, setPixData] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      const savedPix = sessionStorage.getItem(`pix_${orderId}`);
      if (savedPix) {
        setPixData(JSON.parse(savedPix));
      }
    }
  }, [orderId]);

  useEffect(() => {
    if (!orderId || !order || order.paymentStatus === 'PAID' || order.status === 'IN_PRODUCTION') return;

    const interval = setInterval(async () => {
      try {
        const result = await refetch();
        const updatedOrder = result.data;
        
        if (updatedOrder && (updatedOrder.paymentStatus === 'PAID' || updatedOrder.status === 'IN_PRODUCTION')) {
          sessionStorage.removeItem(`pix_${orderId}`);
        }
      } catch (error) {
        console.error("Erro ao verificar status do pedido", error);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [orderId, order?.paymentStatus, order?.status, refetch]);
  
  // Efeito dos Confettis
  useEffect(() => {

    if (order && (order.paymentStatus === 'PAID' || order.status === 'IN_PRODUCTION' || order.paymentMethod !== 'PIX')) {
      const duration = 3000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
      
      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, colors: ['#E53935', '#FFD700', '#FAF7F5'], origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, colors: ['#E53935', '#FFD700', '#FAF7F5'], origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
    }
  }, [order?.paymentStatus, order?.status, order?.paymentMethod]);

  const handleCopyPix = () => {
    const textToCopy = pixData?.qrCode || PIX_MANUAL_FALLBACK;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getWhatsAppLink = () => {
    if (!order) return "#";
    
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
*💳 Pagamento:* ${order.paymentMethod === 'PIX' ? 'Pix' : 'Cartão/Outro'}

*📝 Detalhes do Pedido:*
${order.notes || "Sem observações extras."}

*⚠️ Comprovante:*
Estou enviando o comprovante do pagamento para iniciar a produção! 👇`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] flex items-center justify-center p-4 sm:p-6 font-sans text-[#5D4037]">
      
      <div className="w-full max-w-lg bg-white relative rounded-sm shadow-xl border border-[#D7CCC8] overflow-hidden">
        
        <div className="h-2 bg-[#E53935] w-full border-b border-dashed border-[#B71C1C]/30"></div>

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

        <div className="px-8 pb-10 space-y-8">
            
            {order ? (
                <>
                    <div className="bg-[#FAF7F5] border-2 border-dashed border-[#D7CCC8] p-6 rounded-sm text-center relative">
                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-r border-[#D7CCC8]"></div>
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border-l border-[#D7CCC8]"></div>

                        <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-widest mb-1">Número do Pedido</p>
                        <p className="text-3xl font-serif font-bold text-[#5D4037] tracking-tight">#{order.code ?? order.id}</p>
                    </div>

                    {/* MOSTRA SUCESSO SE JÁ ESTIVER PAGO */}
                    {(order.paymentStatus === 'PAID' || order.status === 'IN_PRODUCTION') && (
                        <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-sm text-center flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
                            <CheckCircle2 className="text-green-500 w-12 h-12" />
                            <div>
                                <h3 className="font-bold text-lg">Pagamento Confirmado!</h3>
                                <p className="text-sm mt-1 opacity-90">O seu pedido já foi encaminhado para a produção.</p>
                            </div>
                        </div>
                    )}

                    {/* MOSTRA O QR CODE APENAS SE FOR PIX E NÃO ESTIVER PAGO AINDA */}
                    {order.paymentMethod === 'PIX' && order.paymentStatus !== 'PAID' && order.status !== 'IN_PRODUCTION' && (
                      <div className="space-y-4">
                          <div className="flex items-start gap-3 bg-[#FFF8E1] p-4 rounded-sm border border-[#FFE0B2]">
                              <div className="bg-[#FFECB3] p-2 rounded-full text-[#F57F17]">
                                  <Scissors size={20} />
                              </div>
                              <div>
                                  <h3 className="text-sm font-bold text-[#5D4037] mb-1">Aguardando Pagamento</h3>
                                  <p className="text-xs text-[#8D6E63] leading-relaxed">
                                      Realize o pagamento do PIX abaixo para iniciarmos a produção. Esta página irá atualizar sozinha quando o pagamento for identificado.
                                  </p>
                              </div>
                          </div>

                          <div className="border border-[#D7CCC8] rounded-sm p-4 bg-white shadow-sm flex flex-col items-center">
                              
                              {pixData ? (
                                <>
                                  <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-3">
                                      Escaneie o QR Code
                                  </span>
                                  <img 
                                    src={`data:image/png;base64,${pixData.qrCodeBase64}`} 
                                    alt="QR Code PIX" 
                                    className="w-48 h-48 border border-neutral-200 rounded-lg shadow-sm mb-4"
                                  />
                                  <span className="text-xs text-[#8D6E63] mb-2">Ou use o código Pix Copia e Cola abaixo:</span>
                                </>
                              ) : (
                                <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-3 flex items-center gap-1">
                                    <Gift size={12} /> Chave Pix (E-mail)
                                </span>
                              )}

                              <div className="flex w-full gap-2 mt-2">
                                  <div className="flex-1 bg-[#FAF7F5] border border-[#EFEBE9] p-3 rounded-sm font-mono text-[10px] sm:text-xs text-[#5D4037] truncate font-bold select-all">
                                      {pixData ? pixData.qrCode : PIX_MANUAL_FALLBACK}
                                  </div>
                                  <Button 
                                      onClick={handleCopyPix}
                                      className="bg-[#5D4037] hover:bg-[#3E2723] text-white px-4 rounded-sm transition-all"
                                  >
                                      {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
                                  </Button>
                              </div>
                          </div>
                      </div>
                    )}

                    <a 
                        href={getWhatsAppLink()} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block w-full bg-[#25D366] hover:bg-[#128C7E] text-white text-center py-4 rounded-sm shadow-md transition-all hover:-translate-y-1 active:translate-y-0 group"
                    >
                        <div className="flex items-center justify-center gap-2 text-lg font-bold uppercase tracking-wide">
                            <MessageCircle size={24} className="group-hover:animate-bounce" />
                            Dúvidas? Fale Conosco
                        </div>
                        <span className="text-[10px] font-medium opacity-90 block mt-1">
                            Vou te atender pessoalmente no WhatsApp!
                        </span>
                    </a>
                </>
            ) : (
                <div className="text-center py-10">
                    <Loader2 className="h-8 w-8 text-[#D7CCC8] animate-spin mx-auto mb-4" />
                    <p className="text-[#8D6E63]">Buscando o seu pedido no ateliê...</p>
                </div>
            )}

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