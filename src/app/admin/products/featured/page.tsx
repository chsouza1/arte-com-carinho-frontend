"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Search, Star, Package, CheckCircle2, XCircle } from "lucide-react";
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

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products-featured"],
    queryFn: async () => {
      const res = await api.get<PageResponse<Product>>("/products", {
        params: { page: 0, size: 100, sort: "featured,desc" },
      });
      return res.data;
    },
  });

  const products = useMemo(() => data?.content ?? [], [data]);

  const toggleFeaturedMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.patch(`/products/${id}/featured`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products-featured"] });
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-dashed border-[#D7CCC8] pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-white p-3 rounded-full border border-[#D7CCC8] shadow-sm">
             <Star className="h-6 w-6 text-[#F57F17] fill-[#F57F17]" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#5D4037]">Vitrine de Destaques</h1>
            <p className="text-[#8D6E63] italic">Selecione as peças que brilharão na página inicial.</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 bg-[#FFF8E1] px-4 py-2 rounded-sm border border-[#FFE0B2] shadow-sm">
            <Sparkles size={16} className="text-[#F57F17]" />
            <span className="text-sm font-bold text-[#F57F17] uppercase tracking-wider">
              {featuredCount} {featuredCount === 1 ? 'Peça em Destaque' : 'Peças em Destaque'}
            </span>
        </div>
      </div>

      {/* Lista de Controle */}
      <Card className="border border-[#D7CCC8] shadow-sm rounded-sm overflow-hidden bg-white">
        <CardHeader className="bg-[#FAF7F5] border-b border-[#EFEBE9] py-4 px-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
              <Input
                placeholder="Buscar produto para destacar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] rounded-sm h-10"
              />
            </div>
        </CardHeader>
        
        <CardContent className="p-0">
            <div className="max-h-[600px] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="p-10 text-center text-[#8D6E63] italic">Buscando peças...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-10 text-center text-[#8D6E63]">
                  Nenhum produto encontrado.
                </div>
              ) : (
                <table className="w-full text-sm text-left">
                  <thead className="bg-[#EFEBE9] text-xs font-bold text-[#5D4037] uppercase sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 w-[60%]">Peça</th>
                      <th className="px-6 py-3 text-center">Status</th>
                      <th className="px-6 py-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EFEBE9]">
                    {filteredProducts.map((product) => (
                      <tr
                        key={product.id}
                        className={cn(
                          "transition-colors hover:bg-[#FAF7F5]",
                          product.featured ? "bg-[#FFFDE7]" : ""
                        )}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-white border border-[#D7CCC8] flex-shrink-0 p-0.5 rounded-sm overflow-hidden">
                              {mainImage(product) ? (
                                <img
                                  src={mainImage(product)!}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-[#D7CCC8]">
                                  <Package size={16} />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className={cn("font-bold text-sm", product.featured ? "text-[#F57F17]" : "text-[#5D4037]")}>
                                {product.name}
                              </p>
                              <p className="text-[10px] uppercase tracking-wider text-[#8D6E63] mt-0.5">
                                {product.category} • {product.price?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                              </p>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-6 py-4 text-center">
                            {product.active ? (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E7D32] bg-[#E8F5E9] px-2 py-1 rounded-sm border border-[#C8E6C9] uppercase">
                                    <CheckCircle2 size={10} /> Ativo
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C62828] bg-[#FFEBEE] px-2 py-1 rounded-sm border border-[#FFCDD2] uppercase">
                                    <XCircle size={10} /> Inativo
                                </span>
                            )}
                        </td>

                        <td className="px-6 py-4 text-right">
                          <Button
                            onClick={() => handleToggle(product.id)}
                            disabled={toggleFeaturedMutation.isPending}
                            size="sm"
                            variant="ghost"
                            className={cn(
                              "gap-2 rounded-sm border transition-all h-9 px-4 text-xs font-bold uppercase tracking-wide",
                              product.featured
                                ? "bg-[#FFF8E1] border-[#FFE0B2] text-[#F57F17] hover:bg-[#FFECB3]"
                                : "bg-white border-[#D7CCC8] text-[#8D6E63] hover:text-[#5D4037] hover:border-[#5D4037]"
                            )}
                          >
                            <Star
                              size={14}
                              className={cn(
                                product.featured ? "fill-current" : "text-[#D7CCC8]"
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
  );
}