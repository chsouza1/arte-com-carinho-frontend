🧵 Arte com Carinho - Frontend

Bem-vindo ao repositório frontend do Ateliê Arte com Carinho, um e-commerce especializado em bordados personalizados, enxovais e presentes feitos à mão com dedicação e cuidado.

Este projeto foi construído com foco em uma experiência de usuário acolhedora e um painel administrativo robusto para gestão de produção.
🚀 Tecnologias Utilizadas

O projeto utiliza as tecnologias mais modernas do ecossistema React:

    Framework: Next.js 14+ (App Router)

    Linguagem: TypeScript

    Estilização: Tailwind CSS

    Componentes de UI: Radix UI & Shadcn/UI

    Gerenciamento de Estado de API: TanStack Query (React Query)

    Gerenciamento de Estado Local: Zustand (Carrinho de compras)

    Formulários: React Hook Form com validação Zod

    Ícones: Lucide React

    Upload de Imagens: Integração com Cloudinary API

✨ Funcionalidades Principais
🛍️ Área do Cliente (Loja)

    Vitrine de Produtos: Catálogo completo com filtros por categoria e busca em tempo real.

    Produtos Destaque: Exibição dinâmica na Home de itens marcados pela administração.

    Carrinho Inteligente: Sistema de sacola com persistência local.

    Personalização de Bordado: Interface detalhada para o cliente escolher nomes, desenhos e cores de linha diretamente no checkout.

    Checkout via WhatsApp: Envio automático dos detalhes do pedido para o WhatsApp do Ateliê.

🛠️ Painel Administrativo (Admin)

    Dashboard Financeiro: Relatórios de faturamento, ticket médio e volume de pedidos com gráficos interativos (Recharts).

    Quadro de Produção (Kanban): Gestão visual do fluxo de trabalho (Bordado → Costura → Acabamento → Embalagem).

    Gestão de Estoque: Monitoramento de estoque crítico para toalhas lisas e materiais de base.

    Catálogo Admin: CRUD completo de produtos com upload direto de múltiplas imagens.

    Impressão de Pedidos: Geração de fichas de produção formatadas para papel A4.

🎨 Design System

O projeto segue uma identidade visual Artesanal/Vintage:

    Paleta: Tons de Creme (#FAF7F5), Marrom Chocolate (#5D4037) e Vermelho Amor (#E53935).

    Tipografia: Mix de fontes Serifadas (para títulos elegantes) e Sans-serif (para legibilidade técnica).

    Estética: Uso de bordas tracejadas (simulando costura) e cantos retos/suaves para parecer papelaria de ateliê físico.

⚙️ Instalação e Uso

    Clone o repositório:
    Bash

    git clone https://github.com/seu-usuario/arte-com-carinho-frontend.git

    Instale as dependências:
    Bash

    npm install

    Configure as variáveis de ambiente:
    Crie um arquivo .env.local na raiz com as seguintes chaves:
    Snippet de código

    NEXT_PUBLIC_API_URL=http://localhost:8080
    NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=seu_cloud_name
    NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=seu_preset
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=sua_chave_google

    Inicie o servidor de desenvolvimento:
    Bash

    npm run dev

📁 Estrutura de Pastas
Plaintext

src/
├── app/              # Rotas e Páginas (Next.js App Router)
│   ├── admin/        # Painel Administrativo
│   ├── cart/         # Carrinho de Compras
│   └── auth/         # Login e Cadastro
├── components/       # Componentes Reutilizáveis (UI e Core)
├── lib/              # Configurações (API, Auth, Utilitários)
├── store/            # Estados do Zustand (Cart Store)
└── types/            # Definições de TypeScript

Desenvolvido com carinho para Arte com Carinho by Simone. ✨
