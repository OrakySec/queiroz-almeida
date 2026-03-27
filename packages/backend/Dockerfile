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
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001
# Roda migrations automaticamente antes de iniciar
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/server.js"]
