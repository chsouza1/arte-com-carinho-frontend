"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, applyAuthFromStorage } from "@/lib/api";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
  Package, ChevronRight, ChevronLeft, FileText, Sparkles, 
  Clock, CheckCircle, Calendar, AlertTriangle, Layers, Scissors, Check, Loader2 
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

const STAGES: { key: ProductionStage; title: string; theme: string }[] = [
  { key: "BORDADO", title: "Bordado", theme: "blue" },
  { key: "COSTURA", title: "Costura", theme: "purple" },
  { key: "ACABAMENTO", title: "Acabamento", theme: "amber" },
  { key: "EMBALAGEM", title: "Embalagem", theme: "orange" },
  { key: "CONCLUIDO", title: "Concluído", theme: "emerald" },
];

async function fetchBoard(): Promise<ProductionBoard> {
  const res = await api.get("/production/board");
  return res.data;
}

export default function AdminProductionPage() {
  const qc = useQueryClient();
  const { notify } = useNotifications();
  const [notesDraft, setNotesDraft] = useState<Record<number, string>>({});

  useEffect(() => { applyAuthFromStorage(); }, []);

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
      notify(`Pedido #${data.orderNumber} avançou!`, "success");
    },
    onError: () => notify("Erro ao mover pedido.", "error"),
  });

  const movePrev = useMutation({
    mutationFn: async (orderId: number) => {
      const res = await api.post(`/production/orders/${orderId}/prev`);
      return res.data;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["admin", "production-board"] });
      notify(`Pedido #${data.orderNumber} retornou.`, "info");
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
      notify("Nota salva!", "success");
    },
    onError: () => notify("Erro ao salvar nota.", "error"),
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
    const isUrgent = diffDays >= 0 && diffDays <= 3; 

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
      <div className="flex h-96 flex-col items-center justify-center text-[#8D6E63]">
        <AlertTriangle size={32} className="mb-2 text-[#E53935]" />
        <p className="font-bold">Não foi possível carregar o quadro.</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-4 border-[#D7CCC8]">Recarregar</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dashed border-[#D7CCC8] pb-4 flex-shrink-0">
            <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
                    <Layers className="h-6 w-6 text-[#5D4037]" />
                </div>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-[#5D4037]">Quadro de Produção</h1>
                    <p className="text-[#8D6E63] text-sm">Controle de fluxo do ateliê.</p>
                </div>
            </div>
            
            <div className="hidden md:flex items-center gap-2 bg-[#FFF8E1] px-3 py-1.5 rounded-sm border border-[#FFE0B2]">
                <Clock size={14} className="text-[#F57F17]" />
                <span className="text-xs font-bold text-[#F57F17] uppercase">Atualização em tempo real</span>
            </div>
        </div>

        {/* Board Container */}
        {isLoading ? (
            <div className="flex h-full items-center justify-center text-[#8D6E63]">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-[#D7CCC8]" />
                <span className="text-sm font-bold uppercase tracking-widest ml-2">Montando quadro...</span>
            </div>
        ) : (
            <div className="flex gap-4 overflow-x-auto pb-4 h-full items-start">
                {STAGES.map((col) => {
                    const cards = board?.[col.key] ?? [];
                    
                    // Cores temáticas para os headers das colunas
                    const themeMap: any = {
                        blue: "bg-[#E3F2FD] text-[#1565C0] border-[#BBDEFB]",
                        purple: "bg-[#F3E5F5] text-[#7B1FA2] border-[#E1BEE7]",
                        amber: "bg-[#FFF8E1] text-[#F57F17] border-[#FFE0B2]",
                        orange: "bg-[#FFF3E0] text-[#E65100] border-[#FFE0B2]",
                        emerald: "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]",
                    };
                    const theme = themeMap[col.theme];

                    return (
                        <div key={col.key} className="flex flex-col w-[300px] min-w-[300px] h-full rounded-sm bg-[#EFEBE9]/40 border border-[#D7CCC8] overflow-hidden">
                            
                            {/* Header da Coluna */}
                            <div className={cn("px-4 py-3 border-b-2 flex justify-between items-center", theme)}>
                                <span className="font-bold text-xs uppercase tracking-wider">{col.title}</span>
                                <span className="bg-white/60 px-2 py-0.5 rounded-full text-[10px] font-bold border border-black/5">
                                    {cards.length}
                                </span>
                            </div>

                            {/* Área de Cards */}
                            <div className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar">
                                {cards.length === 0 && (
                                    <div className="h-20 flex items-center justify-center border-2 border-dashed border-[#D7CCC8] rounded-sm m-2">
                                        <span className="text-[10px] font-bold text-[#A1887F] uppercase opacity-50">Vazio</span>
                                    </div>
                                )}

                                {cards.map((card) => {
                                    const draft = notesDraft[card.orderId] ?? (card.notes ?? "");
                                    const deliveryInfo = getDeliveryInfo(card.expectedDeliveryDate);
                                    
                                    return (
                                        <div 
                                            key={card.orderId} 
                                            className="bg-white border border-[#D7CCC8] rounded-sm p-3 shadow-sm hover:shadow-md transition-all relative group"
                                        >
                                            {/* Tarja lateral de status */}
                                            <div className={cn(
                                                "absolute left-0 top-0 bottom-0 w-1 rounded-l-sm transition-colors",
                                                deliveryInfo?.isLate ? "bg-[#C62828]" : deliveryInfo?.isUrgent ? "bg-[#F57F17]" : "bg-[#D7CCC8] group-hover:bg-[#E53935]"
                                            )}></div>

                                            <div className="pl-2">
                                                {/* Cabeçalho do Card */}
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="font-mono text-xs font-bold text-[#5D4037] bg-[#FAF7F5] px-1.5 rounded border border-[#EFEBE9]">
                                                        #{card.orderNumber}
                                                    </span>
                                                    {deliveryInfo && (
                                                        <span className={cn(
                                                            "text-[9px] font-bold px-1.5 rounded-sm uppercase border",
                                                            deliveryInfo.isLate ? "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]" : 
                                                            deliveryInfo.isUrgent ? "bg-[#FFF8E1] text-[#F57F17] border-[#FFE0B2]" : "bg-white text-[#8D6E63] border-[#EFEBE9]"
                                                        )}>
                                                            {deliveryInfo.isLate ? "Atrasado" : deliveryInfo.isUrgent ? "Urgente" : deliveryInfo.formatted}
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Nome do Cliente */}
                                                <p className="font-bold text-sm text-[#5D4037] line-clamp-1 mb-2">
                                                    {card.customerName}
                                                </p>

                                                {/* Itens */}
                                                <ul className="text-xs text-[#8D6E63] space-y-1 mb-3 bg-[#FAF7F5] p-2 rounded-sm border border-[#EFEBE9]">
                                                    {card.items.slice(0, 3).map((it, idx) => (
                                                        <li key={idx} className="flex justify-between">
                                                            <span className="truncate w-3/4">{it.name}</span>
                                                            <span className="font-bold">x{it.quantity}</span>
                                                        </li>
                                                    ))}
                                                    {card.items.length > 3 && (
                                                        <li className="text-[9px] text-center opacity-70">+{card.items.length - 3} outros...</li>
                                                    )}
                                                </ul>

                                                {/* Bloco de Notas */}
                                                <div className="relative mb-3">
                                                    <Textarea
                                                        value={draft}
                                                        onChange={(e) => setNotesDraft(prev => ({ ...prev, [card.orderId]: e.target.value }))}
                                                        placeholder="Notas..."
                                                        className="min-h-[40px] text-[10px] resize-none bg-white border-[#D7CCC8] focus:border-[#E53935] py-1 px-2 rounded-sm pr-6"
                                                    />
                                                    {draft !== (card.notes || "") && (
                                                        <button
                                                            className="absolute bottom-1 right-1 text-[#2E7D32] hover:text-[#1B5E20]"
                                                            onClick={() => saveNotes.mutate({ orderId: card.orderId, notes: draft })}
                                                            title="Salvar nota"
                                                        >
                                                            <CheckCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Ações de Navegação */}
                                                <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#EFEBE9]">
                                                    <button
                                                        className="text-[#D7CCC8] hover:text-[#8D6E63] p-1"
                                                        onClick={() => window.open(`/admin/orders/${card.orderId}/print`, "_blank")}
                                                        title="Imprimir"
                                                    >
                                                        <FileText size={14} />
                                                    </button>

                                                    <div className="flex gap-1">
                                                        <button
                                                            onClick={() => movePrev.mutate(card.orderId)}
                                                            disabled={col.key === "BORDADO" || movePrev.isPending}
                                                            className="p-1 rounded-sm border border-[#D7CCC8] text-[#8D6E63] hover:bg-[#FAF7F5] disabled:opacity-30"
                                                        >
                                                            <ChevronLeft size={14} />
                                                        </button>
                                                        <button
                                                            onClick={() => moveNext.mutate(card.orderId)}
                                                            disabled={col.key === "CONCLUIDO" || moveNext.isPending}
                                                            className="p-1 rounded-sm bg-[#5D4037] text-white hover:bg-[#3E2723] disabled:opacity-30 disabled:bg-[#A1887F]"
                                                        >
                                                            <ChevronRight size={14} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        )}
    </div>
  );
}