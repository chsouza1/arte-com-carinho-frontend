"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      .sort((a, b) => (a.stock ?? 0) - (b.stock ?? 0)); // os mais graves primeiro
  }, [data, threshold, searchTerm]);

  const totalCritical = criticalProducts.length;
  const totalUnitsCritical = criticalProducts.reduce(
    (sum, p) => sum + (p.stock ?? 0),
    0,
  );

  if (isLoading) {
    return (
      <div className="p-4 text-xs text-slate-500">
        Carregando painel de estoque crítico...
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <Card className="border-rose-200 bg-rose-50/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-rose-800">
            Painel de alerta de estoque
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-[11px] text-rose-900 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p>
              Aqui aparecem apenas itens com estoque **crítico**, ou seja,
              menor ou igual ao limite definido.
            </p>
            <p className="mt-1">
              Use esse painel para planejar compra de toalhas lisas / base para
              bordado.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex items-center gap-2">
              <span>Limite de alerta:</span>
              <Input
                type="number"
                min={1}
                className="h-7 w-16 border-rose-300 text-[11px]"
                value={threshold}
                onChange={(e) =>
                  setThreshold(Math.max(1, Number(e.target.value) || 1))
                }
              />
              <span>peças</span>
            </div>
            <div className="flex flex-wrap gap-3 text-[11px]">
              <span>
                Produtos críticos:{" "}
                <strong>{totalCritical}</strong>
              </span>
              <span>
                Total de unidades em nível crítico:{" "}
                <strong>{totalUnitsCritical}</strong>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
            <span>Lista de itens críticos</span>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Buscar por nome do produto..."
                  className="h-8 text-[11px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-rose-200 text-[11px] text-rose-600 hover:bg-rose-50"
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
        <CardContent>
          {criticalProducts.length === 0 ? (
            <p className="text-[11px] text-slate-500">
              Nenhum item está abaixo ou igual ao limite de alerta atual. 🎉
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border-b bg-slate-50 text-slate-700">
                    <th className="px-2 py-1 text-left">Produto</th>
                    <th className="px-2 py-1 text-left">Linha</th>
                    <th className="px-2 py-1 text-center">Tipo</th>
                    <th className="px-2 py-1 text-right">Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {criticalProducts.map((p) => {
                    const lineName = lineLabel(p.line);
                    const isVeryLow = (p.stock ?? 0) <= 2;
                    return (
                      <tr
                        key={p.id}
                        className={`border-b last:border-0 ${
                          isVeryLow ? "bg-rose-100/70" : "bg-rose-50/40"
                        }`}
                      >
                        <td className="px-2 py-1 text-slate-800">
                          {p.name}
                        </td>
                        <td className="px-2 py-1 text-slate-700">
                          {lineName}
                        </td>
                        <td className="px-2 py-1 text-center text-slate-700">
                          {p.customizable ? "Personalizável" : "Liso"}
                        </td>
                        <td
                          className={`px-2 py-1 text-right ${
                            isVeryLow
                              ? "font-semibold text-rose-800"
                              : "text-rose-700"
                          }`}
                        >
                          {p.stock}
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
  );
}
