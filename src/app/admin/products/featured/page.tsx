"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Star, Package } from "lucide-react";
import { cn } from "@/lib/utils";

type Product = {
  id: number;
  name: string;
  category?: string;
  price?: number;
  featured?: boolean;
  images?: string[];
  active?: boolean;
};

type PageResponse<T> = {
  content: T[];
};

export default function AdminFeaturedPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Busca todos os produtos para listar
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products-featured"],
    queryFn: async () => {
      const res = await api.get<PageResponse<Product>>("/products", {
        params: { page: 0, size: 100, sort: "featured,desc" }, // Traz os destaques primeiro
      });
      return res.data;
    },
  });

  const products = useMemo(() => data?.content ?? [], [data]);

  // Mutation para alternar o destaque
  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/products/${id}/featured`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products-featured"] });
      // Também invalida a lista geral de produtos
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  const filteredProducts = useMemo(() => {
    if (!search) return products;
    const lower = search.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(lower));
  }, [products, search]);

  const featuredCount = products.filter((p) => p.featured).length;

  const handleToggle = (id: number) => {
    toggleFeaturedMutation.mutate(id);
  };

  const mainImage = (p: Product) =>
    p.images && p.images.length > 0 ? p.images[0] : null;

  return (
    <div className="min-h-screen bg-rose-50/30 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-800">
              <div className="rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 p-2 text-amber-600">
                <Sparkles size={24} />
              </div>
              Gestão de Destaques
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Selecione os produtos que aparecerão na página inicial da loja.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-2 shadow-sm border border-rose-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              Em destaque:
            </span>
            <span className="text-xl font-black text-rose-600">
              {featuredCount}
            </span>
          </div>
        </div>

        <Card className="border-2 border-rose-100 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="border-b border-rose-50 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Buscar produto por nome..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 rounded-xl border-rose-200 bg-white"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">Carregando...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-slate-500">
                  Nenhum produto encontrado.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-rose-50/50 text-xs font-bold text-slate-600 uppercase sticky top-0 z-10 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-4">Produto</th>
                      <th className="px-6 py-4 text-center">Preço</th>
                      <th className="px-6 py-4 text-center">Status</th>
                      <th className="px-6 py-4 text-right">Destaque</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-rose-50">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className={cn(
                          "transition-colors hover:bg-rose-50/30",
                          product.featured ? "bg-amber-50/30" : ""
                        )}
                      >
                        <td className="px-6 py-3">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 flex-shrink-0">
                              {mainImage(product) ? (
                                <img
                                  src={mainImage(product)!}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-slate-300">
                                  <Package size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-700">
                                {product.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                {product.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3 text-center font-medium text-slate-600">
                          {product.price?.toLocaleString("pt-BR", {
                            style: "currency",
                            currency: "BRL",
                          })}
                        </td>
                        <td className="px-6 py-3 text-center">
                            {!product.active && (
                                <span className="inline-block px-2 py-1 rounded text-[10px] bg-slate-100 text-slate-500 font-bold">Inativo</span>
                            )}
                            {product.active && <span className="text-emerald-500 text-[10px] font-bold">Ativo</span>}
                        </td>
                        <td className="px-6 py-3 text-right">
                          <Button
                            onClick={() => handleToggle(product.id)}
                            disabled={toggleFeaturedMutation.isPending}
                            variant="outline"
                            className={cn(
                              "gap-2 rounded-xl border-2 transition-all active:scale-95",
                              product.featured
                                ? "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-300"
                                : "border-slate-200 text-slate-400 hover:border-rose-200 hover:text-rose-500"
                            )}
                          >
                            <Star
                              size={16}
                              className={cn(
                                product.featured ? "fill-amber-500 text-amber-500" : ""
                              )}
                            />
                            {product.featured ? "Destacado" : "Destacar"}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}