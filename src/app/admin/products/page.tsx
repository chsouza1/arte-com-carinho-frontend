"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ProductCategory =
  | "CLOTHING"
  | "BABY_KIT"
  | "EMBROIDERY"
  | "DECOR"
  | string;

type Product = {
  id: number;
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  category?: ProductCategory;
  active?: boolean;
  featured?: boolean;
  customizable?: boolean;
  images?: string[];
  sizes?: string[];
  colors?: string[];
  [key: string]: any;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
};

type ProductFormData = {
  id?: number;
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  category: ProductCategory;
  active: boolean;
  featured: boolean;
  customizable: boolean;
  imageUrls: string;
};

async function fetchProducts(): Promise<PageResponse<Product>> {
  const res = await api.get<PageResponse<Product>>("/products", {
    params: { page: 0, size: 20, sort: "id,desc" },
  });
  return res.data;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "CLOTHING",
    active: true,
    featured: false,
    customizable: false,
    imageUrls: "",
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
  });

  const products = useMemo(() => data?.content ?? [], [data]);

  const imagesArray = form.imageUrls
  .split("/n")
  .map((s) => s.trim())
  .filter((s) => s.length > 0);
  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || null,
        price: form.price ? Number(form.price) : 0,
        stock: form.stockQuantity ? Number(form.stockQuantity) : 0,
        category: form.category,
        active: form.active,
        featured: form.featured,
        customizable: form.customizable,
        images: imagesArray,
        sizes: [] as string[],
        colors: [] as string[],
      };

      if (form.id) {
        const res = await api.put<Product>(`/products/${form.id}`, payload);
        return res.data;
      } else {
        const res = await api.post<Product>("/products", payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      resetForm();
    },
    onError: (error: any) => {
      console.error("Erro ao salvar produto:", error?.response?.data || error);
      setErrorMsg("Não foi possível salvar o produto. Verifique os campos.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      resetForm();
    },
  });

  function resetForm() {
    setSelectedProduct(null);
    setForm({
      name: "",
      description: "",
      price: "",
      stockQuantity: "",
      category: "CLOTHING",
      active: true,
      featured: false,
      customizable: false,
      imageUrls: "",
    });
    setErrorMsg(null);
  }

  function handleFormChange<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  function handleEdit(product: Product) {
    setSelectedProduct(product);
    setForm({
      id: product.id,
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price != null ? String(product.price) : "",
      stockQuantity:
        product.stock != null ? String(product.stock) : "",
      category: (product.category as ProductCategory) ?? "CLOTHING",
      active: product.active ?? true,
      featured: product.featured ?? false,
      customizable: product.customizable ?? false,
      imageUrls: (product.images ?? []).join("\n"),
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Deseja desativar este produto?")) return;
    deleteMutation.mutate(id);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    saveMutation.mutate();
  }

  return (
    <div className="grid gap-6 md:grid-cols-[2fr,1.5fr]">
      {/* Lista de produtos */}
      <Card className="border-rose-100 bg-white/95 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-900">
            Produtos do ateliê
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="text-[11px]"
            onClick={() => router.push("/products")}
          >
            Ver como cliente
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <p className="text-xs text-slate-500">Carregando produtos...</p>
          )}

          {isError && (
            <p className="text-xs text-rose-500">
              Não foi possível carregar os produtos.
            </p>
          )}

          {!isLoading && !isError && products.length === 0 && (
            <p className="text-xs text-slate-500">
              Nenhum produto cadastrado ainda.
            </p>
          )}

          <div className="space-y-2">
            {products.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between rounded-lg border border-rose-100 bg-rose-50/60 px-3 py-2 text-xs"
              >
                <div>
                  <p className="font-semibold text-slate-800">
                    {product.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {product.category ?? "Categoria não informada"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-600">
                    Preço:{" "}
                    {product.price != null
                      ? product.price.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "-"}{" "}
                    • Estoque: {product.stock ?? "-"}
                  </p>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    {product.active ? "Ativo" : "Inativo"}
                    {product.featured && " • Destaque"}
                    {product.customizable && " • Personalizável"}
                  </p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[10px]"
                    onClick={() => handleEdit(product)}
                  >
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 px-2 text-[10px] text-rose-600 hover:bg-rose-50"
                    onClick={() => handleDelete(product.id)}
                    disabled={deleteMutation.isPending}
                  >
                    Desativar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Formulário de cadastro/edição */}
      <Card className="border-rose-100 bg-white/95 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-900">
            {form.id ? "Editar produto" : "Novo produto"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div className="space-y-1">
              <Label htmlFor="name">Nome do produto</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => handleFormChange("name", e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) =>
                  handleFormChange("description", e.target.value)
                }
                rows={3}
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="imageUrls">Urls das Imagens</label>
              <textarea id="imageUrls"
              placeholder="Cole aqui as Urls, uma por linha"
              value={form.imageUrls}
              onChange={(e) => handleFormChange("imageUrls", e.target.value)}
              className="h-24">
              </textarea>
              <p className="text-[10px] text-slate-400">
                    Ex.: https://meu-bucket/imagem1.jpg{"\n"}
                    Cada linha será uma imagem diferente.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={(e) => handleFormChange("price", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={form.stockQuantity}
                  onChange={(e) =>
                    handleFormChange("stockQuantity", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="category">Categoria</Label>
              <select
                id="category"
                className="h-9 w-full rounded-md border border-slate-200 bg-white px-2 text-xs"
                value={form.category}
                onChange={(e) =>
                  handleFormChange("category", e.target.value as ProductCategory)
                }
              >
                <option value="CLOTHING">Roupas / Bodies</option>
                <option value="BABY_KIT">Enxoval / Kits</option>
                <option value="EMBROIDERY">Peças bordadas</option>
                <option value="DECOR">Decoração</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              <TogglePill
                label="Ativo"
                active={form.active}
                onToggle={() => handleFormChange("active", !form.active)}
              />
              <TogglePill
                label="Destaque"
                active={form.featured}
                onToggle={() =>
                  handleFormChange("featured", !form.featured)
                }
              />
              <TogglePill
                label="Personalizável"
                active={form.customizable}
                onToggle={() =>
                  handleFormChange("customizable", !form.customizable)
                }
              />
            </div>

            {errorMsg && (
              <p className="text-[11px] text-rose-500">{errorMsg}</p>
            )}

            <div className="mt-2 flex gap-2">
              <Button
                type="submit"
                className="h-8 flex-1 bg-rose-500 text-[11px] font-semibold text-white hover:bg-rose-600"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending
                  ? "Salvando..."
                  : form.id
                  ? "Salvar alterações"
                  : "Cadastrar produto"}
              </Button>
              {form.id && (
                <Button
                  type="button"
                  variant="outline"
                  className="h-8 flex-1 text-[11px]"
                  onClick={resetForm}
                >
                  Novo produto
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

type TogglePillProps = {
  label: string;
  active: boolean;
  onToggle: () => void;
};

function TogglePill({ label, active, onToggle }: TogglePillProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex h-8 items-center justify-center rounded-full border px-3 text-[11px] font-medium",
        active
          ? "border-rose-500 bg-rose-50 text-rose-600"
          : "border-slate-200 bg-slate-50 text-slate-600"
      )}
    >
      {label}
    </button>
  );
}
