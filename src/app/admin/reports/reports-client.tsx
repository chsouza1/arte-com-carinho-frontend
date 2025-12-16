"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, BarChart3, LineChart as LineChartIcon, TrendingUp, DollarSign, ShoppingBag, Sparkles } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

type SummaryStats = {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
};

type MonthlyPoint = {
  month: string;
  revenue: number;
  orders: number;
};

type TopProduct = {
  productName: string;
  totalSold: number;
  totalRevenue: number;
};

type StatusPoint = {
  status: string;
  count: number;
};

async function fetchStatusDistribution(): Promise<StatusPoint[]> {
  const res = await api.get("/orders/stats/status-distribution");
  return res.data;
}

async function fetchSummary(start: string, end: string): Promise<SummaryStats> {
  const res = await api.get("/orders/stats/summary", {
    params: { start, end },
  });
  return res.data;
}

async function fetchByMonth(year: number): Promise<MonthlyPoint[]> {
  const res = await api.get("/orders/stats/by-month", {
    params: { year },
  });
  return res.data;
}

async function fetchTopProducts(start: string, end: string): Promise<TopProduct[]> {
  const res = await api.get("/products/stats/top", {
    params: { start, end, limit: 5 },
  });
  return res.data;
}

export function AdminReportsPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const now = new Date();
  const currentYear = now.getFullYear();

  const initialStart = searchParams.get("start") ?? formatDateISO(addDays(now, -90));
  const initialEnd = searchParams.get("end") ?? formatDateISO(now);
  const initialYear = parseInt(searchParams.get("year") ?? `${currentYear}`, 10) || currentYear;

  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [year, setYear] = useState(initialYear);

  useEffect(() => {
    const params = new URLSearchParams();
    params.set("start", startDate);
    params.set("end", endDate);
    params.set("year", String(year));
    router.replace(`/admin/reports?${params.toString()}`);
  }, [startDate, endDate, year, router]);

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["reports", "summary", startDate, endDate],
    queryFn: () => fetchSummary(startDate, endDate),
  });

  const { data: monthly, isLoading: loadingMonthly } = useQuery({
    queryKey: ["reports", "monthly", year],
    queryFn: () => fetchByMonth(year),
  });

  const { data: topProducts, isLoading: loadingTop } = useQuery({
    queryKey: ["reports", "topProducts", startDate, endDate],
    queryFn: () => fetchTopProducts(startDate, endDate),
  });

  const { data: statusDistribution, isLoading: loadingStatus } = useQuery({
    queryKey: ["reports", "status-distribution"],
    queryFn: fetchStatusDistribution,
  });

  const totalRevenueBRL = summary?.totalRevenue?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const avgTicketBRL = summary?.avgTicket?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
                <BarChart3 size={24} className="text-rose-600" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
                <Sparkles size={14} className="animate-pulse" />
                Análise de dados
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Relatórios e Análises
            </h1>
            <p className="mt-3 text-base text-neutral-600 font-medium">
              Visualize vendas, ticket médio e os produtos mais queridos da Arte com Carinho.
            </p>
          </div>
        </section>

        {/* Filtros de período */}
        <section className="rounded-[2rem] bg-white/80 backdrop-blur-sm p-6 shadow-lg border-2 border-rose-200">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-rose-500" />
              <span className="text-sm font-bold text-slate-700">Período para análise</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">De</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10 rounded-xl border-2 border-rose-200 bg-white px-3 text-sm font-medium"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Até</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10 rounded-xl border-2 border-rose-200 bg-white px-3 text-sm font-medium"
                />
              </div>
              <button
                type="button"
                className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-4 py-2 text-xs font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30"
                onClick={() => {
                  const now = new Date();
                  setStartDate(formatDateISO(addDays(now, -30)));
                  setEndDate(formatDateISO(now));
                }}
              >
                Últimos 30 dias
              </button>
            </div>
          </div>
        </section>

        {/* Cards resumo */}
        <section className="grid gap-6 sm:grid-cols-3">
          <Card className="rounded-3xl border-2 border-emerald-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-emerald-50 to-green-50 border-b-2 border-emerald-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-slate-700">
                  Faturamento no período
                </CardTitle>
                <div className="rounded-xl bg-white p-2 shadow-md">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingSummary ? (
                <Skeleton className="h-10 w-32 rounded-lg bg-emerald-100" />
              ) : (
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600">
                  {totalRevenueBRL}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 border-blue-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b-2 border-blue-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-slate-700">
                  Número de pedidos
                </CardTitle>
                <div className="rounded-xl bg-white p-2 shadow-md">
                  <ShoppingBag className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingSummary ? (
                <Skeleton className="h-10 w-20 rounded-lg bg-blue-100" />
              ) : (
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-600">
                  {summary?.totalOrders ?? 0}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-2 border-purple-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b-2 border-purple-100 pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xs font-bold text-slate-700">
                  Ticket médio
                </CardTitle>
                <div className="rounded-xl bg-white p-2 shadow-md">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {loadingSummary ? (
                <Skeleton className="h-10 w-28 rounded-lg bg-purple-100" />
              ) : (
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-violet-600">
                  {avgTicketBRL}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Gráficos */}
        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {/* Faturamento por mês */}
          <Card className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-rose-500" />
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Faturamento por mês
                  </CardTitle>
                </div>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="h-9 rounded-xl border-2 border-rose-200 bg-white px-3 text-xs font-bold"
                >
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear + 1}>{currentYear + 1}</option>
                </select>
              </div>
            </CardHeader>
            <CardContent className="h-64 pt-6">
              {loadingMonthly ? (
                <Skeleton className="h-full w-full rounded-2xl bg-rose-100" />
              ) : monthly && monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" fontSize={11} tickLine={false} />
                    <YAxis
                      fontSize={11}
                      tickFormatter={(value) =>
                        value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 0,
                        })
                      }
                    />
                    <Tooltip
                      formatter={(value: any) =>
                        Number(value).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#fb7185"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#fb7185" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500 text-center">
                  Não há dados suficientes para este ano.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pedidos por status */}
          <Card className="rounded-3xl border-2 border-blue-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-sky-50 border-b-2 border-blue-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                <CardTitle className="text-sm font-bold text-slate-800">
                  Pedidos por status
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-64 pt-6">
              {loadingStatus ? (
                <Skeleton className="h-full w-full rounded-2xl bg-blue-100" />
              ) : statusDistribution && statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statusDistribution}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="status" fontSize={11} tickLine={false} />
                    <YAxis allowDecimals={false} fontSize={11} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500 text-center">
                  Ainda não há pedidos cadastrados.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Produtos mais vendidos */}
          <Card className="rounded-3xl border-2 border-purple-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-violet-50 border-b-2 border-purple-100">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <CardTitle className="text-sm font-bold text-slate-800">
                  Produtos mais vendidos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-64 pt-6">
              {loadingTop ? (
                <Skeleton className="h-full w-full rounded-2xl bg-purple-100" />
              ) : topProducts && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="productName"
                      fontSize={10}
                      tickLine={false}
                      tickFormatter={(value) =>
                        String(value).length > 10
                          ? String(value).slice(0, 10) + "…"
                          : value
                      }
                    />
                    <YAxis fontSize={11} />
                    <Tooltip
                      formatter={(value: any, name: any) =>
                        name === "totalSold"
                          ? `${value} un.`
                          : Number(value).toLocaleString("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            })
                      }
                      labelFormatter={(label) => label}
                    />
                    <Bar dataKey="totalSold" fill="#a855f7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-slate-500 text-center">
                  Ainda não há dados de vendas para o período selecionado.
                </p>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

function formatDateISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

function addDays(d: Date, days: number) {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + days);
  return copy;
}