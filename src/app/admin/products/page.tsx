"use client";

import { useEffect, useMemo, useState, useRef } from "react";
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
import { Package, Edit, Trash2, Plus, Eye, Sparkles, CheckCircle2, XCircle, Upload, Loader2, Image as ImageIcon } from "lucide-react";

type ProductCategory =
  | "ROUPAS" 
  | "ENXOVAL_DE_BANHO" 
  | "ACESSORIOS" 
  | "DECORACAO_DE_CASA"
  | "ENXOVAL_DE_BANHO"
  | "TOALHA_CAPUZ"
  | "NANINHAS"
  | "TOALHA_FRAUDA"
  | "CADERNETAS_VACINACAO"
  | "BODYS"
  | "TOALHA_DE_BOCA"
  | "NECESSARIES"
  | "SAQUINHOS_TROCA"
  | "MANTINHAS"
  | "BATIZADO"
  | "BOLSAS_MATERNIDADES"
  | "TROCADORES"
  | "PANO_COPA"
  | "SAIDA_MATERNIDADE"
  | "KITS"
  | "ESTOJO_ESCOLAR"
  | "OUTROS"
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stockQuantity: "",
    category: "ROUPAS",
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
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // --- Função de Upload para o Cloudinary ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg(null);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setErrorMsg("Erro de configuração: Variáveis do Cloudinary não encontradas.");
      setIsUploading(false);
      return;
    }

    try {
      const newUrls: string[] = [];

      // Upload de cada arquivo selecionado
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!res.ok) throw new Error("Falha no upload da imagem");

        const data = await res.json();
        newUrls.push(data.secure_url);
      }

      setForm((prev) => ({
        ...prev,
        imageUrls: prev.imageUrls 
          ? `${prev.imageUrls}\n${newUrls.join("\n")}`
          : newUrls.join("\n"),
      }));

    } catch (error) {
      console.error("Erro no upload:", error);
      setErrorMsg("Erro ao fazer upload da imagem. Tente novamente.");
    } finally {
      setIsUploading(false);
      // Limpa o input para permitir selecionar o mesmo arquivo novamente se necessário
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

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
      category: "ROUPAS",
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
      category: (product.category as ProductCategory) ?? "ROUPAS",
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
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-orange-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 lg:grid-cols-[1.8fr,1.2fr]">
          {/* Lista de produtos - MANTIDA IGUAL */}
          <Card className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden">
             {/* ... (conteúdo da lista de produtos mantido igual ao anterior) ... */}
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-white p-2.5 shadow-md">
                    <Package className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <span className="text-base font-bold text-slate-800">
                      Produtos do ateliê
                    </span>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {products.length} {products.length === 1 ? 'produto cadastrado' : 'produtos cadastrados'}
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-2 border-rose-200 text-xs font-semibold hover:bg-rose-50 hover:border-rose-300 transition-all"
                  onClick={() => router.push("/products")}
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  Ver como cliente
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 max-h-[calc(100vh-16rem)] overflow-y-auto">
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-rose-500 border-r-transparent mb-3"></div>
                    <p className="text-xs font-semibold text-neutral-600">Carregando produtos...</p>
                  </div>
                </div>
              )}

              {isError && (
                <div className="rounded-2xl bg-gradient-to-br from-rose-50 to-pink-50 p-8 text-center border-2 border-rose-200">
                  <p className="text-sm font-semibold text-rose-600">
                    Não foi possível carregar os produtos.
                  </p>
                </div>
              )}

              {!isLoading && !isError && products.length === 0 && (
                <div className="rounded-2xl bg-gradient-to-br from-white to-rose-50/50 p-12 text-center border-2 border-rose-200">
                  <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center mb-4">
                    <Package className="h-8 w-8 text-rose-400" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-700 mb-2">
                    Nenhum produto cadastrado ainda
                  </p>
                  <p className="text-xs text-neutral-500">
                    Use o formulário ao lado para criar seu primeiro produto
                  </p>
                </div>
              )}

              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="group relative rounded-2xl border-2 border-rose-100 bg-gradient-to-br from-white to-rose-50/30 p-5 hover:shadow-lg hover:border-rose-200 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between gap-4">
                      {/* Miniatura da Imagem (Nova funcionalidade visual) */}
                      {product.images && product.images.length > 0 && (
                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-rose-100 bg-white">
                          <img 
                            src={product.images[0]} 
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <p className="font-bold text-sm text-slate-800 group-hover:text-rose-600 transition-colors truncate">
                            {product.name}
                          </p>
                          {product.active ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-500 flex-shrink-0" />
                          ) : (
                            <XCircle className="h-4 w-4 text-slate-400 flex-shrink-0" />
                          )}
                        </div>
                        
                        <p className="text-xs text-slate-500 font-medium mb-2">
                          {product.category ?? "Categoria não informada"}
                        </p>
                        
                        <div className="flex items-center gap-3 text-xs mb-2">
                          <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                            {product.price != null
                              ? product.price.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })
                              : "-"}
                          </span>
                          <span className="text-slate-600 font-semibold">
                            Estoque: {product.stock ?? "-"}
                          </span>
                        </div>
                        
                        <div className="flex flex-wrap gap-1.5">
                          {!product.active && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                              Inativo
                            </span>
                          )}
                          {product.featured && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                              <Sparkles className="h-2.5 w-2.5" />
                              Destaque
                            </span>
                          )}
                          {product.customizable && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 px-2.5 py-1 text-[10px] font-bold text-purple-700">
                              <Sparkles className="h-2.5 w-2.5" />
                              Personalizável
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs font-semibold rounded-xl border-2 border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 transition-all"
                          onClick={() => handleEdit(product)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 px-3 text-xs font-semibold rounded-xl border-2 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all"
                          onClick={() => handleDelete(product.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Desativar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Formulário de cadastro/edição */}
          <Card className="rounded-3xl border-2 border-rose-200 bg-white/90 backdrop-blur-sm shadow-xl overflow-hidden lg:sticky lg:top-8 h-fit">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-pink-50 border-b-2 border-rose-100">
              <CardTitle className="flex items-center gap-3">
                <div className="rounded-xl bg-white p-2.5 shadow-md">
                  {form.id ? (
                    <Edit className="h-5 w-5 text-rose-600" />
                  ) : (
                    <Plus className="h-5 w-5 text-rose-600" />
                  )}
                </div>
                <span className="text-base font-bold text-slate-800">
                  {form.id ? "Editar produto" : "Novo produto"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* --- INPUTS DO FORMULÁRIO (Nome e Descrição) --- */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold text-slate-700">Nome do produto *</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => handleFormChange("name", e.target.value)}
                    required
                    className="rounded-xl border-2 border-rose-200 h-10 px-4 text-sm font-medium focus:border-rose-400 transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs font-bold text-slate-700">Descrição</Label>
                  <Textarea
                    id="description"
                    value={form.description}
                    onChange={(e) =>
                      handleFormChange("description", e.target.value)
                    }
                    rows={3}
                    className="rounded-xl border-2 border-rose-200 px-4 py-3 text-sm font-medium focus:border-rose-400 transition-colors resize-none"
                  />
                </div>

                {/* --- SESSÃO DE IMAGENS ATUALIZADA --- */}
                <div className="space-y-3 rounded-2xl border-2 border-rose-100 bg-rose-50/50 p-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="imageUrls" className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <ImageIcon className="h-3.5 w-3.5" />
                      Imagens do produto
                    </Label>
                    
                    {/* Botão de Upload Customizado */}
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label 
                        htmlFor="file-upload"
                        className={cn(
                          "flex items-center gap-2 cursor-pointer rounded-xl bg-white border-2 border-rose-200 px-3 py-1.5 text-xs font-bold text-rose-600 shadow-sm hover:bg-rose-50 transition-all",
                          isUploading && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isUploading ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Upload className="h-3.5 w-3.5" />
                        )}
                        {isUploading ? "Enviando..." : "Fazer Upload"}
                      </label>
                    </div>
                  </div>

                  {/* Campo de URLs (Mantido para edição manual ou visualização) */}
                  <Textarea
                    id="imageUrls"
                    placeholder="URLs aparecerão aqui após o upload..."
                    value={form.imageUrls}
                    onChange={(e) => handleFormChange("imageUrls", e.target.value)}
                    rows={4}
                    className="rounded-xl border-2 border-rose-200 px-4 py-3 text-xs font-medium focus:border-rose-400 transition-colors resize-none bg-white"
                  />
                  
                  {/* Preview das imagens (Visualização rápida) */}
                  {imagesArray.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                      {imagesArray.map((url, idx) => (
                        <div key={idx} className="relative h-16 w-16 shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden shadow-sm group">
                          <img src={url} alt={`Preview ${idx}`} className="h-full w-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* --- RESTO DO FORMULÁRIO (Preço, Estoque, etc) --- */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-xs font-bold text-slate-700">Preço (R$) *</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={form.price}
                      onChange={(e) => handleFormChange("price", e.target.value)}
                      required
                      className="rounded-xl border-2 border-rose-200 h-10 px-4 text-sm font-medium focus:border-rose-400 transition-colors"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock" className="text-xs font-bold text-slate-700">Estoque *</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={form.stockQuantity}
                      onChange={(e) =>
                        handleFormChange("stockQuantity", e.target.value)
                      }
                      required
                      className="rounded-xl border-2 border-rose-200 h-10 px-4 text-sm font-medium focus:border-rose-400 transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-xs font-bold text-slate-700">Categoria *</Label>
                  <select
                    id="category"
                    className="h-10 w-full rounded-xl border-2 border-rose-200 bg-white px-4 text-sm font-semibold focus:border-rose-400 transition-colors cursor-pointer"
                    value={form.category}
                    onChange={(e) =>
                      handleFormChange("category", e.target.value as ProductCategory)
                    }
                  >
                    <option value="ROUPAS">Roupas</option>
                    <option value="ENXOVAL_DE_BANHO">Enxoval de Banho</option>
                    <option value="ACESSORIOS">Acessorios</option>
                    <option value="DECORACAO_DE_CASA">Decoração de Casa</option>
                    <option value="TOALHA_CAPUZ">Toalha com Capuz</option>
                    <option value="NANINHAS">Naninhas</option>
                    <option value="TOALHA_FRAUDA">Toalha Frauda</option>
                    <option value="CADERNETAS_VACINACAO">Cadernetas de Vacinação</option>
                    <option value="TOALHA_DE_BOCA">Toalha de Boca</option>
                    <option value="NECESSARIES">Necessaires</option>
                    <option value="SAQUINHOS_TROCA">Saquinhos de Troca</option>
                    <option value="MANTINHAS">Mantinhas</option>
                    <option value="BATIZADO">Toalha Batizado</option>
                    <option value="BOLSAS_MATERNIDADES">Bolsas Maternidades</option>
                    <option value="TROCADORES">Trocadores</option>
                    <option value="PANO_COPA">Pano de Copa</option>
                    <option value="SAIDA_MATERNIDADE">Saída Maternidade</option>
                    <option value="KITS">Kits</option>
                    <option value="ESTOJO_ESCOLAR">Estojo Escolar</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-700">Opções</Label>
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
                </div>

                {errorMsg && (
                  <div className="rounded-xl bg-rose-50 border-2 border-rose-200 p-3">
                    <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    className="h-11 flex-1 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-sm font-bold text-white hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg shadow-rose-500/30 hover:shadow-xl hover:shadow-rose-500/40"
                    disabled={saveMutation.isPending || isUploading}
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
                      className="h-11 flex-1 rounded-xl border-2 border-rose-200 text-sm font-bold hover:bg-rose-50 hover:border-rose-300 transition-all"
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
      </div>
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
        "inline-flex h-9 items-center justify-center rounded-full border-2 px-4 text-xs font-bold transition-all hover:scale-105 active:scale-95",
        active
          ? "border-rose-500 bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-lg shadow-rose-500/30"
          : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
      )}
    >
      {label}
    </button>
  );
}