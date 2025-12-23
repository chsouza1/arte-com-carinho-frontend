"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useCartStore, type CartItem } from "@/lib/cart";
import { getAuthSession, type AuthSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Loader2,
  Palette, Type, Scissors, Shapes, PaintBucket, Baby
} from "lucide-react";


const COLORS = ["Branco", "Creme", "Rosa Bebê", "Azul Bebê", "Verde Água", "Lilás", "Cinza", "Outra (Definir no Whats)"];
const THREAD_COLORS = ["Dourado", "Prateado", "Rosa", "Azul Marinho", "Azul Claro", "Preto", "Branco", "Cinza", "Marrom", "Bege", "Outra (Definir no Whats)"];
const GENDER_OPTIONS = ["Menina", "Menino", "Unissex / Neutro"];
const EMBROIDERY_TYPES = [
  { value: "nome", label: "Somente Nome" },
  { value: "nome_desenho", label: "Nome + Desenho" },
  { value: "desenho", label: "Somente Desenho" },
  { value: "sem_bordado", label: "Sem Bordado" }
];

export default function CartPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? api.defaults.baseURL;


  const { items, updateQuantity, removeItem, updateItem, clearCart } = useCartStore();

  const [session, setSession] = useState<AuthSession | null>(null);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setSession(getAuthSession());
  }, []);

  const resolveImage = (item: CartItem) => {
    const img = item.image;
    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_URL}${img}`;
  };

  const totalAmount = useMemo(
    () => items.reduce((sum, item) => sum + item.price * (item.quantity ?? 1), 0),
    [items]
  );

  // Função helper para atualizar personalização
  function handleCustomize(id: number, field: keyof CartItem, value: string) {
    updateItem(id, { [field]: value });
  }

  const checkoutMutation = useMutation({
    mutationFn: async () => {
      let customizationReport = "";
      
      items.forEach((item) => {
        // Valores default para campos não preenchidos
        const embType = item.embroideryType || "nome";
        const gender = item.gender || "Unissex / Neutro";
        const color = item.selectedColor || "Branco";
        const thread = item.embroideryColor || "Dourado";

        if (embType !== "sem_bordado") {
            customizationReport += `\n[${item.name.toUpperCase()}]\n`;
            customizationReport += `- Para: ${gender}\n`;
            customizationReport += `- Cor da Peça: ${color}\n`;
            
            const typeLabel = EMBROIDERY_TYPES.find(t => t.value === embType)?.label;
            customizationReport += `- Tipo: ${typeLabel}\n`;
            
            if (embType === "nome" || embType === "nome_desenho") {
                customizationReport += `- Nome: "${item.customText || '(Não informado)'}"\n`;
                customizationReport += `- Cor do Nome: ${thread}\n`;
            }

            if (embType === "desenho" || embType === "nome_desenho") {
                customizationReport += `- Desenho: "${item.designDescription || '(Não informado)'}"\n`;
            }
            
            customizationReport += "----------------\n";
        }
      });

      const finalNotes = `${notes}\n\n=== DETALHES DE PERSONALIZAÇÃO ===${customizationReport}`;

      const payload = {
        customer: {
            name: session?.name || "Cliente",
            email: session?.email,
            phone: phone 
        },
        items: items.map((i) => ({
          productId: i.id,
          quantity: i.quantity,
        })),
        notes: finalNotes,
        paymentMethod: paymentMethod.toUpperCase(),
      };

      const res = await api.post("/public/orders", payload);
      return res.data;
    },
    onSuccess: (data) => {
      clearCart();
      const orderId = data.id || data.orderId; 
      router.push(`/order/success?id=${orderId}`);
    },
    onError: (error: any) => {
      console.error("Erro no checkout:", error);
      const serverMsg = error.response?.data?.message;
      setFormError(serverMsg || "Ocorreu um erro ao processar o pedido.");
    },
  });

  function handleCheckout() {
    setFormError(null);

    if (!session) {
      router.push("/auth/login?redirect=/cart");
      return;
    }

    if (!phone) {
      setFormError("Por favor, informe um telefone para contato.");
      return;
    }

    const missingName = items.find(
        i => {
           const type = i.embroideryType || "nome";
           return (type === 'nome' || type === 'nome_desenho') && !i.customText?.trim()
        }
    );

    if (missingName) {
        setFormError(`Por favor, informe o nome para bordar no item: ${missingName.name}`);
        return;
    }

    const missingDesign = items.find(
        i => {
            const type = i.embroideryType || "nome";
            return (type === 'desenho' || type === 'nome_desenho') && !i.designDescription?.trim()
        }
    );

    if (missingDesign) {
        setFormError(`Por favor, descreva qual desenho você quer no item: ${missingDesign.name}`);
        return;
    }

    checkoutMutation.mutate();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <button
              onClick={() => router.push("/")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-700 transition-colors mb-3 group"
            >
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Continuar comprando
            </button>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500">
              Sua Sacola
            </h1>
          </div>
          
          {items.length > 0 && (
            <div className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur-sm px-6 py-3 shadow-lg border-2 border-rose-200">
              <ShoppingBag size={20} className="text-rose-500" />
              <span className="text-sm font-bold text-neutral-800">
                {items.length} {items.length === 1 ? "item" : "itens"}
              </span>
            </div>
          )}
        </div>

        {items.length === 0 ? (
          <div className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-16 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden text-center">
             <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-6">
                <ShoppingBag size={40} className="text-rose-400" />
              </div>
              <p className="text-lg font-semibold text-neutral-700 mb-2">
                Sua sacola está vazia
              </p>
              <Button 
                onClick={() => router.push("/")}
                className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-6 text-sm font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30"
              >
                Ver produtos
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-5">
              {items.map((item) => {
                const image = resolveImage(item);
                const embType = item.embroideryType || "nome";
                const gender = item.gender || "Unissex / Neutro";
                const selectedColor = item.selectedColor || "Branco";
                const embroideryColor = item.embroideryColor || "Dourado";
                
                const showNameInput = embType === "nome" || embType === "nome_desenho";
                const showDesignInput = embType === "desenho" || embType === "nome_desenho";

                return (
                  <div
                    key={item.id}
                    className="group relative flex flex-col md:flex-row gap-5 rounded-3xl border-2 border-transparent bg-white p-6 shadow-lg hover:shadow-xl hover:border-rose-200 transition-all duration-300"
                  >
                    <div className="flex gap-4">
                        <div className="relative h-28 w-28 rounded-2xl overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 flex-shrink-0 shadow-md">
                        {image ? (
                            <img
                            src={image}
                            alt={item.name}
                            className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-xs text-slate-400 font-medium">
                            Sem imagem
                            </div>
                        )}
                        </div>

                        <div className="flex flex-col justify-between">
                            <div>
                                <p className="text-base font-bold text-neutral-800 group-hover:text-rose-600 transition-colors">
                                {item.name}
                                </p>
                                <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 mt-1">
                                {item.price.toLocaleString("pt-BR", {
                                    style: "currency",
                                    currency: "BRL",
                                })}
                                </p>
                            </div>

                            <div className="mt-2 flex items-center gap-3 rounded-full border-2 border-rose-200 bg-white px-3 py-1.5 text-sm font-bold shadow-sm w-fit">
                                <button 
                                    onClick={() => updateQuantity(item.id, (item.quantity ?? 1) - 1)}
                                    className="text-rose-500 hover:text-rose-700"
                                >
                                    <Minus size={14} />
                                </button>
                                <span className="min-w-[20px] text-center text-neutral-800">
                                    {item.quantity}
                                </span >
                                <button 
                                    onClick={() => updateQuantity(item.id, (item.quantity ?? 1) + 1)}
                                    className="text-rose-500 hover:text-rose-700"
                                >
                                    <Plus size={14} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 border-t md:border-t-0 md:border-l border-rose-100 pt-4 md:pt-0 md:pl-5 space-y-3">
                        <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider flex items-center gap-1">
                            <Scissors size={12} /> Personalização
                        </h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                                    <Baby size={10} /> Para quem é?
                                </label>
                                <select 
                                    value={gender}
                                    onChange={(e) => handleCustomize(item.id, "gender", e.target.value)}
                                    className="w-full rounded-lg border border-rose-200 text-xs px-2 py-1.5 focus:border-rose-400 outline-none bg-slate-50"
                                >
                                    {GENDER_OPTIONS.map(g => <option key={g} value={g}>{g}</option>)}
                                </select>
                            </div>

                            <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                                    <Palette size={10} /> Cor da Peça
                                </label>
                                <select 
                                    value={selectedColor}
                                    onChange={(e) => handleCustomize(item.id, "selectedColor", e.target.value)}
                                    className="w-full rounded-lg border border-rose-200 text-xs px-2 py-1.5 focus:border-rose-400 outline-none bg-slate-50"
                                >
                                    {COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="sm:col-span-1">
                                <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1 mb-1">
                                    <Type size={10} /> Tipo de Bordado
                                </label>
                                <select 
                                    value={embType}
                                    onChange={(e) => handleCustomize(item.id, "embroideryType", e.target.value)}
                                    className="w-full rounded-lg border border-rose-200 text-xs px-2 py-1.5 focus:border-rose-400 outline-none bg-slate-50"
                                >
                                    {EMBROIDERY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                        </div>

                        {showNameInput && (
                            <div className="animate-in fade-in slide-in-from-top-2 grid grid-cols-3 gap-2">
                                <div className="col-span-2">
                                    <label className="text-[10px] font-bold text-slate-500 mb-1 block">
                                        Nome para bordar:
                                    </label>
                                    <Input 
                                        placeholder="Ex: Maria Eduarda"
                                        value={item.customText || ""}
                                        onChange={(e) => handleCustomize(item.id, "customText", e.target.value)}
                                        className="h-8 text-xs border-rose-200 focus:border-rose-400"
                                    />
                                </div>
                                <div className="col-span-1">
                                    <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                                        <PaintBucket size={10} /> Cor do Nome
                                    </label>
                                    <select 
                                        value={embroideryColor}
                                        onChange={(e) => handleCustomize(item.id, "embroideryColor", e.target.value)}
                                        className="w-full h-8 rounded-lg border border-rose-200 text-[10px] px-1 focus:border-rose-400 outline-none bg-slate-50"
                                    >
                                        {THREAD_COLORS.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                            </div>
                        )}

                        {showDesignInput && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-bold text-slate-500 mb-1 flex items-center gap-1">
                                    <Shapes size={10} /> Qual desenho você quer?
                                </label>
                                <Input 
                                    placeholder="Ex: Ursinho príncipe, Flor, Leão..."
                                    value={item.designDescription || ""}
                                    onChange={(e) => handleCustomize(item.id, "designDescription", e.target.value)}
                                    className="h-8 text-xs border-rose-200 focus:border-rose-400"
                                />
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => removeItem(item.id)}
                        className="absolute top-4 right-4 text-rose-300 hover:text-rose-500 transition-colors"
                        title="Remover item"
                    >
                        <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="lg:sticky lg:top-8 h-fit">
              <div className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-8 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-2xl"></div>
                
                <div className="relative z-10 space-y-5">
                  <h2 className="text-xl font-black text-neutral-800 mb-6">
                    Resumo do Pedido
                  </h2>

                  <div className="space-y-3">
                    <Input
                      placeholder="Telefone / WhatsApp (Obrigatório)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="rounded-2xl border-2 border-rose-200 px-5 py-6 bg-white/80 backdrop-blur-sm shadow-sm hover:border-rose-300 transition-colors font-medium"
                    />

                    <Textarea
                      rows={3}
                      placeholder="Observações adicionais (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-2xl border-2 border-rose-200 px-5 py-4 bg-white/80 backdrop-blur-sm shadow-sm hover:border-rose-300 transition-colors font-medium resize-none"
                    />
                  </div>

                <div className="space-y-3">
                  <p className="text-sm font-bold text-neutral-700">
                    Forma de pagamento
                  </p>
                  
                  {['pix', 'card', 'cash'].map((method) => (
                     <label key={method} className="flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-white/80 px-4 py-3 cursor-pointer hover:border-rose-300 transition-colors">
                        <input
                        type="radio"
                        name="payment"
                        value={method}
                        checked={paymentMethod === method}
                        onChange={() => setPaymentMethod(method)}
                        className="accent-rose-500"
                        />
                        <span className="text-sm font-medium text-neutral-800">
                        {method === 'pix' ? 'Pix' : method === 'card' ? 'Cartão na entrega' : 'Dinheiro'}
                        </span>
                    </label>
                  ))}
                </div>

                {formError && (
                    <div className="p-3 bg-rose-100 text-rose-700 text-sm font-bold rounded-xl border border-rose-200 flex items-start gap-2">
                        <span className="mt-0.5 text-xs">⚠️</span>
                        {formError}
                    </div>
                )}

                  <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-6 flex justify-between items-center shadow-md border-2 border-rose-200">
                    <span className="text-sm font-bold text-neutral-700">Total</span>
                    <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                      {totalAmount.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </span>
                  </div>

                  <Button
                    onClick={handleCheckout}
                    disabled={checkoutMutation.isPending}
                    className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white py-7 text-base font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
                  >
                    {checkoutMutation.isPending ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Enviando pedido...
                        </>
                    ) : "Finalizar pedido"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}