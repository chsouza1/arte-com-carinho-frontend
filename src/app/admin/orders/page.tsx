"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, setAuthToken } from "@/lib/api";
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

  // 🔐 Garante que só entra aqui quem tem token
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("arte_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setAuthToken(token);
  }, [router]);

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

  // 🔁 Atualizar status
  const updateStatusMutation = useMutation({
    mutationFn: async (payload: { id: number; status: OrderStatus }) => {
      // aqui depende de como teu controller está mapeado; ajusta se necessário
      await api.put(`/orders/${payload.id}/status`, null, {
        params: { newStatus: payload.status },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });

  // ❌ Cancelar pedido
  const cancelOrderMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.post(`/orders/${id}/cancel`);
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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Pedidos do ateliê
          </h1>
          <p className="text-sm text-slate-500">
            Acompanhe o fluxo de pedidos, atualize o status e mantenha o cliente
            informado.
          </p>
        </div>
      </section>

      {/* Filtros */}
      <section className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Label htmlFor="search" className="text-xs text-slate-500">
            Buscar
          </Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procure por número do pedido ou cliente..."
            className="h-8 text-xs"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Filter className="h-3.5 w-3.5 text-slate-400" />
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
            label="Em produção"
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
      </section>

      {/* Lista de pedidos */}
      <section className="space-y-3">
        {isLoading && (
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <Skeleton
                key={i}
                className="h-20 rounded-xl bg-rose-50"
              />
            ))}
          </div>
        )}

        {!isLoading && filteredOrders.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhum pedido encontrado com os filtros atuais.
          </p>
        )}

        {!isLoading &&
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="border-rose-100 bg-white/95 shadow-sm"
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-semibold text-slate-900">
                    {order.orderNumber}
                  </CardTitle>
                  <p className="text-[11px] text-slate-500">
                    {order.customerName || "Cliente não informado"}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-xs font-semibold text-rose-600">
                    {order.totalAmount.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <OrderStatusBadge status={order.status} />
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center gap-3 text-slate-500">
                  <div className="inline-flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-rose-400" />
                    <span>
                      Pedido em{" "}
                      {formatDate(order.orderDate)}
                    </span>
                  </div>
                  {order.expectedDeliveryDate && (
                    <div className="inline-flex items-center gap-1.5">
                      <Truck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>
                        Previsão de entrega:{" "}
                        {formatDate(order.expectedDeliveryDate)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 border-t border-rose-50 pt-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-600">
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5">
                      <ShoppingBag className="h-3 w-3 text-rose-500" />
                      <span>{order.status === "PENDING" ? "Aguardando produção" : "Em fluxo"}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
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
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium transition",
        active
          ? "bg-rose-500 text-white shadow-sm"
          : "bg-slate-50 text-slate-600 hover:bg-rose-50"
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
    PENDING: { label: "Pendente", className: "bg-amber-50 text-amber-700" },
    IN_PRODUCTION: {
      label: "Em produção",
      className: "bg-sky-50 text-sky-700",
    },
    SHIPPED: { label: "Enviado", className: "bg-violet-50 text-violet-700" },
    DELIVERED: { label: "Entregue", className: "bg-emerald-50 text-emerald-700" },
    CANCELLED: { label: "Cancelado", className: "bg-slate-100 text-slate-500" },
  };

  const cfg = map[status];

  return (
    <Badge className={cn("border-none px-2 py-0.5 text-[10px]", cfg.className)}>
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
          className="h-7 border-sky-200 bg-sky-50 text-[11px] text-sky-700 hover:bg-sky-100"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "IN_PRODUCTION")}
        >
          <Clock className="mr-1 h-3 w-3" />
          Produção
        </Button>
      )}

      {order.status === "IN_PRODUCTION" && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-violet-200 bg-violet-50 text-[11px] text-violet-700 hover:bg-violet-100"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "SHIPPED")}
        >
          <Truck className="mr-1 h-3 w-3" />
          Enviar
        </Button>
      )}

      {order.status === "SHIPPED" && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-emerald-200 bg-emerald-50 text-[11px] text-emerald-700 hover:bg-emerald-100"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "DELIVERED")}
        >
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Entregar
        </Button>
      )}

      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 border-rose-200 bg-rose-50 text-[11px] text-rose-700 hover:bg-rose-100"
          disabled={disabled}
          onClick={() => onCancel(order)}
        >
          <XCircle className="mr-1 h-3 w-3" />
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
