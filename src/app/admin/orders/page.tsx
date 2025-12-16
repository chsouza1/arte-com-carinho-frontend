"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Filter,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Search,
  Sparkles,
} from "lucide-react";

type OrderStatus = "PENDING" | "IN_PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type Order = {
  id: number;
  orderNumber: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  orderDate: string; // ISO
  expectedDeliveryDate?: string;
};

async function fetchOrders(): Promise<Order[]> {
  const res = await api.get("/orders", {
    params: { size: 200, sort: "orderDate,desc" },
  });
  return res.data.content ?? res.data;
}

export default function AdminOrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  useEffect(() => {
    applyAuthFromStorage();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrders,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL">("ALL");

  const filteredOrders = useMemo(() => {
    const list = data ?? [];
    return list.filter((o) => {
      const matchesSearch =
        search.trim().length === 0 ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (o.customerName ?? "")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "ALL" ? true : o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [data, search, statusFilter]);

// Atualizar status
const updateStatusMutation = useMutation({
  mutationFn: async (payload: { id: number; status: OrderStatus }) => {
    // backend: PATCH /api/orders/{id}/status?status=IN_PRODUCTION
    await api.patch(`/orders/${payload.id}/status`, null, {
      params: { status: payload.status },
    });
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
  },
});


  // Cancelar pedido
const cancelOrderMutation = useMutation({
  mutationFn: async (id: number) => {
    // backend: DELETE /api/orders/{id}
    await api.delete(`/orders/${id}`);
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
  },
});

  function handleChangeStatus(order: Order, newStatus: OrderStatus) {
    if (order.status === "CANCELLED") return;
    updateStatusMutation.mutate({ id: order.id, status: newStatus });
  }

  function handleCancel(order: Order) {
    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      alert("Não é possível cancelar um pedido já entregue ou cancelado.");
      return;
    }
    if (
      window.confirm(
        `Tem certeza que deseja cancelar o pedido ${order.orderNumber}?`
      )
    ) {
      cancelOrderMutation.mutate(order.id);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Cabeçalho */}
        <section className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
                <ShoppingBag size={24} className="text-rose-600" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
                <Sparkles size={14} className="animate-pulse" /> {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Pedidos do Ateliê
            </h1>
            <p className="mt-3 text-base text-neutral-600 font-medium">
              Acompanhe o fluxo de pedidos, atualize o status e mantenha o cliente informado.
            </p>
          </div>
        </section>

        {/* Filtros */}
        <section className="rounded-[2rem] bg-white/80 backdrop-blur-sm p-6 shadow-lg border-2 border-rose-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            {/* Busca */}
            <div className="flex-1">
              <Label htmlFor="search" className="text-xs font-bold text-slate-700 mb-2 block">
                Buscar pedido
              </Label>
              <div className="relative flex items-center">
                <Search className="absolute left-4 h-5 w-5 text-rose-400" />
                <Input
                  id="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Procure por número do pedido ou cliente..."
                  className="h-12 pl-12 rounded-2xl border-2 border-rose-200 text-sm font-medium focus:border-rose-400 transition-colors"
                />
              </div>
            </div>

            {/* Filtros de status */}
            <div className="lg:w-auto">
              <div className="flex items-center gap-2 mb-2">
                <Filter className="h-4 w-4 text-rose-500" />
                <Label className="text-xs font-bold text-slate-700">
                  Filtrar por status
                </Label>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusFilterButton
                  label="Todos"
                  active={statusFilter === "ALL"}
                  onClick={() => setStatusFilter("ALL")}
                />
                <StatusFilterButton
                  label="Pendentes"
                  active={statusFilter === "PENDING"}
                  onClick={() => setStatusFilter("PENDING")}
                />
                <StatusFilterButton
                  label="Produção"
                  active={statusFilter === "IN_PRODUCTION"}
                  onClick={() => setStatusFilter("IN_PRODUCTION")}
                />
                <StatusFilterButton
                  label="Enviados"
                  active={statusFilter === "SHIPPED"}
                  onClick={() => setStatusFilter("SHIPPED")}
                />
                <StatusFilterButton
                  label="Entregues"
                  active={statusFilter === "DELIVERED"}
                  onClick={() => setStatusFilter("DELIVERED")}
                />
                <StatusFilterButton
                  label="Cancelados"
                  active={statusFilter === "CANCELLED"}
                  onClick={() => setStatusFilter("CANCELLED")}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Lista de pedidos */}
        <section className="space-y-5">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-32 rounded-3xl bg-rose-100"
                />
              ))}
            </div>
          )}

          {!isLoading && filteredOrders.length === 0 && (
            <div className="rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-16 shadow-xl backdrop-blur-sm border border-white/50 text-center">
              <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
                <ShoppingBag className="h-10 w-10 text-rose-400" />
              </div>
              <p className="text-base font-semibold text-neutral-700 mb-2">
                Nenhum pedido encontrado
              </p>
              <p className="text-sm text-neutral-500">
                Ajuste os filtros ou faça uma nova busca
              </p>
            </div>
          )}

          {!isLoading &&
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className="group rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:border-rose-300 transition-all duration-300"
              >
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between border-b-2 border-rose-100 bg-gradient-to-r from-rose-50/50 to-pink-50/50">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2 shadow-md">
                        <Package className="h-5 w-5 text-rose-600" />
                      </div>
                      <CardTitle className="text-base font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                        {order.orderNumber}
                      </CardTitle>
                    </div>
                    <p className="text-sm text-slate-600 font-semibold pl-12">
                      {order.customerName || "Cliente não informado"}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                      {order.totalAmount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                </CardHeader>

                <CardContent className="space-y-5 pt-6">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-50 to-pink-50 px-4 py-2 border-2 border-rose-100">
                      <Calendar className="h-4 w-4 text-rose-500" />
                      <span className="text-xs font-bold text-slate-700">
                        Pedido em {formatDate(order.orderDate)}
                      </span>
                    </div>
                    {order.expectedDeliveryDate && (
                      <div className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 px-4 py-2 border-2 border-emerald-100">
                        <Truck className="h-4 w-4 text-emerald-500" />
                        <span className="text-xs font-bold text-slate-700">
                          Previsão: {formatDate(order.expectedDeliveryDate)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-3 border-t-2 border-rose-100 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-100 to-sky-100 px-4 py-2 border-2 border-blue-200">
                        <ShoppingBag className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-bold text-blue-700">
                          {order.status === "PENDING" ? "Aguardando produção" : "Em fluxo"}
                        </span>
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 rounded-xl border-2 border-slate-200 text-xs font-bold hover:bg-slate-50 hover:border-slate-300 transition-all"
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API_URL}/orders/${order.id}/pdf`, "_blank")}
                      >
                        <FileText className="mr-1.5 h-3.5 w-3.5" />
                        Ver PDF
                      </Button>
                      <StatusActionButtons
                        order={order}
                        onChangeStatus={handleChangeStatus}
                        onCancel={handleCancel}
                        loading={
                          updateStatusMutation.isPending ||
                          cancelOrderMutation.isPending
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </section>
      </div>
    </div>
  );
}

function StatusFilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full px-4 py-2 text-xs font-bold transition-all border-2",
        active
          ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30 border-transparent scale-105"
          : "bg-white text-slate-600 hover:bg-rose-50 border-rose-200 hover:border-rose-300"
      )}
    >
      {label}
    </button>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<
    OrderStatus,
    { label: string; className: string }
  > = {
    PENDING: { label: "Pendente", className: "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border-amber-200" },
    IN_PRODUCTION: {
      label: "Em produção",
      className: "bg-gradient-to-r from-sky-100 to-blue-100 text-sky-700 border-sky-200",
    },
    SHIPPED: { label: "Enviado", className: "bg-gradient-to-r from-violet-100 to-purple-100 text-violet-700 border-violet-200" },
    DELIVERED: { label: "Entregue", className: "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200" },
    CANCELLED: { label: "Cancelado", className: "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-600 border-slate-200" },
  };

  const cfg = map[status];

  return (
    <Badge className={cn("border-2 px-4 py-1.5 text-xs font-bold shadow-sm", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}

function StatusActionButtons({
  order,
  onChangeStatus,
  onCancel,
  loading,
}: {
  order: Order;
  onChangeStatus: (order: Order, status: OrderStatus) => void;
  onCancel: (order: Order) => void;
  loading: boolean;
}) {
  const disabled = loading || order.status === "CANCELLED";

  return (
    <>
      {order.status === "PENDING" && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-2 border-sky-200 bg-gradient-to-r from-sky-50 to-blue-50 text-xs font-bold text-sky-700 hover:from-sky-100 hover:to-blue-100 transition-all shadow-sm"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "IN_PRODUCTION")}
        >
          <Clock className="mr-1.5 h-3.5 w-3.5" />
          Iniciar Produção
        </Button>
      )}

      {order.status === "IN_PRODUCTION" && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-2 border-violet-200 bg-gradient-to-r from-violet-50 to-purple-50 text-xs font-bold text-violet-700 hover:from-violet-100 hover:to-purple-100 transition-all shadow-sm"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "SHIPPED")}
        >
          <Truck className="mr-1.5 h-3.5 w-3.5" />
          Marcar Enviado
        </Button>
      )}

      {order.status === "SHIPPED" && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-2 border-emerald-200 bg-gradient-to-r from-emerald-50 to-green-50 text-xs font-bold text-emerald-700 hover:from-emerald-100 hover:to-green-100 transition-all shadow-sm"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "DELIVERED")}
        >
          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" />
          Confirmar Entrega
        </Button>
      )}

      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 rounded-xl border-2 border-rose-200 bg-gradient-to-r from-rose-50 to-pink-50 text-xs font-bold text-rose-700 hover:from-rose-100 hover:to-pink-100 transition-all shadow-sm"
          disabled={disabled}
          onClick={() => onCancel(order)}
        >
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          Cancelar
        </Button>
      )}
    </>
  );
}

function formatDate(iso: string | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR");
}