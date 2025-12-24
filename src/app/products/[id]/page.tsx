"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter, useParams } from "next/navigation"; // ADICIONADO: useParams
import Image from "next/image";
import { api } from "@/lib/api";
import { useCartStore } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Check, ChevronLeft, Star, Ruler, Palette, AlertTriangle, Bug } from "lucide-react";


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
      
      console.log(`Buscando produto ID: ${productId}`);
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
    const errorMsg = error instanceof Error ? error.message : "Erro desconhecido";
    const errorDetails = (error as any)?.response?.data ? JSON.stringify((error as any).response.data) : null;
    const status = (error as any)?.response?.status;

    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] text-center space-y-6 p-8 bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border border-rose-100">
            <div className="mx-auto w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-rose-500" />
            </div>
            
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Ops! Não conseguimos carregar.</h2>
            <p className="text-slate-500 mb-6">Ocorreu um problema ao buscar o produto ID: <strong>{productId}</strong></p>
            
            {/* Área técnica para você identificar o problema */}
            <div className="bg-slate-900 rounded-xl p-4 text-left mb-6 overflow-hidden">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase mb-2">
                    <Bug size={12} /> Diagnóstico Técnico
                </div>
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                  Status: {status || 'N/A'}{"\n"}
                  Erro: {errorMsg}{"\n"}
                  {errorDetails && `Detalhes: ${errorDetails}`}
                </pre>
            </div>

            <div className="flex gap-3 justify-center">
                <Button onClick={() => window.location.reload()} variant="outline">Tentar Novamente</Button>
                <Button onClick={() => router.back()} className="bg-rose-500 hover:bg-rose-600 text-white">Voltar para Loja</Button>
            </div>
        </div>
      </div>
    );
  }

  const hasImages = product.images && product.images.length > 0;
  const mainImage = selectedImage || (hasImages ? product.images[0] : null);
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="min-h-screen bg-[#FBF7FF]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => router.back()} 
          className="group mb-6 flex items-center text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
        >
          <div className="mr-2 rounded-full bg-white p-1 shadow-sm group-hover:bg-rose-100 transition-colors">
            <ChevronLeft size={16} />
          </div>
          Voltar para loja
        </button>

        <div className="grid grid-cols-1 gap-x-10 gap-y-10 lg:grid-cols-2">
          
          {/* GALERIA */}
          <div className="flex flex-col gap-4">
            <div className="relative aspect-square w-full overflow-hidden rounded-[2rem] border-2 border-rose-100 bg-white shadow-lg">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className={`h-full w-full object-cover object-center transition-all duration-500 hover:scale-105 ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-300 font-medium">
                  Sem imagem
                </div>
              )}
              
              {product.featured && (
                <div className="absolute top-4 left-4">
                  <Badge className="bg-amber-400 text-amber-900 hover:bg-amber-500 gap-1 px-3 py-1 text-xs border-2 border-white shadow-sm">
                    <Star size={12} fill="currentColor" /> Destaque
                  </Badge>
                </div>
              )}

              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
                     <span className="bg-neutral-800 text-white px-6 py-2 rounded-full text-lg font-bold shadow-xl">ESGOTADO</span>
                </div>
              )}
            </div>

            {hasImages && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide py-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 transition-all shadow-sm ${
                      selectedImage === img 
                        ? "border-rose-500 ring-2 ring-rose-200 ring-offset-1 scale-105" 
                        : "border-transparent opacity-70 hover:opacity-100 hover:border-rose-200"
                    }`}
                  >
                    <img src={img} alt={`Thumb ${idx}`} className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* INFORMAÇÕES */}
          <div className="flex flex-col pt-2">
            <div className="mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-rose-500 bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                {product.category?.replace(/_/g, " ")}
              </span>
            </div>

            <h1 className="text-3xl font-black text-slate-900 sm:text-4xl mb-4 leading-tight">
              {product.name}
            </h1>

            <div className="mb-6 flex items-end gap-4 border-b border-slate-100 pb-6">
              <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                {product.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </p>
              
              {!isOutOfStock && product.stock <= 3 && (
                 <span className="mb-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-bold text-amber-600 border border-amber-200 animate-pulse">
                   <AlertTriangle size={12} />
                   Restam {product.stock}
                 </span>
              )}
            </div>

            <div className="prose prose-sm prose-slate mb-8 text-slate-600 leading-relaxed text-base">
              <p className="whitespace-pre-line">{product.description || "Sem descrição disponível."}</p>
            </div>

            <div className="space-y-6 mt-auto">
              
              {product.colors && product.colors.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Palette size={16} className="text-rose-500" /> Modelos / Cores
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {product.colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                          selectedColor === color
                            ? "border-rose-500 bg-rose-50 text-rose-700"
                            : "border-slate-100 bg-white text-slate-600 hover:border-rose-200"
                        }`}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <Button
                  size="lg"
                  className="h-14 flex-1 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 text-base font-bold text-white shadow-xl shadow-rose-200 transition-all hover:scale-[1.02] hover:shadow-rose-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  {isOutOfStock ? "Produto Esgotado" : "Adicionar ao Carrinho"}
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                  <div className="rounded-full bg-green-100 p-2 text-green-600">
                    <Check size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Produção Artesanal</span>
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm border border-slate-100">
                  <div className="rounded-full bg-blue-100 p-2 text-blue-600">
                    <Check size={16} />
                  </div>
                  <span className="text-xs font-bold text-slate-700">Compra Segura</span>
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
    <div className="mx-auto max-w-6xl px-4 py-12">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-[2rem] bg-rose-100/50" />
        <div className="flex flex-col gap-6 pt-4">
          <Skeleton className="h-8 w-32 rounded-full" />
          <Skeleton className="h-12 w-3/4 rounded-xl" />
          <Skeleton className="h-16 w-1/3 rounded-xl" />
          <div className="space-y-2 pt-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
          <Skeleton className="h-14 w-full rounded-2xl mt-8" />
        </div>
      </div>
    </div>
  );
}