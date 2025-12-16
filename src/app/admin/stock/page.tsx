"use client";

import { useMemo, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Package, Search, Download, Filter, Sparkles, X, AlertTriangle } from "lucide-react";

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
      return "Kits / jogos de toalhas";
    default:
      return "Outros produtos";
  }
}

const lineColors: Record<string, { from: string; to: string; border: string; icon: string }> = {
  TOWEL_BATH: { from: "blue-50", to: "sky-50", border: "blue-200", icon: "blue-600" },
  TOWEL_FACE: { from: "purple-50", to: "violet-50", border: "purple-200", icon: "purple-600" },
  TOWEL_HAND: { from: "amber-50", to: "yellow-50", border: "amber-200", icon: "amber-600" },
  TOWEL_BABY: { from: "pink-50", to: "rose-50", border: "pink-200", icon: "pink-600" },
  KIT: { from: "emerald-50", to: "green-50", border: "emerald-200", icon: "emerald-600" },
  OTHER: { from: "slate-50", to: "gray-50", border: "slate-200", icon: "slate-600" },
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

    const result: Record<
      string,
      {
        plain: Product[];
        customizable: Product[];
        total: number;
        totalVisible: number;
      }
    > = {};

    for (const p of data) {
      const key = p.line ?? "OTHER";

      const nameMatches =
        term.length === 0 ||
        p.name.toLowerCase().includes(term);

      const isLow = (p.stock ?? 0) <= lowStockThreshold;
      const passesLowFilter = !showLowOnly || isLow;

      if (!result[key]) {
        result[key] = {
          plain: [],
          customizable: [],
          total: 0,
          totalVisible: 0,
        };
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
    const rows: {
      id: number;
      name: string;
      line: string;
      stock: number;
      customizable: string;
    }[] = [];

    for (const [lineKey, info] of Object.entries(grouped)) {
      const lineName = lineLabel(lineKey as ProductLine);

      for (const p of info.plain) {
        rows.push({
          id: p.id,
          name: p.name,
          line: lineName + " (lisa)",
          stock: p.stock ?? 0,
          customizable: "Não",
        });
      }

      for (const p of info.customizable) {
        rows.push({
          id: p.id,
          name: p.name,
          line: lineName + " (personalizável)",
          stock: p.stock ?? 0,
          customizable: "Sim",
        });
      }
    }

    return rows;
  }, [grouped]);

  const handleExportCsv = useCallback(() => {
    if (flattenedVisibleProducts.length === 0) {
      alert("Não há itens visíveis com os filtros atuais para exportar.");
      return;
    }

    const header = ["ID", "Nome", "Linha", "Estoque", "Personalizável"];

    const lines = flattenedVisibleProducts.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.line.replace(/"/g, '""')}"`,
      p.stock,
      p.customizable,
    ]);

    const csvContent =
      header.join(";") +
      "\n" +
      lines.map((row) => row.join(";")).join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const timestamp = now
      .toISOString()
      .slice(0, 19)
      .replace(/[:T]/g, "-");
    link.href = url;
    link.setAttribute(
      "download",
      `estoque-arte-com-carinho-${timestamp}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [flattenedVisibleProducts]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 text-center">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent mb-4"></div>
            <p className="text-sm font-semibold text-neutral-600">
              Carregando visão de estoque...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <section className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
                <Package size={24} className="text-rose-600" />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
                <Sparkles size={14} className="animate-pulse" />
                Inventário completo
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Visão Geral de Estoque
            </h1>
            <p className="mt-3 text-base text-neutral-600 font-medium">
              Consulta rápida de toalhas lisas e personalizáveis organizadas por linha.
            </p>
          </div>
        </section>

        {/* Filtros e Controles */}
        <section className="rounded-[2rem] bg-white/80 backdrop-blur-sm p-6 shadow-lg border-2 border-rose-200">
          <div className="flex flex-col gap-6">
            {/* Linha 1: Busca e Exportar */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex-1 max-w-xl">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Buscar por nome do produto
                </label>
                <div className="relative flex items-center">
                  <Search className="absolute left-4 h-5 w-5 text-rose-400" />
                  <Input
                    placeholder="Ex.: toalha de banho lisa, toalha de boca, kit..."
                    className="h-12 pl-12 pr-10 rounded-2xl border-2 border-rose-200 text-sm font-medium focus:border-rose-400 transition-colors"
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
              </div>

              <Button
                size="sm"
                className="h-12 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 text-sm font-bold text-white hover:from-emerald-600 hover:to-green-600 transition-all shadow-lg shadow-emerald-500/30 hover:shadow-xl"
                onClick={handleExportCsv}
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
            </div>

            {/* Linha 2: Filtros Avançados */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 border-2 border-blue-200">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-bold text-slate-800">Filtros</span>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-3 rounded-xl bg-white border-2 border-blue-300 px-4 py-2.5 shadow-sm">
                  <label className="text-xs font-bold text-slate-700 whitespace-nowrap">
                    Estoque baixo ≤
                  </label>
                  <Input
                    type="number"
                    min={1}
                    className="h-9 w-20 border-2 border-blue-300 text-sm font-bold text-center rounded-xl"
                    value={lowStockThreshold}
                    onChange={(e) =>
                      setLowStockThreshold(
                        Math.max(1, Number(e.target.value) || 1),
                      )
                    }
                  />
                </div>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-white border-2 border-blue-300 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-blue-50 transition-colors shadow-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded accent-blue-600 cursor-pointer"
                    checked={showLowOnly}
                    onChange={(e) => setShowLowOnly(e.target.checked)}
                  />
                  Apenas estoque baixo
                </label>

                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 px-4 rounded-xl border-2 border-rose-200 text-sm font-bold text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
                  onClick={() => {
                    setSearchTerm("");
                    setShowLowOnly(false);
                    setLowStockThreshold(5);
                  }}
                >
                  Limpar filtros
                </Button>
              </div>
            </div>

            {/* Info sobre exportação */}
            <p className="text-xs text-center text-slate-500 font-medium">
              💡 A exportação considera apenas os itens visíveis com os filtros aplicados
            </p>
          </div>
        </section>

        {/* Mensagem se vazio */}
        {Object.entries(grouped).length === 0 && (
          <div className="rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-16 shadow-xl backdrop-blur-sm border border-white/50 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center mb-4">
              <Package className="h-10 w-10 text-slate-400" />
            </div>
            <p className="text-base font-semibold text-slate-700">
              Nenhum item encontrado
            </p>
            <p className="text-sm text-slate-500 mt-2">
              Ajuste os filtros para ver os produtos
            </p>
          </div>
        )}

        {/* Cards por linha */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([line, info]) => {
            if (info.plain.length === 0 && info.customizable.length === 0) {
              return null;
            }

            const colors = lineColors[line] || lineColors.OTHER;

            return (
              <Card key={line} className={`rounded-3xl border-2 border-${colors.border} bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden`}>
                <CardHeader className={`bg-gradient-to-r from-${colors.from} to-${colors.to} border-b-2 border-${colors.border} pb-5`}>
                  <CardTitle className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-xl bg-white p-2.5 shadow-md">
                        <Package className={`h-5 w-5 text-${colors.icon}`} />
                      </div>
                      <span className="text-base font-bold text-slate-800">
                        {lineLabel(line as ProductLine)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white border-2 border-slate-300 px-4 py-1.5 text-xs font-bold text-slate-700 shadow-sm">
                        <Package className="h-3 w-3" />
                        Total: {info.total ?? 0}
                      </span>
                      {info.totalVisible !== info.total && (
                        <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-${colors.from} to-${colors.to} border-2 border-${colors.border} px-4 py-1.5 text-xs font-bold text-${colors.icon} shadow-sm`}>
                          <Filter className="h-3 w-3" />
                          Visível: {info.totalVisible ?? 0}
                        </span>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 grid gap-6 md:grid-cols-2">
                  {/* Lisas */}
                  <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-gray-50 p-4 border-2 border-slate-200">
                    <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-600"></span>
                      Peças lisas (sem bordado)
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-slate-200">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-white">
                            <th className="py-2 px-3 text-left font-bold text-slate-700">Produto</th>
                            <th className="py-2 px-3 text-right font-bold text-slate-700">Estoque</th>
                          </tr>
                        </thead>
                        <tbody>
                          {info.plain.map((p) => {
                            const isLow = (p.stock ?? 0) <= lowStockThreshold;
                            return (
                              <tr
                                key={p.id}
                                className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${
                                  isLow ? "bg-rose-50/80" : "bg-white"
                                }`}
                              >
                                <td className="py-2 px-3">
                                  <span className={`font-medium ${isLow ? "text-rose-700" : "text-slate-700"}`}>
                                    {p.name}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                    isLow
                                      ? "bg-rose-100 text-rose-700 border border-rose-300"
                                      : "bg-slate-100 text-slate-700"
                                  }`}>
                                    {isLow && <AlertTriangle className="h-3 w-3" />}
                                    {p.stock}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {info.plain.length === 0 && (
                            <tr>
                              <td colSpan={2} className="py-4 px-3 text-center text-xs text-slate-400">
                                Nenhum item nessa categoria
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Personalizáveis */}
                  <div className="rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 border-2 border-purple-200">
                    <p className="text-sm font-black text-slate-800 mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Peças personalizáveis
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-purple-200">
                      <table className="w-full border-collapse text-xs">
                        <thead>
                          <tr className="bg-white">
                            <th className="py-2 px-3 text-left font-bold text-slate-700">Produto</th>
                            <th className="py-2 px-3 text-right font-bold text-slate-700">Estoque</th>
                          </tr>
                        </thead>
                        <tbody>
                          {info.customizable.map((p) => {
                            const isLow = (p.stock ?? 0) <= lowStockThreshold;
                            return (
                              <tr
                                key={p.id}
                                className={`border-t border-purple-100 hover:bg-purple-50 transition-colors ${
                                  isLow ? "bg-rose-50/80" : "bg-white"
                                }`}
                              >
                                <td className="py-2 px-3">
                                  <span className={`font-medium ${isLow ? "text-rose-700" : "text-slate-700"}`}>
                                    {p.name}
                                  </span>
                                </td>
                                <td className="py-2 px-3 text-right">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                                    isLow
                                      ? "bg-rose-100 text-rose-700 border border-rose-300"
                                      : "bg-purple-100 text-purple-700 border border-purple-200"
                                  }`}>
                                    {isLow && <AlertTriangle className="h-3 w-3" />}
                                    {p.stock}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                          {info.customizable.length === 0 && (
                            <tr>
                              <td colSpan={2} className="py-4 px-3 text-center text-xs text-slate-400">
                                Nenhum item personalizável
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}