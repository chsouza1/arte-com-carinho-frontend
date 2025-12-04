"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { api, setAuthToken } from "@/lib/api";
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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  CircleDot,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProductCategory = "CLOTHING" | "ACCESSORIES" | "HOME_DECOR" | "OTHER";

type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category: ProductCategory;
  sku?: string;
  active?: boolean;
  featured?: boolean;
  customizable?: boolean;
};

type ProductFormData = {
  id?: number;
  name: string;
  description?: string;
  price: string; // usar string no form, número na API
  stock: string;
  category: ProductCategory;
  active: boolean;
  featured: boolean;
  customizable: boolean;
};

async function fetchProducts(): Promise<Product[]> {
  const res = await api.get("/products", { params: { size: 200 } });
  return res.data.content ?? res.data;
}

export default function AdminProductsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 🔐 Proteção básica: exige token
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("arte_token");
    if (!token) {
      router.push("/auth/login");
      return;
    }
    setAuthToken(token);
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
  });

  const [search, setSearch] = useState("");
  const [showOnlyActive, setShowOnlyActive] = useState(true);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "CLOTHING",
    active: true,
    featured: false,
    customizable: false,
  });

  const filteredProducts = useMemo(() => {
    const list = data ?? [];
    return list.filter((p) => {
      const matchesSearch =
        search.trim().length === 0 ||
        p.name.toLowerCase().includes(search.toLowerCase());
      const matchesActive = !showOnlyActive || p.active !== false;
      return matchesSearch && matchesActive;
    });
  }, [data, search, showOnlyActive]);

  // 🧩 Mutations: create/update/delete
  const saveMutation = useMutation({
    mutationFn: async (payload: ProductFormData) => {
      const body = {
        name: payload.name,
        description: payload.description,
        price: parseFloat(payload.price.replace(",", ".")),
        stock: parseInt(payload.stock, 10),
        category: payload.category,
        active: payload.active,
        featured: payload.featured,
        customizable: payload.customizable,
      };

      if (payload.id) {
        // update
        await api.put(`/products/${payload.id}`, body);
      } else {
        // create
        await api.post("/products", body);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setIsDialogOpen(false);
      setEditingProduct(null);
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  function openCreateDialog() {
    setEditingProduct(null);
    resetForm();
    setIsDialogOpen(true);
  }

  function openEditDialog(product: Product) {
    setEditingProduct(product);
    setForm({
      id: product.id,
      name: product.name,
      description: product.description ?? "",
      price: product.price.toString().replace(".", ","),
      stock: product.stock.toString(),
      category: product.category,
      active: product.active ?? true,
      featured: product.featured ?? false,
      customizable: product.customizable ?? false,
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setForm({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "CLOTHING",
      active: true,
      featured: false,
      customizable: false,
    });
  }

  function handleFormChange<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.price || !form.stock) return;
    saveMutation.mutate(form);
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Inventário de produtos
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie o catálogo do ateliê, controle de estoque e destaque os
            bordados mais especiais.
          </p>
        </div>

        <Button
          className="inline-flex items-center gap-2 rounded-full bg-rose-500 text-xs font-semibold hover:bg-rose-600"
          onClick={openCreateDialog}
        >
          <Plus className="h-4 w-4" />
          Novo produto
        </Button>
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-rose-100 bg-white/90 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <Label htmlFor="search" className="text-xs text-slate-500">
            Buscar
          </Label>
          <Input
            id="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Procure por nome do produto..."
            className="h-8 text-xs"
          />
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-600">
          <button
            type="button"
            onClick={() => setShowOnlyActive((prev) => !prev)}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 transition",
              showOnlyActive
                ? "border-rose-500 bg-rose-50 text-rose-600"
                : "border-slate-200 bg-slate-50"
            )}
          >
            {showOnlyActive ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <CircleDot className="h-3.5 w-3.5" />
            )}
            Somente ativos
          </button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading &&
          [...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl bg-rose-50" />
          ))}

        {!isLoading && filteredProducts.length === 0 && (
          <p className="text-sm text-slate-500">
            Nenhum produto encontrado com os filtros atuais.
          </p>
        )}

        {!isLoading &&
          filteredProducts.map((product) => (
            <Card
              key={product.id}
              className="flex h-full flex-col justify-between border-rose-100 bg-white/95 shadow-sm"
            >
              <CardHeader className="space-y-1 pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <CardTitle className="text-sm font-semibold text-slate-900">
                      {product.name}
                    </CardTitle>
                    <p className="line-clamp-2 text-xs text-slate-500">
                      {product.description ||
                        "Produto do ateliê com bordado personalizado."}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-rose-50 text-[10px] font-semibold text-rose-600">
                      {product.category}
                    </Badge>
                    {product.featured && (
                      <span className="text-[10px] font-semibold text-amber-600">
                        Destaque
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <Package className="h-3.5 w-3.5 text-rose-400" />
                    <span>
                      Estoque:{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          product.stock <= 2
                            ? "text-rose-600"
                            : product.stock <= 5
                            ? "text-amber-600"
                            : "text-slate-800"
                        )}
                      >
                        {product.stock} un.
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] text-slate-500">Preço</p>
                    <p className="text-sm font-semibold text-rose-600">
                      {product.price.toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <StatusPill active={product.active ?? true} />
                    {product.customizable && (
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                        Personalizável
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 border-rose-200 text-rose-500 hover:bg-rose-50"
                      onClick={() => openEditDialog(product)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 border-rose-200 text-rose-500 hover:bg-rose-50"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Tem certeza que deseja excluir o produto "${product.name}"?`
                          )
                        ) {
                          deleteMutation.mutate(product.id);
                        }
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
      </section>

      {/* Modal de criação/edição */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg border-rose-100">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold text-slate-900">
              {editingProduct ? "Editar produto" : "Novo produto"}
            </DialogTitle>
          </DialogHeader>

          <form className="space-y-4 pt-2" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <Label htmlFor="name">Nome</Label>
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

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  value={form.price}
                  onChange={(e) =>
                    handleFormChange("price", e.target.value.replace(/[^\d,\.]/g, ""))
                  }
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="stock">Estoque</Label>
                <Input
                  id="stock"
                  value={form.stock}
                  onChange={(e) =>
                    handleFormChange(
                      "stock",
                      e.target.value.replace(/[^\d]/g, "")
                    )
                  }
                  required
                />
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
                  <option value="CLOTHING">Roupinhas</option>
                  <option value="ACCESSORIES">Acessórios</option>
                  <option value="HOME_DECOR">Banho & enxoval</option>
                  <option value="OTHER">Outros</option>
                </select>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <TogglePill
                label="Ativo na loja"
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

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                className="text-xs"
                onClick={() => {
                  setIsDialogOpen(false);
                  setEditingProduct(null);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-rose-500 text-xs font-semibold hover:bg-rose-600"
                disabled={saveMutation.isPending}
              >
                {saveMutation.isPending
                  ? "Salvando..."
                  : editingProduct
                  ? "Salvar alterações"
                  : "Criar produto"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusPill({ active }: { active: boolean }) {
  if (active) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Ativo
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Inativo
    </span>
  );
}

function TogglePill({
  label,
  active,
  onToggle,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "inline-flex h-9 w-full items-center justify-center rounded-full border text-[11px] font-medium transition",
        active
          ? "border-rose-500 bg-rose-50 text-rose-600"
          : "border-slate-200 bg-slate-50 text-slate-600"
      )}
    >
      {label}
    </button>
  );
}
