// src/app/admin/customers/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { OrderSummary } from "@/lib/orders";
import { Calendar, Users, Search, ShoppingBag, DollarSign, Clock, Sparkles } from "lucide-react";

type CustomerSummary = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  createdAt?: string | null;
};

type CustomerKpi = {
  customerId: number;
  ordersCount: number;
  totalRevenue: number;
  lastOrderDate?: string | null;
};

type CustomerWithKpi = CustomerSummary & { kpi?: CustomerKpi };

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
};

async function fetchCustomers(): Promise<CustomerSummary[]> {
  const res = await api.get<CustomerSummary[]>("/customers/admin");
  return res.data;
}

async function fetchCustomerKpis(): Promise<CustomerKpi[]> {
  const res = await api.get<CustomerKpi[]>("/customers/admin/kpis");
  return res.data;
}

async function fetchOrdersByCustomer(customerId: number): Promise<OrderSummary[]> {
  const res = await api.get<PageResponse<OrderSummary>>(
    `/orders/customer/${customerId}`,
    { params: { size: 50, sort: "orderDate,desc" } }
  );

  return (res.data as any).content ?? (res.data as any);
}

export default function AdminCustomersPage() {
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithKpi | null>(null);

  useEffect(() => {
    applyAuthFromStorage();
  }, []);

  const {
    data: customers,
    isLoading: loadingCustomers,
    isError,
  } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: fetchCustomers,
  });

  const { data: kpis } = useQuery({
    queryKey: ["admin", "customers-kpis"],
    queryFn: fetchCustomerKpis,
  });

  const {
    data: customerOrders,
    isLoading: loadingOrders,
  } = useQuery({
    queryKey: ["admin", "customer-orders", selectedCustomer?.id],
    queryFn: () =>
      selectedCustomer ? fetchOrdersByCustomer(selectedCustomer.id) : [],
    enabled: !!selectedCustomer,
  });

  const customersWithKpis = useMemo<CustomerWithKpi[]>(() => {
    const list = customers ?? [];
    const map = new Map<number, CustomerKpi>();
    (kpis ?? []).forEach((k) => map.set(k.customerId, k));

    return list.map((c) => ({
      ...c,
      kpi: map.get(c.id),
    }));
  }, [customers, kpis]);

  const filteredCustomers = useMemo<CustomerWithKpi[]>(() => {
    const list = customersWithKpis;
    if (!search.trim()) return list;

    const term = search.toLowerCase();
    return list.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        (c.email ?? "").toLowerCase().includes(term) ||
        (c.phone ?? "").toLowerCase().includes(term)
    );
  }, [customersWithKpis, search]);

  function formatDate(iso?: string | null) {
    if (!iso) return "-";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("pt-BR");
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500">
              Clientes
            </h1>
            <p className="mt-3 text-sm font-semibold text-rose-600">
              Ocorreu um erro ao carregar os clientes. Verifique se está logado como admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Cabeçalho */}
        <section className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
                <Users size={24} className="text-rose-600" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
                <Sparkles size={14} className="animate-pulse" />
                {filteredCustomers.length} {filteredCustomers.length === 1 ? 'cliente' : 'clientes'}
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Base de Clientes
            </h1>
            <p className="mt-3 text-base text-neutral-600 font-medium">
              Visualize a base de clientes e acompanhe os pedidos de cada um.
            </p>
          </div>
        </section>

        {/* Layout: esquerda = clientes, direita = pedidos */}
        <section className="grid gap-8 lg:grid-cols-2">
          {/* Lista de clientes */}
          <Card className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100">
              <CardTitle className="flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2.5 shadow-md">
                    <Users className="h-5 w-5 text-rose-600" />
                  </div>
                  <span className="text-base font-bold text-slate-800">
                    Lista de Clientes
                  </span>
                </div>

                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-rose-400" />
                  <Input
                    placeholder="Buscar por nome, e-mail ou telefone..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="h-12 pl-12 rounded-2xl border-2 border-rose-200 text-sm font-medium focus:border-rose-400 transition-colors"
                  />
                </div>
              </CardTitle>
            </CardHeader>

            <CardContent className="p-6 max-h-[calc(100vh-24rem)] overflow-y-auto">
              {loadingCustomers && (
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-32 rounded-2xl bg-rose-100" />
                  ))}
                </div>
              )}

              {!loadingCustomers && filteredCustomers.length === 0 && (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
                    <Users className="h-8 w-8 text-rose-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    Nenhum cliente encontrado
                  </p>
                </div>
              )}

              {!loadingCustomers &&
                filteredCustomers.map((customer) => {
                  const isSelected = selectedCustomer?.id === customer.id;

                  return (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => setSelectedCustomer(customer)}
                      className={cn(
                        "w-full rounded-2xl border-2 p-5 text-left transition-all duration-300 mb-3",
                        isSelected
                          ? "border-rose-400 bg-gradient-to-br from-rose-50 to-pink-50 shadow-lg scale-[1.02]"
                          : "border-rose-100 bg-white hover:bg-rose-50/50 hover:border-rose-200 hover:shadow-md"
                      )}
                    >
                      <div className="space-y-3">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-black text-base text-slate-900 truncate">
                              {customer.name}
                            </h3>
                            <p className="text-xs text-slate-600 font-medium truncate mt-1">
                              {customer.email}
                            </p>
                            {customer.phone && (
                              <p className="text-xs text-slate-500 font-medium mt-0.5">
                                {customer.phone}
                              </p>
                            )}
                          </div>
                          <span
                            className={cn(
                              "inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-bold transition-all",
                              isSelected
                                ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30"
                                : "bg-slate-100 text-slate-700"
                            )}
                          >
                            Ver
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 px-3 py-2 border border-blue-200">
                            <div className="flex items-center gap-1.5 mb-1">
                              <ShoppingBag className="h-3 w-3 text-blue-600" />
                              <span className="text-[10px] font-bold text-blue-700">Pedidos</span>
                            </div>
                            <p className="text-sm font-black text-blue-800">
                              {customer.kpi?.ordersCount ?? 0}
                            </p>
                          </div>

                          <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 px-3 py-2 border border-emerald-200">
                            <div className="flex items-center gap-1.5 mb-1">
                              <DollarSign className="h-3 w-3 text-emerald-600" />
                              <span className="text-[10px] font-bold text-emerald-700">Total</span>
                            </div>
                            <p className="text-xs font-black text-emerald-800 truncate">
                              {(customer.kpi?.totalRevenue ?? 0).toLocaleString("pt-BR", {
                                style: "currency",
                                currency: "BRL",
                              })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {customer.kpi?.lastOrderDate && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-50 to-purple-50 px-3 py-1 text-[10px] font-bold text-violet-700 border border-violet-200">
                              <Clock className="h-3 w-3" />
                              Último: {formatDate(customer.kpi.lastOrderDate)}
                            </span>
                          )}
                          {customer.createdAt && (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 px-3 py-1 text-[10px] font-bold text-rose-700 border border-rose-200">
                              <Calendar className="h-3 w-3" />
                              Desde {formatDate(customer.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
            </CardContent>
          </Card>

          {/* Pedidos do cliente selecionado */}
          <Card className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden lg:sticky lg:top-8 h-fit max-h-[calc(100vh-4rem)]">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b-2 border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="rounded-xl bg-white p-2.5 shadow-md">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
                <CardTitle className="text-base font-bold text-slate-800">
                  Pedidos do Cliente
                </CardTitle>
              </div>
              <p className="text-xs font-semibold text-slate-600">
                {selectedCustomer 
                  ? `Histórico de pedidos de ${selectedCustomer.name}`
                  : "Selecione um cliente para ver os pedidos"}
              </p>
            </CardHeader>

            <CardContent className="p-6 max-h-[calc(100vh-20rem)] overflow-y-auto">
              {!selectedCustomer && (
                <div className="text-center py-12">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center mb-4">
                    <ShoppingBag className="h-8 w-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">
                    Selecione um cliente
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Clique em um cliente à esquerda para ver seus pedidos
                  </p>
                </div>
              )}

              {selectedCustomer && loadingOrders && (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl bg-blue-100" />
                  ))}
                </div>
              )}

              {selectedCustomer &&
                !loadingOrders &&
                (!customerOrders || customerOrders.length === 0) && (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center mb-4">
                      <ShoppingBag className="h-8 w-8 text-slate-400" />
                    </div>
                    <p className="text-sm font-semibold text-slate-600">
                      Nenhum pedido encontrado
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {selectedCustomer.name} ainda não realizou pedidos
                    </p>
                  </div>
                )}

              {selectedCustomer &&
                !loadingOrders &&
                customerOrders &&
                customerOrders.map((order) => (
                  <div
                    key={order.id}
                    className="group rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50/30 p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300 mb-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="font-black text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          {order.orderNumber ?? order.code ?? `Pedido #${order.id}`}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-slate-500" />
                          <span className="text-xs text-slate-600 font-medium">
                            {formatDate(
                              (order as any).orderDate ??
                              (order as any).createdDate ??
                              (order as any).createdAt
                            )}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                          {(order as any).totalAmount?.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </span>
                        <span className="rounded-full bg-gradient-to-r from-slate-100 to-gray-100 px-3 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                          {(order as any).status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}