import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Sparkles, Tag, ShoppingBag, Eye } from "lucide-react";

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
    <Link href={`/products/${product.id}`} className="group h-full block">
      <Card className="h-full border border-[#D7CCC8] rounded-sm shadow-sm hover:shadow-md hover:border-[#A1887F] transition-all duration-300 bg-white relative overflow-hidden flex flex-col">
        
        {/* Faixa decorativa superior (aparece no hover) */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[#E53935] opacity-0 group-hover:opacity-100 transition-opacity z-10"></div>
        
        {/* Área da Imagem */}
        <div className="relative aspect-square w-full overflow-hidden bg-[#FAF7F5] border-b border-[#EFEBE9]">
          {mainImage ? (
            <>
              <img
                src={mainImage}
                alt={product.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Overlay sutil no hover */}
              <div className="absolute inset-0 bg-[#5D4037]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center flex-col gap-2 text-[#D7CCC8]">
              <Tag className="h-8 w-8" strokeWidth={1.5} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Sem imagem</span>
            </div>
          )}

          {/* Badge de Destaque (Estilo Etiqueta) */}
          {product.featured && (
            <div className="absolute top-2 right-2 z-20">
              <Badge className="inline-flex items-center gap-1 rounded-sm bg-[#FFF8E1] border border-[#FFE0B2] px-2 py-1 text-[10px] font-bold text-[#F57F17] shadow-sm uppercase tracking-wider hover:bg-[#FFF8E1]">
                <Sparkles className="h-3 w-3" />
                Destaque
              </Badge>
            </div>
          )}
        </div>

        {/* Conteúdo do Cartão */}
        <CardContent className="flex flex-col flex-1 p-5 relative bg-[url('/paper-texture-light.png')]">
          
          {/* Categoria */}
          <div className="mb-2 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-[#E53935]/20 group-hover:bg-[#E53935] transition-colors"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D6E63]">
              {product.category || "Artesanato"}
            </span>
          </div>

          {/* Título */}
          <h3 className="text-lg font-serif font-bold text-[#5D4037] leading-tight line-clamp-2 mb-2 group-hover:text-[#E53935] transition-colors">
            {product.name}
          </h3>

          {/* Descrição */}
          <p className="line-clamp-2 text-xs text-[#8D6E63] leading-relaxed mb-4 flex-1">
            {product.description || "Peça exclusiva feita à mão com materiais de alta qualidade e muito carinho."}
          </p>

          {/* Rodapé do Cartão (Preço e Ação) */}
          <div className="mt-auto pt-4 border-t border-dashed border-[#D7CCC8] flex items-center justify-between">
            <div className="flex flex-col">
                <span className="text-[10px] text-[#A1887F] font-bold uppercase">Valor</span>
                <span className="text-xl font-serif font-bold text-[#E53935]">
                {priceFormatted}
                </span>
            </div>

            {/* Ícone de Ação */}
            <div className="w-8 h-8 rounded-full bg-[#FAF7F5] border border-[#D7CCC8] flex items-center justify-center text-[#5D4037] group-hover:bg-[#E53935] group-hover:border-[#E53935] group-hover:text-white transition-all shadow-sm">
                <Eye size={16} />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}