"use client";

import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useOrderDetail, type OrderDetail } from "@/lib/orders";
import { 
  ArrowLeft, Package, Calendar, DollarSign, Clock, 
  CheckCircle, Truck, Box, Gift, MessageSquare, 
  Sparkles, Scissors, PenTool, MapPin
} from "lucide-react";

// Função auxiliar de data
function formatOrderDate(order: OrderDetail): string {
  const raw = order.orderDate ?? order.createdDate ?? (order as any).createdAt;
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

// Função auxiliar de status com cores do Ateliê
function traduzStatus(status: string): { label: string; bg: string; text: string; border: string; icon: any } {
  const s = status?.toUpperCase?.() ?? "";
  
  const statusMap: Record<string, any> = {
    PENDING: { label: "Aguardando Pagamento", bg: "bg-[#FFF8E1]", text: "text-[#F57F17]", border: "border-[#FFE0B2]", icon: Clock },
    PAID: { label: "Pagamento Aprovado", bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", border: "border-[#C8E6C9]", icon: CheckCircle },
    IN_PRODUCTION: { label: "Em Produção", bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", border: "border-[#BBDEFB]", icon: Scissors },
    SHIPPED: { label: "Enviado", bg: "bg-[#F3E5F5]", text: "text-[#7B1FA2]", border: "border-[#E1BEE7]", icon: Truck },
    DELIVERED: { label: "Entregue", bg: "bg-[#F1F8E9]", text: "text-[#33691E]", border: "border-[#DCEDC8]", icon: Gift },
    CANCELLED: { label: "Cancelado", bg: "bg-[#FFEBEE]", text: "text-[#C62828]", border: "border-[#FFCDD2]", icon: Clock }
  };

  return statusMap[s] || { label: status, bg: "bg-[#F5F5F5]", text: "text-[#757575]", border: "border-[#E0E0E0]", icon: Clock };
}

export default function AccountOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const orderId = params.id;

  const { data: order, isLoading, isError } = useOrderDetail(orderId);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-[#8D6E63]">
        <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-[#D7CCC8] border-r-[#E53935] mb-4"></div>
        <p className="text-sm font-bold uppercase tracking-widest">Abrindo a ficha do pedido...</p>
      </div>
    );
  }

  if (isError || !order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#D7CCC8] p-8 text-center shadow-sm rounded-sm relative overflow-hidden">
          <div className="h-1 bg-[#E53935] w-full absolute top-0 left-0"></div>
          
          <div className="mx-auto w-16 h-16 rounded-full bg-[#FFEBEE] flex items-center justify-center mb-4 border border-[#FFCDD2]">
            <Package className="h-8 w-8 text-[#E53935]" />
          </div>
          <p className="text-base font-bold text-[#5D4037] mb-2">
            Não encontramos esse pedido
          </p>
          <p className="text-sm text-[#8D6E63] mb-6">
            Verifique se o número está correto ou tente novamente.
          </p>
          <Button
            className="h-10 bg-[#E53935] hover:bg-[#C62828] text-white px-6 text-xs font-bold uppercase tracking-widest rounded-sm"
            onClick={() => router.push("/account/orders")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Meus Pedidos
          </Button>
        </div>
      </div>
    );
  }

  const dateLabel = formatOrderDate(order);
  const statusInfo = traduzStatus(order.status);
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-8">
      {/* Botão voltar */}
      <button
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#8D6E63] hover:text-[#E53935] transition-colors group"
        onClick={() => router.push("/account/orders")}
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para lista
      </button>

      {/* CARTÃO PRINCIPAL DO PEDIDO (FICHA TÉCNICA) */}
      <div className="bg-white border border-[#D7CCC8] shadow-sm rounded-sm overflow-hidden relative">
        <div className="h-1 bg-[#E53935] w-full absolute top-0 left-0"></div>
        
        <div className="p-8 space-y-8">
            
            {/* Cabeçalho do Pedido */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-dashed border-[#D7CCC8] pb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-[#FAF7F5] text-[#5D4037] font-mono font-bold px-2 py-0.5 rounded-sm border border-[#EFEBE9] text-sm">
                            #{order.code ?? order.orderNumber ?? order.id}
                        </span>
                        <span className="text-xs text-[#8D6E63] flex items-center gap-1">
                            <Calendar size={12} /> {dateLabel}
                        </span>
                    </div>
                    <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Detalhes do Pedido</h1>
                </div>

                <div className={`flex items-center gap-3 px-4 py-2 rounded-sm border ${statusInfo.bg} ${statusInfo.border}`}>
                    <div className={`p-1 rounded-full bg-white/50 ${statusInfo.text}`}>
                        <StatusIcon size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Status Atual</p>
                        <p className={`text-sm font-bold ${statusInfo.text}`}>{statusInfo.label}</p>
                    </div>
                </div>
            </div>

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Coluna 1: Itens */}
                <div className="md:col-span-2 space-y-4">
                    <h2 className="text-sm font-bold text-[#5D4037] uppercase tracking-wider flex items-center gap-2 border-b border-[#EFEBE9] pb-2">
                        <Package size={14} className="text-[#E53935]" /> Itens da Encomenda
                    </h2>
                    
                    <div className="space-y-3">
                        {order.items?.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start justify-between p-3 bg-[#FAF7F5] border border-[#EFEBE9] rounded-sm hover:border-[#D7CCC8] transition-colors"
                            >
                                <div>
                                    <p className="text-sm font-bold text-[#5D4037]">{item.productName}</p>
                                    <div className="text-xs text-[#8D6E63] mt-1 space-y-0.5">
                                        <p>Quantidade: {item.quantity}</p>
                                        <p>Valor unitário: {item.unitPrice?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-bold text-[#5D4037]">
                                        {item.subtotal?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Totais */}
                    <div className="flex justify-end pt-4 border-t border-dashed border-[#D7CCC8]">
                        <div className="text-right">
                            <p className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Valor Total</p>
                            <p className="text-2xl font-serif font-bold text-[#5D4037]">
                                {order.totalAmount?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Coluna 2: Detalhes e Observações */}
                <div className="space-y-6">
                    
                    {/* Endereço / Entrega (Simulado se não tiver no objeto) */}
                    <div>
                        <h2 className="text-sm font-bold text-[#5D4037] uppercase tracking-wider flex items-center gap-2 border-b border-[#EFEBE9] pb-2 mb-3">
                            <Truck size={14} className="text-[#E53935]" /> Entrega
                        </h2>
                        <div className="text-sm text-[#8D6E63]">
                            <p className="font-bold text-[#5D4037]">Endereço de envio:</p>
                            <p>Rua Exemplo, 123 - Bairro</p>
                            <p>Curitiba - PR</p>
                            <p>CEP: 80000-000</p>
                        </div>
                    </div>

                    {/* Observações */}
                    {order.notes && (
                        <div>
                            <h2 className="text-sm font-bold text-[#5D4037] uppercase tracking-wider flex items-center gap-2 border-b border-[#EFEBE9] pb-2 mb-3">
                                <PenTool size={14} className="text-[#E53935]" /> Observações
                            </h2>
                            <div className="bg-[#FFF8E1] border border-[#FFE0B2] p-3 rounded-sm">
                                <p className="text-xs text-[#5D4037] italic font-medium leading-relaxed">
                                    "{order.notes}"
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Ajuda */}
                    <div className="pt-6 border-t border-dashed border-[#D7CCC8]">
                        <button
                            className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white py-3 px-4 rounded-sm shadow-sm flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all"
                            onClick={() => window.open('https://wa.me/5541999932625', '_blank')}
                        >
                            <MessageSquare size={16} /> Falar sobre este pedido
                        </button>
                    </div>

                </div>
            </div>
        </div>

        {/* Rodapé do Card */}
        <div className="bg-[#FAF7F5] p-4 text-center border-t border-[#D7CCC8]">
            <p className="text-[10px] text-[#A1887F] font-serif italic">
                Agradecemos a confiança em nosso trabalho artesanal.
            </p>
        </div>
      </div>
    </div>
  );
}