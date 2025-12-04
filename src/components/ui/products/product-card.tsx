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
};

export function ProductCard({ product }: { product: Product }) {
  const priceFormatted = product.price.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  return (
    <Link href={`/products/${product.id}`}>
      <Card className="group h-full cursor-pointer overflow-hidden border-rose-100 bg-white/90 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
        {/* Aqui depois entra uma imagem real do produto */}
        <div className="h-40 bg-gradient-to-br from-rose-50 to-rose-100" />

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
