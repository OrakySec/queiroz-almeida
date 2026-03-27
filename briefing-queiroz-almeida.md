# Queiroz Almeida — Briefing Técnico Completo
### Desenvolvimento do Novo Site e Sistema de Gestão
**Versão 1.0 | 2026**

---

## Índice

1. [Visão Geral do Projeto](#1-visão-geral-do-projeto)
2. [Identidade Visual](#2-identidade-visual)
3. [Stack Tecnológica e Arquitetura](#3-stack-tecnológica-e-arquitetura)
4. [Estrutura do Repositório](#4-estrutura-do-repositório)
5. [Docker Compose e Infraestrutura](#5-docker-compose-e-infraestrutura)
6. [Banco de Dados — Schema Prisma](#6-banco-de-dados--schema-prisma)
7. [Backend — API Fastify](#7-backend--api-fastify)
8. [Site Público — Estrutura da Home](#8-site-público--estrutura-da-home)
9. [Dashboard Administrativo](#9-dashboard-administrativo)
10. [Sistema de Roles e Permissões](#10-sistema-de-roles-e-permissões)
11. [Fluxo de Aprovação de Empreendimentos](#11-fluxo-de-aprovação-de-empreendimentos)
12. [Variáveis de Ambiente](#12-variáveis-de-ambiente)
13. [Checklist de Implementação](#13-checklist-de-implementação)

---

## 1. Visão Geral do Projeto

### 1.1 Sobre a Empresa

A **Queiroz Almeida Construtora e Incorporadora** foi fundada em 2016 e é especializada em flats de investimento no litoral nordestino. Atua no Litoral Sul Pernambucano (Porto de Galinhas) e no Litoral Norte Alagoano (Maragogi). Possui atualmente 3 empreendimentos em obra simultânea.

### 1.2 Empreendimentos Ativos

| Empreendimento | Localização | Metragem | Quartos | Banheiros | Vagas |
|---|---|---|---|---|---|
| Porto Lagoa Residence | Porto de Galinhas, PE | 21 a 36 m² | Studio | 1 | Rotativa |
| Porto Mau Loa | Porto de Galinhas, PE | 22,50 a 32 m² | 1 e Studio | 1 | Rotativa |
| Caminho do Mar | Maragogi, AL | 29 a 42 m² | 1 e Studio | 1 | Rotativa |

### 1.3 O Sistema é Composto por Dois Módulos

1. **Site Público** — página institucional com hero em vídeo, seção de lançamento em destaque, outros empreendimentos, formulário de captação de leads com prova social dinâmica e depoimentos.
2. **Dashboard Administrativo** — área restrita com autenticação JWT, hierarquia de roles (Admin / Gerente / Editor), fluxo de aprovação de empreendimentos, gestão de leads e gestão de usuários.

---

## 2. Identidade Visual

### 2.1 Paleta de Cores

| Nome | Hex | Uso |
|---|---|---|
| Azul principal | `#112669` | Hero, navbar, headings, fundo hero |
| Azul secundário | `#004A9B` | Links, hovers, destaques |
| Dourado areia | `#C9973A` | CTAs primários, badges, detalhes, linha ativa do menu |
| Azul gelo | `#F4F7FC` | Fundo de seções alternadas |
| Borda suave | `#D0DAEA` | Divisores e bordas de cards |
| Azul texto | `#3D4F6B` | Corpo de texto |
| Branco | `#FFFFFF` | Fundo principal |

### 2.2 Tipografia

- **Headings**: Georgia (serif) — transmite solidez e elegância
- **Corpo e UI**: Inter ou system-ui (sans-serif) — leitura limpa e moderna
- **Eyebrows / labels**: Inter, `font-size: 11px`, `letter-spacing: 0.12em`, `text-transform: uppercase`

### 2.3 Copy do Site — Regra Importante

> Todo texto institucional (Quem Somos, missão, sobre) deve ser escrito em **terceira pessoa**. Isso transmite imparcialidade e credibilidade na percepção do visitante.

**Exemplo correto:**
> "A Queiroz Almeida Construtora e Incorporadora é reconhecida no mercado do litoral nordestino pela excelência na construção de flats de investimento..."

**Exemplo incorreto:**
> "Nossa empresa se destaca pela excelência..."

---

## 3. Stack Tecnológica e Arquitetura

### 3.1 Containers (Docker — Portainer + Traefik)

| Container | Imagem | Porta | Função |
|---|---|---|---|
| `traefik` | `traefik:v3` | 80 / 443 | Proxy reverso, SSL automático Let's Encrypt |
| `nextjs` | `node:20-alpine` (build) | 3000 (interna) | Site público + Dashboard `/admin/*` |
| `api` | `node:20-alpine` (build) | 3001 (interna) | API REST — Fastify + Prisma |
| `postgres` | `postgres:16-alpine` | 5432 (interna) | Banco de dados principal |
| `minio` | `minio/minio` | 9000 / 9001 | Object storage para fotos dos empreendimentos |
| `redis` | `redis:7-alpine` | 6379 (interna) | Blacklist de JWT + cache |

> **Regra de segurança**: PostgreSQL e Redis **nunca** devem ter portas expostas para fora da rede Docker. Apenas Traefik é exposto na internet.

### 3.2 Domínios e Roteamento via Traefik

```
queirozalmeidaconstrutora.com.br        → nextjs:3000
api.queirozalmeidaconstrutora.com.br    → api:3001
storage.queirozalmeidaconstrutora.com.br → minio:9000
```

### 3.3 Dependências Principais

**Frontend (Next.js)**
```
next@14, react@18, typescript, tailwindcss,
zod, react-hook-form, @hookform/resolvers,
axios, js-cookie, @radix-ui/react-*, lucide-react,
react-dropzone, react-markdown
```

**Backend (Fastify)**
```
fastify@4, @fastify/cors, @fastify/jwt, @fastify/multipart,
@fastify/rate-limit, prisma@5, @prisma/client,
bcrypt, zod, minio, resend, ioredis, slugify
```

### 3.4 Estimativa de RAM — KVM1 (4 GB)

| Serviço | Estimativa |
|---|---|
| SO + Docker | ~600 MB |
| Traefik | ~50 MB |
| Next.js | ~400 MB |
| Fastify API | ~150 MB |
| PostgreSQL | ~300 MB |
| MinIO | ~300 MB |
| Redis | ~50 MB |
| **Total** | **~1,85 GB de 4 GB** |

---

## 4. Estrutura do Repositório

Monorepo com `pnpm workspaces`.

```
queiroz-almeida/
├── packages/
│   ├── frontend/                        # Next.js 14
│   │   ├── app/
│   │   │   ├── (public)/                # Rotas públicas
│   │   │   │   ├── page.tsx             # Home
│   │   │   │   ├── empreendimentos/
│   │   │   │   │   ├── page.tsx         # Listagem
│   │   │   │   │   └── [slug]/page.tsx  # Detalhe
│   │   │   │   └── evolucao-da-obra/
│   │   │   │       └── page.tsx
│   │   │   ├── (admin)/                 # Rotas protegidas
│   │   │   │   ├── layout.tsx           # Verifica JWT, redireciona se não autenticado
│   │   │   │   ├── dashboard/page.tsx   # Visão geral
│   │   │   │   ├── empreendimentos/
│   │   │   │   │   ├── page.tsx         # Lista com status e filtros
│   │   │   │   │   ├── novo/page.tsx    # Formulário de criação
│   │   │   │   │   └── [id]/
│   │   │   │   │       └── editar/page.tsx
│   │   │   │   ├── leads/
│   │   │   │   │   └── page.tsx         # Tabela de leads
│   │   │   │   └── usuarios/
│   │   │   │       ├── page.tsx         # Lista de usuários
│   │   │   │       └── [id]/page.tsx    # Editar usuário
│   │   │   ├── login/page.tsx
│   │   │   └── layout.tsx               # Layout raiz com fontes e providers
│   │   ├── components/
│   │   │   ├── public/                  # Componentes do site público
│   │   │   │   ├── Hero.tsx
│   │   │   │   ├── QuemSomos.tsx
│   │   │   │   ├── Lancamento.tsx
│   │   │   │   ├── EmpreendimentoCard.tsx
│   │   │   │   ├── FormLead.tsx
│   │   │   │   ├── Depoimentos.tsx
│   │   │   │   ├── ProvasSocial.tsx     # Notificações dinâmicas
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── Footer.tsx
│   │   │   └── admin/                   # Componentes do dashboard
│   │   │       ├── Sidebar.tsx
│   │   │       ├── EmpreendimentoForm.tsx
│   │   │       ├── FotoUploader.tsx
│   │   │       ├── ProgressBar.tsx
│   │   │       ├── LeadsTable.tsx
│   │   │       ├── UsuariosTable.tsx
│   │   │       └── StatusBadge.tsx
│   │   ├── lib/
│   │   │   ├── api.ts                   # Axios instance configurada
│   │   │   ├── auth.ts                  # Helpers JWT no cliente
│   │   │   └── utils.ts
│   │   ├── public/
│   │   ├── tailwind.config.ts
│   │   ├── next.config.ts
│   │   └── Dockerfile
│   │
│   └── backend/                         # Fastify + Prisma
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── empreendimentos.public.ts
│       │   │   ├── empreendimentos.admin.ts
│       │   │   ├── leads.ts
│       │   │   └── usuarios.ts
│       │   ├── plugins/
│       │   │   ├── jwt.ts               # @fastify/jwt configurado
│       │   │   ├── cors.ts
│       │   │   ├── multipart.ts
│       │   │   └── rateLimit.ts
│       │   ├── middlewares/
│       │   │   ├── verifyJWT.ts
│       │   │   └── requireRole.ts
│       │   ├── services/
│       │   │   ├── minio.service.ts
│       │   │   ├── email.service.ts
│       │   │   └── redis.service.ts
│       │   ├── schemas/                 # Zod schemas de validação
│       │   └── server.ts                # Entry point
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── migrations/
│       └── Dockerfile
│
├── docker-compose.yml                   # Desenvolvimento local
├── docker-compose.prod.yml              # Produção
├── .env.example
└── pnpm-workspace.yaml
```

---

## 5. Docker Compose e Infraestrutura

### 5.1 `docker-compose.prod.yml`

```yaml
version: "3.9"

networks:
  web:
    external: true
  internal:
    internal: true

volumes:
  postgres_data:
  minio_data:
  redis_data:

services:

  traefik:
    image: traefik:v3
    networks: [web]
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik/acme.json:/acme.json
    command:
      - "--providers.docker=true"
      - "--providers.docker.exposedByDefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=contato@queirozalmeidaconstrutora.com.br"
      - "--certificatesresolvers.letsencrypt.acme.storage=/acme.json"

  postgres:
    image: postgres:16-alpine
    networks: [internal]
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    networks: [internal]
    volumes:
      - redis_data:/data
    restart: unless-stopped

  minio:
    image: minio/minio
    networks: [internal, web]
    volumes:
      - minio_data:/data
    environment:
      MINIO_ROOT_USER: ${MINIO_ROOT_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_ROOT_PASSWORD}
    command: server /data --console-address ":9001"
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.minio.rule=Host(`storage.queirozalmeidaconstrutora.com.br`)"
      - "traefik.http.routers.minio.entrypoints=websecure"
      - "traefik.http.routers.minio.tls.certresolver=letsencrypt"
      - "traefik.http.services.minio.loadbalancer.server.port=9000"

  api:
    build:
      context: ./packages/backend
      dockerfile: Dockerfile
    networks: [internal, web]
    environment:
      DATABASE_URL: postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@postgres:5432/${POSTGRES_DB}
      REDIS_URL: redis://redis:6379
      JWT_SECRET: ${JWT_SECRET}
      MINIO_ENDPOINT: minio
      MINIO_PORT: 9000
      MINIO_ACCESS_KEY: ${MINIO_ROOT_USER}
      MINIO_SECRET_KEY: ${MINIO_ROOT_PASSWORD}
      MINIO_BUCKET: empreendimentos
      MINIO_PUBLIC_URL: https://storage.queirozalmeidaconstrutora.com.br
      RESEND_API_KEY: ${RESEND_API_KEY}
      EMAIL_TO: contato@queirozalmeidaconstrutora.com.br
    depends_on: [postgres, redis, minio]
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.api.rule=Host(`api.queirozalmeidaconstrutora.com.br`)"
      - "traefik.http.routers.api.entrypoints=websecure"
      - "traefik.http.routers.api.tls.certresolver=letsencrypt"
      - "traefik.http.services.api.loadbalancer.server.port=3001"

  nextjs:
    build:
      context: ./packages/frontend
      dockerfile: Dockerfile
    networks: [internal, web]
    environment:
      NEXT_PUBLIC_API_URL: https://api.queirozalmeidaconstrutora.com.br
      NEXT_PUBLIC_STORAGE_URL: https://storage.queirozalmeidaconstrutora.com.br
    depends_on: [api]
    restart: unless-stopped
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.nextjs.rule=Host(`queirozalmeidaconstrutora.com.br`)"
      - "traefik.http.routers.nextjs.entrypoints=websecure"
      - "traefik.http.routers.nextjs.tls.certresolver=letsencrypt"
      - "traefik.http.services.nextjs.loadbalancer.server.port=3000"
```

### 5.2 Dockerfile — Backend (Fastify)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
```

### 5.3 Dockerfile — Frontend (Next.js)

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## 6. Banco de Dados — Schema Prisma

### 6.1 `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  GERENTE
  EDITOR
}

enum StatusEmpreendimento {
  RASCUNHO
  AGUARDANDO_APROVACAO
  PUBLICADO
  REJEITADO
}

model User {
  id          String    @id @default(uuid())
  nome        String
  email       String    @unique
  senha_hash  String
  role        Role      @default(EDITOR)
  ativo       Boolean   @default(true)
  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  criados     Empreendimento[] @relation("CriadoPor")
  aprovados   Empreendimento[] @relation("AprovadoPor")
}

model Empreendimento {
  id                String               @id @default(uuid())
  nome              String
  slug              String               @unique
  descricao         String?
  status            StatusEmpreendimento @default(RASCUNHO)
  progresso         Int                  @default(0)
  localizacao       String
  area_min          Decimal?
  area_max          Decimal?
  quartos           String?
  banheiros         Int?
  vagas             String?
  fotos             Json                 @default("[]")
  video_url         String?
  is_lancamento     Boolean              @default(false)
  rejection_comment String?
  created_by_id     String
  approved_by_id    String?
  created_at        DateTime             @default(now())
  updated_at        DateTime             @updatedAt

  created_by  User  @relation("CriadoPor", fields: [created_by_id], references: [id])
  approved_by User? @relation("AprovadoPor", fields: [approved_by_id], references: [id])
}

model Lead {
  id         String   @id @default(uuid())
  nome       String
  email      String
  whatsapp   String
  interesse  String?  // Nome do empreendimento de interesse
  origem     String?  // URL da página que gerou o lead
  lido       Boolean  @default(false)
  created_at DateTime @default(now())
}
```

### 6.2 Tabela de Campos — Empreendimento

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | UUID | Chave primária gerada automaticamente |
| `nome` | VARCHAR | Nome do empreendimento |
| `slug` | VARCHAR | URL amigável gerada do nome (único) |
| `descricao` | TEXT | Texto rico em Markdown |
| `status` | ENUM | `RASCUNHO` \| `AGUARDANDO_APROVACAO` \| `PUBLICADO` \| `REJEITADO` |
| `progresso` | INTEGER | Percentual da obra — 0 a 100 |
| `localizacao` | VARCHAR | Ex: Porto de Galinhas, PE |
| `area_min` | DECIMAL | Metragem mínima em m² |
| `area_max` | DECIMAL | Metragem máxima em m² |
| `quartos` | VARCHAR | Ex: Studio, 1, 2 |
| `banheiros` | INTEGER | Quantidade de banheiros |
| `vagas` | VARCHAR | Ex: Rotativa, 1, 2 |
| `fotos` | JSONB | Array de URLs das imagens no MinIO |
| `video_url` | VARCHAR | URL do vídeo do hero (opcional) |
| `is_lancamento` | BOOLEAN | Se `true`, aparece em destaque na home |
| `rejection_comment` | TEXT | Comentário de rejeição pelo Gerente/Admin |
| `created_by_id` | UUID FK | Editor que criou o registro |
| `approved_by_id` | UUID FK | Gerente/Admin que aprovou |
| `created_at` | TIMESTAMP | Gerado automaticamente |
| `updated_at` | TIMESTAMP | Atualizado automaticamente |

---

## 7. Backend — API Fastify

### 7.1 Mapa Completo de Rotas

```
# Autenticação
POST   /api/auth/login                          → Recebe email + senha, retorna JWT
POST   /api/auth/logout                         → Adiciona token na blacklist do Redis
GET    /api/auth/me                             → Retorna dados do usuário logado

# Empreendimentos — rotas públicas (sem autenticação)
GET    /api/empreendimentos                     → Lista os PUBLICADOS
GET    /api/empreendimentos/lancamento          → Retorna o is_lancamento = true
GET    /api/empreendimentos/:slug               → Detalhe de um empreendimento

# Empreendimentos — rotas admin (requer JWT)
GET    /api/admin/empreendimentos               → Lista todos com status (ADMIN, GERENTE, EDITOR)
POST   /api/admin/empreendimentos               → Cria empreendimento (todos os roles)
PUT    /api/admin/empreendimentos/:id           → Edita (EDITOR só edita RASCUNHO ou REJEITADO)
DELETE /api/admin/empreendimentos/:id           → Remove (GERENTE, ADMIN)
POST   /api/admin/empreendimentos/:id/submeter  → Muda status para AGUARDANDO_APROVACAO (EDITOR)
POST   /api/admin/empreendimentos/:id/aprovar   → Publica (GERENTE, ADMIN)
POST   /api/admin/empreendimentos/:id/rejeitar  → body: { comentario } (GERENTE, ADMIN)
POST   /api/admin/empreendimentos/:id/fotos     → Upload multipart de fotos (todos)
DELETE /api/admin/empreendimentos/:id/fotos     → body: { url } — remove foto (todos)

# Leads
POST   /api/leads                               → Cria lead (público — formulário do site)
GET    /api/admin/leads                         → Lista leads com paginação (GERENTE, ADMIN)
PATCH  /api/admin/leads/:id/lido                → Marca como lido (GERENTE, ADMIN)

# Usuários (requer JWT)
GET    /api/admin/usuarios                      → Lista usuários (ADMIN: todos | GERENTE: só Editores)
POST   /api/admin/usuarios                      → Cria usuário (ADMIN cria qualquer | GERENTE só EDITOR)
PUT    /api/admin/usuarios/:id                  → Edita usuário
DELETE /api/admin/usuarios/:id                  → Remove (não pode remover a si mesmo)
PATCH  /api/admin/usuarios/:id/ativar           → Ativa conta
PATCH  /api/admin/usuarios/:id/desativar        → Desativa conta
```

### 7.2 Middleware de Autenticação

```typescript
// src/middlewares/verifyJWT.ts
// Verifica o token Bearer no header Authorization
// Confere se o token está na blacklist do Redis
// Injeta req.user = { id, email, role } no request

// src/middlewares/requireRole.ts
// Recebe uma lista de roles permitidos
// Retorna 403 se req.user.role não estiver na lista

// Exemplo de uso nas rotas:
fastify.post(
  '/api/admin/empreendimentos/:id/aprovar',
  { preHandler: [verifyJWT, requireRole('GERENTE', 'ADMIN')] },
  aprovarHandler
)
```

### 7.3 Serviço de Upload — MinIO

```typescript
// src/services/minio.service.ts

// Configuração:
// - Bucket: 'empreendimentos'
// - Policy do bucket: leitura pública (GET), escrita privada
// - Caminho dos arquivos: empreendimentos/{id}/{timestamp}-{nome-sanitizado}
// - URL pública: https://storage.queirozalmeidaconstrutora.com.br/{caminho}

// Validações obrigatórias no upload:
// - Tamanho máximo: 10 MB por arquivo
// - Formatos aceitos: image/jpeg, image/png, image/webp
// - Máximo de fotos por empreendimento: 20

// Ao deletar uma foto:
// 1. Remover o objeto do MinIO
// 2. Atualizar o array fotos[] no Postgres removendo a URL
```

### 7.4 Serviço de E-mail — Resend

```typescript
// src/services/email.service.ts
// Disparado quando POST /api/leads é chamado com sucesso

// Template HTML do e-mail:
// Para: contato@queirozalmeidaconstrutora.com.br
// Assunto: "Novo lead — {nome} — {empreendimento}"
// Corpo: nome, whatsapp, email, interesse, horário do contato

// O lead SEMPRE é salvo no banco antes de tentar enviar o e-mail.
// Se o envio falhar, o lead não é perdido (já está no banco).
```

### 7.5 Regras de Negócio Críticas

```
1. EDITOR só pode editar empreendimentos com status RASCUNHO ou REJEITADO
   → Tentativa de editar PUBLICADO ou AGUARDANDO_APROVACAO retorna 403

2. Quando EDITOR edita um empreendimento REJEITADO:
   → Status muda automaticamente para RASCUNHO
   → Campo rejection_comment é limpo

3. Apenas UM empreendimento pode ter is_lancamento = true por vez
   → Ao marcar um como lançamento, o anterior é desmarcado automaticamente

4. GERENTE não pode ver, criar, editar ou excluir outros GERENTES
   → Apenas ADMIN tem acesso ao CRUD de GERENTES

5. Nenhum usuário pode deletar a si mesmo

6. Ao desativar um usuário (ativo = false):
   → Tokens JWT existentes são invalidados via blacklist no Redis

7. Slug é gerado automaticamente do nome e deve ser único
   → Usar slugify com suporte a caracteres especiais do português
```

---

## 8. Site Público — Estrutura da Home

A home usa **Next.js Server Components** para SSR — dados de empreendimentos buscados no servidor para garantir SEO.

### Bloco 1 — Hero com Vídeo de Fundo

**Referência visual:** https://hasaempreendimentos.com.br

```
Layout:
- Vídeo do empreendimento em loop (autoplay, muted, playsInline, sem controles)
- Fallback para imagem estática de alta qualidade se não houver vídeo
- Overlay: background #112669, opacidade 60%

Conteúdo (centralizado ou alinhado à esquerda):
- Eyebrow: "Litoral Pernambucano e Litoral Alagoano" (cor #7ECFE8, uppercase, spacing)
- Headline (Georgia, bold, branco, ~52px desktop / 36px mobile):
  "Invista em imóveis no litoral com alto potencial de renda e valorização"
- Subheadline (Inter, regular, #AABFD8, ~18px):
  "Flats de alto padrão em Porto de Galinhas e Maragogi"
- Dois botões:
  → Primário (fundo #C9973A, texto branco): "Quero ver valores"
  → Secundário (outline branco 1.5px): "Falar com especialista"
- Barra de stats (fundo #0D2233, padding 16px):
  "9+ anos de mercado" | "3 empreendimentos" | "2 estados" | "100% litoral"
```

### Bloco 2 — Quem Somos

```
Layout: texto à esquerda (60%) + 3 cards de números à direita (40%)
Background: branco

Texto em terceira pessoa:
"A Queiroz Almeida Construtora e Incorporadora é reconhecida no mercado
do litoral nordestino pela excelência na construção de flats de investimento.
Fundada em 2016, a empresa atua no Litoral Sul Pernambucano e Litoral Norte
Alagoano, entregando empreendimentos que combinam qualidade construtiva,
localização privilegiada e alto potencial de valorização."

Cards de números (animação counter-up ao entrar na viewport):
- "9+" | "anos de mercado"
- "3"  | "empreendimentos ativos"
- "2"  | "estados de atuação"
```

### Bloco 3 — Destaque: Lançamento

```
Background: #F4F7FC
Busca: empreendimento com is_lancamento = true (via API)
Se nenhum: exibir o mais recente publicado

Layout:
- Badge "Lançamento" em #C9973A (topo esquerdo)
- Imagem principal (60% da largura, rounded corners)
- Coluna de dados à direita:
  → Nome do empreendimento (Georgia, #112669)
  → Localização com ícone de pin
  → Metragem, quartos, banheiros, vagas (ícones + texto)
  → Barra de progresso da obra com percentual (cor #C9973A)
  → Botão primário: "Garantir minha unidade" (#112669)
  → Botão secundário ghost: "Acompanhar evolução da obra" → /evolucao-da-obra
```

### Bloco 4 — Outros Empreendimentos

```
Background: branco
Título da seção: "Conheça nossos empreendimentos"

Grid de cards (3 colunas desktop / 1 mobile):
- Foto com badge de status (Em obra / Lançamento / Entregue)
- Nome do empreendimento (Georgia)
- Localização
- Metragem e quartos
- Botão: "Conhecer" → /empreendimentos/{slug}

CTA ao final da seção:
- Botão outline: "Ver todos os empreendimentos" → /empreendimentos
```

### Bloco 5 — Formulário de Captura de Leads

```
Background: #112669

Três micro-promessas (ícone SVG + texto branco):
1. "Receba valores atualizados"
2. "Simule sua rentabilidade"
3. "Acesso antecipado às unidades"

Campos do formulário:
- Nome completo (obrigatório)
- WhatsApp com máscara (obrigatório) — ex: (81) 99999-9999
- E-mail (obrigatório)
- Empreendimento de interesse (select, opcional):
  → Porto Lagoa Residence
  → Porto Mau Loa
  → Caminho do Mar

Botão submit: "Quero receber mais informações" (fundo #C9973A)
Após submit: mensagem de sucesso inline (sem reload de página)
```

### Bloco 6 — Depoimentos

```
Background: branco
Título: "O que dizem nossos clientes"

Cards de depoimentos (carrossel ou grid):
- Foto do cliente (avatar circular)
- Nome e cidade
- Texto do depoimento (aspas estilizadas em #C9973A)
- Estrelas de avaliação (5 estrelas)

Mínimo 3 depoimentos. Dados fixos no código inicialmente.
```

### Bloco 7 — Notificações de Prova Social (Dinâmicas)

```
Posição: canto inferior esquerdo da tela (fixo na viewport)
z-index: 9999

Comportamento:
- Aparecem 3–5 segundos após o usuário carregar a página
- Animação de entrada: slide-in da esquerda
- Ficam visíveis por 4 segundos
- Animação de saída: fade-out
- Intervalo entre notificações: 8–12 segundos (aleatório)
- Loop infinito com array de mensagens

Mensagens rotativas:
- "Alguém de Recife acabou de solicitar informações sobre o Porto Mau Loa"
- "Novo interesse registrado no Caminho do Mar — Maragogi"
- "Uma pessoa está visualizando o Porto Lagoa agora"
- "Alguém de São Paulo acabou de entrar em contato"
- "Novo interesse no Porto Mau Loa — há 2 minutos"

Design do card de notificação:
- Fundo: #112669, texto branco
- Bolinha verde animada (pulse) indicando "ao vivo"
- Largura máxima: 320px
- Border-radius: 10px
- Sombra suave
```

### Bloco 8 — Footer

```
Background: #0D2233

Colunas (3 desktop / 1 mobile):
1. Logo + texto curto sobre a empresa + ícones de redes sociais
2. Links de navegação: Início | Sobre | Empreendimentos | Evolução da Obra | Contato
3. Contato: e-mail, telefone, WhatsApp (link direto wa.me)

Linha inferior:
- "© 2026 Queiroz Almeida Construtora. Todos os direitos reservados."
- CNPJ da empresa
```

---

## 9. Dashboard Administrativo

### 9.1 Página de Login (`/login`)

```
- Campo: E-mail
- Campo: Senha (com toggle mostrar/ocultar)
- Botão: "Entrar"
- Ao fazer login: salvar JWT no cookie httpOnly via route handler do Next.js
- Redirecionar para /admin/dashboard
- Em caso de erro: exibir mensagem inline (não usar alert)
```

### 9.2 Layout do Admin

```
Sidebar fixa (desktop) / menu hambúrguer (mobile):
- Logo da Queiroz Almeida
- Nome e role do usuário logado
- Links de navegação (visibilidade por role — ver seção 10)
- Botão "Sair" no final

Header:
- Breadcrumb da página atual
- Sino de notificações (empreendimentos aguardando aprovação)
- Avatar do usuário
```

### 9.3 Dashboard (`/admin/dashboard`)

```
Cards de resumo (visibilidade por role):
- Total de empreendimentos publicados
- Empreendimentos aguardando aprovação (badge de alerta se > 0)
- Leads recebidos hoje
- Leads não lidos (badge vermelho se > 0)

Tabela de empreendimentos recentes com status
Tabela de leads recentes (GERENTE e ADMIN)
```

### 9.4 Gestão de Empreendimentos (`/admin/empreendimentos`)

```
Listagem com filtros:
- Filtro por status: Todos | Rascunho | Aguardando | Publicado | Rejeitado
- Busca por nome
- Badge colorido por status

Ações por linha (dependendo do role e status):
- Editar
- Submeter para aprovação (EDITOR, se RASCUNHO ou REJEITADO)
- Aprovar (GERENTE, ADMIN — se AGUARDANDO)
- Rejeitar (GERENTE, ADMIN — abre modal para digitar comentário)
- Excluir (GERENTE, ADMIN)
```

### 9.5 Formulário de Empreendimento (`/admin/empreendimentos/novo` e `/editar`)

```
Seções do formulário:

1. Informações gerais:
   - Nome (text input)
   - Localização (text input)
   - Descrição (textarea com preview Markdown)
   - Status de obra: select (Em obra / Pronto para lançar / Entregue)
   - Progresso da obra: slider 0–100% com preview visual da barra
   - É lançamento? (toggle — ao ativar, avisa que o atual será desmarcado)

2. Especificações técnicas:
   - Metragem mínima (number input, m²)
   - Metragem máxima (number input, m²)
   - Quartos (select: Studio / 1 / 2 / 3+)
   - Banheiros (number input)
   - Vagas (select: Rotativa / 1 / 2 / Nenhuma)

3. Mídia:
   - Upload de fotos via drag-and-drop (react-dropzone)
   - Preview das fotos enviadas com botão de remoção individual
   - Máximo 20 fotos, até 10 MB cada
   - Formatos aceitos: JPG, PNG, WebP
   - URL do vídeo (input text para link do vídeo do hero)

4. Ações:
   - "Salvar rascunho" — salva com status RASCUNHO
   - "Enviar para aprovação" — muda para AGUARDANDO_APROVACAO

Exibir comentário de rejeição se status === REJEITADO:
- Box destacado em vermelho claro com ícone de aviso
- Texto: "Este empreendimento foi rejeitado: {rejection_comment}"
```

### 9.6 Gestão de Leads (`/admin/leads`)

```
Visível para: GERENTE e ADMIN

Tabela com colunas:
- Nome | E-mail | WhatsApp | Interesse | Data | Status (lido/não lido)

Funcionalidades:
- Filtro: Todos | Não lidos | Lidos
- Busca por nome ou e-mail
- Clicar na linha marca como lido
- Botão para copiar WhatsApp
- Link direto para o WhatsApp da pessoa (wa.me/{numero})
- Exportar CSV (ADMIN)
- Paginação: 20 por página
```

### 9.7 Gestão de Usuários (`/admin/usuarios`)

```
Visível para: ADMIN (todos) e GERENTE (apenas Editores)

Tabela com colunas:
- Nome | E-mail | Role | Status (ativo/inativo) | Data de criação | Ações

Formulário de criação/edição:
- Nome
- E-mail
- Senha (obrigatório na criação, opcional na edição)
- Role (ADMIN vê todas; GERENTE só pode selecionar EDITOR)
- Ativo (toggle)

Ações disponíveis:
- Criar novo usuário
- Editar usuário
- Ativar / Desativar (não pode desativar a si mesmo)
- Excluir (não pode excluir a si mesmo)
```

---

## 10. Sistema de Roles e Permissões

### 10.1 Matriz de Permissões

| Ação | Admin | Gerente | Editor |
|---|---|---|---|
| Criar empreendimento | ✓ | ✓ | ✓ (rascunho) |
| Editar empreendimento | ✓ | ✓ | ✓ (só rascunho/rejeitado) |
| Submeter para aprovação | ✓ | ✓ | ✓ |
| Aprovar e publicar | ✓ | ✓ | — |
| Rejeitar com comentário | ✓ | ✓ | — |
| Excluir empreendimento | ✓ | ✓ | — |
| Upload de fotos | ✓ | ✓ | ✓ |
| Atualizar % progresso | ✓ | ✓ | ✓ |
| Marcar como lançamento | ✓ | ✓ | — |
| Ver leads | ✓ | ✓ | — |
| Exportar leads CSV | ✓ | — | — |
| Criar Editores | ✓ | ✓ | — |
| Criar Gerentes | ✓ | — | — |
| Criar Admins | ✓ | — | — |
| Editar Editores | ✓ | ✓ | — |
| Editar Gerentes | ✓ | — | — |
| Ver lista de Gerentes | ✓ | — | — |
| Desativar usuários | ✓ | Apenas Editores | — |

### 10.2 Itens Visíveis na Sidebar por Role

| Item | Admin | Gerente | Editor |
|---|---|---|---|
| Dashboard | ✓ | ✓ | ✓ |
| Empreendimentos | ✓ | ✓ | ✓ |
| Leads | ✓ | ✓ | — |
| Usuários | ✓ | ✓ (só Editores) | — |

---

## 11. Fluxo de Aprovação de Empreendimentos

```
[EDITOR cria]
      ↓
  status: RASCUNHO
      ↓
[EDITOR clica "Enviar para aprovação"]
      ↓
  status: AGUARDANDO_APROVACAO
  (GERENTE e ADMIN recebem notificação no sino do dashboard)
      ↓
[GERENTE ou ADMIN revisa]
      ↓
   ┌──────────────────────────────────────┐
   │                                      │
[Aprova]                            [Rejeita + comentário]
   ↓                                      ↓
status: PUBLICADO               status: REJEITADO
(aparece no site)               rejection_comment = "..."
                                         ↓
                                [EDITOR edita o empreendimento]
                                         ↓
                               status volta para: RASCUNHO
                               rejection_comment = null
                                         ↓
                              [Ciclo recomeça do RASCUNHO]
```

---

## 12. Variáveis de Ambiente

### `.env.example`

```bash
# PostgreSQL
POSTGRES_DB=queiroz_almeida
POSTGRES_USER=qa_user
POSTGRES_PASSWORD=TROQUE_POR_SENHA_FORTE
DATABASE_URL=postgresql://qa_user:SENHA@postgres:5432/queiroz_almeida

# JWT
JWT_SECRET=GERE_COM_openssl_rand_-base64_64
JWT_EXPIRES_IN=7d

# MinIO
MINIO_ROOT_USER=qa_minio_admin
MINIO_ROOT_PASSWORD=TROQUE_POR_SENHA_FORTE
MINIO_BUCKET=empreendimentos
MINIO_PUBLIC_URL=https://storage.queirozalmeidaconstrutora.com.br

# Redis
REDIS_URL=redis://redis:6379

# Resend (e-mail)
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=noreply@queirozalmeidaconstrutora.com.br
EMAIL_TO=contato@queirozalmeidaconstrutora.com.br

# URLs
NEXT_PUBLIC_API_URL=https://api.queirozalmeidaconstrutora.com.br
NEXT_PUBLIC_STORAGE_URL=https://storage.queirozalmeidaconstrutora.com.br
NEXT_PUBLIC_SITE_URL=https://queirozalmeidaconstrutora.com.br

# Ambiente
NODE_ENV=production
```

---

## 13. Checklist de Implementação

### Fase 1 — Infraestrutura

- [ ] Criar rede Docker `web` na VPS
- [ ] Configurar arquivo `traefik/acme.json` com permissões `chmod 600`
- [ ] Subir `docker-compose.prod.yml` no Portainer
- [ ] Verificar SSL automático nos 3 domínios
- [ ] Criar bucket `empreendimentos` no MinIO com policy pública de leitura
- [ ] Criar usuário administrador inicial via seed do Prisma

### Fase 2 — Backend

- [ ] Configurar Fastify com plugins (cors, jwt, multipart, rateLimit)
- [ ] Implementar rotas de autenticação com blacklist Redis
- [ ] Implementar middlewares `verifyJWT` e `requireRole`
- [ ] Implementar CRUD de empreendimentos com todas as regras de role
- [ ] Implementar fluxo de aprovação (submeter / aprovar / rejeitar)
- [ ] Implementar upload de fotos para MinIO
- [ ] Implementar CRUD de leads + envio de e-mail via Resend
- [ ] Implementar CRUD de usuários com regras de hierarquia
- [ ] Criar seed com usuário ADMIN inicial

### Fase 3 — Site Público

- [ ] Configurar Next.js com Tailwind e fontes (Georgia + Inter)
- [ ] Implementar Hero com vídeo e fallback para imagem
- [ ] Implementar Bloco Quem Somos com animação de contadores
- [ ] Implementar Bloco Lançamento com barra de progresso
- [ ] Implementar Grid de outros empreendimentos
- [ ] Implementar Formulário de leads com validação e feedback
- [ ] Implementar Depoimentos
- [ ] Implementar Notificações de prova social dinâmicas
- [ ] Implementar Footer completo
- [ ] Implementar página `/empreendimentos` (listagem)
- [ ] Implementar página `/empreendimentos/[slug]` (detalhe)
- [ ] Implementar página `/evolucao-da-obra`
- [ ] Verificar SEO: meta tags, Open Graph, sitemap.xml, robots.txt

### Fase 4 — Dashboard Admin

- [ ] Implementar página de login com salvamento de JWT em cookie httpOnly
- [ ] Implementar layout do admin (sidebar + header)
- [ ] Implementar proteção de rotas no layout `/admin`
- [ ] Implementar Dashboard com cards e tabelas resumo
- [ ] Implementar listagem de empreendimentos com filtros e badges de status
- [ ] Implementar formulário de criação/edição com upload de fotos drag-and-drop
- [ ] Implementar fluxo de aprovação/rejeição com modal de comentário
- [ ] Implementar página de Leads com filtros e marcação de lido
- [ ] Implementar página de Usuários com CRUD por role
- [ ] Implementar sino de notificações para aprovações pendentes

### Fase 5 — Qualidade e Deploy

- [ ] Testar todos os fluxos de role (Admin / Gerente / Editor)
- [ ] Testar upload e remoção de fotos
- [ ] Testar formulário de lead (banco + e-mail)
- [ ] Testar fluxo completo de aprovação
- [ ] Configurar `next.config.ts` com `output: 'standalone'`
- [ ] Verificar `@next/image` com domínio do MinIO em `remotePatterns`
- [ ] Verificar headers de segurança (CSP, HSTS, X-Frame-Options)
- [ ] Testar responsividade em mobile (320px, 375px, 768px, 1280px)
- [ ] Verificar Lighthouse score (meta: Performance > 85, SEO > 95)

---

*Documento gerado em março de 2026. Todas as decisões técnicas foram baseadas nas especificações levantadas em reuniões com o cliente e nas restrições da infraestrutura VPS KVM1 da Hostinger.*
