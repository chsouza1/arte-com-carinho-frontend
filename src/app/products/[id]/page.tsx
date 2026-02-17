"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { ShoppingCart, Check, ChevronLeft, Star, Ruler, Palette, AlertTriangle, Bug, Scissors, Heart } from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  sizes?: string[];
  colors?: string[];
  category: string;
  featured: boolean;
  active: boolean;
  customizable: boolean;
};

export default function ProductDetailsPage() {
  const router = useRouter();
  const params = useParams(); 
  const { addItem } = useCartStore();
  
  const productId = params?.id ? String(params.id) : null;

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const { data: product, isLoading, isError, error } = useQuery({
    queryKey: ["product", productId],
    queryFn: async () => {
      if (!productId) throw new Error("ID do produto não encontrado");
      try {
        const res = await api.get<Product>(`/products/${productId}`);
        return res.data;
      } catch (err: any) {
        console.error("Erro ao buscar produto:", err);
        throw err;
      }
    },
    retry: 1,
    enabled: !!productId, 
  });

  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: selectedImage || (product.images?.[0]) || "/placeholder.png",
      quantity: 1,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
      stock: product.stock
    });
    
    router.push("/cart");
  };

  if (!productId || isLoading) return <ProductSkeleton />;
  
  if (isError || !product) {
    // Tratamento de erro mantido, mas estilizado
    const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 p-8 bg-[#FAF7F5]">
        <div className="bg-white p-10 rounded-sm shadow-xl max-w-lg w-full border border-[#D7CCC8]">
            <div className="mx-auto w-16 h-16 bg-[#FFEBEE] rounded-full flex items-center justify-center mb-4 border border-[#FFCDD2]">
                <Scissors className="h-8 w-8 text-[#E53935]" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-[#5D4037] mb-2">Ops! Algo deu errado.</h2>
            <p className="text-[#8D6E63] mb-6">Não conseguimos encontrar este produto no ateliê.</p>
            
            <div className="bg-[#EFEBE9] rounded p-4 text-left mb-6 overflow-hidden border border-[#D7CCC8]">
                <div className="flex items-center gap-2 text-[#5D4037] font-bold text-xs uppercase mb-2">
                    <Bug size={12} /> Detalhes Técnicos
                </div>
                <pre className="text-xs text-[#8D6E63] font-mono whitespace-pre-wrap break-all">
                  Erro: {errorMsg}
                </pre>
            </div>

            <div className="flex gap-3 justify-center">
                <button onClick={() => window.location.reload()} className="px-4 py-2 border border-[#8D6E63] text-[#5D4037] hover:bg-[#EFEBE9] font-bold uppercase text-xs tracking-widest rounded-sm">Tentar Novamente</button>
                <button onClick={() => router.back()} className="px-4 py-2 bg-[#E53935] text-white hover:bg-[#C62828] font-bold uppercase text-xs tracking-widest rounded-sm shadow-md">Voltar para Loja</button>
            </div>
        </div>
      </div>
    );
  }

  const hasImages = product.images && product.images.length > 0;
  const mainImage = selectedImage || (hasImages ? product.images[0] : null);
  const isOutOfStock = product.stock <= 0;

  return (
    // FUNDO CREME
    <div className="min-h-screen bg-[#FAF7F5] text-[#5D4037]">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        
        {/* BREADCRUMB / VOLTAR */}
        <button 
          onClick={() => router.back()} 
          className="group mb-8 flex items-center text-sm font-bold text-[#8D6E63] hover:text-[#E53935] transition-colors uppercase tracking-widest"
        >
          <ChevronLeft size={16} className="mr-1" />
          Voltar para o ateliê
        </button>

        <div className="grid grid-cols-1 gap-x-12 gap-y-12 lg:grid-cols-2">
          
          {/* COLUNA ESQUERDA: GALERIA DE IMAGENS */}
          <div className="flex flex-col gap-6">
            
            {/* Imagem Principal estilo POLAROID */}
            <div className="relative aspect-square w-full bg-white p-4 shadow-lg border border-[#EFEBE9] rotate-1 hover:rotate-0 transition-transform duration-500 rounded-sm">
              <div className="relative w-full h-full overflow-hidden bg-[#F5F5F5]">
                {mainImage ? (
                  <img
                    src={mainImage}
                    alt={product.name}
                    className={`h-full w-full object-cover transition-all duration-700 hover:scale-110 ${isOutOfStock ? 'grayscale opacity-70' : ''}`}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#D7CCC8]">
                    <Scissors size={48} opacity={0.5} />
                  </div>
                )}
                
                {/* Badges Flutuantes */}
                {product.featured && (
                  <div className="absolute top-0 left-0 bg-[#FFC107] text-[#5D4037] px-3 py-1 text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1">
                    <Star size={12} fill="currentColor" /> Destaque
                  </div>
                )}

                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px]">
                       <span className="bg-[#5D4037] text-white px-6 py-2 text-lg font-bold uppercase tracking-widest border-2 border-white shadow-xl rotate-[-5deg]">Esgotado</span>
                  </div>
                )}
              </div>
            </div>

            {/* Miniaturas (Carretel) */}
            {hasImages && product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 pt-2 justify-center lg:justify-start">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 w-20 flex-shrink-0 bg-white p-1 shadow-sm border transition-all ${
                      selectedImage === img 
                        ? "border-[#E53935] -translate-y-1 shadow-md" 
                        : "border-[#EFEBE9] hover:border-[#D7CCC8]"
                    }`}
                  >
                    <img src={img} alt={`Ver detalhe ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: INFORMAÇÕES DO PRODUTO */}
          <div className="flex flex-col pt-2">
            
            {/* Categoria Etiqueta */}
            <div className="mb-4">
              <span className="inline-block border-b-2 border-dashed border-[#E53935] text-[#E53935] text-xs font-bold uppercase tracking-widest pb-1">
                {product.category?.replace(/_/g, " ") || "Artesanato"}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-serif text-[#5D4037] mb-4 leading-tight">
              {product.name}
            </h1>

            {/* Preço e Estoque */}
            <div className="mb-8 flex items-baseline gap-4 border-b border-dashed border-[#D7CCC8] pb-6">
              <p className="text-4xl font-bold text-[#5D4037]">
                {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              
              {!isOutOfStock && product.stock <= 3 && (
                 <span className="flex items-center gap-1 text-xs font-bold text-[#E65100] bg-[#FFF3E0] px-2 py-1 rounded-sm border border-[#FFE0B2]">
                   <AlertTriangle size={12} />
                   Restam apenas {product.stock}
                 </span>
              )}
            </div>

            {/* Descrição */}
            <div className="prose prose-stone mb-10 text-[#8D6E63] leading-relaxed">
              <p className="whitespace-pre-line font-medium">{product.description || "Feito à mão com muito carinho e atenção aos detalhes."}</p>
            </div>

            {/* Seletores (Tamanho/Cor) */}
            <div className="space-y-8 mt-auto">
              
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold text-[#5D4037] uppercase tracking-wider flex items-center gap-2">
                    <Palette size={16} /> Cores Disponíveis
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 text-sm font-bold border transition-all rounded-sm ${
                          selectedColor === color
                            ? "border-[#E53935] bg-[#FFEBEE] text-[#C62828]"
                            : "border-[#D7CCC8] bg-white text-[#8D6E63] hover:border-[#A1887F]"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão de Ação */}
              <div className="pt-4">
                <button
                  className={`w-full py-4 text-base font-bold uppercase tracking-widest shadow-lg transition-all flex items-center justify-center gap-3 rounded-sm
                    ${isOutOfStock 
                        ? "bg-[#EFEBE9] text-[#A1887F] cursor-not-allowed border border-[#D7CCC8]" 
                        : "bg-[#E53935] text-white hover:bg-[#C62828] hover:shadow-xl hover:-translate-y-1 active:translate-y-0"
                    }
                  `}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {isOutOfStock ? "Indisponível no momento" : "Adicionar à Sacola"}
                </button>
              </div>

              {/* Garantias / Infos Extras */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 border-t border-dashed border-[#D7CCC8]">
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-[#EFEBE9] text-[#5D4037] mt-1">
                    <Scissors size={14} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#5D4037] uppercase">Produção Artesanal</span>
                    <span className="text-xs text-[#8D6E63]">Peças únicas feitas à mão</span>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1 rounded-full bg-[#EFEBE9] text-[#5D4037] mt-1">
                    <Heart size={14} />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-[#5D4037] uppercase">Feito com Amor</span>
                    <span className="text-xs text-[#8D6E63]">Qualidade e carinho em cada ponto</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Skeleton de Carregamento (Estilizado)
function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 bg-[#FAF7F5]">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Skeleton Imagem */}
        <div className="aspect-square w-full bg-[#EFEBE9] animate-pulse rounded-sm border border-[#D7CCC8]"></div>
        
        {/* Skeleton Info */}
        <div className="flex flex-col gap-6 pt-4">
          <div className="h-6 w-32 bg-[#EFEBE9] animate-pulse rounded"></div>
          <div className="h-12 w-3/4 bg-[#EFEBE9] animate-pulse rounded"></div>
          <div className="h-10 w-1/3 bg-[#EFEBE9] animate-pulse rounded border-b border-[#D7CCC8]"></div>
          
          <div className="space-y-3 pt-6">
            <div className="h-4 w-full bg-[#EFEBE9] animate-pulse rounded"></div>
            <div className="h-4 w-full bg-[#EFEBE9] animate-pulse rounded"></div>
            <div className="h-4 w-2/3 bg-[#EFEBE9] animate-pulse rounded"></div>
          </div>
          
          <div className="h-14 w-full bg-[#EFEBE9] animate-pulse rounded mt-8"></div>
        </div>
      </div>
    </div>
  );
}