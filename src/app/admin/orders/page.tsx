"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  Filter,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Search,
  Sparkles,
  Scissors,
  Trash2,
  Printer
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
  const queryClient = useQueryClient();

  useEffect(() => {
    applyAuthFromStorage();
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrders,
  });

  const [search, setSearch] = useState("");
  // Abre por padrão apenas nos pedidos ATIVOS para limpar a tela
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "ALL" | "ACTIVE">("ACTIVE");

  const filteredOrders = useMemo(() => {
    const list = data ?? [];
    return list.filter((o) => {
      const matchesSearch =
        search.trim().length === 0 ||
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (o.customerName ?? "").toLowerCase().includes(search.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === "ACTIVE") {
          matchesStatus = ["PENDING", "IN_PRODUCTION", "SHIPPED"].includes(o.status);
      } else if (statusFilter !== "ALL") {
          matchesStatus = o.status === statusFilter;
      }
      
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

  // Cancelar/Excluir pedido
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
      alert("Não é possível excluir um pedido já entregue ou cancelado.");
      return;
    }
    if (window.confirm(`Tem certeza que deseja EXCLUIR o pedido #${order.orderNumber} da lista? O estoque será devolvido.`)) {
      cancelOrderMutation.mutate(order.id);
    }
  }

  return (
    <div className="space-y-6 pb-20">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 border border-[#D7CCC8] rounded-sm shadow-sm">
            <div className="flex items-center gap-4">
                <div className="bg-[#FAF7F5] p-3 rounded-full border border-[#D7CCC8]">
                    <ShoppingBag className="h-6 w-6 text-[#E53935]" />
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#5D4037]">Pedidos do Ateliê</h1>
                    <p className="text-sm text-[#8D6E63]">Gerencie e organize suas encomendas.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 bg-[#FFF8E1] px-4 py-2 rounded-sm border border-[#FFE0B2] shadow-sm">
                <Sparkles size={16} className="text-[#F57F17]" />
                <span className="text-sm font-bold text-[#F57F17] uppercase tracking-wider">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'visível' : 'visíveis'}
                </span>
            </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-[#D7CCC8] p-5 rounded-sm shadow-sm flex flex-col lg:flex-row gap-5 justify-between items-end">
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
                    <Label className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">
                        Visualização
                    </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                    <StatusFilterButton label="Ativos" active={statusFilter === "ACTIVE"} onClick={() => setStatusFilter("ACTIVE")} />
                    <StatusFilterButton label="Todos" active={statusFilter === "ALL"} onClick={() => setStatusFilter("ALL")} />
                    <StatusFilterButton label="Pendentes" active={statusFilter === "PENDING"} onClick={() => setStatusFilter("PENDING")} />
                    <StatusFilterButton label="Produção" active={statusFilter === "IN_PRODUCTION"} onClick={() => setStatusFilter("IN_PRODUCTION")} />
                    <StatusFilterButton label="Enviados" active={statusFilter === "SHIPPED"} onClick={() => setStatusFilter("SHIPPED")} />
                    <StatusFilterButton label="Entregues" active={statusFilter === "DELIVERED"} onClick={() => setStatusFilter("DELIVERED")} />
                    <StatusFilterButton label="Excluídos" active={statusFilter === "CANCELLED"} onClick={() => setStatusFilter("CANCELLED")} />
                </div>
            </div>
        </div>

        {/* Tabela de Pedidos (Muito mais compacta e limpa) */}
        <div className="bg-white border border-[#D7CCC8] rounded-sm shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 rounded-sm bg-[#EFEBE9] w-full" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-16 text-center bg-[#FAF7F5]">
                <Package className="mx-auto h-12 w-12 text-[#D7CCC8] mb-4" />
                <p className="text-lg font-serif text-[#5D4037]">Nenhum pedido encontrado</p>
                <p className="text-sm text-[#8D6E63] mt-1">Tente ajustar os filtros acima.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#FAF7F5] border-b border-[#D7CCC8] text-xs uppercase tracking-wider text-[#8D6E63]">
                        <tr>
                            <th className="px-6 py-4 font-bold">Pedido</th>
                            <th className="px-6 py-4 font-bold">Cliente</th>
                            <th className="px-6 py-4 font-bold">Data</th>
                            <th className="px-6 py-4 font-bold">Valor</th>
                            <th className="px-6 py-4 font-bold">Status</th>
                            <th className="px-6 py-4 font-bold text-center">Ações Rápidas</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEBE9]">
                        {filteredOrders.map((order) => {
                            const isProcessing = updateStatusMutation.isPending || cancelOrderMutation.isPending;
                            
                            return (
                                <tr key={order.id} className="hover:bg-[#FAF7F5] transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="font-mono font-bold text-[#E53935]">#{order.orderNumber}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-[#5D4037]">{order.customerName || "Não informado"}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-[#8D6E63]">
                                        {formatDate(order.orderDate)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-bold text-[#5D4037]">
                                        {order.totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <OrderStatusBadge status={order.status} />
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            
                                            {/* Botão de Avançar Status (Muda ícone dinamicamente) */}
                                            {order.status === "PENDING" && (
                                                <button onClick={() => handleChangeStatus(order, "IN_PRODUCTION")} disabled={isProcessing} className="p-2 bg-[#E3F2FD] text-[#1565C0] hover:bg-[#BBDEFB] rounded-sm border border-[#BBDEFB] transition-colors" title="Iniciar Produção">
                                                    <Scissors size={16} />
                                                </button>
                                            )}
                                            {order.status === "IN_PRODUCTION" && (
                                                <button onClick={() => handleChangeStatus(order, "SHIPPED")} disabled={isProcessing} className="p-2 bg-[#F3E5F5] text-[#7B1FA2] hover:bg-[#E1BEE7] rounded-sm border border-[#E1BEE7] transition-colors" title="Marcar como Enviado">
                                                    <Truck size={16} />
                                                </button>
                                            )}
                                            {order.status === "SHIPPED" && (
                                                <button onClick={() => handleChangeStatus(order, "DELIVERED")} disabled={isProcessing} className="p-2 bg-[#E8F5E9] text-[#2E7D32] hover:bg-[#C8E6C9] rounded-sm border border-[#C8E6C9] transition-colors" title="Marcar como Entregue">
                                                    <CheckCircle2 size={16} />
                                                </button>
                                            )}

                                            {/* Imprimir Ficha */}
                                            <button 
                                                onClick={() => window.open(`/admin/orders/${order.id}/print`, "_blank")} 
                                                className="p-2 bg-white text-[#5D4037] hover:bg-[#EFEBE9] rounded-sm border border-[#D7CCC8] transition-colors" 
                                                title="Imprimir Ficha"
                                            >
                                                <Printer size={16} />
                                            </button>

                                            {/* Botão de Excluir / Cancelar (Lixeira) */}
                                            {order.status !== "CANCELLED" && order.status !== "DELIVERED" && (
                                                <button 
                                                    onClick={() => handleCancel(order)} 
                                                    disabled={isProcessing} 
                                                    className="p-2 bg-white text-[#C62828] hover:bg-[#FFEBEE] rounded-sm border border-[#FFCDD2] transition-colors" 
                                                    title="Excluir/Cancelar Pedido"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
          )}
        </div>
    </div>
  );
}

// --- COMPONENTES AUXILIARES ---

function StatusFilterButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-sm border transition-all shadow-sm",
        active
          ? "bg-[#E53935] text-white border-[#E53935]"
          : "bg-white text-[#8D6E63] border-[#D7CCC8] hover:border-[#A1887F] hover:text-[#5D4037]"
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
    CANCELLED: { label: "Cancelado/Excluído", className: "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]" },
  };

  const cfg = map[status];
  return <span className={cn("px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm border", cfg.className)}>{cfg.label}</span>;
}

function formatDate(iso: string | undefined) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}