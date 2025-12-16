"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Search, Package, Sparkles, X } from "lucide-react";

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
    case "TOWEL_BATH":
      return "Toalha de banho";
    case "TOWEL_FACE":
      return "Toalha de rosto / boca";
    case "TOWEL_HAND":
      return "Toalha de mão / lavabo";
    case "TOWEL_BABY":
      return "Linha baby (fralda / boca infantil)";
    case "KIT":
      return "Kits / jogos";
    default:
      return "Outros produtos";
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
        const matchesName =
          term.length === 0 ||
          p.name.toLowerCase().includes(term);
        return isCritical && matchesName;
      })
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0));
  }, [data, threshold, searchTerm]);

  const totalCritical = criticalProducts.length;
  const totalUnitsCritical = criticalProducts.reduce(
    (sum, p) => sum + (p.stock ?? 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent mb-4"></div>
            <p className="text-sm font-semibold text-neutral-600">
              Carregando painel de estoque crítico...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header com alerta */}
        <Card className="rounded-[2rem] border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-100 to-orange-100 border-b-2 border-amber-200 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-white p-3 shadow-lg">
                <AlertTriangle size={28} className="text-amber-600" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-amber-500/30">
                <Sparkles size={14} className="animate-pulse" />
                Alerta de estoque
              </span>
            </div>
            <CardTitle className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-orange-600 to-red-500">
              Painel de Estoque Crítico
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  ⚠️ Aqui aparecem apenas itens com estoque <span className="font-black">crítico</span>
                </p>
                <p className="text-sm text-amber-800">
                  Use esse painel para planejar compra de toalhas lisas e base para bordado.
                </p>
              </div>
              <div className="flex flex-col gap-3 lg:items-end">
                <div className="flex items-center gap-3 rounded-xl bg-white border-2 border-amber-300 px-4 py-3 shadow-md">
                  <span className="text-xs font-bold text-slate-700">Limite de alerta:</span>
                  <Input
                    type="number"
                    min={1}
                    className="h-9 w-20 border-2 border-amber-300 text-sm font-bold text-center rounded-xl"
                    value={threshold}
                    onChange={(e) =>
                      setThreshold(Math.max(1, Number(e.target.value) || 1))
                    }
                  />
                  <span className="text-xs font-bold text-slate-700">peças</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-white border-2 border-red-300 px-4 py-2 text-center">
                    <div className="text-xs font-bold text-slate-600 mb-1">Produtos críticos</div>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
                      {totalCritical}
                    </div>
                  </div>
                  <div className="rounded-xl bg-white border-2 border-orange-300 px-4 py-2 text-center">
                    <div className="text-xs font-bold text-slate-600 mb-1">Unidades críticas</div>
                    <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-600">
                      {totalUnitsCritical}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de produtos críticos */}
        <Card className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100">
            <CardTitle className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2.5 shadow-md">
                  <Package className="h-5 w-5 text-rose-600" />
                </div>
                <span className="text-base font-bold text-slate-800">
                  Lista de Itens Críticos
                </span>
              </div>
              
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex items-center flex-1 sm:w-80">
                  <Search className="absolute left-4 h-4 w-4 text-rose-400" />
                  <Input
                    placeholder="Buscar por nome do produto..."
                    className="h-11 pl-11 pr-10 rounded-2xl border-2 border-rose-200 text-sm font-medium focus:border-rose-400 transition-colors"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm("")}
                      className="absolute right-3 p-1 hover:bg-rose-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-rose-500" />
                    </button>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-11 px-5 rounded-2xl border-2 border-rose-200 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
                  onClick={() => {
                    setSearchTerm("");
                    setThreshold(5);
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {criticalProducts.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center mb-4">
                  <Package className="h-10 w-10 text-emerald-500" />
                </div>
                <p className="text-base font-bold text-slate-700 mb-2">
                  Nenhum item em nível crítico! 🎉
                </p>
                <p className="text-sm text-slate-500">
                  Todos os produtos estão com estoque acima do limite de alerta
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border-2 border-rose-100">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100">
                      <th className="px-4 py-3 text-left text-xs font-black text-slate-700">
                        Produto
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-black text-slate-700">
                        Linha
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-black text-slate-700">
                        Tipo
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-black text-slate-700">
                        Estoque
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {criticalProducts.map((p) => {
                      const lineName = lineLabel(p.line);
                      const isVeryLow = (p.stock ?? 0) <= 2;
                      return (
                        <tr
                          key={p.id}
                          className={`border-b border-rose-50 last:border-0 transition-colors hover:bg-rose-50/50 ${
                            isVeryLow ? "bg-red-50" : "bg-amber-50/40"
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span className={`text-sm font-semibold ${
                              isVeryLow ? "text-red-800" : "text-slate-800"
                            }`}>
                              {p.name}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700 font-medium">
                            {lineName}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${
                              p.customizable
                                ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border border-purple-200"
                                : "bg-gradient-to-r from-slate-100 to-gray-100 text-slate-700 border border-slate-200"
                            }`}>
                              {p.customizable ? (
                                <>
                                  <Sparkles className="h-3 w-3" />
                                  Personalizável
                                </>
                              ) : (
                                "Liso"
                              )}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-black text-sm ${
                              isVeryLow
                                ? "bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border-2 border-red-300"
                                : "bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700 border-2 border-amber-300"
                            }`}>
                              {isVeryLow && <AlertTriangle className="h-4 w-4" />}
                              {p.stock}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}