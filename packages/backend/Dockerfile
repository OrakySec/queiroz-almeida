FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Instalar dependências
COPY package.json ./
RUN pnpm install

# Gerar Prisma Client e buildar
COPY . .
RUN pnpm exec prisma generate
RUN pnpm build

# ── Runner ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json

# Regera o Prisma client para o platform correto (linux-musl Alpine)
RUN npx prisma generate

EXPOSE 3001
# Roda migrations automaticamente antes de iniciar
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && ./node_modules/.bin/tsx prisma/seed.ts && node dist/server.js"]
