# MinIO Client (mc) — compilado a partir do código-fonte oficial.
# Ver docker/minio/Dockerfile para o contexto completo do porquê.
# Última versão publicada: RELEASE.2025-08-13T08-35-41Z.
FROM golang:1.24-alpine AS build

ARG MC_VERSION=RELEASE.2025-08-13T08-35-41Z

RUN apk add --no-cache git

WORKDIR /build
RUN git clone --depth 1 --branch ${MC_VERSION} https://github.com/minio/mc.git .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags kqueue -trimpath -o /out/mc .

FROM alpine:3.19
RUN apk add --no-cache ca-certificates

COPY --from=build /out/mc /usr/bin/mc

ENTRYPOINT ["mc"]
