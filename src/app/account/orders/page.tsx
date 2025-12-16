"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMyOrders, type OrderSummary } from "@/lib/orders";
import { ShoppingBag, Calendar, Package, Sparkles, ChevronRight, ArrowRight } from "lucide-react";

function formatOrderDate(order: OrderSummary): string {
  const raw = order.orderDate ?? order.createdDate ?? (order as any).createdAt;
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

function traduzStatus(status: string): { label: string; color: string } {
  const s = status?.toUpperCase?.() ?? "";
  if (s === "PENDING") return { label: "Pendente", color: "amber" };
  if (s === "PAID") return { label: "Pagamento aprovado", color: "emerald" };
  if (s === "IN_PRODUCTION") return { label: "Em produção", color: "blue" };
  if (s === "SHIPPED") return { label: "Enviado", color: "purple" };
  if (s === "DELIVERED") return { label: "Entregue", color: "green" };
  if (s === "CANCELLED") return { label: "Cancelado", color: "slate" };
  return { label: status || "-", color: "slate" };
}

export default function AccountOrdersPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useMyOrders(0);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent mb-4"></div>
          <p className="text-sm font-semibold text-slate-600">
            Carregando seus pedidos...
          </p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border-2 border-rose-200 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
            <ShoppingBag className="h-8 w-8 text-rose-400" />
          </div>
          <p className="text-base font-bold text-rose-600 mb-2">
            Não foi possível carregar seus pedidos
          </p>
          <p className="text-sm text-slate-600 mb-6">
            Tente novamente mais tarde ou entre em contato conosco.
          </p>
          <Button
            className="h-11 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30"
            onClick={() => router.push("/")}
          >
            Voltar para a loja
          </Button>
        </div>
      </div>
    );
  }

  const orders = data?.content ?? [];

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border-2 border-rose-200 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-sky-100 flex items-center justify-center mb-4">
            <Package className="h-10 w-10 text-blue-500" />
          </div>
          <h2 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mb-2">
            Nenhum pedido ainda
          </h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Você ainda não realizou nenhum pedido. Explore nossos produtos feitos com carinho!
          </p>
          <Button
            className="h-11 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:scale-105 active:scale-95"
            onClick={() => router.push("/products")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ver produtos do ateliê
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-8">
      {/* Header */}
      <div className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-8 shadow-xl backdrop-blur-sm border-2 border-rose-200 overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-2xl"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
              <ShoppingBag size={24} className="text-rose-600" />
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
              <Sparkles size={14} className="animate-pulse" />
              {orders.length} {orders.length === 1 ? 'pedido' : 'pedidos'}
            </span>
          </div>
          
          <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
            Meus Pedidos
          </h1>
          <p className="mt-2 text-sm text-neutral-600 font-medium">
            Acompanhe o status dos seus pedidos feitos no ateliê.
          </p>
        </div>
      </div>

      {/* Lista de pedidos */}
      <div className="space-y-4">
        {orders.map((order) => {
          const dateLabel = formatOrderDate(order);
          const statusInfo = traduzStatus(order.status);
          
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
            <button
              key={order.id}
              type="button"
              onClick={() => router.push(`/account/orders/${order.id}`)}
              className="group w-full rounded-3xl border-2 border-rose-200 bg-white p-6 text-left shadow-lg hover:shadow-2xl hover:border-rose-300 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-start justify-between gap-4">
                {/* Left section */}
                <div className="flex-1 space-y-3">
                  {/* Order number */}
                  <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 p-2 shadow-sm">
                      <Package className="h-5 w-5 text-rose-600" />
                    </div>
                    <h3 className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                      Pedido #{order.code ?? order.orderNumber ?? order.id}
                    </h3>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span className="text-slate-600 font-medium">
                      Realizado em {dateLabel}
                    </span>
                  </div>

                  {/* Status badge */}
                  <div className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-${colors.from} to-${colors.to} border-2 border-${colors.border} px-4 py-1.5 shadow-sm`}>
                    <span className={`w-2 h-2 rounded-full bg-${colors.text}`}></span>
                    <span className={`text-xs font-bold text-${colors.text}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Right section */}
                <div className="flex flex-col items-end gap-3">
                  <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                    {order.totalAmount?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-rose-600 group-hover:gap-2 transition-all">
                    <span>Ver detalhes</span>
                    <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}