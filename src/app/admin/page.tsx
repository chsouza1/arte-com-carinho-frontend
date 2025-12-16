"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertTriangle, Package, ShoppingBag, Wallet, TrendingUp, Sparkles } from "lucide-react";
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
  orderDate: string;
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
    queryKey: ["admin", "dashboard-products"],
    queryFn: fetchProducts,
  });

  const {
    data: orders,
    isLoading: loadingOrders,
  } = useQuery({
    queryKey: ["admin", "dashboard-orders"],
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
    const prods = Array.isArray(products) ? products : [];
    const ords = Array.isArray(orders) ? orders : [];

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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* HEADER */}
        <section className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30 mb-4">
              <Sparkles size={14} className="animate-pulse" /> Painel administrativo
            </span>
            
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Painel Administrativo da empresa.
            </h1>
            <p className="mt-3 text-base text-neutral-600 font-medium">
              Acompanhe estoque, pedidos e faturamento da Arte com Carinho em um só lugar.
            </p>
          </div>
        </section>

        {/* Cards de métricas */}
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Package className="h-6 w-6 text-rose-500" />}
            label="Produtos cadastrados"
            value={isLoading ? "…" : totalProducts.toString()}
            helper="Itens do catálogo do ateliê"
            isLoading={isLoading}
          />

          <MetricCard
            icon={<AlertTriangle className="h-6 w-6 text-amber-500" />}
            label="Estoque baixo"
            value={isLoading ? "…" : lowStockCount.toString()}
            helper="Produtos com 5 unidades ou menos"
            highlight={lowStockCount > 0}
            isLoading={isLoading}
          />

          <MetricCard
            icon={<ShoppingBag className="h-6 w-6 text-blue-500" />}
            label="Pedidos pendentes"
            value={isLoading ? "…" : pendingOrdersCount.toString()}
            helper="Aguardando produção ou envio"
            highlight={pendingOrdersCount > 0}
            isLoading={isLoading}
          />

          <MetricCard
            icon={<Wallet className="h-6 w-6 text-emerald-500" />}
            label="Faturamento do mês"
            value={isLoading ? "…" : monthlyRevenueBRL}
            helper="Pedidos entregues neste mês"
            isLoading={isLoading}
          />
        </section>

        {/* Duas colunas: pedidos + estoque crítico */}
        <section className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2.5 shadow-md">
                    <ShoppingBag className="h-5 w-5 text-rose-600" />
                  </div>
                  <span className="text-base font-bold text-slate-800">
                    Últimos pedidos
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
                  Tempo real
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading && (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-2xl bg-rose-50" />
                  ))}
                </div>
              )}

              {!isLoading && recentOrders.length === 0 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-3">
                    <ShoppingBag className="h-8 w-8 text-rose-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    Ainda não há pedidos cadastrados.
                  </p>
                </div>
              )}

              {!isLoading && recentOrders.length > 0 && (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="group flex items-center justify-between rounded-2xl border-2 border-rose-100 bg-gradient-to-br from-white to-rose-50/30 p-4 hover:shadow-lg hover:border-rose-200 transition-all duration-300"
                    >
                      <div className="space-y-1.5">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-rose-600 transition-colors">
                          {order.orderNumber}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {order.customerName || "Cliente não informado"}
                        </p>
                      </div>
                      <div className="text-right space-y-1.5">
                        <p className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
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

          <Card className="rounded-3xl border-2 border-amber-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b-2 border-amber-100">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2.5 shadow-md">
                    <AlertTriangle className="h-5 w-5 text-amber-600" />
                  </div>
                  <span className="text-base font-bold text-slate-800">
                    Estoque crítico
                  </span>
                </div>
                <span className="text-xs font-medium text-slate-500 bg-white px-3 py-1.5 rounded-full shadow-sm">
                  ≤ 5 unidades
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {isLoading && (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-2xl bg-amber-50" />
                  ))}
                </div>
              )}

              {!isLoading && lowStockProducts.length === 0 && (
                <div className="text-center py-8">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mb-3">
                    <Package className="h-8 w-8 text-emerald-500" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    Nenhum produto com estoque crítico! ✨
                  </p>
                </div>
              )}

              {!isLoading && lowStockProducts.length > 0 && (
                <div className="space-y-3">
                  {lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="group flex items-center justify-between rounded-2xl border-2 border-amber-100 bg-gradient-to-br from-white to-amber-50/30 p-4 hover:shadow-lg hover:border-amber-200 transition-all duration-300"
                    >
                      <div className="space-y-1.5 flex-1 mr-4">
                        <p className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors line-clamp-1">
                          {product.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {product.category}
                        </p>
                      </div>
                      <div className="text-right space-y-1.5">
                        <p
                          className={cn(
                            "text-sm font-black",
                            product.stock <= 2
                              ? "text-rose-600"
                              : "text-amber-600"
                          )}
                        >
                          {product.stock} un.
                        </p>
                        <p className="text-xs text-slate-500 font-semibold">
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
    </div>
  );
}

function MetricCard(props: {
  icon: React.ReactNode;
  label: string;
  value: string;
  helper?: string;
  highlight?: boolean;
  isLoading?: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative rounded-3xl border-2 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1",
        props.highlight ? "border-amber-300 bg-gradient-to-br from-white to-amber-50/30" : "border-rose-200 bg-gradient-to-br from-white to-rose-50/30"
      )}
    >
      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 hover:from-rose-500/5 hover:to-pink-500/5 transition-all duration-300 pointer-events-none"></div>
      
      <CardHeader className="relative z-10 flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className="text-sm font-bold text-slate-600">
          {props.label}
        </CardTitle>
        <div className={cn(
          "flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg",
          props.highlight ? "bg-gradient-to-br from-amber-100 to-orange-100" : "bg-gradient-to-br from-rose-100 to-pink-100"
        )}>
          {props.icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        {props.isLoading ? (
          <Skeleton className="h-8 w-24 rounded-lg bg-rose-100" />
        ) : (
          <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
            {props.value}
          </div>
        )}
        {props.helper && (
          <p className="mt-2 text-xs text-slate-500 font-medium leading-relaxed">{props.helper}</p>
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
    <Badge className={cn("border-2 px-3 py-1 text-[10px] font-bold shadow-sm", cfg.className)}>
      {cfg.label}
    </Badge>
  );
}