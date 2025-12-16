"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Package, ChevronRight, ChevronLeft, FileText, Sparkles, Clock, CheckCircle } from "lucide-react";

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

const STAGES: { key: ProductionStage; title: string; color: string }[] = [
  { key: "BORDADO", title: "Bordado", color: "blue" },
  { key: "COSTURA", title: "Costura", color: "purple" },
  { key: "ACABAMENTO", title: "Acabamento", color: "amber" },
  { key: "EMBALAGEM", title: "Embalagem", color: "orange" },
  { key: "CONCLUIDO", title: "Concluído", color: "emerald" },
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
    refetchInterval: 15_000,
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
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50">
            <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500">
              Produção
            </h1>
            <p className="mt-3 text-sm font-semibold text-rose-600">
              Erro ao carregar o quadro. Verifique se está logado como admin.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-[1800px] space-y-8">
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
                Quadro Kanban
              </span>
            </div>
            
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Produção
            </h1>
            <p className="mt-3 text-base text-neutral-600 font-medium">
              Acompanhe e mova pedidos entre etapas: bordado, costura, acabamento e embalagem.
            </p>
          </div>
        </section>

        {isLoading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {STAGES.map((s) => (
              <Card key={s.key} className="rounded-3xl border-2 border-rose-200 bg-white/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-sm font-semibold">{s.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Skeleton className="h-32 rounded-2xl bg-rose-100" />
                  <Skeleton className="h-32 rounded-2xl bg-rose-100" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
            {STAGES.map((col) => {
              const cards = board?.[col.key] ?? [];
              const colorMap = {
                blue: "from-blue-50 to-sky-50 border-blue-200",
                purple: "from-purple-50 to-violet-50 border-purple-200",
                amber: "from-amber-50 to-yellow-50 border-amber-200",
                orange: "from-orange-50 to-red-50 border-orange-200",
                emerald: "from-emerald-50 to-green-50 border-emerald-200",
              };

              const badgeMap = {
                blue: "bg-gradient-to-r from-blue-500 to-sky-500",
                purple: "bg-gradient-to-r from-purple-500 to-violet-500",
                amber: "bg-gradient-to-r from-amber-500 to-yellow-500",
                orange: "bg-gradient-to-r from-orange-500 to-red-500",
                emerald: "bg-gradient-to-r from-emerald-500 to-green-500",
              };

              return (
                <Card key={col.key} className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
                  <CardHeader className={cn("bg-gradient-to-r border-b-2", colorMap[col.color as keyof typeof colorMap])}>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800">
                        {col.title}
                      </span>
                      <span className={cn("rounded-full px-3 py-1 text-xs font-bold text-white shadow-lg", badgeMap[col.color as keyof typeof badgeMap])}>
                        {cards.length}
                      </span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto">
                    {cards.length === 0 && (
                      <div className="text-center py-8">
                        <div className="mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-slate-100 to-gray-100 flex items-center justify-center mb-3">
                          <Package className="h-6 w-6 text-slate-400" />
                        </div>
                        <p className="text-xs font-semibold text-slate-500">
                          Nenhum pedido nesta etapa
                        </p>
                      </div>
                    )}

                    {cards.map((card) => {
                      const draft = notesDraft[card.orderId] ?? (card.notes ?? "");
                      const statusColors = {
                        PENDING: "bg-amber-100 text-amber-700 border-amber-300",
                        IN_PROGRESS: "bg-blue-100 text-blue-700 border-blue-300",
                        DONE: "bg-emerald-100 text-emerald-700 border-emerald-300",
                      };

                      return (
                        <div
                          key={card.orderId}
                          className="rounded-2xl border-2 border-rose-100 bg-white p-4 shadow-sm hover:shadow-md transition-all"
                        >
                          {/* Header do card */}
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <div className="flex-1">
                              <div className="font-black text-sm text-slate-900 mb-1">
                                {card.orderNumber}
                              </div>
                              <div className="text-xs text-slate-600 font-semibold">
                                {card.customerName}
                              </div>
                            </div>
                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 border border-slate-200">
                              #{card.orderId}
                            </span>
                          </div>

                          {/* Status atual */}
                          <div className={cn("inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border-2 mb-3", statusColors[card.status])}>
                            {card.status === "PENDING" && <Clock className="h-3 w-3" />}
                            {card.status === "IN_PROGRESS" && <Sparkles className="h-3 w-3" />}
                            {card.status === "DONE" && <CheckCircle className="h-3 w-3" />}
                            {card.status === "PENDING" ? "Pendente" : card.status === "IN_PROGRESS" ? "Em andamento" : "Concluído"}
                          </div>

                          {/* Items */}
                          <div className="space-y-1 mb-3 p-3 rounded-xl bg-gradient-to-br from-slate-50 to-gray-50 border border-slate-200">
                            {card.items?.slice(0, 3).map((it, idx) => (
                              <div key={idx} className="text-xs text-slate-700 font-medium">
                                • {it.name} <span className="text-slate-500 font-bold">x{it.quantity}</span>
                              </div>
                            ))}
                            {card.items && card.items.length > 3 && (
                              <div className="text-xs text-slate-500 font-semibold">
                                +{card.items.length - 3} itens…
                              </div>
                            )}
                          </div>

                          {/* Botões de status */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <Button
                              variant={card.status === "PENDING" ? "default" : "outline"}
                              size="sm"
                              className="h-8 text-xs rounded-xl"
                              onClick={() => setStatus.mutate({ orderId: card.orderId, status: "PENDING" })}
                              disabled={setStatus.isPending}
                            >
                              Pendente
                            </Button>

                            <Button
                              variant={card.status === "IN_PROGRESS" ? "default" : "outline"}
                              size="sm"
                              className="h-8 text-xs rounded-xl"
                              onClick={() => setStatus.mutate({ orderId: card.orderId, status: "IN_PROGRESS" })}
                              disabled={setStatus.isPending}
                            >
                              Produzindo
                            </Button>

                            <Button
                              variant={card.status === "DONE" ? "default" : "outline"}
                              size="sm"
                              className="h-8 text-xs rounded-xl"
                              onClick={() => setStatus.mutate({ orderId: card.orderId, status: "DONE" })}
                              disabled={setStatus.isPending}
                            >
                              Feito
                            </Button>
                          </div>

                          {/* Observações */}
                          <Textarea
                            value={draft}
                            onChange={(e) =>
                              setNotesDraft((prev) => ({
                                ...prev,
                                [card.orderId]: e.target.value,
                              }))
                            }
                            placeholder="Observações (nome bordado, cor, detalhes...)"
                            className="min-h-[70px] text-xs rounded-xl border-2 border-rose-200 mb-3"
                          />

                          {/* Ações */}
                          <div className="flex flex-wrap gap-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-9 text-xs rounded-xl font-bold"
                              disabled={saveNotes.isPending}
                              onClick={() => saveNotes.mutate({ orderId: card.orderId, notes: draft })}
                            >
                              Salvar obs.
                            </Button>

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-9 text-xs rounded-xl font-bold border-2"
                              onClick={() => window.open(`/api/production/orders/${card.orderId}/pdf`, "_blank")}
                            >
                              <FileText className="h-3.5 w-3.5 mr-1" />
                              PDF
                            </Button>

                            <div className="ml-auto flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-9 px-3 text-xs rounded-xl font-bold border-2"
                                disabled={col.key === "BORDADO" || movePrev.isPending}
                                onClick={() => movePrev.mutate(card.orderId)}
                              >
                                <ChevronLeft className="h-4 w-4" />
                              </Button>

                              <Button
                                size="sm"
                                className={cn(
                                  "h-9 px-3 text-xs rounded-xl font-bold bg-gradient-to-r from-rose-500 to-pink-500 text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30",
                                  col.key === "CONCLUIDO" && "opacity-60"
                                )}
                                disabled={col.key === "CONCLUIDO" || moveNext.isPending}
                                onClick={() => moveNext.mutate(card.orderId)}
                              >
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {card.updatedAt && (
                            <div className="text-[10px] text-slate-400 font-medium mt-3 text-center">
                              Atualizado em {new Date(card.updatedAt).toLocaleString("pt-BR")}
                            </div>
                          )}
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
    </div>
  );
}