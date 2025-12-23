"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ProductCategory =
  | "ROUPAS" 
  | "ENXOVAL_DE_BANHO" 
  | "ACESSORIOS" 
  | "DECORACAO_DE_CASA"
  | "ENXOVAL_DE_BANHO"
  | "TOALHA_CAPUZ"
  | "NANINHAS"
  | "TOALHA_FRAUDA"
  | "CADERNETAS_VACINACAO"
  | "BODYS"
  | "TOALHA_DE_BOCA"
  | "NECESSARIES"
  | "SAQUINHOS_TROCA"
  | "MANTINHAS"
  | "BATIZADO"
  | "BOLSAS_MATERNIDADES"
  | "TROCADORES"
  | "PANO_COPA"
  | "SAIDA_MATERNIDADE"
  | "KITS"
  | "ESTOJO_ESCOLAR"
  | "OUTROS"
  | string;

type Product = {
  id: number;
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
  active?: boolean;
  featured?: boolean;
  customizable?: boolean;
  images?: string[];
  [key: string]: any;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
};

async function fetchShopProducts(): Promise<PageResponse<Product>> {
  const res = await api.get<PageResponse<Product>>("/products", {
    params: { page: 0, size: 50, sort: "id,desc" },
  });
  return res.data;
}

export default function ProductsPage() {
  const { addItem } = useCartStore(); // <--- MUDANÇA
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shop", "products"],
    queryFn: fetchShopProducts,
  });
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  const products = useMemo(() => data?.content ?? [], [data]);

  const visibleProducts = useMemo(
    () =>
      products.filter(
        (p) => (p.active ?? true) && (p.stock ?? 0) > 0
      ),
    [products]
  );

  function handleAddToCart(product: Product) {
    if (!product.id || !product.price) return;

    addItem({ // <--- MUDANÇA
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });

    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <header className="mb-4 space-y-1">
        <h1 className="text-lg font-semibold text-slate-900">
          Produtos do ateliê
        </h1>
        <p className="text-xs text-slate-600">
          Peças feitas com carinho para enxoval, recém-nascidos e presentes
          especiais.
        </p>
      </header>

      {isLoading && (
        <p className="text-sm text-slate-500">Carregando produtos...</p>
      )}

      {isError && (
        <p className="text-sm text-rose-500">
          Não foi possível carregar os produtos. Tente novamente mais tarde.
        </p>
      )}

      {!isLoading && !isError && visibleProducts.length === 0 && (
        <p className="text-sm text-slate-600">
          Ainda não há produtos disponíveis na loja.
        </p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {visibleProducts.map((product) => (
          <article
            key={product.id}
            className="flex flex-col rounded-xl border border-rose-100 bg-white shadow-sm"
          >
            {/* Imagem (placeholder por enquanto) */}
            <div className="h-32 w-full rounded-t-xl bg-rose-50" />

            <div className="flex flex-1 flex-col gap-2 p-3">
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-900">
                  {product.name}
                </h2>
                {product.description && (
                  <p className="line-clamp-2 text-[11px] text-slate-600">
                    {product.description}
                  </p>
                )}
                <p className="text-xs font-semibold text-rose-600">
                  {product.price?.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
                <p className="text-[10px] text-slate-500">
                  Estoque disponível: {product.stock ?? 0}
                </p>
              </div>

              <div className="mt-auto flex flex-col gap-1">
                {product.customizable && (
                  <span className="w-fit rounded-full bg-rose-50 px-2 py-[2px] text-[10px] text-rose-600">
                    Personalizável
                  </span>
                )}

                <Button
                  size="sm"
                  className={cn(
                    "mt-1 h-8 w-full bg-rose-500 text-[11px] font-semibold text-white hover:bg-rose-600",
                    (product.stock ?? 0) <= 0 &&
                      "cursor-not-allowed bg-slate-300 hover:bg-slate-300"
                  )}
                  disabled={(product.stock ?? 0) <= 0}
                  onClick={() => handleAddToCart(product)}
                >
                  {justAddedId === product.id
                    ? "Adicionado à sacola ✓"
                    : "Adicionar à sacola"}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}