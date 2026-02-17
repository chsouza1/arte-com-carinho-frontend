"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton";
import { useCartStore } from "@/lib/cart";

// Tipos dos produtos
type Product = {
  id: number;
  name: string;
  price: number;
  category?: string;
  images?: string[];
  active?: boolean;
  stock: number;
};

const mainImage = (product: Product) => (product.images?.[0] || null);

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function normalizeCategory(cat?: string) {
  return cat ? cat.trim().toLowerCase() : "outros";
}

function formatCategoryLabel(cat: string) {
  if (cat === "all") return "Ver tudo";
  return cat.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function HomePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? api.defaults.baseURL;
  const { addItem } = useCartStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/public/products/featured?t=${Date.now()}`, { cache: "no-store" });
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        const mapped = list.map((p: any) => ({
          ...p,
          price: Number(p.price ?? 0),
          category: normalizeCategory(p.category),
          images: Array.isArray(p.images) ? p.images : [],
        }));
        setProducts(mapped.filter((p) => p.active !== false));
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      }
    };
    load();
  }, [API_URL]);

  const categories = useMemo(() => ["all", ...Array.from(new Set(products.map((p) => normalizeCategory(p.category))))], [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchQ = !query || p.name.toLowerCase().includes(query.toLowerCase());
      const matchC = category === "all" || normalizeCategory(p.category) === category;
      return matchQ && matchC;
    });
  }, [products, query, category]);

  const addToCartAndGo = (product: Product) => {
    if (!product.id) return;
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: mainImage(product),
      stock: product.stock
    });
    router.push("/cart");
  };

  return (
    // FUNDO: Creme suave (#FAF7F5) para imitar o fundo do logo, mas mais limpo para leitura
    // TEXTO: Stone-800 (Marrom acinzentado) para suavidade
    <div className="min-h-screen bg-[#FAF7F5] font-sans text-stone-800">
      
      {/* 1. TOPO: Inspirado na linha pontilhada do logo */}
      <header className="pt-10 pb-8 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Ícone decorativo imitando o logo */}
          <div className="flex justify-center mb-4">
             <div className="relative">
                <Heart className="fill-red-500 text-red-500 animate-pulse" size={40} />
                {/* Linhas pontilhadas decorativas ao lado do coração */}
                <div className="absolute top-1/2 left-full w-16 h-[2px] border-t-2 border-dashed border-stone-400 ml-4 -translate-y-1/2 hidden sm:block"></div>
                <div className="absolute top-1/2 right-full w-16 h-[2px] border-t-2 border-dashed border-stone-400 mr-4 -translate-y-1/2 hidden sm:block"></div>
             </div>
          </div>

          <h1 className="text-5xl md:text-6xl font-serif text-[#5D4037] mb-2 tracking-tight">
            Arte com Carinho
          </h1>
          <p className="font-medium text-[#8D6E63] text-lg italic">By Simone</p>

          {/* BUSCA: Estilo papel com borda marrom suave */}
          <div className="mt-8 max-w-xl mx-auto bg-white p-2 rounded-full shadow-sm border-2 border-[#EFEBE9] flex items-center gap-2 focus-within:border-[#D7CCC8] transition-colors">
            <div className="pl-4 text-[#A1887F]">
              <Search size={20} />
            </div>
            <input 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="O que você procura hoje?"
              className="w-full bg-transparent outline-none text-stone-600 placeholder:text-[#D7CCC8]"
            />
            {/* Filtro de categorias estilo botão */}
            <select 
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="bg-[#F5F5F5] text-[#5D4037] text-sm font-semibold px-4 py-2 rounded-full outline-none cursor-pointer hover:bg-[#EFEBE9] transition-colors"
            >
              {categories.map(c => <option key={c} value={c}>{formatCategoryLabel(c)}</option>)}
            </select>
          </div>
        </div>
      </header>

      {/* 2. CONTEÚDO */}
      <main className="max-w-6xl mx-auto px-4 py-10 pb-32">
        
        {/* Título da Seção com detalhe de costura */}
        <div className="flex items-center gap-4 mb-10">
            <div className="h-[2px] flex-1 bg-stone-200 border-t border-dashed border-stone-300"></div>
            <h2 className="text-2xl font-serif text-[#5D4037]">Nossas Peças</h2>
            <div className="h-[2px] flex-1 bg-stone-200 border-t border-dashed border-stone-300"></div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 opacity-50">
            <p>Nenhuma peça encontrada com esse nome.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product) => {
              const isOutOfStock = product.stock === 0;

              return (
                <div key={product.id} className="group flex flex-col">
                  {/* CARD DE IMAGEM: Borda branca grossa (estilo foto polaroid) + Sombra suave */}
                  <div className="relative aspect-square bg-white rounded-xl p-2 shadow-sm border border-[#EFEBE9] group-hover:shadow-lg group-hover:border-[#D7CCC8] transition-all duration-300">
                    <div className="w-full h-full relative rounded-lg overflow-hidden bg-[#FAF7F5]">
                        {mainImage(product) ? (
                            <img
                            src={mainImage(product) as string}
                            alt={product.name}
                            className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-50' : ''}`}
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center text-[#D7CCC8]">
                                <Sparkles size={24} />
                            </div>
                        )}

                        {/* Botão de Adicionar Flutuante (Aparece no Hover) - Cor VERMELHO DO LOGO */}
                        {!isOutOfStock && (
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    addToCartAndGo(product);
                                }}
                                className="absolute bottom-3 right-3 bg-[#E53935] text-white p-3 rounded-full shadow-lg translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-[#C62828]"
                            >
                                <ShoppingBag size={18} />
                            </button>
                        )}

                        {isOutOfStock && (
                            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
                                <span className="text-xs font-bold bg-[#5D4037] text-white px-3 py-1 rounded-full">Esgotado</span>
                            </div>
                        )}
                    </div>
                  </div>

                  {/* INFO DO PRODUTO */}
                  <div className="mt-3 text-center px-1">
                    <p className="text-[10px] uppercase tracking-widest text-[#A1887F] font-bold mb-1">
                        {formatCategoryLabel(product.category || "")}
                    </p>
                    <Link href={`/products/${product.id}`}>
                        <h3 className="text-[#5D4037] font-medium text-lg leading-tight group-hover:text-[#E53935] transition-colors font-serif">
                        {product.name}
                        </h3>
                    </Link>
                    <p className="text-[#5D4037] font-bold mt-1">
                        {formatBRL(product.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Botão ver catálogo completo */}
        <div className="mt-16 text-center">
             <button 
                onClick={() => router.push('/products')}
                className="inline-block border-b-2 border-[#E53935] text-[#E53935] pb-1 font-bold hover:text-[#B71C1C] hover:border-[#B71C1C] transition-colors uppercase text-xs tracking-widest"
             >
                Ver todas as peças
             </button>
        </div>
      </main>

      <WhatsAppFloatingButton phone="5541999932625" />
    </div>
  );
}
