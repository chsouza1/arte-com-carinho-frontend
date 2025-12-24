"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Package, Sparkles, Filter, AlertTriangle, Bug } from "lucide-react";

type Product = {
  id: number;
  name: string;
  price: number;
  stock: number;
  category?: string;
  active?: boolean;
  customizable?: boolean;
  images?: string[];
};

type PageResponse<T> = {
  content: T[];
};

async function fetchShopProducts() {
  const res = await api.get<PageResponse<Product>>(`/products?t=${Date.now()}`, {
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


  useEffect(() => {
    if (data) {
        console.group("DEBUG PRODUTOS (CATÁLOGO)");
        console.log("Dados brutos da API:", data);
        if (data.content && data.content.length > 0) {
            console.log("Primeiro item:", data.content[0]);
            console.log("ID do primeiro item:", data.content[0].id);
            console.log("Tipo do ID:", typeof data.content[0].id);
        } else {
            console.warn("Array 'content' está vazio ou não existe!");
        }
        console.groupEnd();
    }
  }, [data]);

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
        <header className="mb-10">
          <div className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-10 shadow-xl backdrop-blur-sm border border-white/50">
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500">
                Catálogo ({visibleProducts.length})
            </h1>
          </div>
        </header>

        {isLoading && <div className="text-center py-20">Carregando...</div>}
        
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product, index) => {

             const debugId = product.id; 
             const hasId = debugId !== undefined && debugId !== null;
             const linkTarget = hasId ? `/products/${debugId}` : "#";

             return (
            <article
              key={product.id || index}
              className="group relative rounded-3xl bg-white border-2 border-transparent shadow-lg hover:shadow-2xl transition-all overflow-hidden hover:-translate-y-2"
            >
              {/* DEBUG VISUAL NO CARD */}
              <div className="absolute top-2 left-2 z-50 bg-black/70 text-white text-[10px] p-1 rounded font-mono pointer-events-none">
                ID: {String(debugId)}
              </div>

              {/* Link na Imagem */}
              <Link href={linkTarget} className={hasId ? "cursor-pointer" : "cursor-not-allowed"}>
                {mainImage(product) ? (
                  <div className="h-48 overflow-hidden bg-rose-50 relative">
                    <img
                      src={mainImage(product)!}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-110 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="h-48 flex items-center justify-center bg-rose-50 text-slate-400 font-medium">
                    Sem foto
                  </div>
                )}
              </Link>

              <div className="p-4 relative z-20">
                <Link href={linkTarget} className={hasId ? "cursor-pointer" : "cursor-not-allowed"}>
                    <h2 className="text-sm font-bold text-slate-800 line-clamp-2 hover:text-rose-600 transition-colors">
                    {product.name}
                    </h2>
                </Link>

                <div className="mt-2 flex justify-between items-center">
                    <p className="text-lg font-black text-rose-600">
                        R$ {product.price?.toFixed(2)}
                    </p>
                </div>

                <Button
                  size="sm"
                  onClick={() => handleAddToCart(product)}
                  disabled={!hasId || product.stock <= 0}
                  className="mt-3 w-full rounded-xl"
                >
                  {hasId ? "Comprar" : "Erro no ID"}
                </Button>
              </div>
            </article>
          )})}
        </div>
      </div>
    </div>
  );
}