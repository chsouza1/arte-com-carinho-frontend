"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Calendar, BarChart3, LineChart as LineChartIcon } from "lucide-react";
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
  month: string; // "Jan", "Fev", etc.
  revenue: number;
  orders: number;
};

type TopProduct = {
  productName: string;
  totalSold: number;
  totalRevenue: number;
};

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

async function fetchTopProducts(
  start: string,
  end: string
): Promise<TopProduct[]> {
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

  const initialStart =
    searchParams.get("start") ??
    formatDateISO(addDays(now, -90)); // últimos 90 dias
  const initialEnd =
    searchParams.get("end") ?? formatDateISO(now);
  const initialYear =
    parseInt(searchParams.get("year") ?? `${currentYear}`, 10) || currentYear;

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

  const totalRevenueBRL = summary?.totalRevenue?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const avgTicketBRL = summary?.avgTicket?.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Relatórios e análises
          </h1>
          <p className="text-sm text-slate-500">
            Visualize vendas, ticket médio e os produtos mais queridos da Arte
            com Carinho.
          </p>
        </div>
      </section>

      {/* Filtros de período */}
      <section className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <Calendar className="h-4 w-4 text-rose-400" />
          <span>Período para o resumo e top produtos</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span>De</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2"
            />
          </div>
          <div className="flex items-center gap-1">
            <span>Até</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-8 rounded-md border border-slate-200 bg-white px-2"
            />
          </div>
          <button
            type="button"
            className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-100"
            onClick={() => {
              const now = new Date();
              setStartDate(formatDateISO(addDays(now, -30)));
              setEndDate(formatDateISO(now));
            }}
          >
            Últimos 30 dias
          </button>
        </div>
      </section>

      {/* Cards resumo */}
      <section className="grid gap-4 sm:grid-cols-3">
        <Card className="border-rose-100 bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Faturamento no período
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-7 w-24 rounded-lg bg-rose-50" />
            ) : (
              <div className="text-lg font-semibold text-rose-600">
                {totalRevenueBRL}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Número de pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-7 w-12 rounded-lg bg-rose-50" />
            ) : (
              <div className="text-lg font-semibold text-slate-900">
                {summary?.totalOrders ?? 0}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-white/90 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-slate-500">
              Ticket médio
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSummary ? (
              <Skeleton className="h-7 w-24 rounded-lg bg-rose-50" />
            ) : (
              <div className="text-lg font-semibold text-slate-900">
                {avgTicketBRL}
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Gráfico por mês e top produtos */}
      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="border-rose-100 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <LineChartIcon className="h-4 w-4 text-rose-400" />
              <CardTitle className="text-sm font-semibold text-slate-800">
                Faturamento por mês
              </CardTitle>
            </div>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="h-8 rounded-md border border-slate-200 bg-white px-2 text-xs"
            >
              <option value={currentYear - 1}>{currentYear - 1}</option>
              <option value={currentYear}>{currentYear}</option>
              <option value={currentYear + 1}>{currentYear + 1}</option>
            </select>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            {loadingMonthly ? (
              <Skeleton className="h-full w-full rounded-lg bg-rose-50" />
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
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">
                Não há dados suficientes para este ano.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-rose-100 bg-white/90 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-rose-400" />
              <CardTitle className="text-sm font-semibold text-slate-800">
                Produtos mais vendidos
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="h-64 pt-2">
            {loadingTop ? (
              <Skeleton className="h-full w-full rounded-lg bg-rose-50" />
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
                  <Bar dataKey="totalSold" fill="#fb7185" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-xs text-slate-500">
                Ainda não há dados de vendas para o período selecionado.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
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
