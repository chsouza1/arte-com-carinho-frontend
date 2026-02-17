"use client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useMyOrders, type OrderSummary } from "@/lib/orders";
import { ShoppingBag, Calendar, Package, Sparkles, ChevronRight, AlertTriangle, Loader2 } from "lucide-react";

// Função auxiliar para data
function formatOrderDate(order: OrderSummary): string {
  const raw = order.orderDate ?? order.createdDate ?? (order as any).createdAt;
  if (!raw) return "-";
  const parsed = new Date(raw);
  if (isNaN(parsed.getTime())) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
}

// Função auxiliar para status com cores do Ateliê
function traduzStatus(status: string): { label: string; bg: string; text: string; border: string } {
  const s = status?.toUpperCase?.() ?? "";
  
  const statusMap: Record<string, { label: string; bg: string; text: string; border: string }> = {
    PENDING: { label: "Aguardando Pagamento", bg: "bg-[#FFF8E1]", text: "text-[#F57F17]", border: "border-[#FFE0B2]" }, // Âmbar
    PAID: { label: "Pagamento Aprovado", bg: "bg-[#E8F5E9]", text: "text-[#2E7D32]", border: "border-[#C8E6C9]" }, // Verde Suave
    IN_PRODUCTION: { label: "Em Produção", bg: "bg-[#E3F2FD]", text: "text-[#1565C0]", border: "border-[#BBDEFB]" }, // Azul Bebê
    SHIPPED: { label: "Enviado", bg: "bg-[#F3E5F5]", text: "text-[#7B1FA2]", border: "border-[#E1BEE7]" }, // Lilás
    DELIVERED: { label: "Entregue", bg: "bg-[#F1F8E9]", text: "text-[#33691E]", border: "border-[#DCEDC8]" }, // Verde Folha
    CANCELLED: { label: "Cancelado", bg: "bg-[#FFEBEE]", text: "text-[#C62828]", border: "border-[#FFCDD2]" } // Vermelho
  };

  return statusMap[s] || { label: status || "-", bg: "bg-[#F5F5F5]", text: "text-[#757575]", border: "border-[#E0E0E0]" };
}

export default function AccountOrdersPage() {
  const router = useRouter();
  const { data, isLoading, isError } = useMyOrders(0);

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center text-[#8D6E63]">
        <Loader2 className="h-10 w-10 animate-spin mb-4 text-[#D7CCC8]" />
        <p className="text-sm font-bold uppercase tracking-widest">Buscando seus pedidos...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border border-[#D7CCC8] p-8 text-center shadow-sm rounded-sm relative overflow-hidden">
          <div className="h-1 bg-[#E53935] w-full absolute top-0 left-0"></div>
          
          <div className="mx-auto w-16 h-16 rounded-full bg-[#FFEBEE] flex items-center justify-center mb-4 border border-[#FFCDD2]">
            <AlertTriangle className="h-8 w-8 text-[#E53935]" />
          </div>
          <h2 className="text-xl font-serif font-bold text-[#5D4037] mb-2">
            Ops! Algo deu errado.
          </h2>
          <p className="text-sm text-[#8D6E63] mb-6">
            Não conseguimos carregar sua lista de pedidos.
          </p>
          <Button
            className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest rounded-sm"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  const orders = data?.content ?? [];

  if (orders.length === 0) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white border-2 border-dashed border-[#D7CCC8] p-10 text-center rounded-sm">
          <div className="mx-auto w-20 h-20 rounded-full bg-[#FAF7F5] flex items-center justify-center mb-6 border border-[#EFEBE9]">
            <ShoppingBag className="h-10 w-10 text-[#D7CCC8]" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-[#5D4037] mb-2">
            Sua lista está vazia
          </h2>
          <p className="text-sm text-[#8D6E63] mb-8 leading-relaxed">
            Você ainda não fez nenhum pedido conosco. Que tal escolher algo especial hoje?
          </p>
          <Button
            className="bg-[#E53935] hover:bg-[#C62828] text-white px-8 py-6 font-bold uppercase tracking-widest rounded-sm shadow-md hover:-translate-y-1 transition-all"
            onClick={() => router.push("/products")}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            Ver Catálogo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header da Seção */}
      <div className="flex items-center gap-4 border-b border-dashed border-[#D7CCC8] pb-6">
        <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
            <Package className="h-6 w-6 text-[#E53935]" />
        </div>
        <div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Meus Pedidos</h1>
            <p className="text-[#8D6E63] italic flex items-center gap-2">
              <span className="w-2 h-2 bg-[#E53935] rounded-full inline-block"></span>
              {orders.length} {orders.length === 1 ? 'encomenda encontrada' : 'encomendas encontradas'}
            </p>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="grid gap-6">
        {orders.map((order) => {
          const dateLabel = formatOrderDate(order);
          const status = traduzStatus(order.status);
          
          return (
            <button
              key={order.id}
              type="button"
              onClick={() => router.push(`/account/orders/${order.id}`)}
              className="group w-full bg-white border border-[#D7CCC8] p-6 text-left shadow-sm hover:shadow-md hover:border-[#A1887F] transition-all duration-300 rounded-sm relative overflow-hidden"
            >
              {/* Efeito de hover lateral */}
              <div className="absolute top-0 left-0 w-1 h-full bg-[#E53935] opacity-0 group-hover:opacity-100 transition-opacity"></div>

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                
                {/* Info Principal */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-3">
                     <span className="bg-[#FAF7F5] text-[#5D4037] font-mono font-bold px-3 py-1 rounded-sm border border-[#EFEBE9]">
                        #{order.code ?? order.orderNumber ?? order.id}
                     </span>
                     <span className="text-sm text-[#8D6E63] flex items-center gap-1">
                        <Calendar size={14} /> {dateLabel}
                     </span>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-sm border ${status.bg} ${status.border} ${status.text} text-xs font-bold uppercase tracking-wider mt-2`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {status.label}
                  </div>
                </div>

                {/* Valor e Ação */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-1">
                  <span className="text-xs font-bold text-[#8D6E63] uppercase tracking-wider">Valor Total</span>
                  <span className="text-2xl font-serif font-bold text-[#5D4037]">
                    {order.totalAmount?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  
                  <div className="flex items-center gap-1 text-xs font-bold text-[#E53935] group-hover:gap-2 transition-all mt-2 uppercase tracking-widest">
                    Ver Detalhes <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}