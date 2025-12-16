// src/app/order/success/page.tsx
"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useOrderDetail } from "@/lib/orders";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle2, ShoppingBag, Package, Sparkles, Heart, ArrowRight } from "lucide-react";

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("orderId");
  const { data: order } = useOrderDetail(orderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl rounded-[2rem] border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-2xl overflow-hidden">
        <CardHeader className="relative bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100 pb-8 pt-10">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-xl"></div>
          
          <div className="relative z-10 flex flex-col items-center space-y-5">
            {/* Icon with animation */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-100 to-green-100 shadow-lg border-4 border-white">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              </div>
            </div>

            {/* Badge */}
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/30">
              <Heart size={16} className="animate-pulse" />
              Pedido realizado com carinho
            </span>

            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight text-center">
              Obrigada pela sua compra! 💖
            </h1>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-8">
          {order ? (
            <div className="space-y-5">
              {/* Info do pedido */}
              <div className="relative rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 border-2 border-rose-200 shadow-lg overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-xl"></div>
                
                <div className="relative z-10 space-y-3">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Package className="h-5 w-5 text-rose-500" />
                    <p className="font-bold text-rose-600 text-sm">
                      Número do pedido
                    </p>
                  </div>
                  
                  <p className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 tracking-wide text-center">
                    #{order.code ?? order.id}
                  </p>
                  
                  <p className="text-sm text-center text-slate-700 font-semibold leading-relaxed">
                    Seu pedido foi recebido pelo ateliê e já está sendo preparado com muito carinho!
                  </p>
                </div>
              </div>

              {/* Acompanhamento */}
              <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 p-6 border-2 border-blue-200">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2 shadow-sm mt-0.5">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-left flex-1">
                    <p className="text-sm text-slate-700 font-semibold leading-relaxed mb-2">
                      Você pode acompanhar o status do seu pedido a qualquer momento em:
                    </p>
                    <button
                      onClick={() => router.push("/account/orders")}
                      className="inline-flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors group"
                    >
                      Minha conta → Meus pedidos
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 border-2 border-rose-200 shadow-lg text-center">
              <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
                <Sparkles className="h-8 w-8 text-rose-500" />
              </div>
              <p className="text-base font-semibold text-slate-700 leading-relaxed">
                Seu pedido foi recebido com sucesso! 
              </p>
              <p className="text-sm text-slate-600 mt-2">
                Em instantes você poderá acompanhar o status na área de "Meus pedidos".
              </p>
            </div>
          )}

          {/* Botões de ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95"
              onClick={() => router.push("/account/orders")}
            >
              <ShoppingBag className="h-5 w-5 mr-2" />
              Ver meus pedidos
            </Button>
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-2xl border-2 border-rose-200 text-sm font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-all"
              onClick={() => router.push("/products")}
            >
              <Package className="h-5 w-5 mr-2" />
              Continuar comprando
            </Button>
          </div>

          {/* Mensagem adicional */}
          <div className="pt-4 border-t-2 border-rose-100 text-center">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              ✨ Agradecemos por escolher a Arte com Carinho para criar momentos especiais!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}