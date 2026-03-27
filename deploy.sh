#!/bin/bash
set -e

echo "🚀 Iniciando deploy..."

# Puxar últimas alterações do GitHub
git pull origin main

# Buildar e subir os containers com as novas imagens
docker compose -f docker-compose.prod.yml up -d --build

# Remover imagens antigas (dangling = sem tag, geradas pelo build anterior)
docker image prune -f

# Remover containers parados
docker container prune -f

# Mostrar status final
echo ""
echo "✅ Deploy concluído!"
docker compose -f docker-compose.prod.yml ps
