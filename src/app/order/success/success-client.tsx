// src/app/order/success/page.tsx
"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useOrderDetail } from "@/lib/orders";
import { Button } from "@/components/ui/button";

export function OrderSuccessClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const { data: order } = useOrderDetail(orderId);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-emerald-100 px-4 py-2 text-xs font-semibold text-emerald-700">
        Pedido realizado com carinho 💖
      </div>

      <div className="space-y-2">
        <h1 className="text-lg font-semibold text-slate-900">
          Obrigada pela sua compra!
        </h1>
        {order ? (
          <>
            <p className="text-sm text-slate-700">
              Seu pedido{" "}
              <span className="font-semibold">#{order.code ?? order.id}</span>{" "}
              foi recebido pelo ateliê.
            </p>
            <p className="text-xs text-slate-500">
              Você pode acompanhar o status em{" "}
              <button
                className="underline underline-offset-2"
                onClick={() => router.push("/account/orders")}
              >
                Minha conta &gt; Meus pedidos
              </button>
              .
            </p>
          </>
        ) : (
          <p className="text-sm text-slate-700">
            Seu pedido foi recebido com sucesso. Em instantes você
            poderá acompanhar o status na área de “Meus pedidos”.
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          className="bg-rose-500 text-xs text-white hover:bg-rose-600"
          onClick={() => router.push("/account/orders")}
        >
          Ver meus pedidos
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => router.push("/products")}
        >
          Continuar comprando
        </Button>
      </div>
    </div>
  );
}
