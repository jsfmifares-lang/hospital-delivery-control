# Hospital Delivery Control

Sistema web para controle de entregas de materiais em hospitais. Colaboradores registram solicitações de entrega e acompanham o status em tempo real.

## Funcionalidades

- **Nova Solicitação** — Busca por hospital com autocomplete e registro de entrega
- **Monitor de Entregas** — Visualização em grid com atualização de status em tempo real (Realtime)
- **Cadastro de Hospitais** — CRUD completo com interface responsiva

## Tecnologias

- React 19 + TypeScript
- Vite
- Tailwind CSS + shadcn/ui
- Supabase (Banco de dados + Realtime)
- React Router
- TanStack Query
- React Hook Form + Zod

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [Supabase](https://supabase.com/) (conta gratuita)

## Instalação

```bash
git clone https://github.com/SEU-USUARIO/hospital-delivery-control.git
cd hospital-delivery-control
npm install
```

## Configuração

1. Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon
```

2. Para obter essas acesse o painel do Supabase → Settings → API.

## Criar Banco de Dados

No painel do Supabase, acesse o **SQL Editor** e execute:

1. Primeiro `supabase/schema.sql`
2. Depois `supabase/policies.sql`

## Rodar Localmente

```bash
npm run dev
```

Acesse http://localhost:5173

## Deploy no GitHub

```bash
git init
git add .
git commit -m "Primeiro commit"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/hospital-delivery-control.git
git push -u origin main
```

## Deploy no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login com GitHub
2. Clique em "New Project"
3. Selecione o repositório `hospital-delivery-control`
4. Configure as variáveis de ambiente:
   - `VITE_SUPABASE_URL` → URL do seu projeto Supabase
   - `VITE_SUPABASE_ANON_KEY` → Chave anônima do Supabase
5. Clique em "Deploy"

Pronto! Seu projeto estará online gratuitamente.

## Estrutura do Projeto

```
hospital-delivery-control/
├── src/
│   ├── components/       # Componentes reutilizáveis
│   │   └── ui/           # Componentes shadcn/ui
│   ├── pages/            # Páginas da aplicação
│   ├── hooks/            # Custom hooks (React Query)
│   ├── services/         # Serviços de API (Supabase)
│   ├── lib/              # Utilitários e configuração
│   ├── types/            # Definições TypeScript
│   ├── layouts/          # Layouts e Sidebar
│   └── assets/           # Imagens e estáticos
├── supabase/
│   ├── schema.sql        # Estrutura das tabelas
│   └── policies.sql      # Políticas de segurança (RLS)
├── public/
├── .env.example
├── package.json
├── tailwind.config.ts
├── vite.config.ts
└── README.md
```

## Licença

MIT
