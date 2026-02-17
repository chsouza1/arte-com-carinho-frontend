"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, Download, Filter, Sparkles, X, AlertTriangle, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

type ProductLine =
  | "TOWEL_BATH"
  | "TOWEL_FACE"
  | "TOWEL_HAND"
  | "TOWEL_BABY"
  | "KIT"
  | "OTHER";

type Product = {
  id: number;
  name: string;
  line?: ProductLine;
  stock: number;
  customizable?: boolean;
};

async function fetchInventory(): Promise<Product[]> {
  const res = await api.get("/products", { params: { size: 500 } });
  const data = res.data;
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.content)) return data.content;
  return [];
}

function lineLabel(line?: ProductLine) {
  switch (line) {
    case "TOWEL_BATH": return "Toalhas de Banho";
    case "TOWEL_FACE": return "Toalhas de Rosto/Boca";
    case "TOWEL_HAND": return "Toalhas de Mão/Lavabo";
    case "TOWEL_BABY": return "Linha Baby";
    case "KIT": return "Kits e Jogos";
    default: return "Outros Produtos";
  }
}

// Cores temáticas para as categorias (Tons pastéis/terrosos)
const lineStyles: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  TOWEL_BATH: { bg: "bg-[#E3F2FD]", border: "border-[#BBDEFB]", text: "text-[#1565C0]", icon: "text-[#1976D2]" },
  TOWEL_FACE: { bg: "bg-[#F3E5F5]", border: "border-[#E1BEE7]", text: "text-[#7B1FA2]", icon: "text-[#8E24AA]" },
  TOWEL_HAND: { bg: "bg-[#FFF8E1]", border: "border-[#FFE0B2]", text: "text-[#F57F17]", icon: "text-[#FFA000]" },
  TOWEL_BABY: { bg: "bg-[#FFEBEE]", border: "border-[#FFCDD2]", text: "text-[#C62828]", icon: "text-[#E53935]" },
  KIT: { bg: "bg-[#E8F5E9]", border: "border-[#C8E6C9]", text: "text-[#2E7D32]", icon: "text-[#43A047]" },
  OTHER: { bg: "bg-[#F5F5F5]", border: "border-[#E0E0E0]", text: "text-[#616161]", icon: "text-[#757575]" },
};

