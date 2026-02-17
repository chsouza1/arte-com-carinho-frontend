"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search, Package, Sparkles, X, CheckCircle2 } from "lucide-react";

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
    case "TOWEL_BATH": return "Toalha de Banho";
    case "TOWEL_FACE": return "Toalha de Rosto";
    case "TOWEL_HAND": return "Toalha de Mão";
    case "TOWEL_BABY": return "Linha Baby";
    case "KIT": return "Kits";
    default: return "Outros";
  }
}

export default function CriticalStockPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: fetchInventory,
  });

  const [threshold, setThreshold] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");

  const criticalProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return data
      .filter((p) => {
        const isCritical = (p.stock ?? 0) <= threshold;
        const matchesName = term.length === 0 || p.name.toLowerCase().includes(term);
        return isCritical && matchesName;
      })
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  }, [data, threshold, searchTerm]);

  const totalCritical = criticalProducts.length;
  const totalUnitsCritical = criticalProducts.reduce((sum, p) => sum + (p.stock ?? 0), 0);

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center text-[#8D6E63]">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#D7CCC8] border-r-[#E53935] mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest">Analisando estoque...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Alerta de Topo */}
      <div className="bg-[#FFEBEE] border-l-4 border-[#C62828] p-6 rounded-r-sm shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
        <div className="flex gap-4">
            <div className="bg-white p-3 rounded-full border border-[#FFCDD2]">
                <AlertTriangle className="h-6 w-6 text-[#C62828]" />
            </div>
            <div>
                <h1 className="text-2xl font-serif font-bold text-[#B71C1C]">Estoque Crítico</h1>
                <p className="text-[#C62828] text-sm mt-1">Itens que precisam de reposição urgente no ateliê.</p>
            </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center w-full md:w-auto">
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-sm border border-[#FFCDD2]">
                <span className="text-xs font-bold text-[#B71C1C] uppercase">Definir Limite:</span>
                <Input 
                    type="number" 
                    min="1" 
                    value={threshold} 
                    onChange={e => setThreshold(Math.max(1, Number(e.target.value)))} 
                    className="w-16 h-8 text-center border-[#FFCDD2] text-[#C62828] font-bold bg-[#FFEBEE] rounded-sm focus:border-[#C62828]"
                />
                <span className="text-xs font-bold text-[#B71C1C]">unidades</span>
            </div>

            <div className="flex gap-4">
                <div className="bg-white px-4 py-2 rounded-sm border border-[#FFCDD2] text-center min-w-[100px]">
                    <span className="text-[10px] font-bold text-[#B71C1C] uppercase block">Produtos</span>
                    <span className="text-xl font-black text-[#C62828]">{totalCritical}</span>
                </div>
                <div className="bg-white px-4 py-2 rounded-sm border border-[#FFE0B2] text-center min-w-[100px]">
                    <span className="text-[10px] font-bold text-[#E65100] uppercase block">Unidades</span>
                    <span className="text-xl font-black text-[#EF6C00]">{totalUnitsCritical}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Lista de Itens */}
      <Card className="border border-[#D7CCC8] rounded-sm bg-white shadow-sm">
        <CardHeader className="bg-[#FAF7F5] border-b border-[#EFEBE9] py-4 px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-white border border-[#D7CCC8] rounded-sm">
                    <Package size={18} className="text-[#5D4037]" />
                </div>
                <CardTitle className="text-sm font-bold text-[#5D4037] uppercase tracking-wider">Lista de Reposição</CardTitle>
            </div>
            
            <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                    <Input 
                        value={searchTerm} 
                        onChange={e => setSearchTerm(e.target.value)} 
                        placeholder="Filtrar produto..." 
                        className="pl-9 h-9 text-xs bg-white border-[#D7CCC8] text-[#5D4037] rounded-sm focus:border-[#E53935]"
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm("")} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#E53935]">
                            <X size={14}/>
                        </button>
                    )}
                </div>
                <Button 
                    variant="outline" 
                    onClick={() => { setSearchTerm(""); setThreshold(5); }}
                    className="h-9 text-xs border-[#D7CCC8] text-[#8D6E63] hover:text-[#5D4037] uppercase font-bold tracking-wider rounded-sm"
                >
                    Limpar
                </Button>
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
            {criticalProducts.length === 0 ? (
                <div className="p-16 text-center text-[#8D6E63] flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#E8F5E9] rounded-full flex items-center justify-center border border-[#C8E6C9] mb-4">
                        <CheckCircle2 size={32} className="text-[#2E7D32]" />
                    </div>
                    <p className="font-serif text-lg text-[#1B5E20] mb-1">Estoque Saudável!</p>
                    <p className="text-sm">Nenhum item abaixo do limite de alerta.</p>
                </div>
            ) : (
                <table className="w-full text-sm text-left">
                    <thead className="bg-[#EFEBE9] text-[10px] font-bold text-[#8D6E63] uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-3">Produto</th>
                            <th className="px-6 py-3">Linha</th>
                            <th className="px-6 py-3 text-center">Tipo</th>
                            <th className="px-6 py-3 text-right">Restam</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#EFEBE9]">
                        {criticalProducts.map(p => {
                            const isVeryLow = (p.stock ?? 0) <= 2;
                            return (
                                <tr key={p.id} className={`transition-colors ${isVeryLow ? 'bg-[#FFEBEE]/50 hover:bg-[#FFEBEE]' : 'hover:bg-[#FAF7F5]'}`}>
                                    <td className="px-6 py-3 font-bold text-[#5D4037]">{p.name}</td>
                                    <td className="px-6 py-3 text-xs text-[#8D6E63] uppercase">{lineLabel(p.line)}</td>
                                    <td className="px-6 py-3 text-center">
                                        {p.customizable ? (
                                            <span className="text-[9px] bg-[#FFF8E1] text-[#F57F17] px-2 py-1 rounded-sm border border-[#FFE0B2] uppercase font-bold flex items-center justify-center gap-1 w-fit mx-auto">
                                                <Sparkles size={8} /> Personalizável
                                            </span>
                                        ) : (
                                            <span className="text-[9px] bg-[#F5F5F5] text-[#8D6E63] px-2 py-1 rounded-sm border border-[#D7CCC8] uppercase font-bold w-fit mx-auto block">
                                                Liso
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <span className={`font-mono font-bold px-3 py-1 rounded-sm text-xs border ${isVeryLow ? 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]' : 'bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]'}`}>
                                            {isVeryLow && <AlertTriangle size={10} className="inline mr-1 -mt-0.5"/>}
                                            {p.stock}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            )}
        </CardContent>
      </Card>
    </div>
  );
}