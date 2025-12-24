"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; 
import { Badge } from "@/components/ui/badge"; 
import { Checkbox } from "@/components/ui/checkbox"; 
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Check, 
  X 
} from "lucide-react";

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

  // Logs de Debug mantidos conforme seu código original
  useEffect(() => {
    if (data) {
        console.group("DEBUG PRODUTOS (CATÁLOGO)");
        // ... logs originais ...
        console.groupEnd();
    }
  }, [data]);

  // --- ESTADOS DE FILTRO ---
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [onlyCustom, setOnlyCustom] = useState(false);
  const [order, setOrder] = useState("recent");
  const [showFilters, setShowFilters] = useState(false); // Para mobile

  const products = useMemo(() => data?.content ?? [], [data]);

  // Extrai categorias únicas dinamicamente
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  // --- LÓGICA DE FILTRAGEM ATUALIZADA ---
  const visibleProducts = useMemo(() => {
    let list = products.filter(
      (p) => (p.active ?? true) && (p.stock ?? 0) > 0
    );

    // Filtro de Texto (Busca)
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(lowerTerm));
    }

    // Filtro de Categoria
    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    // Filtro de Personalizável
    if (onlyCustom) {
      list = list.filter((p) => p.customizable);
    }

    // Ordenação
    if (order === "price-asc") {
      list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (order === "price-desc") {
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (order === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }
    // "recent" usa a ordem padrão da API (id desc)

    return list;
  }, [products, category, onlyCustom, order, searchTerm]);

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

  // Função auxiliar para formatar nome de categoria (ex: remove underscore)
  const formatCategory = (cat: string) => 
    cat === "all" ? "Todas" : cat.replace(/_/g, " ");

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">
        
        {/* HEADER */}
        <header className="mb-8">
          <div className="rounded-[2rem] bg-white/60 p-6 sm:p-10 shadow-xl backdrop-blur-sm border border-white/50 text-center sm:text-left">
            <h1 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 mb-2">
                Nossa Coleção
            </h1>
            <p className="text-slate-500 font-medium">
              Explore {visibleProducts.length} produtos exclusivos feitos com carinho
            </p>
          </div>
        </header>

        {/* --- ÁREA DE CONTROLE (BUSCA E FILTROS) --- */}
        <div className="mb-8 space-y-4">
            
            {/* Barra de Busca e Botão de Filtro Mobile */}
            <div className="flex gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input 
                        placeholder="Buscar produto..." 
                        className="pl-9 bg-white border-rose-100 focus-visible:ring-rose-400 rounded-xl h-12 shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                           onClick={() => setSearchTerm("")}
                           className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-rose-500"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <Button 
                    variant="outline" 
                    className="h-12 w-12 shrink-0 rounded-xl border-rose-100 bg-white hover:bg-rose-50 lg:hidden"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <SlidersHorizontal className="h-5 w-5 text-rose-600" />
                </Button>
            </div>

            {/* Painel de Filtros (Expansível no Mobile, Fixo no Desktop) */}
            <div className={`
                bg-white p-4 rounded-2xl shadow-sm border border-rose-100 space-y-4 transition-all duration-300
                ${showFilters ? 'block' : 'hidden lg:block'}
            `}>
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                    
                    {/* Categorias (Scroll Horizontal) */}
                    <div className="w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                        <div className="flex gap-2">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setCategory(cat)}
                                    className={`
                                        px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border
                                        ${category === cat 
                                            ? "bg-rose-500 text-white border-rose-500 shadow-md shadow-rose-200" 
                                            : "bg-slate-50 text-slate-600 border-slate-100 hover:border-rose-200 hover:bg-white"}
                                    `}
                                >
                                    {formatCategory(cat)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Controles da Direita: Ordenação e Checkbox */}
                    <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto items-start sm:items-center">
                        
                        <div className="flex items-center space-x-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                            <Checkbox 
                                id="custom-filter" 
                                checked={onlyCustom}
                                onCheckedChange={(c) => setOnlyCustom(c as boolean)}
                                className="border-slate-300 data-[state=checked]:bg-rose-500 data-[state=checked]:border-rose-500"
                            />
                            <label
                                htmlFor="custom-filter"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-600 cursor-pointer select-none"
                            >
                                Apenas Personalizáveis
                            </label>
                        </div>

                        <div className="relative">
                            <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500 pointer-events-none" />
                            <select 
                                value={order}
                                onChange={(e) => setOrder(e.target.value)}
                                className="h-10 pl-8 pr-8 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-rose-500 appearance-none cursor-pointer"
                            >
                                <option value="recent">Mais Recentes</option>
                                <option value="price-asc">Menor Preço</option>
                                <option value="price-desc">Maior Preço</option>
                                <option value="name">Nome (A-Z)</option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* LOADING & EMPTY STATE */}
        {isLoading && <div className="text-center py-20 text-slate-400">Carregando catálogo...</div>}
        
        {!isLoading && visibleProducts.length === 0 && (
            <div className="text-center py-20 bg-white/50 rounded-3xl border border-dashed border-slate-200">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-400">
                    <Filter size={24} />
                </div>
                <h3 className="text-lg font-bold text-slate-700">Nenhum produto encontrado</h3>
                <p className="text-slate-500">Tente ajustar seus filtros ou busca.</p>
                <Button 
                    variant="link" 
                    onClick={() => {setSearchTerm(""); setCategory("all"); setOnlyCustom(false);}}
                    className="mt-2 text-rose-600"
                >
                    Limpar todos os filtros
                </Button>
            </div>
        )}

        {/* GRID DE PRODUTOS */}
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visibleProducts.map((product, index) => {
             const debugId = product.id; 
             const hasId = debugId !== undefined && debugId !== null;
             const linkTarget = hasId ? `/products/${debugId}` : "#";

             return (
            <article
              key={product.id || index}
              className="group relative flex flex-col justify-between rounded-3xl bg-white border border-rose-100/50 shadow-lg shadow-rose-100/20 hover:shadow-2xl hover:shadow-rose-200/40 transition-all duration-300 overflow-hidden hover:-translate-y-1"
            >

              {/* IMAGEM */}
              <Link href={linkTarget} className={`block relative ${hasId ? "cursor-pointer" : "cursor-not-allowed"}`}>
                <div className="aspect-[4/3] overflow-hidden bg-rose-50 relative">
                  {mainImage(product) ? (
                    <img
                      src={mainImage(product)!}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-300 font-medium">
                      Sem foto
                    </div>
                  )}
                  
                  {/* Badges sobre a imagem */}
                  <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                      {product.customizable && (
                          <Badge className="bg-white/90 text-rose-600 text-[10px] backdrop-blur hover:bg-white shadow-sm font-bold uppercase tracking-wider">
                              Personalizável
                          </Badge>
                      )}
                      {product.category && (
                          <Badge variant="secondary" className="bg-black/50 text-white text-[10px] backdrop-blur hover:bg-black/60 shadow-sm border-none">
                              {product.category.replace(/_/g, " ")}
                          </Badge>
                      )}
                  </div>
                </div>
              </Link>

              {/* CONTEÚDO */}
              <div className="p-5 flex flex-col flex-1">
                <Link href={linkTarget} className={hasId ? "cursor-pointer" : "cursor-not-allowed"}>
                    <h2 className="text-base font-bold text-slate-800 line-clamp-2 hover:text-rose-600 transition-colors mb-2 leading-snug">
                    {product.name}
                    </h2>
                </Link>

                <div className="mt-auto pt-2 flex items-end justify-between border-t border-slate-50">
                    <div>
                        <span className="text-xs text-slate-400 font-medium block mb-0.5">Preço</span>
                        <p className="text-xl font-black text-rose-600">
                            R$ {product.price?.toFixed(2)}
                        </p>
                    </div>
                    {product.stock <= 3 && product.stock > 0 && (
                        <span className="text-[10px] text-amber-600 font-bold bg-amber-50 px-2 py-1 rounded-full">
                            Restam {product.stock}
                        </span>
                    )}
                </div>

                <Button
                  onClick={() => handleAddToCart(product)}
                  disabled={!hasId || product.stock <= 0}
                  className={`
                    mt-4 w-full rounded-xl font-bold shadow-lg shadow-rose-100 transition-all
                    ${hasId && product.stock > 0 
                        ? "bg-gradient-to-r from-rose-600 to-pink-600 hover:scale-[1.02] active:scale-95 text-white" 
                        : "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"}
                  `}
                >
                  {product.stock <= 0 ? "Esgotado" : (hasId ? "Adicionar" : "Indisponível")}
                </Button>
              </div>
            </article>
          )})}
        </div>
      </div>
    </div>
  );
}