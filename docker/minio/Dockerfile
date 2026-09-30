# MinIO Server — compilado a partir do código-fonte oficial.
#
# A MinIO descontinuou a distribuição de imagens Docker prontas (Docker Hub e
# Quay.io) em out/2025 e desativou até o download direto de binários no CDN
# próprio (dl.min.io) — retorna 410 Gone. O repositório da edição community
# foi arquivado em fev/2026 (sem mais atualizações). Esta é a última versão
# publicada antes do arquivamento: RELEASE.2025-10-15T17-29-55Z.
#
# O build usa apenas o Go Module Proxy (proxy.golang.org) e o próprio
# repositório Git no GitHub — nenhuma dependência do Docker Hub/Quay/dl.min.io.
FROM golang:1.24-alpine AS build

ARG MINIO_VERSION=RELEASE.2025-10-15T17-29-55Z

RUN apk add --no-cache git

WORKDIR /build
RUN git clone --depth 1 --branch ${MINIO_VERSION} https://github.com/minio/minio.git .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags kqueue -trimpath -o /out/minio .

FROM alpine:3.19
RUN apk add --no-cache ca-certificates

COPY --from=build /out/minio /usr/bin/minio

EXPOSE 9000 9001
VOLUME ["/data"]

ENTRYPOINT ["minio"]
CMD ["server", "/data", "--console-address", ":9001"]
