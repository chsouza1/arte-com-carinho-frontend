"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Baby, Home } from "lucide-react";

export function OrderSuccessClientAdmin() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderNumber = searchParams.get("orderNumber");

  return (
    <div className="flex items-center justify-center py-10">
      <Card className="w-full max-w-lg border-rose-100 bg-white/95 shadow-md">
        <CardHeader className="flex flex-col items-center space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          </div>
          <CardTitle className="text-center text-lg font-semibold text-slate-900">
            Pedido recebido com carinho 💕
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center text-sm text-slate-600">
          <p>
            Recebemos o seu pedido e o ateliê já foi avisado para começar a
            preparar tudo com muito cuidado.
          </p>

          {orderNumber && (
            <div className="rounded-xl bg-rose-50 px-4 py-3 text-xs text-slate-700">
              <p className="font-semibold text-rose-600">
                Número do seu pedido:
              </p>
              <p className="mt-1 text-sm font-mono text-slate-900">
                {orderNumber}
              </p>
              <p className="mt-2 text-[11px] text-slate-500">
                Guarde este número. Ele ajuda a identificar seu pedido caso você
                entre em contato pelo WhatsApp ou e-mail.
              </p>
            </div>
          )}

          <div className="space-y-2 text-xs">
            <p>
              Em breve você receberá uma mensagem da{" "}
              <span className="font-semibold text-rose-600">
                Arte com Carinho
              </span>{" "}
              confirmando detalhes como nomes, cores e prazo de entrega.
            </p>
            <p className="flex items-center justify-center gap-1.5">
              <Baby className="h-4 w-4 text-rose-400" />
              <span>
                Seu enxoval está um passo mais perto de ficar prontinho! ✨
              </span>
            </p>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              className="inline-flex items-center justify-center gap-2 bg-rose-500 text-xs font-semibold hover:bg-rose-600"
              onClick={() => router.push("/products")}
            >
              <Baby className="h-4 w-4" />
              Ver mais produtos
            </Button>

            <Button
              variant="outline"
              className="inline-flex items-center justify-center gap-2 border-rose-200 text-xs font-medium text-rose-700 hover:bg-rose-50"
              onClick={() => router.push("/")}
            >
              <Home className="h-4 w-4" />
              Voltar para o início
            </Button>
          </div>

          <p className="mt-3 text-[11px] text-slate-400">
            No futuro, você poderá acompanhar o status do seu pedido em uma
            área de cliente com login.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