export default function AdminStockPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: fetchInventory,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  const grouped = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const result: Record<string, { plain: Product[]; customizable: Product[]; total: number; totalVisible: number; }> = {};

    for (const p of data) {
      const key = p.line ?? "OTHER";
      const nameMatches = term.length === 0 || p.name.toLowerCase().includes(term);
      const isLow = (p.stock ?? 0) <= lowStockThreshold;
      const passesLowFilter = !showLowOnly || isLow;

      if (!result[key]) {
        result[key] = { plain: [], customizable: [], total: 0, totalVisible: 0 };
      }
      result[key].total += p.stock ?? 0;

      if (!nameMatches || !passesLowFilter) continue;

      if (p.customizable) result[key].customizable.push(p);
      else result[key].plain.push(p);

      result[key].totalVisible += p.stock ?? 0;
    }
    return result;
  }, [data, searchTerm, showLowOnly, lowStockThreshold]);

  const flattenedVisibleProducts = useMemo(() => {
    const rows: any[] = [];
    for (const [lineKey, info] of Object.entries(grouped)) {
      const lineName = lineLabel(lineKey as ProductLine);
      for (const p of info.plain) rows.push({ ...p, lineName, type: "Lisa" });
      for (const p of info.customizable) rows.push({ ...p, lineName, type: "Personalizável" });
    }
    return rows;
  }, [grouped]);

  const handleExportCsv = useCallback(() => {
    if (flattenedVisibleProducts.length === 0) {
      alert("Nada para exportar com os filtros atuais.");
      return;
    }
    const header = ["ID", "Nome", "Linha", "Tipo", "Estoque"];
    const lines = flattenedVisibleProducts.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.lineName}"`,
      p.type,
      p.stock,
    ]);
    const csvContent = header.join(";") + "\n" + lines.map((row) => row.join(";")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `estoque-atelie-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [flattenedVisibleProducts]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-[#8D6E63]">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#D7CCC8] border-r-[#E53935] mb-3"></div>
        <p className="text-sm font-bold uppercase tracking-widest">Abrindo almoxarifado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dashed border-[#D7CCC8] pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
             <Layers className="h-6 w-6 text-[#5D4037]" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Controle de Estoque</h1>
            <p className="text-[#8D6E63] italic">Visão geral dos materiais e peças.</p>
          </div>
        </div>
        
        <div className="bg-[#FFF8E1] px-4 py-2 rounded-sm border border-[#FFE0B2] shadow-sm flex items-center gap-2">
            <Sparkles size={16} className="text-[#F57F17]" />
            <span className="text-sm font-bold text-[#F57F17] uppercase tracking-wider">
                Inventário Ativo
            </span>
        </div>
      </div>

      {/* Painel de Controle */}
      <div className="bg-white border border-[#D7CCC8] rounded-sm p-6 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 justify-between items-end">
            {/* Busca */}
            <div className="w-full lg:w-1/3">
                <label className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider mb-2 block">Buscar Item</label>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                    <Input 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Nome do produto..." 
                        className="pl-9 bg-[#FAF7F5] border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-10 rounded-sm"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#E53935]">
                            <X size={14}/>
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros e Ações */}
            <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                
                {/* Limite de Estoque */}
                <div className="flex items-center gap-2 bg-[#FAF7F5] border border-[#D7CCC8] px-3 py-2 rounded-sm">
                    <span className="text-xs font-bold text-[#8D6E63]">Alerta Baixo ≤</span>
                    <input 
                        type="number" 
                        min="1" 
                        value={lowStockThreshold} 
                        onChange={e => setLowStockThreshold(Math.max(1, Number(e.target.value)))} 
                        className="w-12 text-center bg-white border border-[#D7CCC8] rounded-sm text-sm font-bold text-[#5D4037] outline-none focus:border-[#E53935]"
                    />
                </div>

                {/* Toggle Filtro */}
                <label className="flex items-center gap-2 cursor-pointer select-none border border-[#D7CCC8] px-3 py-2 rounded-sm hover:bg-[#FAF7F5] transition-colors bg-white">
                    <input 
                        type="checkbox" 
                        checked={showLowOnly} 
                        onChange={e => setShowLowOnly(e.target.checked)} 
                        className="accent-[#E53935]" 
                    />
                    <span className="text-xs font-bold text-[#5D4037] uppercase">Apenas Críticos</span>
                </label>

                {/* Botão Exportar */}
                <Button 
                    onClick={handleExportCsv} 
                    className="bg-[#E53935] hover:bg-[#C62828] text-white text-xs font-bold uppercase tracking-widest h-10 px-6 rounded-sm shadow-md transition-all hover:-translate-y-0.5"
                >
                    <Download className="mr-2 h-4 w-4" /> Exportar CSV
                </Button>
            </div>
        </div>
      </div>

      {/* Empty State */}
      {Object.entries(grouped).length === 0 && (
        <div className="p-16 text-center border-2 border-dashed border-[#D7CCC8] rounded-sm bg-[#FAF7F5]">
            <Package className="mx-auto h-12 w-12 text-[#D7CCC8] mb-4" />
            <p className="text-lg font-serif text-[#5D4037]">Nenhum item encontrado</p>
            <p className="text-sm text-[#8D6E63]">Tente ajustar os filtros de busca.</p>
        </div>
      )}

      {/* Cards de Categorias */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([line, info]) => {
            if (info.plain.length === 0 && info.customizable.length === 0) return null;

            const style = lineStyles[line] || lineStyles.OTHER;

            return (
                <Card key={line} className={`border border-[#D7CCC8] shadow-sm rounded-sm bg-white overflow-hidden`}>
                    
                    {/* Header da Categoria */}
                    <CardHeader className={`${style.bg} border-b ${style.border} py-3 px-6 flex flex-row items-center justify-between`}>
                        <div className="flex items-center gap-3">
                            <Package className={`h-5 w-5 ${style.icon}`} />
                            <CardTitle className={`text-sm font-bold uppercase tracking-wider ${style.text}`}>
                                {lineLabel(line as ProductLine)}
                            </CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="bg-white/80 px-2 py-1 rounded-sm text-[10px] font-bold border border-white/50 text-[#5D4037]">
                                Total: {info.total}
                            </span>
                            {info.totalVisible !== info.total && (
                                <span className="bg-white/80 px-2 py-1 rounded-sm text-[10px] font-bold border border-white/50 text-[#8D6E63] flex items-center gap-1">
                                    <Filter size={8} /> Visível: {info.totalVisible}
                                </span>
                            )}
                        </div>
                    </CardHeader>

                    <CardContent className="p-0 grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#EFEBE9]">
                        
                        {/* Coluna: Peças Lisas */}
                        <div className="p-4">
                            <h4 className="text-xs font-bold text-[#8D6E63] mb-3 flex items-center gap-2 border-b border-dashed border-[#D7CCC8] pb-1 uppercase tracking-wider">
                                <div className="w-2 h-2 bg-[#A1887F] rounded-full"></div> Peças Lisas
                            </h4>
                            <div className="space-y-1">
                                {info.plain.map((p) => {
                                    const isLow = (p.stock ?? 0) <= lowStockThreshold;
                                    return (
                                        <div key={p.id} className={cn("flex justify-between items-center text-sm py-1.5 px-2 rounded-sm transition-colors", isLow ? "bg-[#FFEBEE]" : "hover:bg-[#FAF7F5]")}>
                                            <span className={cn("font-medium", isLow ? "text-[#C62828]" : "text-[#5D4037]")}>{p.name}</span>
                                            <span className={cn("font-mono font-bold px-2 py-0.5 rounded-sm text-xs border", isLow ? "bg-white border-[#FFCDD2] text-[#C62828]" : "bg-[#FAF7F5] border-[#EFEBE9] text-[#8D6E63]")}>
                                                {isLow && <AlertTriangle size={10} className="inline mr-1"/>}
                                                {p.stock}
                                            </span>
                                        </div>
                                    );
                                })}
                                {info.plain.length === 0 && <p className="text-xs text-[#D7CCC8] italic px-2">Nenhum item.</p>}
                            </div>
                        </div>

                        {/* Coluna: Peças Personalizáveis */}
                        <div className="p-4 bg-[#FFFDE7]/30">
                            <h4 className="text-xs font-bold text-[#F57F17] mb-3 flex items-center gap-2 border-b border-dashed border-[#FFE0B2] pb-1 uppercase tracking-wider">
                                <Sparkles size={12} /> Personalizáveis
                            </h4>
                            <div className="space-y-1">
                                {info.customizable.map((p) => {
                                    const isLow = (p.stock ?? 0) <= lowStockThreshold;
                                    return (
                                        <div key={p.id} className={cn("flex justify-between items-center text-sm py-1.5 px-2 rounded-sm transition-colors", isLow ? "bg-[#FFEBEE]" : "hover:bg-[#FFF9C4]/50")}>
                                            <span className={cn("font-medium", isLow ? "text-[#C62828]" : "text-[#5D4037]")}>{p.name}</span>
                                            <span className={cn("font-mono font-bold px-2 py-0.5 rounded-sm text-xs border", isLow ? "bg-white border-[#FFCDD2] text-[#C62828]" : "bg-[#FFF8E1] border-[#FFE0B2] text-[#E65100]")}>
                                                {isLow && <AlertTriangle size={10} className="inline mr-1"/>}
                                                {p.stock}
                                            </span>
                                        </div>
                                    );
                                })}
                                {info.customizable.length === 0 && <p className="text-xs text-[#D7CCC8] italic px-2">Nenhum item.</p>}
                            </div>
                        </div>

                    </CardContent>
                </Card>
            );
        })}
      </div>
    </div>
  );
}