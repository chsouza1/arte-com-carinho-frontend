"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOrderDetail, type OrderDetail } from "@/lib/orders";

function formatOrderDate(order: OrderDetail): string {
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
  return status;
}

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const {
    data: order,
    isLoading,
    isError,
  } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <p className="text-sm text-slate-500">
        Carregando detalhes do pedido...
      </p>
    );
  }

  if (isError || !order) {
    return (
      <div className="space-y-2">
        <p className="text-sm text-rose-500">
          Não foi possível carregar os detalhes do pedido.
        </p>
        <Button
          size="sm"
          variant="outline"
          className="text-xs"
          onClick={() => router.push("/account/orders")}
        >
          Voltar para meus pedidos
        </Button>
      </div>
    );
  }

  const dateLabel = formatOrderDate(order);

  return (
    <div className="space-y-4">
      <Button
        size="sm"
        variant="outline"
        className="text-xs"
        onClick={() => router.push("/account/orders")}
      >
        Voltar para meus pedidos
      </Button>

      <div className="rounded-lg border border-rose-100 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-800">
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
              {traduzStatus(order.status)}
            </p>
          </div>
        </div>

        {/* Linha do tempo simples */}
        <div className="mt-3 border-t border-rose-50 pt-2">
          <p className="mb-1 text-[11px] font-semibold text-slate-700">
            Acompanhamento do pedido
          </p>
          <ul className="space-y-1 text-[11px] text-slate-600">
            <li>• Pedido recebido no ateliê</li>
            <li>• Pagamento e detalhes combinados com o cliente</li>
            <li>• Produção e bordados em andamento</li>
            <li>• Separação e envio</li>
            <li>• Entrega para o cliente</li>
          </ul>
        </div>

        {/* Itens do pedido */}
        <div className="mt-3 border-t border-rose-50 pt-2">
          <p className="mb-1 text-[11px] font-semibold text-slate-700">
            Itens do pedido
          </p>
          <div className="space-y-2 text-[11px]">
            {order.items?.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-md bg-rose-50/60 px-2 py-1"
              >
                <div>
                  <p className="font-medium text-slate-700">
                    {item.productName}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Qtde: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-700">
                    {item.subtotal?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {item.unitPrice?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}{" "}
                    / un.
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {order.notes && (
          <div className="mt-3 border-t border-rose-50 pt-2">
            <p className="mb-1 text-[11px] font-semibold text-slate-700">
              Observações do pedido
            </p>
            <p className="text-[11px] text-slate-600">{order.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
