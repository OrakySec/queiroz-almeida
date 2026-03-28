-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'GERENTE', 'EDITOR');

-- CreateEnum
CREATE TYPE "StatusEmpreendimento" AS ENUM ('RASCUNHO', 'AGUARDANDO_APROVACAO', 'PUBLICADO', 'REJEITADO');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Empreendimento" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "descricao" TEXT,
    "status" "StatusEmpreendimento" NOT NULL DEFAULT 'RASCUNHO',
    "progresso" INTEGER NOT NULL DEFAULT 0,
    "localizacao" TEXT NOT NULL,
    "area_min" DECIMAL(65,30),
    "area_max" DECIMAL(65,30),
    "quartos" TEXT,
    "banheiros" INTEGER,
    "vagas" TEXT,
    "fotos" JSONB NOT NULL DEFAULT '[]',
    "video_url" TEXT,
    "is_lancamento" BOOLEAN NOT NULL DEFAULT false,
    "rejection_comment" TEXT,
    "created_by_id" TEXT NOT NULL,
    "approved_by_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Empreendimento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "interesse" TEXT,
    "origem" TEXT,
    "lido" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Empreendimento_slug_key" ON "Empreendimento"("slug");

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Empreendimento" ADD CONSTRAINT "Empreendimento_approved_by_id_fkey" FOREIGN KEY ("approved_by_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
