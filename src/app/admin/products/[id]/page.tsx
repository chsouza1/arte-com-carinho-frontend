"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Package, Sparkles } from "lucide-react";

type ProductCategory = "CLOTHING" | "ACCESSORIES" | "HOME_DECOR" | "OTHER";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: ProductCategory;
  customizable?: boolean;
  featured?: boolean;
};

type PublicOrderPayload = {
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: Array<{
    productId: number;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
    customizationNotes?: string;
  }>;
  notes?: string;
  paymentMethod?: string;
};

// mínima estrutura do que o backend devolve (OrderDTO)
type OrderResponse = {
  id: number;
  orderNumber: string;
  totalAmount: number;
};

async function fetchProduct(id: string): Promise<Product> {
  const res = await api.get(`/products/${id}`);
  return res.data;
}

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params.id;

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => fetchProduct(id),
    enabled: !!id,
  });

  const [quantity, setQuantity] = useState("1");
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [customizationNotes, setCustomizationNotes] = useState("");

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("PIX");

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const orderMutation = useMutation({
    mutationFn: async (payload: PublicOrderPayload) => {
      const res = await api.post<OrderResponse>("/public/orders", payload);
      return res.data;
    },
    onSuccess: (order) => {
      // vai para a tela de "pedido recebido" com o número do pedido
      router.push(`/orders/success?orderNumber=${order.orderNumber}`);
    },
    onError: () => {
      setErrorMessage(
        "Não foi possível enviar o pedido. Tente novamente ou fale com o ateliê pelo WhatsApp."
      );
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!product) return;

    const q = parseInt(quantity, 10);
    if (!q || q <= 0) {
      setErrorMessage("Informe uma quantidade válida.");
      return;
    }

    if (!customerName || !customerEmail || !customerPhone) {
      setErrorMessage("Preencha os dados do cliente para prosseguir.");
      return;
    }

    const payload: PublicOrderPayload = {
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      items: [
        {
          productId: product.id,
          quantity: q,
          selectedSize: selectedSize || undefined,
          selectedColor: selectedColor || undefined,
          customizationNotes: customizationNotes || undefined,
        },
      ],
      notes: orderNotes || undefined,
      paymentMethod,
    };

    setErrorMessage(null);
    orderMutation.mutate(payload);
  }

  if (isLoading || !product) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-72 rounded-2xl bg-rose-50" />
        <div className="space-y-4">
          <Skeleton className="h-6 w-2/3 rounded-lg bg-rose-50" />
          <Skeleton className="h-4 w-full rounded-lg bg-rose-50" />
          <Skeleton className="h-40 w-full rounded-lg bg-rose-50" />
        </div>
      </div>
    );
  }

  const priceBRL = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* “Imagem” / vitrine */}
      <Card className="overflow-hidden border-rose-100 bg-white/90 shadow-md">
        <div className="h-64 bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50">
          {/* Depois você troca por <Image /> com foto real */}
        </div>
        <CardContent className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h1 className="text-lg font-semibold text-slate-900">
                {product.name}
              </h1>
              <p className="text-xs text-slate-500">
                {product.description ||
                  "Peça bordada com muito carinho, ideal para compor o enxoval do seu bebê."}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className="bg-rose-50 text-[10px] font-semibold text-rose-600">
                {mapCategoryLabel(product.category)}
              </Badge>
              {product.featured && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                  <Sparkles className="h-3 w-3" />
                  Destaque do ateliê
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-[11px] text-slate-500">Preço</p>
              <p className="text-xl font-semibold text-rose-600">{priceBRL}</p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <Package className="h-3.5 w-3.5 text-rose-400" />
              <span>
                Estoque:{" "}
                <span
                  className={cn(
                    "font-semibold",
                    product.stock <= 2
                      ? "text-rose-600"
                      : product.stock <= 5
                      ? "text-amber-600"
                      : "text-slate-800"
                  )}
                >
                  {product.stock} un.
                </span>
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulário de pedido */}
      <Card className="border-rose-100 bg-white/90 shadow-md">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-900">
            Fazer pedido desta peça
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Quantidade
                </label>
                <Input
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(e.target.value.replace(/[^\d]/g, ""))
                  }
                  className="h-9 text-sm"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Tamanho
                </label>
                <select
                  value={selectedSize}
                  onChange={(e) => setSelectedSize(e.target.value)}
                  className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                >
                  <option value="">Selecione</option>
                  <option value="RN">RN</option>
                  <option value="P">P</option>
                  <option value="M">M</option>
                  <option value="G">G</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Cor
                </label>
                <Input
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  placeholder="Ex.: Rosa bebê, Azul, Branco..."
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {product.customizable && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Personalização (nome, tema, etc.)
                </label>
                <Textarea
                  value={customizationNotes}
                  onChange={(e) => setCustomizationNotes(e.target.value)}
                  rows={3}
                  placeholder="Ex.: Bordar o nome 'Laura' com tema de ursinho."
                  className="text-xs"
                />
              </div>
            )}

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  Seu nome
                </label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-600">
                  WhatsApp
                </label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  required
                  placeholder="(xx) xxxxx-xxxx"
                  className="h-9 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                E-mail
              </label>
              <Input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                required
                placeholder="voce@exemplo.com"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Observações do pedido
              </label>
              <Textarea
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                rows={3}
                placeholder="Prazo desejado, embalagem para presente, etc."
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-600">
                Forma de pagamento preferida
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
              >
                <option value="pix">PIX</option>
                <option value="cartao credito">Cartão</option>
                <option value="dinheiro">Dinheiro</option>
              </select>
            </div>

            {errorMessage && (
              <p className="text-xs text-rose-600">{errorMessage}</p>
            )}

            <Button
              type="submit"
              className="mt-2 w-full bg-rose-500 text-xs font-semibold hover:bg-rose-600"
              disabled={orderMutation.isPending}
            >
              {orderMutation.isPending
                ? "Enviando pedido..."
                : "Fazer pedido agora"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function mapCategoryLabel(category: ProductCategory) {
  switch (category) {
    case "CLOTHING":
      return "Roupinhas";
    case "ACCESSORIES":
      return "Acessórios";
    case "HOME_DECOR":
      return "Banho & enxoval";
    default:
      return "Outros";
  }
}
