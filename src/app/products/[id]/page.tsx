"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useNotifications } from "@/components/ui/notifications"; // Seu sistema de toast
import { ShoppingCart, Check, ChevronLeft, Star, Ruler, Palette } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ProductDetailsProps = {
  params: {
    id: string;
  };
};

// Interface do Produto (baseado nos seus DTOs)
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  sizes: string[];
  colors: string[];
  category: string;
  featured: boolean;
  active: boolean;
}

export default function ProductDetailsPage({ params }: ProductDetailsProps) {
  const router = useRouter();
  const { addItem } = useCartStore();
  const { notify } = useNotifications();
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Buscar dados do produto
  const { data: product, isLoading, isError } = useQuery({
    queryKey: ["product", params.id],
    queryFn: async () => {
      const res = await api.get<Product>(`/products/${params.id}`);
      return res.data;
    },
  });

  // Define a imagem inicial assim que o produto carrega
  useEffect(() => {
    if (product?.images && product.images.length > 0) {
      setSelectedImage(product.images[0]);
    }
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    // Validação de Tamanho
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      notify("Por favor, selecione um tamanho.", "warning");
      return;
    }

    // Validação de Cor
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      notify("Por favor, selecione uma cor/modelo.", "warning");
      return;
    }

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: selectedImage || "/placeholder.png",
      quantity: 1,
      selectedSize: selectedSize || undefined,
      selectedColor: selectedColor || undefined,
    });

    notify("Produto adicionado ao carrinho!", "success");
  };

  if (isLoading) return <ProductSkeleton />;
  
  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-800">Produto não encontrado</h2>
        <Button onClick={() => router.back()} variant="outline">Voltar</Button>
      </div>
    );
  }

  const hasImages = product.images && product.images.length > 0;
  const mainImage = selectedImage || (hasImages ? product.images[0] : null);

  return (
    <div className="min-h-screen bg-[#FBF7FF]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Botão Voltar */}
        <button 
          onClick={() => router.back()} 
          className="group mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
        >
          <div className="mr-2 rounded-full bg-white p-1 shadow-sm group-hover:bg-rose-100 transition-colors">
            <ChevronLeft size={16} />
          </div>
          Voltar para loja
        </button>

        <div className="grid grid-cols-1 gap-x-8 gap-y-10 lg:grid-cols-2">
          
          {/* COLUNA ESQUERDA: Galeria de Imagens */}
          <div className="flex flex-col gap-4">
            {/* Imagem Principal Grande */}
            <div className="relative aspect-square w-full overflow-hidden rounded-3xl border-2 border-rose-100 bg-white shadow-lg">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full w-full object-cover object-center transition-all duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300">
                  Sem imagem
                </div>
              )}
              
              {product.featured && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500 gap-1 px-3 py-1 text-xs">
                    <Star size={12} fill="currentColor" /> Destaque
                  </Badge>
                </div>
              )}
            </div>

            {/* Carrossel de Miniaturas (Se houver mais de 1 foto) */}
            {hasImages && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                      selectedImage === img 
                        ? "border-rose-500 ring-2 ring-rose-200 ring-offset-1" 
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* COLUNA DIREITA: Detalhes e Compra */}
          <div className="flex flex-col">
            <div className="mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-rose-500">
                {product.category?.replace(/_/g, " ")}
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl mb-4">
              {product.name}
            </h1>

            <div className="mb-6 flex items-end gap-4">
              <p className="text-3xl font-bold text-rose-600">
                {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              {product.stock <= 5 && product.stock > 0 && (
                 <span className="mb-1 text-sm font-bold text-amber-600 animate-pulse">
                   Últimas {product.stock} unidades!
                 </span>
              )}
            </div>

            <div className="prose prose-sm prose-slate mb-8 text-slate-600 leading-relaxed">
              <p className="whitespace-pre-line">{product.description}</p>
            </div>

            <div className="space-y-6 border-t border-slate-200 pt-8">
              
              {/* Seletor de Cores (Se houver) */}
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Palette size={16} className="text-rose-500" /> Cores / Modelos
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`group relative flex items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                          selectedColor === color
                            ? "border-rose-500 bg-rose-50 text-rose-700 ring-1 ring-rose-500"
                            : "border-slate-200 bg-white text-slate-700 hover:border-rose-300"
                        }`}
                      >
                        {color}
                        {selectedColor === color && (
                          <div className="absolute -right-1 -top-1 rounded-full bg-rose-500 p-0.5 text-white">
                            <Check size={10} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Seletor de Tamanhos (Se houver) */}
              {product.sizes && product.sizes.length > 0 && (
                <div>
                   <h3 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Ruler size={16} className="text-rose-500" /> Tamanho
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`group relative flex h-10 min-w-[3rem] items-center justify-center rounded-lg border px-3 text-sm font-bold transition-all ${
                          selectedSize === size
                            ? "border-rose-500 bg-rose-500 text-white shadow-md shadow-rose-200"
                            : "border-slate-200 bg-white text-slate-700 hover:border-rose-300"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Ações */}
              <div className="mt-8 flex gap-4">
                <Button
                  size="lg"
                  className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-base font-bold text-white shadow-xl shadow-rose-200 transition-all hover:scale-[1.02] hover:shadow-rose-300 active:scale-95 disabled:opacity-50"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {product.stock === 0 ? "Esgotado" : "Adicionar ao Carrinho"}
                </Button>
              </div>

              {/* Informações Extras */}
              <div className="mt-6 flex flex-col gap-3 rounded-2xl bg-rose-50/50 p-4 text-xs font-medium text-rose-800">
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-rose-600" />
                  Produção artesanal com carinho
                </div>
                <div className="flex items-center gap-2">
                  <Check size={14} className="text-rose-600" />
                  Entrega garantida para todo o Brasil
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-3xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-12 w-3/4 rounded-lg" />
          <Skeleton className="h-10 w-1/4 rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-14 w-full rounded-2xl mt-8" />
        </div>
      </div>
    </div>
  );
}