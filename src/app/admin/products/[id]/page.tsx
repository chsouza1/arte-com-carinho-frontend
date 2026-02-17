"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, ShoppingBag, Sparkles, Check, AlertTriangle } from "lucide-react";

type ProductCategory =
  | "ROUPAS" 
  | "ENXOVAL_DE_BANHO" 
  | "ACESSORIOS" 
  | "DECORACAO_DE_CASA"
  | "TOALHA_CAPUZ"
  | "NANINHAS"
  | "TOALHA_FRAUDA"
  | "BODYS"
  | "CADERNETAS_VACINACAO"
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
  const { addItem } = useCartStore();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shop", "products"],
    queryFn: fetchShopProducts,
  });
  const [justAddedId, setJustAddedId] = useState<number | null>(null);

  const products = useMemo(() => data?.content ?? [], [data]);

  const visibleProducts = useMemo(
    () => products.filter((p) => (p.active ?? true) && (p.stock ?? 0) > 0),
    [products]
  );

  function handleAddToCart(product: Product) {
    if (!product.id || !product.price) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
    });

    setJustAddedId(product.id);
    setTimeout(() => setJustAddedId(null), 1500);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 font-sans text-[#5D4037]">
      
      {/* Header Estilo Papelaria */}
      <header className="mb-8 border-b border-dashed border-[#D7CCC8] pb-6">
        <div className="flex items-center gap-3 mb-2">
            <div className="bg-white p-2 rounded-full border border-[#D7CCC8] shadow-sm">
                <ShoppingBag size={24} className="text-[#E53935]" />
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037]">
            Catálogo do Ateliê
            </h1>
        </div>
        <p className="text-sm text-[#8D6E63] italic pl-12">
          Peças feitas à mão com carinho para enxoval e presentes especiais.
        </p>
      </header>

      {/* Estados de Carregamento */}
      {isLoading && (
        <div className="text-center py-20 text-[#8D6E63]">
            <p className="text-sm font-bold uppercase tracking-widest animate-pulse">Carregando vitrine...</p>
        </div>
      )}

      {isError && (
        <div className="bg-[#FFEBEE] border border-[#FFCDD2] p-6 text-center rounded-sm">
            <p className="text-sm font-bold text-[#C62828] flex items-center justify-center gap-2">
                <AlertTriangle size={16} /> Não foi possível carregar as peças. Tente novamente.
            </p>
        </div>
      )}

      {!isLoading && !isError && visibleProducts.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed border-[#D7CCC8] rounded-sm bg-[#FAF7F5]">
            <Package className="mx-auto h-12 w-12 text-[#D7CCC8] mb-4" />
            <p className="text-lg font-serif text-[#5D4037]">O ateliê está vazio no momento.</p>
            <p className="text-sm text-[#8D6E63]">Aguarde novas criações!</p>
        </div>
      )}

      {/* Grid de Produtos */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <article
            key={product.id}
            className="group flex flex-col bg-white border border-[#D7CCC8] shadow-sm hover:shadow-md hover:border-[#A1887F] transition-all rounded-sm overflow-hidden relative"
          >
            {/* Faixa decorativa no hover */}
            <div className="absolute top-0 left-0 w-full h-1 bg-[#E53935] opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>

            {/* Área da Imagem */}
            <div className="h-48 w-full bg-[#FAF7F5] border-b border-[#EFEBE9] relative flex items-center justify-center overflow-hidden">
                {product.images && product.images.length > 0 ? (
                    <img 
                        src={product.images[0]} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex flex-col items-center text-[#D7CCC8]">
                        <Package size={32} strokeWidth={1.5} />
                        <span className="text-[10px] uppercase font-bold mt-2">Sem foto</span>
                    </div>
                )}

                {/* Badge Personalizável */}
                {product.customizable && (
                  <span className="absolute top-2 right-2 bg-[#FFF8E1] text-[#F57F17] text-[10px] font-bold px-2 py-1 rounded-sm border border-[#FFE0B2] shadow-sm flex items-center gap-1 uppercase tracking-wider">
                    <Sparkles size={8} /> Personalizável
                  </span>
                )}
            </div>

            {/* Informações */}
            <div className="flex flex-1 flex-col p-4">
              <div className="space-y-1 mb-4">
                <h2 className="text-sm font-bold text-[#5D4037] line-clamp-1 group-hover:text-[#E53935] transition-colors">
                  {product.name}
                </h2>
                <p className="text-[10px] text-[#8D6E63] uppercase tracking-wider">
                    {product.category || "Artesanato"}
                </p>
                {product.description && (
                  <p className="line-clamp-2 text-xs text-[#8D6E63] mt-1 leading-relaxed">
                    {product.description}
                  </p>
                )}
              </div>

              <div className="mt-auto pt-3 border-t border-dashed border-[#EFEBE9]">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-lg font-serif font-bold text-[#5D4037]">
                    {product.price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                    <span className="text-[10px] font-medium text-[#8D6E63] bg-[#FAF7F5] px-2 py-0.5 rounded-sm border border-[#EFEBE9]">
                        Restam {product.stock}
                    </span>
                </div>

                <Button
                  size="sm"
                  className={cn(
                    "w-full h-9 text-xs font-bold uppercase tracking-widest rounded-sm transition-all shadow-sm",
                    (product.stock ?? 0) <= 0 
                        ? "bg-[#EFEBE9] text-[#A1887F] cursor-not-allowed hover:bg-[#EFEBE9]" 
                        : "bg-[#E53935] text-white hover:bg-[#C62828] hover:-translate-y-0.5 active:translate-y-0"
                  )}
                  disabled={(product.stock ?? 0) <= 0}
                  onClick={() => handleAddToCart(product)}
                >
                  {justAddedId === product.id ? (
                      <span className="flex items-center gap-1"><Check size={14}/> Adicionado</span>
                  ) : (
                      "Adicionar à Sacola"
                  )}
                </Button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}