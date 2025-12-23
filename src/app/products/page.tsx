"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, Sparkles, Filter, AlertTriangle } from "lucide-react";

type ProductCategory = string;

type Product = {
  id: number;
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
  active?: boolean;
  customizable?: boolean;
  images?: string[];
};

type PageResponse<T> = {
  content: T[];
};

async function fetchShopProducts(): Promise<PageResponse<Product>> {
  const res = await api.get<PageResponse<Product>>("/products", {
    params: { page: 0, size: 100, sort: "id,desc" },
  });
  return res.data;
}

export default function ProductsPage() {
  const { addItem } = useCartStore();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["shop", "products"],
    queryFn: fetchShopProducts,
  });

  const [category, setCategory] = useState("all");
  const [onlyCustom, setOnlyCustom] = useState(false);
  const [order, setOrder] = useState("recent");

  const products = useMemo(() => data?.content ?? [], [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  const visibleProducts = useMemo(() => {
    let list = products.filter(
      (p) => (p.active ?? true) && (p.stock ?? 0) > 0
    );

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    if (onlyCustom) {
      list = list.filter((p) => p.customizable);
    }

    if (order === "price-asc") {
      list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    }

    if (order === "price-desc") {
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    }

    return list;
  }, [products, category, onlyCustom, order]);

  const mainImage = (product: Product) =>
    product.images && product.images.length > 0 ? product.images[0] : null;

  function handleAddToCart(product: Product) {
    if (!product.id || !product.price) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: mainImage(product),
      stock: product.stock
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* HEADER */}
        <header className="mb-10">
          <div className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="rounded-2xl bg-gradient-to-br from-rose-100 to-pink-100 p-3 shadow-md">
                  <Package size={24} className="text-rose-600" />
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
                  <Sparkles size={14} className="animate-pulse" /> Catálogo completo
                </span>
              </div>
              
              <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
                Catálogo de Produtos
              </h1>
              <p className="mt-3 text-base text-neutral-600 font-medium">
                Todos os produtos disponíveis no ateliê • {visibleProducts.length} {visibleProducts.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
              </p>
            </div>
          </div>
        </header>

        {/* FILTROS */}
        <div className="mb-8 rounded-[2rem] bg-white/80 backdrop-blur-sm p-6 shadow-lg border-2 border-rose-200">
          <div className="flex items-center gap-2 mb-4">
            <Filter size={18} className="text-rose-500" />
            <h2 className="text-sm font-bold text-neutral-800">Filtros</h2>
          </div>
          
          <div className="grid gap-4 sm:grid-cols-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-2xl border-2 border-rose-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm hover:border-rose-300 transition-colors cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === "all" ? "Todas as categorias" : c}
                </option>
              ))}
            </select>

            <select
              value={order}
              onChange={(e) => setOrder(e.target.value)}
              className="rounded-2xl border-2 border-rose-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm hover:border-rose-300 transition-colors cursor-pointer"
            >
              <option value="recent">Mais recentes</option>
              <option value="price-asc">Menor preço</option>
              <option value="price-desc">Maior preço</option>
            </select>

            <label className="flex items-center gap-3 rounded-2xl border-2 border-rose-200 bg-white px-5 py-3 text-sm font-semibold shadow-sm hover:border-rose-300 transition-colors cursor-pointer">
              <input
                type="checkbox"
                checked={onlyCustom}
                onChange={(e) => setOnlyCustom(e.target.checked)}
                className="w-4 h-4 rounded accent-rose-500 cursor-pointer"
              />
              Apenas personalizáveis
            </label>
          </div>
        </div>

        {/* LISTAGEM */}
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent mb-4"></div>
              <p className="text-sm font-semibold text-neutral-600">Carregando produtos...</p>
            </div>
          </div>
        )}
        
        {isError && (
          <div className="rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-rose-300 text-center">
            <p className="text-base font-semibold text-rose-600">
              Erro ao carregar os produtos. Tente novamente.
            </p>
          </div>
        )}

        {!isLoading && !isError && visibleProducts.length === 0 && (
          <div className="rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-16 shadow-xl backdrop-blur-sm border border-white/50 text-center">
            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
              <Package size={36} className="text-rose-400" />
            </div>
            <p className="text-base font-semibold text-neutral-700">
              Nenhum produto encontrado com os filtros selecionados
            </p>
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product) => {
             const stock = product.stock ?? 0;
             const isLowStock = stock > 0 && stock <= 3;

             return (
            <article
              key={product.id}
              className="group relative rounded-3xl bg-white border-2 border-transparent shadow-lg hover:shadow-2xl hover:border-rose-200 transition-all duration-300 overflow-hidden hover:-translate-y-2"
            >
              {/* Gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none z-10"></div>
              
              {/* --- 2. Link na IMAGEM --- */}
              <Link href={`/products/${product.id}`} className="block cursor-pointer">
                {mainImage(product) ? (
                  <div className="h-48 overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 relative">
                    <img
                      src={mainImage(product)!}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100 text-sm text-slate-400 font-medium">
                    Sem imagem
                  </div>
                )}
              </Link>

              <div className="flex flex-1 flex-col gap-3 p-6 relative z-20">
                {/* --- 3. Link no NOME --- */}
                <Link href={`/products/${product.id}`} className="block cursor-pointer">
                    <h2 className="text-sm font-bold text-neutral-800 line-clamp-2 group-hover:text-rose-600 transition-colors min-h-[2.5rem]">
                    {product.name}
                    </h2>
                </Link>

                <div className="flex items-center justify-between">
                  <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                    {product.price?.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </p>

                  {product.customizable ? (
                    <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-3 py-1 text-[10px] font-bold text-rose-600 shadow-sm">
                      <Sparkles size={10} />
                      Personalizável
                    </span>
                  ) : isLowStock ? (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-[10px] font-bold text-amber-600 shadow-sm animate-pulse">
                      <AlertTriangle size={10} />
                      Restam {stock}
                    </span>
                  ) : null}
                </div>

                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  className={cn(
                    "mt-2 h-10 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95"
                  )}
                >
                  Adicionar à sacola
                </Button>
              </div>
            </article>
          )})}
        </div>
      </div>
    </div>
  );
}