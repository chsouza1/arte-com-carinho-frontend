"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMyOrders, type OrderSummary } from "@/lib/orders";

function formatOrderDate(order: OrderSummary): string {
  // tenta na ordem: orderDate -> createdDate -> createdAt
  const raw =
    order.orderDate ?? order.createdDate ?? (order as any).createdAt;

  if (!raw) return "-";

  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return "-";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function traduzStatus(status: string): string {
  const s = status?.toUpperCase?.() ?? "";
  if (s === "PENDING") return "Pendente";
  if (s === "PAID") return "Pagamento aprovado";
  if (s === "IN_PRODUCTION") return "Em produção";
  if (s === "SHIPPED") return "Enviado";
  if (s === "DELIVERED") return "Entregue";
  if (s === "CANCELLED") return "Cancelado";
  return status || "-";
}

export default function AccountOrdersPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useMyOrders(0); // página 0 por enquanto

  if (isLoading) {
    return (
      <p className="text-sm text-slate-500">
        Carregando seus pedidos...
      </p>
    );
  }

  if (isError) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-rose-500">
          Não foi possível carregar seus pedidos. Tente novamente mais tarde.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => router.push("/")}
        >
          Voltar para a loja
        </Button>
      </div>
    );
  }

  const orders = data?.content ?? [];

  if (orders.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-slate-700">
          Você ainda não tem pedidos cadastrados.
        </p>
        <Button
          size="sm"
          className="bg-rose-500 text-xs text-white hover:bg-rose-600"
          onClick={() => router.push("/products")}
        >
          Ver produtos do ateliê
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h1 className="text-sm font-semibold text-slate-900">
        Meus pedidos
      </h1>
      <p className="text-xs text-slate-600">
        Acompanhe os pedidos feitos no ateliê.
      </p>

      <div className="mt-2 space-y-2">
        {orders.map((order) => {
          const dateLabel = formatOrderDate(order);
          const statusLabel = traduzStatus(order.status);

          return (
            <button
              key={order.id}
              type="button"
              onClick={() => router.push(`/account/orders/${order.id}`)}
              className="flex w-full items-center justify-between rounded-lg border border-rose-100 bg-white px-3 py-2 text-left text-xs shadow-sm hover:border-rose-200 hover:bg-rose-50"
            >
              <div>
                <p className="font-semibold text-slate-800">
                  Pedido #{order.code ?? order.orderNumber ?? order.id}
                </p>
                <p className="text-[11px] text-slate-500">
                  Realizado em {dateLabel}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold text-rose-600">
                  {order.totalAmount?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p className="text-[11px] text-slate-500">
                  {statusLabel}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
