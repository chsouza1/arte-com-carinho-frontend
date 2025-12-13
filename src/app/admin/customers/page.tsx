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
import { Calendar } from "lucide-react";

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
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
        <p className="text-sm text-red-600">
          Ocorreu um erro ao carregar os clientes. Verifique se está logado como
          admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Clientes</h1>
          <p className="text-sm text-slate-600">
            Visualize a base de clientes e acompanhe os pedidos de cada um.
          </p>
        </div>
      </section>

      {/* Layout: esquerda = clientes, direita = pedidos do cliente selecionado */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Lista de clientes */}
        <Card className="border-rose-100 bg-white/95 shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Base de clientes
            </CardTitle>

            <div className="w-full max-w-xs">
              <Input
                placeholder="Buscar por nome, e-mail ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 text-xs"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-3">
            {loadingCustomers && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg bg-rose-50" />
                <Skeleton className="h-10 w-full rounded-lg bg-rose-50" />
                <Skeleton className="h-10 w-full rounded-lg bg-rose-50" />
              </div>
            )}

            {!loadingCustomers && filteredCustomers.length === 0 && (
              <p className="text-sm text-slate-500">
                Nenhum cliente encontrado com os filtros atuais.
              </p>
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
                      "w-full rounded-lg border px-3 py-2 text-left text-xs transition",
                      "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
                      isSelected
                        ? "border-rose-400 bg-rose-50"
                        : "border-rose-100 bg-white hover:bg-rose-50/70"
                    )}
                  >
                    {/* ESQUERDA: dados + badges */}
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-slate-900">
                        {customer.name}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        {customer.email}
                      </span>

                      {customer.phone && (
                        <span className="text-[11px] text-slate-500">
                          {customer.phone}
                        </span>
                      )}

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px]">
                          Pedidos: {customer.kpi?.ordersCount ?? 0}
                        </span>

                        <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] text-rose-700">
                          Total:{" "}
                          {(customer.kpi?.totalRevenue ?? 0).toLocaleString(
                            "pt-BR",
                            { style: "currency", currency: "BRL" }
                          )}
                        </span>

                        {customer.kpi?.lastOrderDate && (
                          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-600">
                            Último pedido:{" "}
                            {new Date(
                              customer.kpi.lastOrderDate
                            ).toLocaleDateString("pt-BR")}
                          </span>
                        )}

                        {customer.createdAt && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-slate-600">
                            <Calendar className="h-3 w-3 text-rose-500" />
                            <span>Desde {formatDate(customer.createdAt)}</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* DIREITA: botão */}
                    <span
                      className={cn(
                        "inline-flex items-center justify-center rounded-full px-2 py-0.5 text-[11px] font-medium",
                        isSelected
                          ? "bg-rose-500 text-white"
                          : "bg-slate-50 text-slate-700"
                      )}
                    >
                      Ver pedidos
                    </span>
                  </button>
                );
              })}
          </CardContent>
        </Card>

        {/* Pedidos do cliente selecionado */}
        <Card className="border-rose-100 bg-white/95 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-sm font-semibold text-slate-800">
              Pedidos do cliente
            </CardTitle>
            <p className="text-xs text-slate-500">
              Selecione um cliente na lista ao lado para visualizar os pedidos.
            </p>
          </CardHeader>

          <CardContent className="space-y-3">
            {!selectedCustomer && (
              <p className="text-sm text-slate-500">Nenhum cliente selecionado.</p>
            )}

            {selectedCustomer && loadingOrders && (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full rounded-lg bg-rose-50" />
                <Skeleton className="h-10 w-full rounded-lg bg-rose-50" />
              </div>
            )}

            {selectedCustomer &&
              !loadingOrders &&
              (!customerOrders || customerOrders.length === 0) && (
                <p className="text-sm text-slate-500">
                  Nenhum pedido encontrado para{" "}
                  <span className="font-semibold">{selectedCustomer.name}</span>.
                </p>
              )}

            {selectedCustomer &&
              !loadingOrders &&
              customerOrders &&
              customerOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col justify-between gap-2 rounded-lg border border-rose-100 bg-white px-3 py-2 text-xs sm:flex-row sm:items-center"
                >
                  <div className="space-y-1">
                    <div className="font-semibold text-slate-900">
                      {order.orderNumber ?? order.code ?? `Pedido #${order.id}`}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Data:{" "}
                      {formatDate(
                        (order as any).orderDate ??
                          (order as any).createdDate ??
                          (order as any).createdAt
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-semibold text-rose-600">
                      {(order as any).totalAmount?.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">
                      {(order as any).status}
                    </span>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
