"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Product = {
  id: number;
  name: string;
  category: "CLOTHING" | "ACCESSORIES" | "HOME_DECOR" | "OTHER";
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

export default function AdminStockPage() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin", "inventory"],
    queryFn: fetchInventory,
  });

  const grouped = useMemo(() => {
    const result: Record<string, { plain: Product[]; customizable: Product[] }> =
      {};
    for (const p of data) {
      const cat = p.category ?? "OTHER";
      if (!result[cat]) result[cat] = { plain: [], customizable: [] };
      if (p.customizable) result[cat].customizable.push(p);
      else result[cat].plain.push(p);
    }
    return result;
  }, [data]);

  if (isLoading) {
    return (
      <div className="p-4 text-xs text-slate-500">
        Carregando visão de estoque...
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <h1 className="text-base font-semibold text-slate-800">
        Visão geral de estoque
      </h1>

      {Object.entries(grouped).map(([category, { plain, customizable }]) => (
        <Card key={category}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {category === "CLOTHING" && "Linha toalhas / roupas"}
              {category === "HOME_DECOR" && "Linha casa / decoração"}
              {category === "ACCESSORIES" && "Acessórios"}
              {category === "OTHER" && "Outros"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div>
              <p className="mb-1 font-semibold">Peças lisas (sem bordado)</p>
              <table className="w-full border-collapse text-[11px]">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="py-1 text-left">Produto</th>
                    <th className="py-1 text-right">Estoque</th>
                  </tr>
                </thead>
                <tbody>
                  {plain.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-1">{p.name}</td>
                      <td className="py-1 text-right">{p.stock}</td>
                    </tr>
                  ))}
                  {plain.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-1 text-[11px] text-slate-400"
                      >
                        Nenhum item cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

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
                  {customizable.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-1">{p.name}</td>
                      <td className="py-1 text-right">{p.stock}</td>
                    </tr>
                  ))}
                  {customizable.length === 0 && (
                    <tr>
                      <td
                        colSpan={2}
                        className="py-1 text-[11px] text-slate-400"
                      >
                        Nenhum item cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
