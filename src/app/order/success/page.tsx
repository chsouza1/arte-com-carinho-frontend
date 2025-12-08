// src/app/order/success/page.tsx
import { Suspense } from "react";
import { OrderSuccessClient } from "./success-client";

export default function OrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-xs text-slate-500">
          Carregando detalhes do pedido...
        </div>
      }
    >
      <OrderSuccessClient />
    </Suspense>
  );
}
