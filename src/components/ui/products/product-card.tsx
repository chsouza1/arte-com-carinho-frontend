import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

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
    <Link href={`/products#product-${product.id}`}>
      <Card className="group h-full cursor-pointer overflow-hidden border-rose-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        {/* <div className="h-40 bg-gradient-to-br from-rose-50 to-rose-100" /> */}

        <CardContent className="p-3">
          {mainImage ? (
            <div className="mb-2 h-40 w-full overflow-hidden rounded-md bg-slate-100">
              <img
                src={mainImage}
                alt={product.name}
                className="h-full w-full object-cover transition group-hover:scale-105"
              />
            </div>
          ) : (
            <div className="mb-2 flex h-40 w-full items-center justify-center rounded-md bg-slate-100 text-[11px] text-slate-400">
              Sem imagem
            </div>
          )}
        </CardContent>
        
        <CardContent className="space-y-2 p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 text-sm font-semibold text-slate-800 group-hover:text-rose-600">
              {product.name}
            </h3>
            {product.featured && (
              <Badge className="bg-rose-100 text-[10px] font-semibold text-rose-600">
                Destaque
              </Badge>
            )}
          </div>
          <p className="line-clamp-2 text-xs text-slate-500">
            {product.description || "Peça bordada com muito carinho para o seu bebê."}
          </p>
          <div className="flex items-center justify-between pt-1">
            <span className="text-sm font-semibold text-rose-600">
              {priceFormatted}
            </span>
            <span className="text-[11px] uppercase tracking-wide text-slate-400">
              {product.category}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
