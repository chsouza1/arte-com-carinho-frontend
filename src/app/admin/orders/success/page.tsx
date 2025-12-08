import { Suspense } from "react";
import { OrderSuccessClientAdmin } from "./success-client";

export default function AdminOrderSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center text-xs text-slate-500">
          Carregando confirmação do pedido...
        </div>
      }
    >
      <OrderSuccessClientAdmin />
    </Suspense>
  );
}
