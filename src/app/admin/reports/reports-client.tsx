"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Calendar, BarChart3, LineChart as LineChartIcon, TrendingUp, 
  DollarSign, ShoppingBag, Sparkles, Filter 
} from "lucide-react";
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
  Cell,
  PieChart,
  Pie
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

const STATUS_MAP: Record<string, string> = {
  PENDING: "Pendente",
  IN_PRODUCTION: "Em Produção",
  SHIPPED: "Enviado",
  DELIVERED: "Entregue",
  CANCELLED: "Cancelado",
};

// Cores do gráfico de pizza/barras
const CHART_COLORS = ["#E53935", "#F57F17", "#5D4037", "#1B5E20", "#1565C0"];

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
    <div className="min-h-screen bg-[#FAF7F5] p-8 font-sans text-[#5D4037]">
      <div className="mx-auto max-w-7xl space-y-8">
        
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dashed border-[#D7CCC8] pb-6">
            <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
                    <BarChart3 className="h-6 w-6 text-[#5D4037]" />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Relatórios do Ateliê</h1>
                    <p className="text-[#8D6E63] italic">Análise de desempenho e vendas.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3 bg-[#FFF8E1] px-4 py-2 rounded-sm border border-[#FFE0B2] shadow-sm">
                <Sparkles size={16} className="text-[#F57F17]" />
                <span className="text-sm font-bold text-[#F57F17] uppercase tracking-wider">
                    Dados em tempo real
                </span>
            </div>
        </div>

        {/* Filtros de período */}
        <div className="bg-white border border-[#D7CCC8] p-6 rounded-sm shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-[#8D6E63]">
              <Filter className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Filtrar Período</span>
            </div>
            
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2 bg-[#FAF7F5] px-3 py-1.5 rounded-sm border border-[#EFEBE9]">
                <span className="text-xs font-bold text-[#8D6E63]">De:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent text-sm font-bold text-[#5D4037] outline-none"
                />
              </div>
              <div className="flex items-center gap-2 bg-[#FAF7F5] px-3 py-1.5 rounded-sm border border-[#EFEBE9]">
                <span className="text-xs font-bold text-[#8D6E63]">Até:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent text-sm font-bold text-[#5D4037] outline-none"
                />
              </div>
              <button
                type="button"
                className="bg-[#E53935] hover:bg-[#C62828] text-white px-4 py-2 rounded-sm text-xs font-bold uppercase tracking-widest shadow-sm transition-all"
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
        </div>

        {/* Cards resumo */}
        <div className="grid gap-6 sm:grid-cols-3">
          <Card className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-sm shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-3 opacity-20">
                <DollarSign size={64} className="text-[#1B5E20]" />
            </div>
            <CardContent className="p-6">
                <p className="text-xs font-bold text-[#2E7D32] uppercase tracking-wider mb-2">Faturamento</p>
                {loadingSummary ? (
                    <Skeleton className="h-8 w-32 bg-[#C8E6C9]" />
                ) : (
                    <p className="text-3xl font-serif font-bold text-[#1B5E20]">{totalRevenueBRL}</p>
                )}
            </CardContent>
          </Card>

          <Card className="bg-[#E3F2FD] border border-[#BBDEFB] rounded-sm shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-3 opacity-20">
                <ShoppingBag size={64} className="text-[#0D47A1]" />
            </div>
            <CardContent className="p-6">
                <p className="text-xs font-bold text-[#1565C0] uppercase tracking-wider mb-2">Total de Pedidos</p>
                {loadingSummary ? (
                    <Skeleton className="h-8 w-20 bg-[#BBDEFB]" />
                ) : (
                    <p className="text-3xl font-serif font-bold text-[#0D47A1]">{summary?.totalOrders ?? 0}</p>
                )}
            </CardContent>
          </Card>

          <Card className="bg-[#FFF8E1] border border-[#FFE0B2] rounded-sm shadow-sm relative overflow-hidden">
            <div className="absolute right-0 top-0 p-3 opacity-20">
                <TrendingUp size={64} className="text-[#E65100]" />
            </div>
            <CardContent className="p-6">
                <p className="text-xs font-bold text-[#F57F17] uppercase tracking-wider mb-2">Ticket Médio</p>
                {loadingSummary ? (
                    <Skeleton className="h-8 w-28 bg-[#FFE0B2]" />
                ) : (
                    <p className="text-3xl font-serif font-bold text-[#E65100]">{avgTicketBRL}</p>
                )}
            </CardContent>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          
          {/* Faturamento por mês */}
          <Card className="bg-white border border-[#D7CCC8] rounded-sm shadow-sm col-span-1 xl:col-span-2">
            <CardHeader className="bg-[#FAF7F5] border-b border-[#EFEBE9] py-4 px-6 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <LineChartIcon className="h-4 w-4 text-[#5D4037]" />
                  <CardTitle className="text-sm font-bold text-[#5D4037] uppercase">
                    Evolução Mensal
                  </CardTitle>
                </div>
                <select
                  value={year}
                  onChange={(e) => setYear(parseInt(e.target.value, 10))}
                  className="h-8 rounded-sm border border-[#D7CCC8] bg-white px-2 text-xs font-bold text-[#5D4037] outline-none"
                >
                  <option value={currentYear - 1}>{currentYear - 1}</option>
                  <option value={currentYear}>{currentYear}</option>
                  <option value={currentYear + 1}>{currentYear + 1}</option>
                </select>
            </CardHeader>
            <CardContent className="h-80 pt-6 px-6 pb-2">
              {loadingMonthly ? (
                <div className="h-full flex items-center justify-center text-[#D7CCC8]">Carregando gráfico...</div>
              ) : monthly && monthly.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthly}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EFEBE9" />
                    <XAxis 
                        dataKey="month" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        tick={{fill: '#8D6E63'}} 
                        dy={10}
                    />
                    <YAxis
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                      tick={{fill: '#8D6E63'}}
                      tickFormatter={(value) =>
                        value.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                          maximumFractionDigits: 0,
                        })
                      }
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#FFF', borderColor: '#D7CCC8', borderRadius: '4px', fontSize: '12px' }}
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
                      stroke="#E53935"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#E53935", stroke: "#FFF", strokeWidth: 2 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[#8D6E63] text-center pt-20">
                  Sem dados para este ano.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Pedidos por status */}
          <Card className="bg-white border border-[#D7CCC8] rounded-sm shadow-sm">
            <CardHeader className="bg-[#FAF7F5] border-b border-[#EFEBE9] py-4 px-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#5D4037]" />
                <CardTitle className="text-sm font-bold text-[#5D4037] uppercase">
                  Status dos Pedidos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-80 pt-6">
              {loadingStatus ? (
                <div className="h-full flex items-center justify-center text-[#D7CCC8]">Carregando...</div>
              ) : statusDistribution && statusDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                        data={statusDistribution}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        // FIX: Removido 'status' do destructuring e adicionado tipagem para percent
                        label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`}
                    >
                        {statusDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip 
                        contentStyle={{ backgroundColor: '#FFF', borderColor: '#D7CCC8', borderRadius: '4px', fontSize: '12px' }}
                        formatter={(value: any, name: any, props: any) => [value, STATUS_MAP[props.payload.status] || props.payload.status]} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[#8D6E63] text-center pt-20">
                  Nenhum pedido encontrado.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Produtos mais vendidos */}
          <Card className="bg-white border border-[#D7CCC8] rounded-sm shadow-sm col-span-1 xl:col-span-3">
            <CardHeader className="bg-[#FAF7F5] border-b border-[#EFEBE9] py-4 px-6">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-[#5D4037]" />
                <CardTitle className="text-sm font-bold text-[#5D4037] uppercase">
                  Top 5 Produtos
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="h-64 pt-6 px-6">
              {loadingTop ? (
                <div className="h-full flex items-center justify-center text-[#D7CCC8]">Carregando ranking...</div>
              ) : topProducts && topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#EFEBE9" />
                    <XAxis type="number" fontSize={11} tickLine={false} axisLine={false} tick={{fill: '#8D6E63'}} />
                    <YAxis 
                        type="category" 
                        dataKey="productName" 
                        fontSize={11} 
                        tickLine={false} 
                        axisLine={false} 
                        width={150}
                        tick={{fill: '#5D4037', fontWeight: 'bold'}}
                        tickFormatter={(value) => String(value).length > 20 ? String(value).slice(0, 20) + "…" : value}
                    />
                    <Tooltip
                      cursor={{fill: '#FAF7F5'}}
                      contentStyle={{ backgroundColor: '#FFF', borderColor: '#D7CCC8', borderRadius: '4px', fontSize: '12px' }}
                      formatter={(value: any, name: any) =>
                        name === "totalSold"
                          ? [`${value} un.`, "Vendas"]
                          : [Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" }), "Receita"]
                      }
                    />
                    <Bar dataKey="totalSold" fill="#5D4037" radius={[0, 4, 4, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-xs text-[#8D6E63] text-center pt-20">
                  Sem dados de vendas.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
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