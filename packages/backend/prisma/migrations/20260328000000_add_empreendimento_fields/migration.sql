-- Adiciona novos campos ao modelo Empreendimento
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "cidade" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "estado" TEXT NOT NULL DEFAULT '';
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "descricao_breve" TEXT;
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "tipologia" TEXT;
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "preco_min" DECIMAL(65,30);
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "preco_max" DECIMAL(65,30);
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "total_unidades" INTEGER;
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "unidades_disponiveis" INTEGER;
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "data_entrega" TIMESTAMP(3);
ALTER TABLE "Empreendimento" ADD COLUMN IF NOT EXISTS "whatsapp" TEXT;

-- Migra localizacao para cidade (se existir) e remove a coluna
UPDATE "Empreendimento" SET "cidade" = "localizacao" WHERE "cidade" = '' AND "localizacao" IS NOT NULL;
ALTER TABLE "Empreendimento" DROP COLUMN IF EXISTS "localizacao";

-- Remove colunas que não são mais usadas
ALTER TABLE "Empreendimento" DROP COLUMN IF EXISTS "quartos";
ALTER TABLE "Empreendimento" DROP COLUMN IF EXISTS "banheiros";
ALTER TABLE "Empreendimento" DROP COLUMN IF EXISTS "vagas";
