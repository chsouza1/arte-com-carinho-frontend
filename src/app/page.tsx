"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import WhatsAppFloatingButton from "@/components/ui/WhatsAppFloatingButton";
import { addToCart } from "@/lib/cart";

type Product = {
  id: number;
  name: string;
  price: number;
  category?: string;
  images?: string[];
  active?: boolean;
};

const mainImage = (product: Product) => {
  return product.images && product.images.length > 0
    ? product.images[0]
    : null;
};

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function normalizeCategory(cat?: string) {
  if (!cat) return "outros";
  return cat.trim().toLowerCase();
}

export default function HomePage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL ?? api.defaults.baseURL;

  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const load = async () => {
      try {
        // ATUALIZADO: Busca apenas os produtos em destaque do novo endpoint público
        const res = await fetch(`${API_URL}/public/products/featured`, { cache: "no-store" });
        
        if (!res.ok) throw new Error("Falha ao carregar destaques");

        const data = await res.json();
        
        // O endpoint retorna uma List<ProductDTO>, então é sempre um array
        const list = Array.isArray(data) ? data : [];

        const mapped: Product[] = list.map((p: any) => ({
          id: Number(p.id),
          name: p.name,
          price: Number(p.price ?? 0),
          category: normalizeCategory(p.category),
          images: Array.isArray(p.images) ? p.images : [],
          active: p.active ?? true,
        }));

        setProducts(mapped.filter((p) => p.active !== false));
      } catch (error) {
        console.error("Erro ao carregar produtos em destaque:", error);
      }
    };

    load();
  }, [API_URL]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(normalizeCategory(p.category)));
    return ["all", ...Array.from(set)];
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesQuery =
        !query || p.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory =
        category === "all" || normalizeCategory(p.category) === category;
      return matchesQuery && matchesCategory;
    });
  }, [products, query, category]);

  const addToCartAndGo = (product: Product) => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      imageUrl: mainImage(product),
    });
    router.push("/cart");
  };

  // Função auxiliar para redirecionar a busca para a página completa de produtos
  // (Opcional: melhora a experiência se a busca na Home for para todo o catálogo)
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && query) {
      router.push(`/products?query=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="relative rounded-[2rem] bg-gradient-to-br from-white to-rose-50/50 p-12 shadow-xl backdrop-blur-sm border border-white/50 overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rose-200/30 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-orange-200/20 to-transparent rounded-full blur-2xl"></div>
          
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-5 py-2 text-xs font-semibold text-white shadow-lg shadow-rose-500/30">
              <Sparkles size={14} className="animate-pulse" /> Destaques da Loja
            </span>

            <h1 className="mt-8 text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-orange-500 leading-tight">
              Peças artesanais feitas <br /> com amor e cuidado
            </h1>

            <p className="mt-4 max-w-xl text-lg text-neutral-600 font-medium">
              Confira nossa seleção especial de produtos em destaque.
            </p>

            <div className="mt-10 flex flex-col md:flex-row gap-4">
              {/* Barra de busca mantida, filtrando os destaques atuais */}
              <div className="relative flex items-center gap-3 rounded-2xl border-2 border-rose-200 px-5 py-4 bg-white/80 backdrop-blur-sm w-full shadow-lg hover:shadow-xl transition-all hover:border-rose-300 group">
                <Search size={20} className="text-rose-500 group-hover:scale-110 transition-transform" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleSearch}
                  placeholder="Buscar nos destaques..."
                  className="w-full outline-none text-sm font-medium bg-transparent placeholder:text-neutral-400"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-2xl border-2 border-rose-200 px-6 py-4 bg-white/80 backdrop-blur-sm text-sm font-semibold shadow-lg hover:shadow-xl transition-all hover:border-rose-300 cursor-pointer"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c === "all" ? "Todas as categorias" : c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* PRODUTOS EM DESTAQUE */}
      <main className="mx-auto max-w-6xl px-4 mt-20 pb-32">
        <div className="flex items-center gap-2 mb-8">
            <Sparkles className="text-rose-500" />
            <h2 className="text-2xl font-bold text-neutral-800">Em Destaque</h2>
        </div>

        {filtered.length === 0 && (
            <div className="text-center py-10 text-neutral-500">
                Nenhum produto em destaque encontrado.
            </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <div
              key={product.id}
              className="group relative rounded-3xl bg-white border-2 border-transparent shadow-lg hover:shadow-2xl hover:border-rose-200 transition-all duration-300 overflow-hidden hover:-translate-y-2"
            >
              {/* Overlay, Imagem e Conteúdo (mantido igual ao original) */}
              <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none z-10"></div>
              
              {mainImage(product) ? (
                <div className="h-52 bg-gradient-to-br from-rose-100 to-pink-100 overflow-hidden relative">
                  <img
                    src={mainImage(product) as string}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              ) : (
                <div className="h-52 flex items-center justify-center text-sm text-slate-400 bg-gradient-to-br from-rose-100 to-pink-100 font-medium">
                  Sem imagem
                </div>
              )}

              <div className="p-6 relative z-20">
                <h2 className="text-sm font-bold text-neutral-800 line-clamp-2 group-hover:text-rose-600 transition-colors">
                  {product.name}
                </h2>

                <p className="mt-3 text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                  {formatBRL(product.price)}
                </p>

                <button
                  onClick={() => addToCartAndGo(product)}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white py-3 text-sm font-bold hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40 hover:scale-[1.02] active:scale-95"
                >
                  Comprar
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {/* Botão para ver todos os produtos */}
        <div className="mt-12 text-center">
            <button 
                onClick={() => router.push('/products')}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl border-2 border-rose-200 text-rose-600 font-bold hover:bg-rose-50 transition-colors"
            >
                Ver catálogo completo
            </button>
        </div>
      </main>

      <WhatsAppFloatingButton phone="5541999932625" />
    </div>
  );
}