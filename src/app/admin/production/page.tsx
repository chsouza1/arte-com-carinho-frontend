"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProductionStage = "BORDADO" | "COSTURA" | "ACABAMENTO" | "EMBALAGEM" | "CONCLUIDO";

type ProductionCardItem = {
  name: string;
  quantity: number;
};

type ProductionCard = {
  orderId: number;
  orderNumber: string;
  customerName: string;
  stage: ProductionStage;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  notes?: string | null;
  updatedAt?: string | null;
  items: ProductionCardItem[];
};

type ProductionBoard = {
  columns: Record<ProductionStage, ProductionCard[]>;
};

const STAGES: { key: ProductionStage; title: string }[] = [
  { key: "BORDADO", title: "Bordado" },
  { key: "COSTURA", title: "Costura" },
  { key: "ACABAMENTO", title: "Acabamento" },
  { key: "EMBALAGEM", title: "Embalagem" },
  { key: "CONCLUIDO", title: "Concluído" },
];

async function fetchBoard(): Promise<ProductionBoard> {
  const res = await api.get("/production/board");
  return res.data;
}

export default function AdminProductionPage() {
  const qc = useQueryClient();
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});

  useEffect(() => {
    applyAuthFromStorage();
  }, []);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "production-board"],
    queryFn: fetchBoard,
    refetchInterval: 15_000, // atualiza a cada 15s (opcional)
  });

  const moveNext = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await api.post(`/production/orders/${orderId}/next`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "production-board"] }),
  });

  const movePrev = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await api.post(`/production/orders/${orderId}/prev`);
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "production-board"] }),
  });

  const saveNotes = useMutation({
    mutationFn: async ({ orderId, notes }: { orderId: number; notes: string }) => {
      const res = await api.patch(`/production/orders/${orderId}`, { notes });
      return res.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "production-board"] }),
  });

  const setStatus = useMutation({
  mutationFn: async ({ orderId, status }: { orderId: number; status: "PENDING" | "IN_PROGRESS" | "DONE" }) => {
    const res = await api.patch(`/production/orders/${orderId}`, { status });
    return res.data;
  },
  onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "production-board"] }),
});


  const board = data?.columns;

  if (isError) {
    return (
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Produção</h1>
        <p className="text-sm text-red-600">
          Erro ao carregar o quadro. Verifique se está logado como admin.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-900">Produção</h1>
        <p className="text-sm text-slate-600">
          Acompanhe e mova pedidos entre etapas: bordado, costura, acabamento e embalagem.
        </p>
      </section>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((s) => (
            <Card key={s.key} className="border-rose-100 bg-white/95 shadow-sm">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-slate-800">{s.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-24 w-full rounded-lg bg-rose-50" />
                <Skeleton className="h-24 w-full rounded-lg bg-rose-50" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!isLoading && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {STAGES.map((col) => {
            const cards = board?.[col.key] ?? [];

            return (
              <Card key={col.key} className="border-rose-100 bg-white/95 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-semibold text-slate-800">
                    {col.title}
                  </CardTitle>
                  <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] text-slate-700">
                    {cards.length}
                  </span>
                </CardHeader>

                <CardContent className="space-y-3">
                  {cards.length === 0 && (
                    <p className="text-xs text-slate-500">Nenhum pedido nesta etapa.</p>
                  )}

                  {cards.map((card) => {
                    const draft = notesDraft[card.orderId] ?? (card.notes ?? "");

                    return (
                      <div
                        key={card.orderId}
                        className="rounded-lg border border-rose-100 bg-white p-3 text-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-900">
                              {card.orderNumber}
                            </div>
                            <div className="text-[11px] text-slate-600">
                              {card.customerName}
                            </div>
                          </div>

                          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">
                            #{card.orderId}
                          </span>
                        </div>

                        <div className="mt-2 space-y-1">
                          {card.items?.slice(0, 3).map((it, idx) => (
                            <div key={idx} className="text-[11px] text-slate-600">
                              • {it.name} <span className="text-slate-500">x{it.quantity}</span>
                            </div>
                          ))}
                          {card.items && card.items.length > 3 && (
                            <div className="text-[11px] text-slate-500">
                              +{card.items.length - 3} itens…
                            </div>
                          )}
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                            <Button
                                variant={card.status === "PENDING" ? "default" : "outline"}
                                size="sm"
                                className="h-7 text-[11px]"
                                onClick={() => setStatus.mutate({ orderId: card.orderId, status: "PENDING" })}
                                disabled={setStatus.isPending}
                            >
                                Pendente
                            </Button>

                            <Button
                                variant={card.status === "IN_PROGRESS" ? "default" : "outline"}
                                size="sm"
                                className="h-7 text-[11px]"
                                onClick={() => setStatus.mutate({ orderId: card.orderId, status: "IN_PROGRESS" })}
                                disabled={setStatus.isPending}
                            >
                                Em andamento
                            </Button>

                            <Button
                                variant={card.status === "DONE" ? "default" : "outline"}
                                size="sm"
                                className="h-7 text-[11px]"
                                onClick={() => setStatus.mutate({ orderId: card.orderId, status: "DONE" })}
                                disabled={setStatus.isPending}
                            >
                                Feito
                            </Button>
                            </div>
                        <div className="mt-3 space-y-2">
                          <Textarea
                            value={draft}
                            onChange={(e) =>
                              setNotesDraft((prev) => ({
                                ...prev,
                                [card.orderId]: e.target.value,
                              }))
                            }
                            placeholder="Observações da produção (ex: nome bordado, cor, detalhes...)"
                            className="min-h-[70px] text-xs"
                          />


                          <div className="flex gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 text-xs"
                              disabled={saveNotes.isPending}
                              onClick={() => saveNotes.mutate({ orderId: card.orderId, notes: draft })}
                            >
                              Salvar obs.
                            </Button>

                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                onClick={() => window.open(`/api/production/orders/${card.orderId}/pdf`, "_blank")}
                                >
                                PDF
                            </Button>

                            <div className="ml-auto flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-xs"
                                disabled={col.key === "BORDADO" || movePrev.isPending}
                                onClick={() => movePrev.mutate(card.orderId)}
                              >
                                Voltar
                              </Button>

                              <Button
                                size="sm"
                                className={cn("h-8 text-xs", col.key === "CONCLUIDO" && "opacity-60")}
                                disabled={col.key === "CONCLUIDO" || moveNext.isPending}
                                onClick={() => moveNext.mutate(card.orderId)}
                              >
                                Avançar
                              </Button>
                            </div>
                          </div>

                          {card.updatedAt && (
                            <div className="text-[10px] text-slate-400">
                              Atualizado em {new Date(card.updatedAt).toLocaleString("pt-BR")}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
