# 🧵 Arte com Carinho - Frontend

Bem-vindo ao repositório frontend do **Ateliê Arte com Carinho By Simone**, um e-commerce especializado em bordados personalizados, enxovais e presentes feitos à mão com dedicação e cuidado.

Este projeto foi construído com foco em uma experiência de usuário acolhedora e um painel administrativo robusto para gestão de produção.

---

## 🚀 Tecnologias Utilizadas

O projeto utiliza as tecnologias mais modernas do ecossistema React:

* **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)
* **Estilização:** [Tailwind CSS](https://tailwindcss.com/)
* **Componentes de UI:** [Radix UI](https://www.radix-ui.com/) & [Shadcn/UI](https://ui.shadcn.com/)
* **Gerenciamento de Estado de API:** [TanStack Query (React Query)](https://tanstack.com/query/latest)
* **Gerenciamento de Estado Local:** [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (Carrinho de compras)
* **Formulários:** [React Hook Form](https://react-hook-form.com/) com validação [Zod](https://zod.dev/)
* **Ícones:** [Lucide React](https://lucide.dev/)
* **Upload de Imagens:** Integração com [Cloudinary API](https://cloudinary.com/documentation/upload_images)

---

## ✨ Funcionalidades Principais

### 🛍️ Área do Cliente (Loja)
* **Vitrine de Produtos:** Catálogo completo com filtros por categoria e busca em tempo real.
* **Produtos Destaque:** Exibição dinâmica na Home de itens marcados pela administração.
* **Carrinho Inteligente:** Sistema de sacola com persistência local.
* **Personalização de Bordado:** Interface detalhada para o cliente escolher nomes, desenhos e cores de linha diretamente no checkout.
* **Checkout via WhatsApp:** Envio automático dos detalhes do pedido para o WhatsApp do Ateliê.

### 🛠️ Painel Administrativo (Admin)
* **Dashboard Financeiro:** Relatórios de faturamento, ticket médio e volume de pedidos com gráficos interativos (Recharts).
* **Quadro de Produção (Kanban):** Gestão visual do fluxo de trabalho (Bordado → Costura → Acabamento → Embalagem).
* **Gestão de Estoque:** Monitoramento de estoque crítico para toalhas lisas e materiais de base.
* **Catálogo Admin:** CRUD completo de produtos com upload direto de múltiplas imagens.
* **Impressão de Pedidos:** Geração de fichas de produção formatadas para papel A4 com logo do Ateliê.

---

## 🎨 Design System

O projeto segue uma identidade visual **Artesanal/Vintage**:
* **Paleta:** Tons de Creme (`#FAF7F5`), Marrom Chocolate (`#5D4037`) e Vermelho Amor (`#E53935`).
* **Tipografia:** Mix de fontes Serifadas (para títulos elegantes) e Sans-serif (para legibilidade técnica).
* **Estética:** Uso de bordas tracejadas (simulando costura) e cantos retos/suaves para parecer papelaria de ateliê físico.

---

## ⚙️ Instalação e Uso

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/arte-com-carinho-frontend.git](https://github.com/seu-usuario/arte-com-carinho-frontend.git)
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env.local` na raiz com as seguintes chaves:
    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu_preset
    ```

4.  **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

---

## 📁 Estrutura de Pastas

```text
src/
├── app/              # Rotas e Páginas (Next.js App Router)
│   ├── admin/        # Painel Administrativo (Produção, Estoque, Relatórios)
│   ├── cart/         # Carrinho de Compras e Personalização
│   ├── auth/         # Login, Cadastro e Recuperação
│   └── products/     # Detalhes e Catálogo Público
├── components/       # Componentes Reutilizáveis (UI, ProductCards, Layout)
├── lib/              # Configurações (API Axios, Auth helpers, Utils)
├── store/            # Gerenciamento de estado global (Zustand)
└── types/            # Definições de interfaces TypeScript
