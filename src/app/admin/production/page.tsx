// src/app/admin/production/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
  Package, ChevronRight, ChevronLeft, FileText, Sparkles, 
  Clock, CheckCircle, Calendar, AlertTriangle 
} from "lucide-react";
import { useNotifications } from "@/components/ui/notifications"; 

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
  expectedDeliveryDate?: string | null;
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
  const { notify } = useNotifications();
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
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "production-board"] });
      notify(`Pedido ${data.orderNumber} avançou para a próxima etapa!`, "success");
    },
    onError: () => notify("Erro ao mover pedido. Tente novamente.", "error"),
  });

  const movePrev = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await api.post(`/production/orders/${orderId}/prev`);
      return res.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "production-board"] });
      notify(`Pedido ${data.orderNumber} retornou uma etapa.`, "info");
    },
    onError: () => notify("Erro ao voltar etapa.", "error"),
  });

  const saveNotes = useMutation({
    mutationFn: async ({ orderId, notes }: { orderId: number; notes: string }) => {
      const res = await api.patch(`/production/orders/${orderId}`, { notes });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "production-board"] });
      notify("Observação salva com sucesso!", "success");
    },
    onError: () => notify("Falha ao salvar observação.", "error"),
  });

  const setStatus = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: "PENDING" | "IN_PROGRESS" | "DONE" }) => {
      const res = await api.patch(`/production/orders/${orderId}`, { status });
      return res.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "production-board"] });
    },
  });

  const getDeliveryInfo = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    date.setHours(0,0,0,0);

    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    const isLate = diffDays < 0;
    const isUrgent = diffDays >= 0 && diffDays <= 5; //urgencia

    return {
      formatted: date.toLocaleDateString("pt-BR"),
      isUrgent,
      isLate,
      daysLeft: diffDays
    };
  };

  const board = data?.columns;

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-rose-600">Erro ao carregar quadro</h1>
          <p className="text-slate-600">Verifique sua conexão ou se está logado como admin.</p>
          <Button onClick={() => window.location.reload()} variant="outline">Tentar novamente</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-4 md:p-8">
      <div className="mx-auto max-w-[1900px] space-y-8">
        {/* Header */}
        <section className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-6 md:p-10 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
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
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Produção
            </h1>
            <p className="mt-2 text-neutral-600 font-medium max-w-2xl">
              Gerencie o fluxo de produção arrastando os pedidos ou usando os botões de navegação.
            </p>
          </div>
        </section>

        {isLoading && (
           <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
             {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-96 rounded-3xl bg-rose-100/50" />)}
           </div>
        )}

        {!isLoading && (
          <div className="flex flex-col xl:flex-row gap-6 overflow-x-auto pb-8 min-h-[600px] items-start">
            {STAGES.map((col) => {
              const cards = board?.[col.key] ?? [];
              
              const colorMap: any = {
                blue: "from-blue-50 to-sky-50 border-blue-200",
                purple: "from-purple-50 to-violet-50 border-purple-200",
                amber: "from-amber-50 to-yellow-50 border-amber-200",
                orange: "from-orange-50 to-red-50 border-orange-200",
                emerald: "from-emerald-50 to-green-50 border-emerald-200",
              };

              return (
                <Card key={col.key} className="min-w-[320px] xl:w-1/5 rounded-3xl border-2 border-rose-200 bg-white/60 backdrop-blur-sm shadow-xl flex flex-col shrink-0">
                  <CardHeader className={cn("bg-gradient-to-r border-b-2 py-4", colorMap[col.color])}>
                    <CardTitle className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                        {col.title}
                      </span>
                      <span className="rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-bold text-slate-800 shadow-sm border border-white/20">
                        {cards.length}
                      </span>
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-3 space-y-3 flex-1 overflow-y-auto max-h-[calc(100vh-20rem)] custom-scrollbar">
                    {cards.length === 0 && (
                      <div className="text-center py-12 opacity-50 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2">
                           <Package className="h-5 w-5 text-slate-400" />
                        </div>
                        <p className="text-xs font-medium text-slate-500">Sem pedidos</p>
                      </div>
                    )}

                    {cards.map((card) => {
                      const draft = notesDraft[card.orderId] ?? (card.notes ?? "");
                      const deliveryInfo = getDeliveryInfo(card.expectedDeliveryDate);
                      
                      return (
                        <div
                          key={card.orderId}
                          className={cn(
                            "group relative rounded-2xl border-2 bg-white p-3 shadow-sm hover:shadow-md transition-all duration-300",
                            deliveryInfo?.isLate ? "border-red-300 bg-red-50" : 
                            deliveryInfo?.isUrgent ? "border-amber-300 bg-amber-50" : "border-rose-100"
                          )}
                        >
                          {/* Topo do Card: Número e Data */}
                          <div className="flex justify-between items-start mb-2 gap-2">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100">
                              {card.orderNumber}
                            </span>
                            
                            {deliveryInfo && (
                                <div className={cn(
                                    "flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap",
                                    deliveryInfo.isLate ? "bg-red-200 text-red-700" : 
                                    deliveryInfo.isUrgent ? "bg-amber-200 text-amber-700" : "bg-slate-100 text-slate-600"
                                )}>
                                    {deliveryInfo.isLate && <AlertTriangle size={10} />}
                                    {!deliveryInfo.isLate && <Calendar size={10} />}
                                    {deliveryInfo.formatted}
                                </div>
                            )}
                          </div>

                          <div className="font-bold text-slate-800 text-sm mb-2 leading-tight">
                            {card.customerName}
                          </div>

                          {/* Lista de Itens (Compacta) */}
                          <div className="bg-slate-50/80 rounded-lg p-2 mb-3 border border-slate-100">
                            {card.items?.slice(0, 3).map((it, idx) => (
                              <div key={idx} className="flex justify-between text-xs text-slate-600 mb-1 last:mb-0">
                                <span className="truncate pr-2 font-medium">{it.name}</span>
                                <span className="font-bold shrink-0 bg-white px-1 rounded border">x{it.quantity}</span>
                              </div>
                            ))}
                            {card.items && card.items.length > 3 && (
                                <div className="text-[10px] text-slate-400 text-center font-medium mt-1">
                                    +{card.items.length - 3} itens...
                                </div>
                            )}
                          </div>

                          {/* Campo de Observações com Botão Salvar Condicional */}
                          <div className="mb-3 relative">
                            <Textarea
                              value={draft}
                              onChange={(e) => setNotesDraft(prev => ({ ...prev, [card.orderId]: e.target.value }))}
                              placeholder="Observações..."
                              className="min-h-[50px] text-xs resize-none bg-white border-slate-200 focus:border-rose-300 pr-8 py-2"
                            />
                            {draft !== (card.notes || "") && (
                                <Button
                                    size="icon"
                                    className="absolute bottom-2 right-2 h-5 w-5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm transition-all"
                                    onClick={() => saveNotes.mutate({ orderId: card.orderId, notes: draft })}
                                    disabled={saveNotes.isPending}
                                    title="Salvar observação"
                                >
                                    <CheckCircle size={12} />
                                </Button>
                            )}
                          </div>

                          {/* Rodapé: Ações */}
                          <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-slate-100/50">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                                onClick={() => window.open(`/api/production/orders/${card.orderId}/pdf`, "_blank")}
                                title="Imprimir Ficha de Produção (PDF)"
                            >
                                <FileText size={14} />
                            </Button>

                            <div className="flex items-center gap-1.5">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 px-2 rounded-lg border-slate-200 hover:bg-slate-50"
                                    disabled={col.key === "BORDADO" || movePrev.isPending}
                                    onClick={() => movePrev.mutate(card.orderId)}
                                    title="Voltar etapa"
                                >
                                    <ChevronLeft size={14} />
                                </Button>
                                <Button
                                    size="sm"
                                    className={cn(
                                        "h-8 px-3 rounded-lg bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md hover:shadow-lg transition-all border-0",
                                        col.key === "CONCLUIDO" && "opacity-50 grayscale cursor-not-allowed"
                                    )}
                                    disabled={col.key === "CONCLUIDO" || moveNext.isPending}
                                    onClick={() => moveNext.mutate(card.orderId)}
                                    title="Avançar etapa"
                                >
                                    <ChevronRight size={14} />
                                </Button>
                            </div>
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
    </div>
  );
}