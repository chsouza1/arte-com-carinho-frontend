"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Package, ShoppingBag, Wallet } from "lucide-react";
import { useRouter } from "next/navigation";

type Product = {
  id: number;
  name: string;
  stock: number;
  price: number;
  category: string;
  featured?: boolean;
};

type OrderStatus = "PENDING" | "IN_PRODUCTION" | "SHIPPED" | "DELIVERED" | "CANCELLED";

type Order = {
  id: number;
  orderNumber: string;
  customerName: string;
  status: OrderStatus;
  totalAmount: number;
  orderDate: string; // ISO
};

async function fetchProducts(): Promise<Product[]> {
  const res = await api.get("/products", {
    params: { size: 200 },
  });

  const data = res.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.content)) {
    return data.content;
  }

  return [];
}

async function fetchOrders(): Promise<Order[]> {
  const res = await api.get("/orders", {
    params: { size: 200, sort: "orderDate,desc" },
  });

  const data = res.data;

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data.content)) {
    return data.content;
  }

  return [];
}


// async function fetchProducts(): Promise<Product[]> {
//   const res = await api.get("/products", {
//     params: { size: 200 }, // se sua API for paginada, ela vai usar esse param
//   });
//   
//   return res.data.content ?? res.data;
// }

// async function fetchOrders(): Promise<Order[]> {
//   const res = await api.get("/orders", {
//     params: { size: 200, sort: "orderDate,desc" },
//   });
//   return res.data.content ?? res.data;
// }

export default function AdminDashboardPage() {
  const router = useRouter();

  // 🔐 Garante que o token JWT esteja configurado no axios
  useEffect(() => {
    applyAuthFromStorage();
  }, []);

  const {
    data: products,
    isLoading: loadingProducts,
  } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
  });

  const {
    data: orders,
    isLoading: loadingOrders,
  } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrders,
  });

  // 📊 Métricas calculadas no front
  const {
    totalProducts,
    lowStockCount,
    lowStockProducts,
    pendingOrdersCount,
    monthlyRevenue,
    recentOrders,
  } = useMemo(() => {
    const prods = products ?? [];
    const ords = orders ?? [];

    const totalProducts = prods.length;

    const lowStockProducts = prods
      .filter((p) => p.stock !== undefined && p.stock <= 5)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);

    const lowStockCount = lowStockProducts.length;

    const pendingOrders = ords.filter((o) => o.status === "PENDING");
    const pendingOrdersCount = pendingOrders.length;

    // Faturamento do mês: soma pedidos ENTREGUES no mês atual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const deliveredThisMonth = ords.filter((o) => {
      if (!o.orderDate) return false;
      const d = new Date(o.orderDate);
      return (
        o.status === "DELIVERED" &&
        d.getMonth() === currentMonth &&
        d.getFullYear() === currentYear
      );
    });

    const monthlyRevenue = deliveredThisMonth.reduce(
      (acc, o) => acc + (o.totalAmount ?? 0),
      0
    );

    const recentOrders = ords.slice(0, 5);

    return {
      totalProducts,
      lowStockCount,
      lowStockProducts,
      pendingOrdersCount,
      monthlyRevenue,
      recentOrders,
    };
  }, [products, orders]);

  const isLoading = loadingProducts || loadingOrders;

  const monthlyRevenueBRL = monthlyRevenue.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="space-y-8">
      <section className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">
          Painel do Ateliê
        </h1>
        <p className="text-sm text-slate-500">
          Acompanhe estoque, pedidos e faturamento da Arte com Carinho em um só lugar.
        </p>
      </section>

      {/* Cards de métricas */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Package className="h-5 w-5 text-rose-500" />}
          label="Produtos cadastrados"
          value={isLoading ? "…" : totalProducts.toString()}
          helper="Itens do catálogo do ateliê"
        />

        <MetricCard
          icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
          label="Estoque baixo"
          value={isLoading ? "…" : lowStockCount.toString()}
          helper="Produtos com 5 unidades ou menos"
          highlight={lowStockCount > 0}
        />

        <MetricCard
          icon={<ShoppingBag className="h-5 w-5 text-rose-500" />}
          label="Pedidos pendentes"
          value={isLoading ? "…" : pendingOrdersCount.toString()}
          helper="Aguardando produção ou envio"
          highlight={pendingOrdersCount > 0}
        />

        <MetricCard
          icon={<Wallet className="h-5 w-5 text-emerald-500" />}
          label="Faturamento do mês"
          value={isLoading ? "…" : monthlyRevenueBRL}
          helper="Pedidos entregues neste mês"
        />
      </section>

      {/* Duas colunas: pedidos + estoque crítico */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-rose-100 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-800">
              Últimos pedidos
              <span className="text-[11px] font-normal text-slate-400">
                Atualizado em tempo real
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg bg-rose-50" />
                ))}
              </div>
            )}

            {!isLoading && recentOrders.length === 0 && (
              <p className="text-sm text-slate-500">
                Ainda não há pedidos cadastrados.
              </p>
            )}

            {!isLoading && recentOrders.length > 0 && (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border border-rose-50 bg-rose-50/60 px-3 py-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800">
                        {order.orderNumber}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {order.customerName || "Cliente não informado"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">
                        {order.totalAmount.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-white/90 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-sm font-semibold text-slate-800">
              Estoque crítico
              <span className="text-[11px] font-normal text-slate-400">
                Itens com 5 unidades ou menos
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 rounded-lg bg-rose-50" />
                ))}
              </div>
            )}

            {!isLoading && lowStockProducts.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhum produto com estoque crítico no momento. ✨
              </p>
            )}

            {!isLoading && lowStockProducts.length > 0 && (
              <div className="space-y-2">
                {lowStockProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between rounded-lg border border-rose-50 bg-rose-50/60 px-3 py-2 text-xs"
                  >
                    <div className="space-y-0.5">
                      <p className="font-semibold text-slate-800">
                        {product.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Categoria: {product.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-[11px] font-semibold",
                          product.stock <= 2
                            ? "text-rose-600"
                            : "text-amber-600"
                        )}
                      >
                        {product.stock} un.
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {product.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function MetricCard(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(
        "border-rose-100 bg-white/90 shadow-sm",
        props.highlight && "border-amber-300"
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs font-medium text-slate-500">
          {props.label}
        </CardTitle>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose-50">
          {props.icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-lg font-semibold text-slate-900">
          {props.value}
        </div>
        {props.helper && (
          <p className="mt-1 text-[11px] text-slate-500">{props.helper}</p>
        )}
      </CardContent>
    </Card>
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
    <Badge className={cn("mt-1 border-none px-2 py-0.5 text-[10px]", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}
