"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOrderDetail, type OrderDetail } from "@/lib/orders";
import { ArrowLeft, Package, Calendar, DollarSign, Clock, CheckCircle, Truck, Box, Gift, MessageSquare, Sparkles } from "lucide-react";

function formatOrderDate(order: OrderDetail): string {
  const raw = order.orderDate ?? order.createdDate ?? (order as any).createdAt;
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function traduzStatus(status: string): { label: string; color: string; icon: any } {
  const s = status?.toUpperCase?.() ?? "";
  if (s === "PENDING") return { label: "Pendente", color: "amber", icon: Clock };
  if (s === "PAID") return { label: "Pagamento aprovado", color: "emerald", icon: CheckCircle };
  if (s === "IN_PRODUCTION") return { label: "Em produção", color: "blue", icon: Box };
  if (s === "SHIPPED") return { label: "Enviado", color: "purple", icon: Truck };
  if (s === "DELIVERED") return { label: "Entregue", color: "green", icon: Gift };
  if (s === "CANCELLED") return { label: "Cancelado", color: "slate", icon: Clock };
  return { label: status, color: "slate", icon: Clock };
}

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const { data: order, isLoading, isError } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent mb-4"></div>
          <p className="text-sm font-semibold text-slate-600">
            Carregando detalhes do pedido...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border-2 border-rose-200 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
            <Package className="h-8 w-8 text-rose-400" />
          </div>
          <p className="text-base font-bold text-rose-600 mb-2">
            Não foi possível carregar o pedido
          </p>
          <p className="text-sm text-slate-600 mb-6">
            Tente novamente ou volte para a lista de pedidos.
          </p>
          <Button
            className="h-11 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30"
            onClick={() => router.push("/account/orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para meus pedidos
          </Button>
        </div>
      </div>
    );
  }

  const dateLabel = formatOrderDate(order);
  const statusInfo = traduzStatus(order.status);
  const StatusIcon = statusInfo.icon;

  const colorMap: Record<string, { from: string; to: string; border: string; text: string }> = {
    amber: { from: "amber-100", to: "yellow-100", border: "amber-200", text: "amber-700" },
    emerald: { from: "emerald-100", to: "green-100", border: "emerald-200", text: "emerald-700" },
    blue: { from: "blue-100", to: "sky-100", border: "blue-200", text: "blue-700" },
    purple: { from: "purple-100", to: "violet-100", border: "purple-200", text: "purple-700" },
    green: { from: "green-100", to: "emerald-100", border: "green-200", text: "green-700" },
    slate: { from: "slate-100", to: "gray-100", border: "slate-200", text: "slate-600" },
  };

  const colors = colorMap[statusInfo.color] || colorMap.slate;

  return (
    <div className="space-y-6">
      {/* Botão voltar */}
      <Button
        variant="outline"
        className="rounded-2xl border-2 border-rose-200 px-5 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-50 hover:border-rose-300 transition-all"
        onClick={() => router.push("/account/orders")}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para meus pedidos
      </Button>

      {/* Header do pedido */}
      <div className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-8 shadow-xl backdrop-blur-sm border-2 border-rose-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10 space-y-6">
          {/* Número do pedido e status */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
                  <Package size={28} className="text-rose-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                    Pedido #{order.code ?? order.orderNumber ?? order.id}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-600 font-medium">
                      Realizado em {dateLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status badge grande */}
              <div className={`inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-${colors.from} to-${colors.to} border-2 border-${colors.border} px-5 py-3 shadow-lg`}>
                <StatusIcon className={`h-6 w-6 text-${colors.text}`} />
                <span className={`text-base font-black text-${colors.text}`}>
                  {statusInfo.label}
                </span>
              </div>
            </div>

            {/* Valor total */}
            <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border-2 border-emerald-200 px-6 py-4 shadow-lg text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <DollarSign className="h-5 w-5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">Valor Total</span>
              </div>
              <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                {order.totalAmount?.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Linha do tempo */}
      <div className="rounded-3xl border-2 border-blue-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-sky-50 border-b-2 border-blue-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2 shadow-md">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Acompanhamento do Pedido
            </h2>
          </div>
        </div>
        <div className="p-6">
          <ul className="space-y-3">
            {[
              { icon: CheckCircle, text: "Pedido recebido no ateliê", color: "emerald" },
              { icon: DollarSign, text: "Pagamento e detalhes combinados com o cliente", color: "blue" },
              { icon: Box, text: "Produção e bordados em andamento", color: "purple" },
              { icon: Truck, text: "Separação e envio", color: "amber" },
              { icon: Gift, text: "Entrega para o cliente", color: "rose" },
            ].map((step, index) => {
              const StepIcon = step.icon;
              return (
                <li key={index} className="flex items-center gap-3">
                  <div className={`rounded-full bg-gradient-to-br from-${step.color}-100 to-${step.color}-100 p-2 shadow-sm`}>
                    <StepIcon className={`h-4 w-4 text-${step.color}-600`} />
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {step.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Itens do pedido */}
      <div className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white p-2 shadow-md">
              <Package className="h-5 w-5 text-rose-600" />
            </div>
            <h2 className="text-base font-bold text-slate-800">
              Itens do Pedido
            </h2>
          </div>
        </div>
        <div className="p-6 space-y-3">
          {order.items?.map((item) => (
            <div
              key={item.id}
              className="group flex items-center justify-between rounded-2xl border-2 border-rose-100 bg-gradient-to-br from-white to-rose-50/30 p-4 hover:shadow-md hover:border-rose-200 transition-all"
            >
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                  {item.productName}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    <Package className="h-3 w-3" />
                    Qtde: {item.quantity}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {item.unitPrice?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })} / un.
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                  {item.subtotal?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Observações */}
      {order.notes && (
        <div className="rounded-3xl border-2 border-purple-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-violet-50 border-b-2 border-purple-100 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-white p-2 shadow-md">
                <MessageSquare className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-base font-bold text-slate-800">
                Observações do Pedido
              </h2>
            </div>
          </div>
          <div className="p-6">
            <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-violet-50 border-2 border-purple-200 p-4">
              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                {order.notes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Card de ajuda */}
      <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-white p-3 shadow-md">
            <Sparkles className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-800 mb-2">
              Precisa de ajuda com seu pedido?
            </h3>
            <p className="text-sm text-slate-600 mb-4">
              Entre em contato conosco pelo WhatsApp para tirar dúvidas ou fazer alterações.
            </p>
            <Button
              variant="outline"
              className="rounded-2xl border-2 border-emerald-200 px-5 py-2.5 text-sm font-bold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
              onClick={() => window.open('https://wa.me/5541999932625', '_blank')}
            >
              Falar com o ateliê
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}