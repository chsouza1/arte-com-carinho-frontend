"use client";

import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { AlertTriangle, Package, ShoppingBag, Wallet, Sparkles, Scissors, TrendingUp } from "lucide-react";

// Tipos mantidos...
type Product = { id: number; name: string; stock: number; price: number; category: string; };
type Order = { id: number; orderNumber: string; customerName: string; status: string; totalAmount: number; orderDate: string; };

async function fetchProducts(): Promise<Product[]> {
  const res = await api.get("/products", { params: { size: 200 } });
  return Array.isArray(res.data) ? res.data : res.data.content || [];
}

async function fetchOrders(): Promise<Order[]> {
  const res = await api.get("/orders", { params: { size: 200, sort: "orderDate,desc" } });
  return Array.isArray(res.data) ? res.data : res.data.content || [];
}

export default function AdminDashboardPage() {
  useEffect(() => { applyAuthFromStorage(); }, []);

  const { data: products, isLoading: lp } = useQuery({ queryKey: ["admin", "dash-prod"], queryFn: fetchProducts });
  const { data: orders, isLoading: lo } = useQuery({ queryKey: ["admin", "dash-ord"], queryFn: fetchOrders });

  const { totalProducts, lowStockCount, lowStockProducts, pendingOrdersCount, monthlyRevenue, recentOrders } = useMemo(() => {
    const prods = products || [];
    const ords = orders || [];
    
    const low = prods.filter(p => (p.stock ?? 0) <= 5).sort((a,b) => a.stock - b.stock).slice(0, 5);
    const pending = ords.filter(o => o.status === "PENDING").length;
    
    const now = new Date();
    const delivered = ords.filter(o => o.status === "DELIVERED" && new Date(o.orderDate).getMonth() === now.getMonth());
    const revenue = delivered.reduce((acc, o) => acc + (o.totalAmount ?? 0), 0);

    return {
      totalProducts: prods.length,
      lowStockCount: low.length,
      lowStockProducts: low,
      pendingOrdersCount: pending,
      monthlyRevenue: revenue,
      recentOrders: ords.slice(0, 5)
    };
  }, [products, orders]);

  const isLoading = lp || lo;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dashed border-[#D7CCC8] pb-6">
        <div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Visão Geral</h1>
            <p className="text-[#8D6E63] text-sm mt-1">Bem-vinda de volta ao ateliê.</p>
        </div>
        <div className="inline-flex items-center gap-2 bg-[#FFF8E1] px-4 py-2 rounded-sm border border-[#FFE0B2] text-[#F57F17] text-xs font-bold uppercase tracking-widest shadow-sm">
            <Sparkles size={14} /> Ateliê em funcionamento
        </div>
      </div>

      {/* Métricas (Cards Estilo Post-it/Ficha) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
            label="Produtos" 
            value={totalProducts} 
            icon={Scissors} 
            color="rose" 
            loading={isLoading} 
        />
        <MetricCard 
            label="Estoque Baixo" 
            value={lowStockCount} 
            icon={AlertTriangle} 
            color="amber" 
            loading={isLoading} 
            alert={lowStockCount > 0} 
        />
        <MetricCard 
            label="Pedidos Pendentes" 
            value={pendingOrdersCount} 
            icon={ShoppingBag} 
            color="blue" 
            loading={isLoading} 
            alert={pendingOrdersCount > 0} 
        />
        <MetricCard 
            label="Receita Mensal" 
            value={monthlyRevenue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} 
            icon={Wallet} 
            color="emerald" 
            loading={isLoading} 
        />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Últimos Pedidos */}
        <Card className="bg-white border border-[#D7CCC8] shadow-sm rounded-sm overflow-hidden">
            <CardHeader className="bg-[#FAF7F5] border-b border-[#EFEBE9] py-4">
                <CardTitle className="text-sm font-bold text-[#5D4037] uppercase tracking-wider flex items-center gap-2">
                    <ShoppingBag size={16} /> Últimos Pedidos
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? <div className="p-6 space-y-2"><Skeleton className="h-10"/><Skeleton className="h-10"/></div> : (
                    <div className="divide-y divide-[#EFEBE9]">
                        {recentOrders.map(o => (
                            <div key={o.id} className="p-4 flex justify-between items-center hover:bg-[#FAF7F5] transition-colors">
                                <div>
                                    <p className="text-sm font-bold text-[#5D4037]">#{o.orderNumber}</p>
                                    <p className="text-xs text-[#8D6E63]">{o.customerName || "Cliente"}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[#5D4037]">{o.totalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    <span className="text-[10px] font-bold uppercase text-[#8D6E63]">{o.status}</span>
                                </div>
                            </div>
                        ))}
                        {recentOrders.length === 0 && <p className="p-6 text-center text-xs text-[#8D6E63]">Sem pedidos recentes.</p>}
                    </div>
                )}
            </CardContent>
        </Card>

        {/* Estoque Crítico */}
        <Card className="bg-white border border-[#D7CCC8] shadow-sm rounded-sm overflow-hidden">
            <CardHeader className="bg-[#FFF8E1] border-b border-[#FFE0B2] py-4">
                <CardTitle className="text-sm font-bold text-[#E65100] uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle size={16} /> Precisa de Reposição
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                {isLoading ? <div className="p-6 space-y-2"><Skeleton className="h-10"/><Skeleton className="h-10"/></div> : (
                    <div className="divide-y divide-[#EFEBE9]">
                        {lowStockProducts.map(p => (
                            <div key={p.id} className="p-4 flex justify-between items-center hover:bg-[#FFF8E1]/50 transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${p.stock <= 2 ? 'bg-red-500' : 'bg-amber-500'}`}></div>
                                    <p className="text-sm font-medium text-[#5D4037] line-clamp-1">{p.name}</p>
                                </div>
                                <span className={`text-xs font-bold px-2 py-1 rounded-sm ${p.stock <= 2 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
                                    {p.stock} un.
                                </span>
                            </div>
                        ))}
                        {lowStockProducts.length === 0 && <p className="p-6 text-center text-xs text-[#8D6E63]">Estoque saudável!</p>}
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, color, loading, alert }: any) {
    const colorStyles: any = {
        rose: "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]",
        amber: "bg-[#FFF8E1] text-[#EF6C00] border-[#FFE0B2]",
        blue: "bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]",
        emerald: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]",
    };
    const style = colorStyles[color] || colorStyles.rose;

    return (
        <Card className={cn("border shadow-sm rounded-sm relative overflow-hidden", alert ? "border-l-4 border-l-[#E53935]" : "border-[#D7CCC8]")}>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-1">{label}</p>
                    {loading ? <Skeleton className="h-8 w-16" /> : (
                        <p className="text-2xl font-serif font-bold text-[#5D4037]">{value}</p>
                    )}
                </div>
                <div className={cn("p-3 rounded-full border", style)}>
                    <Icon size={20} />
                </div>
            </CardContent>
        </Card>
    );
}