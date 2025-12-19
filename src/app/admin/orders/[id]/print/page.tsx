"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useParams } from "next/navigation";
import { Loader2, Printer, X } from "lucide-react";
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
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-rose-500" />
      </div>
    );
  }

  if (!order) return <div className="p-8 text-center">Pedido não encontrado</div>;

  const clientName = order.customerName || order.user?.name || order.customer?.name || "Cliente";
  const clientPhone = order.customerPhone || order.user?.phone || order.customer?.phone || "";
  const clientEmail = order.user?.email || order.customer?.email || "";
  const calculatedTotalItems = order.items.reduce((acc, item) => {
      const p = item.price ?? item.unitPrice ?? item.product?.price ?? 0;
      return acc + (p * item.quantity);
  }, 0);
  const finalTotal = order.total || order.totalAmount || calculatedTotalItems;

  return (
    <div className="min-h-screen bg-slate-100 p-8 print:bg-white print:p-0">
      {/* BARRA DE CONTROLE (Não sai na impressão) */}
      <div className="mx-auto mb-8 flex max-w-[210mm] items-center justify-between print:hidden">
        <h1 className="text-xl font-bold text-slate-700">Visualizar Impressão</h1>
        <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.close()}>
                <X className="mr-2 h-4 w-4" /> Fechar
            </Button>
            <Button onClick={() => window.print()} className="bg-rose-600 hover:bg-rose-700">
                <Printer className="mr-2 h-4 w-4" /> Imprimir / Salvar PDF
            </Button>
        </div>
      </div>

      {/* FOLHA A4 */}
      <div className="mx-auto min-h-[297mm] w-[210mm] bg-white p-[15mm] shadow-2xl print:min-h-0 print:w-full print:shadow-none">
        
        {/* CABEÇALHO */}
        <div className="mb-8 border-b-2 border-rose-100 pb-6">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-black text-rose-500">Arte com Carinho</h1>
                    <p className="text-sm text-slate-500">Ateliê e Bordados Personalizados</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold text-slate-800">PEDIDO #{order.code || order.id}</h2>
                    <p className="text-sm text-slate-500">
                        Data: {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                    <div className="mt-2 inline-block rounded bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700 uppercase">
                        {order.status}
                    </div>
                </div>
            </div>
        </div>

        {/* DADOS DO CLIENTE */}
        <div className="mb-8 grid grid-cols-2 gap-8">
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Dados do Cliente</h3>
                <p className="font-bold text-slate-800 text-lg">{clientName}</p>
                {clientPhone && <p className="text-sm text-slate-600">Tel: {clientPhone}</p>}
                {clientEmail && <p className="text-sm text-slate-600">Email: {clientEmail}</p>}
            </div>
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Pagamento</h3>
                <p className="font-bold text-slate-800 text-lg">{order.paymentMethod || "A Combinar"}</p>
                <p className="text-sm text-slate-600">
                    Total: {finalTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </p>
            </div>
        </div>

        {/* ITENS */}
        <div className="mb-8">
            <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">Itens do Pedido</h3>
            <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-500">
                    <tr>
                        <th className="py-2">Produto</th>
                        <th className="py-2 text-center">Qtd</th>
                        <th className="py-2 text-right">Preço Unit.</th>
                        <th className="py-2 text-right">Total</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {order.items.map((item, idx) => {
                        
                        const unitPrice = item.price ?? item.unitPrice ?? item.product?.price ?? 0;
                        const quantity = item.quantity || 1;
                        const totalItem = unitPrice * quantity;
                        const productName = item.productName || item.product?.name || item.name || "Produto";

                        return (
                            <tr key={idx}>
                                <td className="py-3 font-medium text-slate-700">{productName}</td>
                                <td className="py-3 text-center text-slate-600">{quantity}</td>
                                <td className="py-3 text-right text-slate-600">
                                    {unitPrice.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </td>
                                <td className="py-3 text-right font-bold text-slate-800">
                                    {totalItem.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
                {/* Linha de Total Calculado no Rodapé da Tabela */}
                <tfoot className="border-t-2 border-slate-100 font-bold text-slate-800">
                    <tr>
                        <td colSpan={3} className="py-4 text-right">Total Geral:</td>
                        <td className="py-4 text-right text-lg text-rose-600">
                             {finalTotal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {/* PERSONALIZAÇÃO / OBSERVAÇÕES */}
        {order.notes && (
            <div className="mb-8 rounded-xl border-2 border-dashed border-rose-200 bg-rose-50/30 p-6">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-rose-600">
                    <span className="text-lg">📝</span> Detalhes da Personalização
                </h3>
                <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-slate-700">
                    {order.notes}
                </div>
            </div>
        )}

        {/* RODAPÉ */}
        <div className="mt-auto border-t border-slate-200 pt-8 text-center text-xs text-slate-400">
            <p>Arte com Carinho - Documento gerado em {new Date().toLocaleString("pt-BR")}</p>
        </div>

      </div>
    </div>
  );
}