import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles, Tag } from "lucide-react";

export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  category: string;
  featured?: boolean;
  images?: string[];
};

export function ProductCard({ product }: { product: Product }) {
  const priceFormatted = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  const mainImage = product.images && product.images.length > 0
    ? product.images[0]
    : null;

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group relative h-full cursor-pointer overflow-hidden rounded-3xl border-2 border-transparent bg-white shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-rose-200">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none z-10"></div>
        
        {/* Image Section */}
        <div className="relative">
          {mainImage ? (
            <div className="h-56 w-full overflow-hidden bg-gradient-to-br from-rose-100 to-pink-100 relative">
              <img
                src={mainImage}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          ) : (
            <div className="flex h-56 w-full items-center justify-center bg-gradient-to-br from-rose-100 to-pink-100">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-white/80 flex items-center justify-center mb-2">
                  <Tag className="h-6 w-6 text-rose-400" />
                </div>
                <span className="text-xs font-medium text-slate-500">Sem imagem</span>
              </div>
            </div>
          )}

          {/* Featured badge */}
          {product.featured && (
            <div className="absolute top-3 right-3 z-20">
              <Badge className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 border-2 border-white px-3 py-1.5 text-xs font-bold text-white shadow-lg shadow-amber-500/40">
                <Sparkles className="h-3 w-3 animate-pulse" />
                Destaque
              </Badge>
            </div>
          )}
        </div>

        {/* Content Section */}
        <CardContent className="relative z-20 p-6 space-y-3">
          {/* Title */}
          <h3 className="line-clamp-2 min-h-[2.5rem] text-base font-bold text-slate-900 group-hover:text-rose-600 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 text-xs text-slate-600 leading-relaxed font-medium">
            {product.description || "Peça bordada com muito carinho para o seu bebê."}
          </p>

          {/* Category badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-slate-100 to-gray-100 border border-slate-200 px-3 py-1 shadow-sm">
            <Tag className="h-3 w-3 text-slate-500" />
            <span className="text-xs font-bold uppercase tracking-wide text-slate-600">
              {product.category}
            </span>
          </div>

          {/* Price */}
          <div className="pt-2">
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
              {priceFormatted}
            </div>
          </div>

          {/* Hover indicator */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
        </CardContent>
      </Card>
    </Link>
  );
}