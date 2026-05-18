"use client";

import { useMemo, useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  Package, Edit, Trash2, Plus, Sparkles, Upload, Loader2, 
  Image as ImageIcon, Save, X, Search 
} from "lucide-react";

type ProductCategory =
  | "ROUPAS" 
  | "ENXOVAL_DE_BANHO" 
  | "ACESSORIOS" 
  | "DECORACAO_DE_CASA"
  | "TOALHA_CAPUZ"
  | "NANINHAS"
  | "TOALHA_FRAUDA"
  | "BODYS"
  | "CADERNETAS_VACINACAO"
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
    params: { page: 0, size: 100, sort: "id,desc" },
  });
  return res.data;
}

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Controle da gaveta lateral (Sheet)
  const [isSheetOpen, setIsSheetOpen] = useState(false);

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

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
  });

  const products = useMemo(() => data?.content ?? [], [data]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return products;
    const lower = searchTerm.toLowerCase();
    return products.filter(p => p.name.toLowerCase().includes(lower));
  }, [products, searchTerm]);

  const imagesArray = form.imageUrls
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  // --- Upload Cloudinary ---
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setErrorMsg(null);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      setErrorMsg("Configuração de upload ausente.");
      setIsUploading(false);
      return;
    }

    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", uploadPreset);

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: formData }
        );

        if (!res.ok) throw new Error("Falha no upload");
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
      console.error(error);
      setErrorMsg("Erro ao enviar imagem.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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
        await api.put(`/products/${form.id}`, payload);
      } else {
        await api.post("/products", payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
      setIsSheetOpen(false); // Fecha a gaveta após salvar
      resetForm();
    },
    onError: () => setErrorMsg("Erro ao salvar produto."),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
    },
  });

  function resetForm() {
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

  function handleFormChange<K extends keyof ProductFormData>(field: K, value: ProductFormData[K]) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleCreateNew() {
    resetForm();
    setIsSheetOpen(true);
  }

  function handleEdit(product: Product) {
    setForm({
      id: product.id,
      name: product.name ?? "",
      description: product.description ?? "",
      price: product.price != null ? String(product.price) : "",
      stockQuantity: product.stock != null ? String(product.stock) : "",
      category: (product.category as ProductCategory) ?? "ROUPAS",
      active: product.active ?? true,
      featured: product.featured ?? false,
      customizable: product.customizable ?? false,
      imageUrls: (product.images ?? []).join("\n"),
    });
    setIsSheetOpen(true);
  }

  function handleDelete(id: number) {
    if (!confirm("Tem certeza que deseja remover este item?")) return;
    deleteMutation.mutate(id);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate();
  }

  return (
    <div className="pb-20 space-y-6">
      
      {/* --- BARRA SUPERIOR E CONTROLES --- */}
      <div className="bg-white border-2 border-[#D7CCC8] p-4 rounded-sm shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
              <div className="p-2 bg-[#FAF7F5] rounded-full border border-[#D7CCC8]">
                  <Package size={20} className="text-[#5D4037]" />
              </div>
              <h2 className="text-xl font-serif font-bold text-[#5D4037]">Catálogo de Peças</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A1887F]" />
                  <Input 
                      placeholder="Buscar pelo nome..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9 bg-[#FAF7F5] border-[#D7CCC8] focus:border-[#E53935] rounded-sm text-sm w-full"
                  />
              </div>
              <Button 
                onClick={handleCreateNew}
                className="w-full sm:w-auto bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest text-xs h-10 rounded-sm shadow-sm transition-all"
              >
                <Plus size={16} className="mr-2" /> Nova Peça
              </Button>
          </div>
      </div>

      {/* --- LISTA DE PRODUTOS --- */}
      {isLoading ? (
          <div className="text-center py-20 text-[#8D6E63]">
              <Loader2 className="mx-auto h-8 w-8 animate-spin mb-4 text-[#D7CCC8]" />
              Carregando catálogo completo...
          </div>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                  <div 
                      key={product.id} 
                      className="group bg-white border border-[#D7CCC8] p-4 rounded-sm shadow-sm hover:shadow-md hover:border-[#A1887F] transition-all flex gap-4 relative overflow-hidden"
                  >
                      {/* Efeito Hover na Lateral */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#E53935] opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      {/* Imagem do Produto */}
                      <div className="h-24 w-24 bg-[#FAF7F5] border border-[#EFEBE9] flex-shrink-0 rounded-sm overflow-hidden">
                          {product.images?.[0] ? (
                              <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                              <div className="h-full flex items-center justify-center text-[#D7CCC8]"><Package size={24}/></div>
                          )}
                      </div>

                      {/* Informações */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                          <div>
                              <div className="flex justify-between items-start gap-2 mb-1">
                                  <h3 className="font-bold text-[#5D4037] truncate text-sm leading-tight" title={product.name}>{product.name}</h3>
                              </div>
                              <span className="font-serif font-bold text-[#E53935] text-sm whitespace-nowrap">
                                  {product.price?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </span>
                              <p className="text-[10px] text-[#8D6E63] uppercase tracking-wider mt-1">{product.category}</p>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm border uppercase ${product.active ? 'bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]' : 'bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]'}`}>
                                  {product.active ? 'Ativo' : 'Inativo'}
                              </span>
                              {product.featured && (
                                  <span className="text-[9px] font-bold text-[#F57F17] bg-[#FFF8E1] border border-[#FFE0B2] px-1.5 py-0.5 rounded-sm flex items-center gap-1 uppercase">
                                      <Sparkles size={8}/> Destaque
                                  </span>
                              )}
                              <span className="text-[10px] font-bold text-[#5D4037] mt-1 sm:mt-0 w-full sm:w-auto bg-[#FAF7F5] px-2 py-0.5 rounded-sm border border-[#EFEBE9] text-center">
                                  Estoque: {product.stock}
                              </span>
                          </div>
                      </div>

                      {/* Botões de Ação */}
                      <div className="flex flex-col gap-2 justify-center pl-3 border-l border-dashed border-[#D7CCC8]">
                          <button onClick={() => handleEdit(product)} className="text-[#8D6E63] hover:text-[#5D4037] bg-[#FAF7F5] hover:bg-[#EFEBE9] p-2 rounded-sm transition-colors border border-transparent hover:border-[#D7CCC8]" title="Editar">
                              <Edit size={16}/>
                          </button>
                          <button onClick={() => handleDelete(product.id)} className="text-[#8D6E63] hover:text-white bg-[#FAF7F5] hover:bg-[#E53935] p-2 rounded-sm transition-colors border border-transparent hover:border-[#C62828]" title="Excluir">
                              <Trash2 size={16}/>
                          </button>
                      </div>
                  </div>
              ))}
              {filteredProducts.length === 0 && (
                  <div className="col-span-full p-12 text-center border-2 border-dashed border-[#EFEBE9] rounded-sm text-[#8D6E63] text-sm bg-white">
                      <Package size={40} className="mx-auto mb-3 text-[#D7CCC8]" />
                      Nenhuma peça encontrada no catálogo.
                  </div>
              )}
          </div>
      )}

      {/* --- FORMULÁRIO EM GAVETA (SHEET) --- */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md bg-[#FAF7F5] border-l-4 border-l-[#E53935] p-0 overflow-y-auto flex flex-col h-full">
            
            <div className="p-6 bg-white border-b border-[#D7CCC8] shadow-sm sticky top-0 z-10 flex items-center justify-between">
                <h2 className="text-lg font-serif font-bold text-[#5D4037] flex items-center gap-2">
                    {form.id ? <Edit size={20} className="text-[#E53935]" /> : <Plus size={20} className="text-[#E53935]" />}
                    {form.id ? "Editar Peça" : "Nova Peça"}
                </h2>
                {/* O botão 'X' de fechar já é embutido no componente Sheet padrão, mas adicionamos espaço caso precise */}
            </div>

            <div className="p-6 flex-1">
              <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Nome da Peça</Label>
                      <Input 
                          value={form.name} 
                          onChange={e => handleFormChange("name", e.target.value)} 
                          className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-10 text-sm rounded-sm shadow-sm"
                          placeholder="Ex: Toalha de Banho Bordada"
                          required
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Preço (R$)</Label>
                          <Input 
                              type="number" 
                              step="0.01" 
                              value={form.price} 
                              onChange={e => handleFormChange("price", e.target.value)} 
                              className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-10 text-sm rounded-sm shadow-sm" 
                              required
                          />
                      </div>
                      <div className="space-y-1">
                          <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Estoque Inicial</Label>
                          <Input 
                              type="number" 
                              value={form.stockQuantity} 
                              onChange={e => handleFormChange("stockQuantity", e.target.value)} 
                              className="bg-white border-[#D7CCC8] text-[#5D4037] focus:border-[#E53935] h-10 text-sm rounded-sm shadow-sm" 
                              required
                          />
                      </div>
                  </div>

                  <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Categoria</Label>
                      <select 
                          value={form.category} 
                          onChange={e => handleFormChange("category", e.target.value)}
                          className="w-full h-10 px-3 bg-white border border-[#D7CCC8] rounded-sm text-sm text-[#5D4037] shadow-sm focus:outline-none focus:border-[#E53935] cursor-pointer"
                      >
                          <option value="ROUPAS">Roupas</option>
                          <option value="ENXOVAL_DE_BANHO">Enxoval de Banho</option>
                          <option value="ACESSORIOS">Acessórios</option>
                          <option value="DECORACAO_DE_CASA">Decoração</option>
                          <option value="TOALHA_CAPUZ">Toalha Capuz</option>
                          <option value="NANINHAS">Naninhas</option>
                          <option value="TOALHA_FRAUDA">Toalha Fralda</option>
                          <option value="BODYS">Bodys</option>
                          <option value="CADERNETAS_VACINACAO">Cadernetas</option>
                          <option value="TOALHA_DE_BOCA">Toalha Boca</option>
                          <option value="NECESSARIES">Necessaires</option>
                          <option value="SAQUINHOS_TROCA">Saquinhos</option>
                          <option value="MANTINHAS">Mantinhas</option>
                          <option value="BATIZADO">Batizado</option>
                          <option value="BOLSAS_MATERNIDADES">Bolsas</option>
                          <option value="TROCADORES">Trocadores</option>
                          <option value="PANO_COPA">Pano de Copa</option>
                          <option value="SAIDA_MATERNIDADE">Saída Maternidade</option>
                          <option value="KITS">Kits</option>
                          <option value="ESTOJO_ESCOLAR">Estojo Escolar</option>
                          <option value="OUTROS">Outros</option>
                      </select>
                  </div>

                  <div className="space-y-1">
                      <Label className="text-[10px] font-bold text-[#8D6E63] uppercase">Descrição Detalhada</Label>
                      <Textarea 
                          value={form.description} 
                          onChange={e => handleFormChange("description", e.target.value)} 
                          className="bg-white border-[#D7CCC8] text-[#5D4037] shadow-sm focus:border-[#E53935] text-sm rounded-sm min-h-[100px]"
                          placeholder="Detalhes, medidas, tecido, etc..."
                      />
                  </div>

                  {/* Seção de Imagens */}
                  <div className="space-y-3 pt-4 border-t border-dashed border-[#D7CCC8]">
                      <Label className="text-[10px] font-bold text-[#8D6E63] uppercase flex items-center gap-2">
                          <ImageIcon size={14} className="text-[#E53935]"/> Galeria de Fotos
                      </Label>
                      
                      <label className={`w-full flex flex-col items-center justify-center gap-2 bg-white hover:bg-[#FAF7F5] text-[#5D4037] text-xs font-bold py-6 rounded-sm cursor-pointer border-2 border-[#D7CCC8] border-dashed transition-colors shadow-sm ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                          {isUploading ? <Loader2 size={24} className="animate-spin text-[#E53935]" /> : <Upload size={24} className="text-[#A1887F]" />} 
                          {isUploading ? "Enviando para a nuvem..." : "Clique para selecionar fotos"}
                          <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*" multiple disabled={isUploading} ref={fileInputRef} />
                      </label>

                      <Textarea 
                          placeholder="Ou cole os links das imagens aqui (um por linha)"
                          value={form.imageUrls}
                          onChange={e => handleFormChange("imageUrls", e.target.value)}
                          className="text-[11px] min-h-[60px] bg-white shadow-sm border-[#D7CCC8] rounded-sm"
                      />

                      {imagesArray.length > 0 && (
                          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin bg-white p-2 border border-[#EFEBE9] rounded-sm shadow-inner">
                              {imagesArray.map((url, idx) => (
                                  <div key={idx} className="h-16 w-16 flex-shrink-0 border border-[#D7CCC8] rounded-sm overflow-hidden bg-white shadow-sm">
                                      <img src={url} className="h-full w-full object-cover" />
                                  </div>
                              ))}
                          </div>
                      )}
                  </div>

                  {/* Opções de Status (Toggles) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-4 border-t border-dashed border-[#D7CCC8]">
                      <button 
                          type="button" 
                          onClick={() => handleFormChange("active", !form.active)} 
                          className={`py-2.5 text-[10px] font-bold uppercase border rounded-sm transition-all shadow-sm ${form.active ? 'bg-[#E8F5E9] border-[#C8E6C9] text-[#2E7D32]' : 'bg-white border-[#D7CCC8] text-[#A1887F] opacity-60 hover:opacity-100'}`}
                      >
                          {form.active ? '✅ Visível' : '❌ Oculto'}
                      </button>
                      <button 
                          type="button" 
                          onClick={() => handleFormChange("featured", !form.featured)} 
                          className={`py-2.5 text-[10px] font-bold uppercase border rounded-sm transition-all shadow-sm ${form.featured ? 'bg-[#FFF8E1] border-[#FFE0B2] text-[#F57F17]' : 'bg-white border-[#D7CCC8] text-[#A1887F] opacity-60 hover:opacity-100'}`}
                      >
                          {form.featured ? '🌟 Destaque' : 'Comum'}
                      </button>
                      <button 
                          type="button" 
                          onClick={() => handleFormChange("customizable", !form.customizable)} 
                          className={`py-2.5 text-[10px] font-bold uppercase border rounded-sm transition-all shadow-sm ${form.customizable ? 'bg-[#E3F2FD] border-[#BBDEFB] text-[#1565C0]' : 'bg-white border-[#D7CCC8] text-[#A1887F] opacity-60 hover:opacity-100'}`}
                      >
                          {form.customizable ? '✂️ Bordado' : 'Pronto'}
                      </button>
                  </div>

                  {errorMsg && (
                      <div className="text-xs text-[#C62828] bg-[#FFEBEE] p-3 rounded-sm border border-[#FFCDD2] flex items-start gap-2 font-bold shadow-sm">
                          <span className="shrink-0 text-base leading-none">⚠️</span>
                          {errorMsg}
                      </div>
                  )}
              </form>
            </div>

            <div className="p-6 bg-white border-t border-[#D7CCC8] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] sticky bottom-0 z-10">
                <Button 
                    type="submit" 
                    form="product-form"
                    disabled={saveMutation.isPending || isUploading} 
                    className="w-full bg-[#E53935] hover:bg-[#C62828] text-white font-bold uppercase tracking-widest rounded-sm shadow-md h-12 transition-all hover:-translate-y-0.5 active:translate-y-0 text-xs"
                >
                    {saveMutation.isPending ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2"/> Confirmar Salvar</>}
                </Button>
            </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}