"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { getCart, saveCart, type CartItem } from "@/lib/cart";
import type { AuthSession } from "@/lib/auth";
import { getAuthSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PublicOrderRequest = {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: {
    productId: number;
    quantity: number;
    selectedSize?: string | null;
    selectedColor?: string | null;
    customizationNotes?: string | null;
  }[];
  notes?: string | null;
  paymentMethod?: string | null;
};

type OrderDTO = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
};

export default function CartPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>([]);
  const [session, setSession] = useState<AuthSession | null>(null);

  // campos do mini checkout
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCart());
    setSession(getAuthSession());
  }, []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + (item.quantity ?? 0), 0),
    [items]
  );

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (item.price ?? 0) * (item.quantity ?? 0),
        0
      ),
    [items]
  );

  function updateCart(newItems: CartItem[]) {
    setItems(newItems);
    saveCart(newItems);
  }

  function handleChangeQuantity(productId: number, delta: number) {
    const newItems = items
      .map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, (item.quantity ?? 1) + delta) }
          : item
      )
      .filter((item) => item.quantity > 0);

    updateCart(newItems);
  }

  function handleRemove(productId: number) {
    const newItems = items.filter((item) => item.productId !== productId);
    updateCart(newItems);
  }

  function handleClear() {
    updateCart([]);
  }

  async function fetchShippingQuote(toZip: string, items: any[]) {
  const res = await api.post("/shipping/quote", {
    toZip,
    items: items.map((i) => ({
      sku: i.sku,
      qty: i.qty,
      weight: i.weight,
      width: i.width,
      height: i.height,
      length: i.length,
      price: i.price,
    })),
  });
  return res.data as { provider: string; service: string; price: number; days: number; rawId: string }[];
}


  const checkoutMutation = useMutation<
    OrderDTO,
    any,
    { phone: string; notes: string; paymentMethod: string }
  >({
    mutationFn: async ({ phone, notes, paymentMethod }) => {
      if (!session) {
        throw new Error("NO_SESSION");
      }
      if (items.length === 0) {
        throw new Error("EMPTY_CART");
      }

      const payload: PublicOrderRequest = {
        customer: {
          name: session.name,
          email: session.email,
          phone,
        },
        items: items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity ?? 1,
          selectedSize: null,
          selectedColor: null,
          customizationNotes: null,
        })),
        notes: notes || null,
        paymentMethod: paymentMethod || null
      };

      const res = await api.post<OrderDTO>("/public/orders", payload);
      return res.data;
    },
    onSuccess: (order) => {
      // esvazia sacola e manda para pedidos
      saveCart([]);
      setItems([]);
      router.push(`/account/orders/${order.id}`);
    },
    onError: (error: any) => {
      console.error("Erro ao criar pedido público:", error?.response?.data || error);
      if (error?.message === "NO_SESSION") {
        setFormError("Você precisa estar logado para finalizar o pedido.");
        router.push("/auth/login?from=/cart");
        return;
      }
      if (error?.message === "EMPTY_CART") {
        setFormError("Sua sacola está vazia.");
        return;
      }

      const backendMsg = error?.response?.data?.message;
      setFormError(
        backendMsg ||
          "Não foi possível finalizar o pedido. Verifique os dados e tente novamente."
      );
    },
  });

  function handleCheckout() {
    setFormError(null);

    if (!session) {
      // não logado → login com redirect de volta pra sacola
      router.push("/auth/login?from=/cart");
      return;
    }

    if (items.length === 0) {
      setFormError("Sua sacola está vazia.");
      return;
    }

    if (!phone.trim()) {
      setFormError("Informe um telefone para contato.");
      return;
    }

    checkoutMutation.mutate({
      phone: phone.trim(),
      notes: notes.trim(),
      paymentMethod,
    });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <header className="mb-4 space-y-1">
        <h1 className="text-lg font-semibold text-slate-900">Sua sacola</h1>
        <p className="text-xs text-slate-600">
          Confira os itens escolhidos e informe os dados para o ateliê entrar em
          contato e acompanhar o pedido.
        </p>
      </header>

      {items.length === 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Sua sacola está vazia no momento.
          </p>
          <Button
            size="sm"
            className="bg-rose-500 text-xs text-white hover:bg-rose-600"
            onClick={() => router.push("/products")}
          >
            Ver produtos do ateliê
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Lista de itens */}
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-lg border border-rose-100 bg-white px-3 py-2 shadow-sm"
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    {item.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {item.price.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}{" "}
                    x {item.quantity}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 rounded-full border border-slate-200 px-2 py-[2px]">
                    <button
                      type="button"
                      className="px-1 text-slate-600"
                      onClick={() =>
                        handleChangeQuantity(item.productId, -1)
                      }
                    >
                      -
                    </button>
                    <span className="min-w-[16px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="px-1 text-slate-600"
                      onClick={() =>
                        handleChangeQuantity(item.productId, 1)
                      }
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <p className="text-xs font-semibold text-rose-600">
                      {(item.price * item.quantity).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                    <button
                      type="button"
                      className="text-[10px] text-rose-500 underline"
                      onClick={() => handleRemove(item.productId)}
                    >
                      remover
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini checkout (dados do cliente) */}
          <div className="space-y-3 rounded-lg border border-rose-100 bg-rose-50/60 p-3 text-xs">
            <p className="text-[11px] font-semibold text-slate-800">
              Dados para contato
            </p>

            {session ? (
              <div className="text-[11px] text-slate-600">
                <p>
                  <span className="font-medium">Nome:</span> {session.name}
                </p>
                <p>
                  <span className="font-medium">E-mail:</span> {session.email}
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-rose-600">
                Você precisa estar logado para finalizar o pedido.
              </p>
            )}

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Telefone / WhatsApp
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="(47) 99999-9999"
                className="h-8 text-[11px]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Observações (opcional)
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="text-[11px]"
                placeholder="Ex.: nome do bebê, cores preferidas, detalhes de personalização..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Forma de pagamento preferida
              </label>
              <select
                className="h-8 w-full rounded-md border border-slate-200 bg-white px-2 text-[11px]"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="pix">PIX</option>
                <option value="cartao">Cartão</option>
                <option value="dinheiro">Boleto</option>
              </select>
            </div>

            {formError && (
              <p className="text-[11px] text-rose-600">{formError}</p>
            )}

            {/* Resumo */}
            <div className="mt-2 rounded-md bg-white/70 p-2 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-700">Itens na sacola</span>
                <span className="font-semibold text-slate-900">
                  {totalItems}
                </span>
              </div>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-slate-700">Valor total estimado</span>
                <span className="text-sm font-semibold text-rose-700">
                  {totalAmount.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                O valor final, prazos e detalhes são confirmados diretamente com
                o ateliê após o envio do pedido.
              </p>
            </div>

            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-rose-500 text-[11px] text-white hover:bg-rose-600"
                onClick={handleCheckout}
                disabled={checkoutMutation.isPending}
              >
                {checkoutMutation.isPending
                  ? "Enviando pedido..."
                  : "Finalizar pedido"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 text-[11px]"
                onClick={handleClear}
              >
                Esvaziar sacola
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
