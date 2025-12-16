"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Baby, Home, Sparkles, Heart, Package } from "lucide-react";

export function OrderSuccessClientAdmin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderNumber = searchParams.get("orderNumber");

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
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30">
              <Sparkles size={16} className="animate-pulse" />
              Pedido confirmado
            </span>

            <CardTitle className="text-center text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Pedido recebido com carinho 💕
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 p-8 text-center">
          <p className="text-base text-slate-700 font-medium leading-relaxed">
            Recebemos o seu pedido e o ateliê já foi avisado para começar a
            preparar tudo com muito cuidado.
          </p>

          {orderNumber && (
            <div className="relative rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-6 border-2 border-rose-200 shadow-lg overflow-hidden">
              {/* Decorative corner */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-xl"></div>
              
              <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <Package className="h-5 w-5 text-rose-500" />
                  <p className="font-bold text-rose-600 text-sm">
                    Número do seu pedido
                  </p>
                </div>
                
                <p className="text-2xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 tracking-wide">
                  {orderNumber}
                </p>
                
                <p className="text-xs text-slate-600 font-medium max-w-md mx-auto leading-relaxed">
                  Guarde este número. Ele ajuda a identificar seu pedido caso você
                  entre em contato pelo WhatsApp ou e-mail.
                </p>
              </div>
            </div>
          )}

          <div className="space-y-4 rounded-2xl bg-gradient-to-br from-blue-50 to-sky-50 p-6 border-2 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="rounded-xl bg-white p-2 shadow-sm mt-0.5">
                <Heart className="h-5 w-5 text-rose-500" />
              </div>
              <div className="text-left flex-1">
                <p className="text-sm text-slate-700 font-semibold leading-relaxed">
                  Em breve você receberá uma mensagem da{" "}
                  <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                    Arte com Carinho
                  </span>{" "}
                  confirmando detalhes como nomes, cores e prazo de entrega.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 pt-2">
              <Baby className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-bold text-slate-700">
                Seu enxoval está um passo mais perto de ficar prontinho! ✨
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
            <Button
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95"
              onClick={() => router.push("/products")}
            >
              <Baby className="h-5 w-5" />
              Ver mais produtos
            </Button>
            <Button
              variant="outline"
              className="inline-flex items-center justify-center gap-2 h-12 px-8 rounded-2xl border-2 border-rose-200 text-sm font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-all"
              onClick={() => router.push("/")}
            >
              <Home className="h-5 w-5" />
              Voltar para o início
            </Button>
          </div>

          <div className="pt-4 border-t-2 border-rose-100">
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              💡 No futuro, você poderá acompanhar o status do seu pedido em uma
              área de cliente com login personalizado.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}