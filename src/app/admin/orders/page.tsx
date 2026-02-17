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
  Scissors
} from "lucide-react";

type OrderStatus = "PENDING" | "IN_PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type Order = {
  id: number;
  orderNumber: string;
  customerName?: string;
  status: OrderStatus;
  totalAmount: number;
  orderDate: string;
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
    <div className="space-y-8 pb-20">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dashed border-[#D7CCC8] pb-6">
            <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
                    <ShoppingBag className="h-6 w-6 text-[#5D4037]" />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Pedidos do Ateliê</h1>
                    <p className="text-[#8D6E63] italic">Gerencie o fluxo de encomendas.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 bg-[#FFF8E1] px-4 py-2 rounded-sm border border-[#FFE0B2] shadow-sm">
                <Sparkles size={16} className="text-[#F57F17]" />
                <span className="text-sm font-bold text-[#F57F17] uppercase tracking-wider">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
                </span>
            </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-[#D7CCC8] p-6 rounded-sm shadow-sm space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 justify-between items-end">
                <div className="w-full lg:w-1/3">
                    <Label htmlFor="search" className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2 block">
                        Buscar pedido
                    </Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                        <Input
                            id="search"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Número ou nome do cliente..."
                            className="pl-9 bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm h-10"
                        />
                    </div>
                </div>

                <div className="w-full lg:w-auto">
                    <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-3 w-3 text-[#E53935]" />
                        <Label className="text-xs font-bold text-[#8D6E63] uppercase">
                            Filtrar por status
                        </Label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <StatusFilterButton label="Todos" active={statusFilter === "ALL"} onClick={() => setStatusFilter("ALL")} />
                        <StatusFilterButton label="Pendentes" active={statusFilter === "PENDING"} onClick={() => setStatusFilter("PENDING")} />
                        <StatusFilterButton label="Produção" active={statusFilter === "IN_PRODUCTION"} onClick={() => setStatusFilter("IN_PRODUCTION")} />
                        <StatusFilterButton label="Enviados" active={statusFilter === "SHIPPED"} onClick={() => setStatusFilter("SHIPPED")} />
                        <StatusFilterButton label="Entregues" active={statusFilter === "DELIVERED"} onClick={() => setStatusFilter("DELIVERED")} />
                        <StatusFilterButton label="Cancelados" active={statusFilter === "CANCELLED"} onClick={() => setStatusFilter("CANCELLED")} />
                    </div>
                </div>
            </div>
        </div>

        {/* Lista de pedidos */}
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-sm bg-[#EFEBE9]" />
              ))}
            </div>
          )}

          {!isLoading && filteredOrders.length === 0 && (
            <div className="p-12 text-center border-2 border-dashed border-[#D7CCC8] rounded-sm bg-[#FAF7F5]">
                <Package className="mx-auto h-12 w-12 text-[#D7CCC8] mb-4" />
                <p className="text-lg font-serif text-[#5D4037]">Nenhum pedido encontrado</p>
                <p className="text-sm text-[#8D6E63]">Tente ajustar os filtros.</p>
            </div>
          )}

          {!isLoading &&
            filteredOrders.map((order) => (
              <div
                key={order.id}
                className="group relative bg-white border border-[#D7CCC8] rounded-sm shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
              >
                {/* Faixa lateral decorativa */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E53935] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <div className="flex flex-col lg:flex-row">
                    {/* Cabeçalho do Card */}
                    <div className="flex-1 p-6 border-b lg:border-b-0 lg:border-r border-[#EFEBE9]">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <span className="font-mono text-lg font-bold text-[#5D4037] bg-[#FAF7F5] px-2 py-1 rounded-sm border border-[#EFEBE9]">
                                    #{order.orderNumber}
                                </span>
                                <OrderStatusBadge status={order.status} />
                            </div>
                            <span className="text-xl font-serif font-bold text-[#E53935]">
                                {order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <p className="font-bold text-[#5D4037] text-lg">{order.customerName || "Cliente não informado"}</p>
                            <div className="flex flex-wrap gap-4 text-xs text-[#8D6E63] mt-2">
                                <span className="flex items-center gap-1 bg-[#FAF7F5] px-2 py-1 rounded-sm">
                                    <Calendar size={12} /> {formatDate(order.orderDate)}
                                </span>
                                {order.expectedDeliveryDate && (
                                    <span className="flex items-center gap-1 bg-[#FFF8E1] text-[#F57F17] px-2 py-1 rounded-sm border border-[#FFE0B2]">
                                        <Truck size={12} /> Previsão: {formatDate(order.expectedDeliveryDate)}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="p-4 lg:w-64 bg-[#FAF7F5]/50 flex flex-col justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full justify-start h-9 text-xs border-[#D7CCC8] text-[#5D4037] hover:bg-white"
                            onClick={() => window.open(`/admin/orders/${order.id}/print`, "_blank")}
                        >
                            <FileText className="mr-2 h-3.5 w-3.5" />
                            Imprimir Ficha
                        </Button>
                        
                        <div className="h-px bg-[#D7CCC8] border-dashed my-1"></div>

                        <StatusActionButtons
                            order={order}
                            onChangeStatus={handleChangeStatus}
                            onCancel={handleCancel}
                            loading={updateStatusMutation.isPending || cancelOrderMutation.isPending}
                        />
                    </div>
                </div>
              </div>
            ))}
        </div>
    </div>
  );
}

function StatusFilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-all",
        active
          ? "bg-[#5D4037] text-white border-[#5D4037]"
          : "bg-white text-[#8D6E63] border-[#D7CCC8] hover:border-[#5D4037] hover:text-[#5D4037]"
      )}
    >
      {label}
    </button>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const map: Record<OrderStatus, { label: string; className: string }> = {
    PENDING: { label: "Pendente", className: "bg-[#FFF8E1] text-[#F57F17] border-[#FFE0B2]" },
    IN_PRODUCTION: { label: "Em produção", className: "bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]" },
    SHIPPED: { label: "Enviado", className: "bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]" },
    DELIVERED: { label: "Entregue", className: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]" },
    CANCELLED: { label: "Cancelado", className: "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]" },
  };

  const cfg = map[status];
  return <span className={cn("px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border", cfg.className)}>{cfg.label}</span>;
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
          size="sm"
          className="w-full justify-start h-9 text-xs bg-[#E3F2FD] text-[#1565C0] border border-[#BBDEFB] hover:bg-[#BBDEFB] font-bold"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "IN_PRODUCTION")}
        >
          <Scissors className="mr-2 h-3.5 w-3.5" />
          Produzir
        </Button>
      )}

      {order.status === "IN_PRODUCTION" && (
        <Button
          size="sm"
          className="w-full justify-start h-9 text-xs bg-[#F3E5F5] text-[#7B1FA2] border border-[#E1BEE7] hover:bg-[#E1BEE7] font-bold"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "SHIPPED")}
        >
          <Truck className="mr-2 h-3.5 w-3.5" />
          Enviar
        </Button>
      )}

      {order.status === "SHIPPED" && (
        <Button
          size="sm"
          className="w-full justify-start h-9 text-xs bg-[#E8F5E9] text-[#2E7D32] border border-[#C8E6C9] hover:bg-[#C8E6C9] font-bold"
          disabled={disabled}
          onClick={() => onChangeStatus(order, "DELIVERED")}
        >
          <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
          Entregar
        </Button>
      )}

      {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start h-9 text-xs text-[#C62828] hover:bg-[#FFEBEE] font-bold"
          disabled={disabled}
          onClick={() => onCancel(order)}
        >
          <XCircle className="mr-2 h-3.5 w-3.5" />
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