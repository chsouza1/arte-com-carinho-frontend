"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Loader2, Printer, X, Scissors, Phone, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OrderItem {
  productId: number;
  productName?: string;
  name?: string;
  quantity: number;
  price?: number;
  unitPrice?: number;
  product?: { 
      name: string; 
      price: number; 
  };
}

interface OrderDetail {
  id: number;
  code?: string;
  status: string;
  createdAt: string;
  customerName?: string;
  customerPhone?: string;
  user?: { name: string; phone: string; email: string };
  customer?: { name: string; phone: string; email: string };
  items: OrderItem[];
  total?: number;
  totalAmount?: number;
  paymentMethod: string;
  notes?: string;
}

export default function OrderPrintPage() {
  const params = useParams();
  const orderId = params.id as string;

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order", orderId],
    queryFn: async () => {
      try {
        const { data } = await api.get<OrderDetail>(`/orders/${orderId}`);
        return data;
      } catch (e) {
        const { data } = await api.get<OrderDetail>(`/public/orders/${orderId}`);
        return data;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center text-[#8D6E63]">
        <Loader2 className="animate-spin text-[#D7CCC8]" size={40} />
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center text-[#8D6E63]">Pedido não encontrado</div>;

  const clientName = order.customerName || order.user?.name || order.customer?.name || "Cliente";
  const clientPhone = order.customerPhone || order.user?.phone || order.customer?.phone || "";
  const clientEmail = order.user?.email || order.customer?.email || "";
  
  const calculatedTotalItems = order.items.reduce((acc, item) => {
      const p = item.price ?? item.unitPrice ?? item.product?.price ?? 0;
      return acc + (p * item.quantity);
  }, 0);
  const finalTotal = order.total || order.totalAmount || calculatedTotalItems;

  return (
    <div className="min-h-screen bg-[#5D4037]/10 p-8 print:bg-white print:p-0 font-sans text-[#5D4037]">
      
      {/* BARRA DE CONTROLE (Não sai na impressão) */}
      <div className="mx-auto mb-8 flex max-w-[210mm] items-center justify-between print:hidden">
        <h1 className="text-xl font-bold text-[#5D4037]">Visualizar Impressão</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.close()} className="bg-white border-[#D7CCC8] text-[#5D4037]">
                <X className="mr-2 h-4 w-4" /> Fechar
            </Button>
            <Button onClick={() => window.print()} className="bg-[#E53935] hover:bg-[#C62828] text-white">
                <Printer className="mr-2 h-4 w-4" /> Imprimir
            </Button>
        </div>
      </div>

      {/* FOLHA A4 */}
      <div className="mx-auto min-h-[297mm] w-[210mm] bg-white p-[15mm] shadow-2xl print:min-h-0 print:w-full print:shadow-none border border-[#D7CCC8] print:border-0 relative">
        

        <div className="flex justify-between items-start border-b-2 border-[#5D4037] pb-6 mb-8">
            <div className="flex items-center gap-4">
                
                <div className="h-20 w-20 relative overflow-hidden rounded-full border-2 border-[#5D4037] bg-white p-1">
                    <img 
                        src="/logo.png" 
                        alt="Logo Arte com Carinho" 
                        className="h-full w-full object-contain" 
                    />
                </div>
                <div>
                    <h1 className="text-3xl font-serif font-bold leading-none text-[#5D4037]">Arte com Carinho</h1>
                    <p className="text-sm text-[#8D6E63] mt-1 font-medium">Ateliê & Bordados Personalizados</p>
                </div>
            </div>
            <div className="text-right">
                <h2 className="text-xl font-bold text-[#5D4037]">PEDIDO #{order.code || order.id}</h2>
                <p className="text-sm text-[#8D6E63]">
                    Emissão: {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                </p>
                <div className="mt-2 inline-block border border-[#5D4037] px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#5D4037]">
                    {order.status}
                </div>
            </div>
        </div>

        {/* DADOS DO CLIENTE E PAGAMENTO */}
        <div className="mb-8 grid grid-cols-2 gap-8">
            <div className="p-4 border border-[#D7CCC8] bg-[#FAF7F5] rounded-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8D6E63] border-b border-[#D7CCC8] pb-1">Cliente</h3>
                <p className="font-bold text-[#5D4037] text-lg mb-1">{clientName}</p>
                {clientPhone && (
                    <p className="text-sm text-[#5D4037] flex items-center gap-2">
                        <Phone size={12} className="text-[#E53935]"/> {clientPhone}
                    </p>
                )}
                {clientEmail && (
                    <p className="text-sm text-[#5D4037] flex items-center gap-2">
                        <Mail size={12} className="text-[#E53935]"/> {clientEmail}
                    </p>
                )}
            </div>
            
            <div className="p-4 border border-[#D7CCC8] bg-[#FAF7F5] rounded-sm">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#8D6E63] border-b border-[#D7CCC8] pb-1">Pagamento</h3>
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-[#5D4037]">Método:</span>
                    <span className="font-bold text-[#5D4037] uppercase">{order.paymentMethod || "A Combinar"}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-dashed border-[#D7CCC8]">
                    <span className="text-sm font-bold text-[#5D4037]">Total:</span>
                    <span className="text-xl font-serif font-bold text-[#E53935]">
                        {finalTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                </div>
            </div>
        </div>

        {/* TABELA DE ITENS */}
        <div className="mb-8">
            <table className="w-full text-left text-sm">
                <thead className="border-b-2 border-[#5D4037] text-[#5D4037] uppercase text-xs font-bold">
                    <tr>
                        <th className="py-2 pl-2">Item / Produto</th>
                        <th className="py-2 text-center w-20">Qtd</th>
                        <th className="py-2 text-right w-32">Unitário</th>
                        <th className="py-2 text-right w-32 pr-2">Subtotal</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#EFEBE9]">
                    {order.items.map((item, idx) => {
                        const unitPrice = item.price ?? item.unitPrice ?? item.product?.price ?? 0;
                        const quantity = item.quantity || 1;
                        const totalItem = unitPrice * quantity;
                        const productName = item.productName || item.product?.name || item.name || "Produto";

                        return (
                            <tr key={idx}>
                                <td className="py-3 pl-2 font-medium text-[#5D4037]">{productName}</td>
                                <td className="py-3 text-center text-[#8D6E63]">{quantity}</td>
                                <td className="py-3 text-right text-[#8D6E63]">
                                    {unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </td>
                                <td className="py-3 pr-2 text-right font-bold text-[#5D4037]">
                                    {totalItem.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>

        {/* OBSERVAÇÕES DE PRODUÇÃO */}
        {order.notes && (
            <div className="mb-8">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-[#8D6E63] flex items-center gap-2">
                    <span className="text-lg">✂️</span> Detalhes de Personalização
                </h3>
                <div className="p-4 bg-[#FFF8E1] border border-[#FFE0B2] text-[#5D4037] text-sm font-mono whitespace-pre-wrap rounded-sm leading-relaxed">
                    {order.notes}
                </div>
            </div>
        )}

        {/* RODAPÉ */}
        <div className="absolute bottom-[15mm] left-[15mm] right-[15mm] border-t border-[#D7CCC8] pt-4 text-center">
            <p className="text-xs text-[#8D6E63] italic">
                Obrigada pela preferência! Cada peça é feita à mão com amor e dedicação.
            </p>
            <p className="text-[10px] text-[#A1887F] mt-1 uppercase tracking-widest">
                www.artecomcarinho.com.br • @artecomcarinho
            </p>
        </div>

      </div>
    </div>
  );
}