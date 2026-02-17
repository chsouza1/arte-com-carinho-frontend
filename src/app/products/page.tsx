"use client";

import { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { Search, Filter, SlidersHorizontal, ArrowUpDown, Check, X, ShoppingBag, Sparkles } from "lucide-react";

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
  const { data, isLoading } = useQuery({
    queryKey: ["shop", "products"],
    queryFn: fetchShopProducts,
  });

  // --- ESTADOS DE FILTRO ---
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("all");
  const [order, setOrder] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  const products = useMemo(() => data?.content ?? [], [data]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => p.category && set.add(p.category));
    return ["all", ...Array.from(set)];
  }, [products]);

  // --- LÓGICA DE FILTRAGEM ---
  const visibleProducts = useMemo(() => {
    let list = products.filter((p) => (p.active ?? true));

    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(lowerTerm));
    }

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    if (order === "price-asc") {
      list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    } else if (order === "price-desc") {
      list = [...list].sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
    } else if (order === "name") {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [products, category, order, searchTerm]);

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

  const formatCategory = (cat: string) => 
    cat === "all" ? "Todas as Peças" : cat.replace(/_/g, " ");

  const formatBRL = (value: number) => 
    value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    // FUNDO: Creme suave (#FAF7F5)
    <div className="min-h-screen bg-[#FAF7F5] text-[#5D4037] font-sans">
      
      {/* HEADER DA PÁGINA */}
      <header className="pt-12 pb-8 px-6 text-center border-b border-dashed border-[#D7CCC8]">
        <h1 className="text-4xl md:text-5xl font-serif text-[#5D4037] mb-3">
          Nossa Coleção
        </h1>
        <p className="text-[#8D6E63] font-medium italic max-w-xl mx-auto">
          Explore peças exclusivas, feitas à mão com todo o carinho que você merece.
        </p>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8">
        
        {/* BARRA DE CONTROLE (Busca e Filtros) */}
        <div className="mb-10 space-y-6">
            
            {/* Linha Superior: Busca e Toggle Mobile */}
            <div className="flex gap-4 items-center">
                <div className="relative flex-1 max-w-md mx-auto md:mx-0">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-[#A1887F]" />
                    <input 
                        placeholder="Buscar por nome..." 
                        className="w-full pl-11 pr-4 py-3 bg-white border-2 border-[#EFEBE9] rounded-full text-[#5D4037] placeholder:text-[#D7CCC8] focus:outline-none focus:border-[#D7CCC8] transition-colors shadow-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button 
                           onClick={() => setSearchTerm("")}
                           className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D7CCC8] hover:text-[#E53935]"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                
                {/* Botão Filtros Mobile */}
                <button 
                    className="md:hidden p-3 bg-white border-2 border-[#EFEBE9] rounded-full text-[#5D4037] hover:bg-[#FAF7F5]"
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <SlidersHorizontal size={20} />
                </button>

                {/* Ordenação Desktop */}
                <div className="hidden md:flex items-center gap-2 ml-auto">
                    <span className="text-sm font-bold text-[#A1887F] uppercase tracking-wider">Ordenar:</span>
                    <div className="relative">
                        <select 
                            value={order}
                            onChange={(e) => setOrder(e.target.value)}
                            className="appearance-none bg-white pl-4 pr-8 py-2 rounded-lg border border-[#EFEBE9] text-sm font-bold text-[#5D4037] cursor-pointer hover:border-[#D7CCC8] focus:outline-none"
                        >
                            <option value="recent">Mais Recentes</option>
                            <option value="price-asc">Menor Preço</option>
                            <option value="price-desc">Maior Preço</option>
                            <option value="name">A-Z</option>
                        </select>
                        <ArrowUpDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1887F] pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Painel de Categorias (Scroll Horizontal) */}
            <div className={`
                ${showFilters ? 'block' : 'hidden md:block'}
                animate-in slide-in-from-top-2 duration-300
            `}>
                <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`
                                px-5 py-2 rounded-full text-sm font-bold transition-all border-2
                                ${category === cat 
                                    ? "bg-[#5D4037] text-white border-[#5D4037] shadow-md" 
                                    : "bg-white text-[#8D6E63] border-[#EFEBE9] hover:border-[#D7CCC8] hover:text-[#5D4037]"}
                            `}
                        >
                            {formatCategory(cat)}
                        </button>
                    ))}
                </div>
                
                {/* Ordenação Mobile (aparece dentro do painel se expandido) */}
                <div className="md:hidden mt-4 pt-4 border-t border-dashed border-[#D7CCC8]">
                     <label className="text-xs font-bold text-[#A1887F] uppercase tracking-wider block mb-2">Ordenar por</label>
                     <select 
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                        className="w-full bg-white p-3 rounded-lg border border-[#EFEBE9] text-[#5D4037]"
                    >
                        <option value="recent">Mais Recentes</option>
                        <option value="price-asc">Menor Preço</option>
                        <option value="price-desc">Maior Preço</option>
                    </select>
                </div>
            </div>
        </div>

        {/* LOADING & EMPTY STATE */}
        {isLoading && (
            <div className="py-20 text-center">
                <div className="inline-block animate-spin text-[#D7CCC8] mb-2"><Sparkles size={32}/></div>
                <p className="text-[#8D6E63]">Buscando peças no ateliê...</p>
            </div>
        )}
        
        {!isLoading && visibleProducts.length === 0 && (
            <div className="text-center py-24 px-6 border-2 border-dashed border-[#EFEBE9] rounded-3xl bg-white/50">
                <Filter size={48} className="mx-auto text-[#D7CCC8] mb-4" />
                <h3 className="text-xl font-serif text-[#5D4037] mb-2">Nenhuma peça encontrada</h3>
                <p className="text-[#8D6E63] mb-6">Tente mudar os filtros ou busque por outro nome.</p>
                <button 
                    onClick={() => {setSearchTerm(""); setCategory("all");}}
                    className="text-[#E53935] font-bold underline hover:text-[#B71C1C]"
                >
                    Limpar filtros
                </button>
            </div>
        )}

        {/* GRID DE PRODUTOS - Estilo Polaroid/Craft */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {visibleProducts.map((product) => {
             const isOutOfStock = product.stock <= 0;
             const hasImage = !!mainImage(product);

             return (
            <div key={product.id} className="group flex flex-col">
              
              {/* CARD IMAGEM */}
              <div className="relative bg-white p-3 pb-8 shadow-sm border border-[#EFEBE9] hover:shadow-xl hover:border-[#D7CCC8] hover:-translate-y-1 transition-all duration-300 rounded-sm">
                
                {/* Imagem */}
                <div className="aspect-square relative overflow-hidden bg-[#FAF7F5]">
                   <Link href={`/products/${product.id}`}>
                      {hasImage ? (
                        <img
                          src={mainImage(product)!}
                          alt={product.name}
                          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-60' : ''}`}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#D7CCC8]">
                           <Sparkles size={32} />
                        </div>
                      )}
                   </Link>

                   {/* Badges Flutuantes */}
                   <div className="absolute top-2 left-2 flex flex-col gap-1">
                      {product.stock <= 3 && product.stock > 0 && (
                          <span className="bg-[#FFF8E1] text-[#F57F17] text-[10px] font-bold px-2 py-1 rounded-sm border border-[#FFE0B2]">
                              Últimas {product.stock}
                          </span>
                      )}
                   </div>

                   {/* Overlay Esgotado */}
                   {isOutOfStock && (
                      <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="bg-[#5D4037] text-white text-xs font-bold px-3 py-1 uppercase tracking-wider">Esgotado</span>
                      </div>
                   )}
                </div>

                {/* Botão de Compra Rápida (Aparece no Hover) */}
                {!isOutOfStock && (
                    <button
                        onClick={() => handleAddToCart(product)}
                        className="absolute bottom-4 right-4 bg-[#E53935] text-white p-3 rounded-full shadow-lg opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-[#C62828] hover:scale-110 z-10"
                        title="Adicionar à Sacola"
                    >
                        <ShoppingBag size={18} />
                    </button>
                )}

                {/* Nome do Produto (Abaixo da imagem, dentro do card polaroid) */}
                <div className="mt-4 text-center px-2">
                    <p className="text-[10px] uppercase font-bold text-[#A1887F] tracking-widest mb-1">
                        {product.category || "Artesanato"}
                    </p>
                    <Link href={`/products/${product.id}`}>
                        <h2 className="font-serif text-lg text-[#5D4037] leading-tight group-hover:text-[#E53935] transition-colors line-clamp-2 min-h-[2.5em]">
                            {product.name}
                        </h2>
                    </Link>
                    <p className="mt-2 font-bold text-[#5D4037] text-lg">
                        {formatBRL(product.price)}
                    </p>
                </div>
              </div>
            </div>
          )})}
        </div>
      </div>
    </div>
  );
}