FROM node:20-alpine AS builder
RUN npm install -g pnpm
WORKDIR /app

# Instalar dependências
COPY package.json ./
RUN pnpm install

# Receber URL da API em tempo de build (necessário para Next.js embutir no bundle)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Copiar código e buildar
COPY . .
RUN pnpm build

# ── Runner ──────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOSTNAME=0.0.0.0
ENV PORT=3000

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/sharp ./node_modules/sharp

EXPOSE 3000
CMD ["node", "server.js"]
