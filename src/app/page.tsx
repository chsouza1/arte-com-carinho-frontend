"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Product, ProductCard } from "@/components/ui/products/product-card";
import { Skeleton } from "@/components/ui/skeleton";

async function fetchProducts(): Promise<Product[]> {
  const res = await api.get("/products");
  return res.data.content ?? res.data;
}

export default function HomePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["products", "home"],
    queryFn: fetchProducts,
  });

  return (
    <div className="space-y-8">
      <section className="space-y-3">
        <span className="rounded-full bg-rose-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-rose-600">
          Arte com Carinho
        </span>
        <h1 className="max-w-2xl text-2xl font-semibold text-slate-900 sm:text-3xl">
          ajustar
        </h1>
        <p className="max-w-2xl text-sm text-slate-600">
          ajustar.
        </p>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-800">Coleção em destaque</h2>
        </div>

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl bg-rose-50" />
            ))}
          </div>
        )}

        {!isLoading && data && data.length === 0 && (
          <p className="text-sm text-slate-500">
            Ainda não há produtos cadastrados. Em breve você verá aqui os bordados mais fofos do ateliê. ✨
          </p>
        )}

        {!isLoading && data && data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
