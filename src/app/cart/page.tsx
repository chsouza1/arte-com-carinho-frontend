"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { getCart, saveCart, type CartItem } from "@/lib/cart";
import { getAuthSession, type AuthSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ShoppingBag, Trash2, Plus, Minus, ArrowLeft, Loader2 } from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? api.defaults.baseURL;

  const [items, setItems] = useState<CartItem[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCart());
    setSession(getAuthSession());

    const onUpdate = () => setItems(getCart());
    window.addEventListener("cart:updated", onUpdate);
    return () => window.removeEventListener("cart:updated", onUpdate);
  }, []);

  const resolveImage = (item: CartItem) => {
    const img =
      item.imageUrl ||
      (item as any)?.images?.[0] ||
      null;

    if (!img) return null;
    if (img.startsWith("http")) return img;
    return `${API_URL}${img}`;
  };

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * (item.quantity ?? 1),
        0
      ),
    [items]
  );

  function updateCart(newItems: CartItem[]) {
    setItems(newItems);
    saveCart(newItems);
  }

  // --- MUTAÇÃO CORRIGIDA ---
  const checkoutMutation = useMutation({
    mutationFn: async () => {
      // CORREÇÃO AQUI: Removemos o .user, pois name/email estão direto na session
      const payload = {
        customer: {
            name: session?.name || "Cliente", // <--- CORRIGIDO
            email: session?.email,            // <--- CORRIGIDO
            phone: phone 
        },
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        notes: notes,
        paymentMethod: paymentMethod.toUpperCase(),
      };

      const res = await api.post("/public/orders", payload);
      return res.data;
    },
    onSuccess: (data) => {
      updateCart([]);
      const orderId = data.id || data.orderId; 
      router.push(`/order/success?id=${orderId}`);
    },
    onError: (error: any) => {
      console.error("Erro no checkout:", error);
      const serverMsg = error.response?.data?.message;
      const validationMsg = error.response?.data?.validationErrors 
          ? Object.values(error.response.data.validationErrors).join(", ") 
          : null;

      setFormError(
        validationMsg || serverMsg || "Ocorreu um erro ao processar o pedido. Verifique os dados."
      );
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

    checkoutMutation.mutate();
  }
  // -------------------------------

  function handleChangeQuantity(productId: number, delta: number) {
    updateCart(
      items.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, (item.quantity ?? 1) + delta) }
          : item
      )
    );
  }

  function handleRemove(productId: number) {
    updateCart(items.filter((item) => item.productId !== productId));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* HEADER */}
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
              <p className="text-sm text-neutral-500 mb-8">
                Adicione produtos para começar suas compras
              </p>
              <Button 
                onClick={() => router.push("/")}
                className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-6 text-sm font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40"
              >
                Ver produtos
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ITENS */}
            <div className="lg:col-span-2 space-y-5">
              {items.map((item) => {
                const image = resolveImage(item);

                return (
                  <div
                    key={item.productId}
                    className="group relative flex gap-5 rounded-3xl border-2 border-transparent bg-white p-6 shadow-lg hover:shadow-xl hover:border-rose-200 transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none rounded-3xl"></div>
                    
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

                    <div className="flex-1 flex flex-col justify-between relative z-10">
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

                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-3 rounded-full border-2 border-rose-200 bg-white px-4 py-2 text-sm font-bold shadow-sm">
                          <button 
                            onClick={() => handleChangeQuantity(item.productId, -1)}
                            className="text-rose-500 hover:text-rose-700 transition-colors hover:scale-110 active:scale-95"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="min-w-[20px] text-center text-neutral-800">
                            {item.quantity}
                          </span>
                          <button 
                            onClick={() => handleChangeQuantity(item.productId, 1)}
                            className="text-rose-500 hover:text-rose-700 transition-colors hover:scale-110 active:scale-95"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemove(item.productId)}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-rose-500 hover:text-rose-700 transition-colors group/btn"
                        >
                          <Trash2 size={16} className="group-hover/btn:scale-110 transition-transform" />
                          Remover
                        </button>
                      </div>
                    </div>

                    <div className="text-right relative z-10">
                      <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                        {(item.price * (item.quantity ?? 1)).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* RESUMO */}
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
                      placeholder="Observações (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="rounded-2xl border-2 border-rose-200 px-5 py-4 bg-white/80 backdrop-blur-sm shadow-sm hover:border-rose-300 transition-colors font-medium resize-none"
                    />
                  </div>
                  {/* FORMAS DE PAGAMENTO */}
                <div className="space-y-3">
                  <p className="text-sm font-bold text-neutral-700">
                    Forma de pagamento
                  </p>

                  <label className="flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-white/80 px-4 py-3 cursor-pointer hover:border-rose-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="pix"
                      checked={paymentMethod === "pix"}
                      onChange={() => setPaymentMethod("pix")}
                      className="accent-rose-500"
                    />
                    <span className="text-sm font-medium text-neutral-800">
                      Pix
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-white/80 px-4 py-3 cursor-pointer hover:border-rose-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="accent-rose-500"
                    />
                    <span className="text-sm font-medium text-neutral-800">
                      Cartão na entrega
                    </span>
                  </label>

                  <label className="flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-white/80 px-4 py-3 cursor-pointer hover:border-rose-300 transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === "cash"}
                      onChange={() => setPaymentMethod("cash")}
                      className="accent-rose-500"
                    />
                    <span className="text-sm font-medium text-neutral-800">
                      Dinheiro
                    </span>
                  </label>
                </div>

                {formError && (
                    <div className="p-3 bg-rose-100 text-rose-700 text-sm font-bold rounded-xl border border-rose-200">
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
                            Processando...
                        </>
                    ) : "Finalizar pedido"}
                  </Button>

                  <p className="text-xs text-center text-neutral-500 mt-4">
                    Ao finalizar, você será redirecionado para o WhatsApp
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}