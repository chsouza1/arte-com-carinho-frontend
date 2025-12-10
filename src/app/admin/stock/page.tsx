"use client";

import { useMemo, useState, useCallback } from "react";
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

// Labels mais “vida real” para o admin
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

export default function AdminStockPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: fetchInventory,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [showLowOnly, setShowLowOnly] = useState(false);
  const [lowStockThreshold, setLowStockThreshold] = useState(5);

  // produtos já filtrados (linha por linha) para uso tanto na tela quanto no CSV
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

      // sempre controla total geral da linha
      if (!result[key]) {
        result[key] = {
          plain: [],
          customizable: [],
          total: 0,
          totalVisible: 0,
        };
      }
      result[key].total += p.stock ?? 0;

      // aplica filtros só para o que aparece na tela
      if (!nameMatches || !passesLowFilter) continue;

      if (p.customizable) result[key].customizable.push(p);
      else result[key].plain.push(p);

      result[key].totalVisible += p.stock ?? 0;
    }

    return result;
  }, [data, searchTerm, showLowOnly, lowStockThreshold]);

  // mesma lista filtrada, mas “achatada” para exportar CSV
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

    const header = [
      "ID",
      "Nome",
      "Linha",
      "Estoque",
      "Personalizável",
    ];

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
      <div className="p-4 text-xs text-slate-500">
        Carregando visão de estoque...
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* título + controles principais */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-800">
            Visão geral de estoque por linha
          </h1>
          <p className="mt-1 text-[11px] text-slate-500">
            Consulta rápida de toalhas lisas e personalizáveis por linha
            (banho, rosto/boca, baby, kits).
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2">
              <label className="text-[11px] text-slate-600">
                Estoque baixo ≤
              </label>
              <Input
                type="number"
                min={1}
                className="h-8 w-16 text-xs"
                value={lowStockThreshold}
                onChange={(e) =>
                  setLowStockThreshold(
                    Math.max(1, Number(e.target.value) || 1),
                  )
                }
              />
            </div>
            <label className="flex cursor-pointer items-center gap-2 text-[11px] text-slate-600">
              <input
                type="checkbox"
                className="h-3 w-3 accent-rose-600"
                checked={showLowOnly}
                onChange={(e) => setShowLowOnly(e.target.checked)}
              />
              Mostrar apenas itens com estoque baixo
            </label>
          </div>

          <div className="mt-1 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-rose-200 text-[11px] text-rose-600 hover:bg-rose-50"
              onClick={() => {
                setSearchTerm("");
                setShowLowOnly(false);
                setLowStockThreshold(5);
              }}
            >
              Limpar filtros
            </Button>
            <Button
              size="sm"
              className="h-8 bg-rose-600 text-[11px] text-white hover:bg-rose-700"
              onClick={handleExportCsv}
            >
              Exportar CSV do estoque visível
            </Button>
          </div>
        </div>
      </div>

      {/* busca por nome */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:w-80">
          <label className="mb-1 block text-[11px] font-medium text-slate-700">
            Buscar por nome do produto
          </label>
          <Input
            placeholder="Ex.: toalha de banho lisa, toalha de boca, kit..."
            className="h-8 text-xs"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <p className="text-[11px] text-slate-500">
          Exportação considera somente os itens que estão visíveis com os
          filtros aplicados.
        </p>
      </div>

      {/* mensagem se nada aparecer com os filtros */}
      {Object.entries(grouped).length === 0 && (
        <p className="mt-4 text-[11px] text-slate-500">
          Nenhum item encontrado com os filtros atuais.
        </p>
      )}

      {/* cards por linha */}
      {Object.entries(grouped).map(([line, info]) => {
        if (info.plain.length === 0 && info.customizable.length === 0) {
          return null;
        }

        return (
          <Card key={line}>
            <CardHeader className="pb-2">
              <CardTitle className="flex flex-col gap-1 text-sm sm:flex-row sm:items-baseline sm:justify-between">
                <span>{lineLabel(line as ProductLine)}</span>
                <span className="text-[11px] font-normal text-slate-500">
                  Total geral da linha:{" "}
                  <strong>{info.total ?? 0}</strong>{" "}
                  {info.totalVisible !== info.total && (
                    <>
                      {" "}
                      • Visível com filtros:{" "}
                      <strong>{info.totalVisible ?? 0}</strong>
                    </>
                  )}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-xs md:grid-cols-2">
              {/* Lisas */}
              <div>
                <p className="mb-1 font-semibold">
                  Peças lisas (sem bordado / não personalizáveis)
                </p>
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="py-1 text-left">Produto</th>
                      <th className="py-1 text-right">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.plain.map((p) => {
                      const isLow =
                        (p.stock ?? 0) <= lowStockThreshold;
                      return (
                        <tr
                          key={p.id}
                          className={`border-b last:border-0 ${
                            isLow ? "bg-rose-50/60" : ""
                          }`}
                        >
                          <td className="py-1">
                            <span
                              className={
                                isLow
                                  ? "font-medium text-rose-700"
                                  : "text-slate-700"
                              }
                            >
                              {p.name}
                            </span>
                          </td>
                          <td
                            className={`py-1 text-right ${
                              isLow
                                ? "font-semibold text-rose-700"
                                : "text-slate-700"
                            }`}
                          >
                            {p.stock}
                          </td>
                        </tr>
                      );
                    })}
                    {info.plain.length === 0 && (
                      <tr>
                        <td
                          colSpan={2}
                          className="py-1 text-[11px] text-slate-400"
                        >
                          Nenhum item listado nessa linha com os filtros
                          atuais.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Personalizáveis */}
              <div>
                <p className="mb-1 font-semibold">
                  Peças para bordar / personalizáveis
                </p>
                <table className="w-full border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b bg-slate-50">
                      <th className="py-1 text-left">Produto</th>
                      <th className="py-1 text-right">Estoque</th>
                    </tr>
                  </thead>
                  <tbody>
                    {info.customizable.map((p) => {
                      const isLow =
                        (p.stock ?? 0) <= lowStockThreshold;
                      return (
                        <tr
                          key={p.id}
                          className={`border-b last:border-0 ${
                            isLow ? "bg-rose-50/60" : ""
                          }`}
                        >
                          <td className="py-1">
                            <span
                              className={
                                isLow
                                  ? "font-medium text-rose-700"
                                  : "text-slate-700"
                              }
                            >
                              {p.name}
                            </span>
                          </td>
                          <td
                            className={`py-1 text-right ${
                              isLow
                                ? "font-semibold text-rose-700"
                                : "text-slate-700"
                            }`}
                          >
                            {p.stock}
                          </td>
                        </tr>
                      );
                    })}
                    {info.customizable.length === 0 && (
                      <tr>
                        <td
                          colSpan={2}
                          className="py-1 text-[11px] text-slate-400"
                        >
                          Nenhum produto personalizável listado nessa linha
                          com os filtros atuais.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
