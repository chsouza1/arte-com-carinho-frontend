"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrderDetail } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { 
  CheckCircle2, 
  ShoppingBag, 
  Package, 
  Sparkles, 
  Heart, 
  ArrowRight,
  MessageCircle,
  AlertTriangle,
  Copy,
  Check
} from "lucide-react";
import confetti from "canvas-confetti";

// ⚠️ NÚMERO DA ARTESÃ
const WHATSAPP_NUMBER = "5541988091516"; 
const PIX_KEY = "simonearmin@hotmail.com";

const EMOJI = {
    FESTA: "\uD83C\uDF89",     // 🎉
    CLIENTE: "\uD83D\uDC64",   // 👤
    CELULAR: "\uD83D\uDCF1",   // 📱
    CARRINHO: "\uD83D\uDED2",  // 🛒
    SACO_DINHEIRO: "\uD83D\uDCB0", // 💰
    CARTAO: "\uD83D\uDCB3",    // 💳
    LAPIS: "\uD83D\uDCDD",     // 📝
    ALERTA: "\u26A0\uFE0F",    // ⚠️
    CAMERA: "\uD83D\uDCF8",    // 📸
    CORACAO: "\uD83D\uDC96"    // 💖
};

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("id") || searchParams.get("orderId");
  const { data: order } = useOrderDetail(orderId);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (order) {
      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
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

    const itemsList = order.items
      ?.map((item) => `• ${item.quantity}x ${item.productName || "Produto"}`)
      .join("\n") || "";

    const rawTotal = order.total || (order as any).totalAmount || 0;
    const totalValue = Number(rawTotal).toLocaleString("pt-BR", { 
        style: "currency", 
        currency: "BRL" 
    });

    const clientName = order.customerName || order.user?.name || order.customer?.name || "Cliente";
    const clientPhone = order.customerPhone || order.user?.phone || order.customer?.phone || "Não informado";

    const message = 
`*Olá! Acabei de fazer o pedido #${order.code || order.id} no site.* ${EMOJI.FESTA}

*${EMOJI.CLIENTE} Cliente:* ${clientName}
*${EMOJI.CELULAR} Contato:* ${clientPhone}

*${EMOJI.CARRINHO} Resumo:*
${itemsList}

*${EMOJI.SACO_DINHEIRO} Total:* ${totalValue}
*${EMOJI.CARTAO} Pagamento:* ${order.paymentMethod || "Não informado"}

${order.notes ? `*${EMOJI.LAPIS} Detalhes e Personalização:* \n${order.notes}` : ""}

*${EMOJI.ALERTA} Estou ciente do pagamento de 50% para iniciar a produção e envio o comprovante a seguir.*

_Aguardo a confirmação!_`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl rounded-[2rem] border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="relative bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100 pb-8 pt-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-5">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 shadow-lg border-4 border-white">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
            </div>

            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
              <Heart size={16} className="animate-pulse" />
              Pedido realizado com carinho
            </span>

            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight text-center">
              Obrigada pela sua compra! {EMOJI.CORACAO}
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-8">
          {order ? (
            <div className="space-y-6">
              <div className="relative rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 border-2 border-rose-200 shadow-sm overflow-hidden text-center">
                 <p className="text-sm font-bold text-rose-600 mb-1">Número do pedido</p>
                 <p className="text-2xl font-black font-mono text-slate-800">#{order.code ?? order.id}</p>
              </div>

              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-5 space-y-4">
                 <div className="flex items-start gap-3">
                    <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <h3 className="text-sm font-bold text-amber-800 mb-1">
                            Atenção: Início da Produção
                        </h3>
                        <p className="text-sm text-amber-900 leading-relaxed">
                            A produção do seu bordado personalizado só será iniciada após o pagamento de <strong>50% do valor total</strong>.
                        </p>
                    </div>
                 </div>

                 <div className="bg-white rounded-xl border border-amber-200 p-4 flex flex-col gap-2 shadow-sm">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Chave Pix (E-mail)</span>
                    <div className="flex items-center justify-between gap-2">
                        <code className="text-sm sm:text-base font-mono font-bold text-slate-700 truncate">
                            {PIX_KEY}
                        </code>
                        <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 px-3 text-amber-700 hover:text-amber-800 hover:bg-amber-100" 
                            onClick={handleCopyPix}
                        >
                            {copied ? (
                                <span className="flex items-center gap-1 text-green-600 font-bold"><Check size={14}/> Copiado!</span>
                            ) : (
                                <span className="flex items-center gap-1"><Copy size={14}/> Copiar</span>
                            )}
                        </Button>
                    </div>
                 </div>
                 
                 <p className="text-xs text-center text-amber-800 font-medium">
                    {EMOJI.CAMERA} Por favor, envie o comprovante junto com o pedido no botão abaixo.
                 </p>
              </div>

              <div className="space-y-2">
                <a 
                    href={getWhatsAppLink()} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-4 text-white font-bold shadow-lg shadow-green-500/30 transition-transform hover:scale-[1.02] active:scale-95 text-lg"
                >
                    <MessageCircle size={24} />
                    Enviar Pedido + Comprovante
                </a>
              </div>

            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 border-2 border-rose-200 shadow-lg text-center">
              <Sparkles className="h-8 w-8 text-rose-500 mx-auto mb-4" />
              <p className="text-base font-semibold text-slate-700">
                Carregando detalhes do pedido...
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-rose-100">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-2 border-rose-200 text-sm font-bold text-rose-700 hover:bg-rose-50"
              onClick={() => router.push("/account/orders")}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Ver meus pedidos
            </Button>
            <Button
              variant="ghost"
              className="flex-1 h-12 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50"
              onClick={() => router.push("/")}
            >
              <ArrowRight className="h-5 w-5 mr-2" />
              Voltar para a loja
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}