-- Novos campos de detalhe do empreendimento
ALTER TABLE "Empreendimento"
  ADD COLUMN "bairro"        TEXT,
  ADD COLUMN "endereco"      TEXT,
  ADD COLUMN "tipo_imovel"   TEXT,
  ADD COLUMN "padrao"        TEXT,
  ADD COLUMN "quartos_min"   INTEGER,
  ADD COLUMN "quartos_max"   INTEGER,
  ADD COLUMN "suites_min"    INTEGER,
  ADD COLUMN "suites_max"    INTEGER,
  ADD COLUMN "banheiros_min" INTEGER,
  ADD COLUMN "banheiros_max" INTEGER,
  ADD COLUMN "vagas_min"     INTEGER,
  ADD COLUMN "vagas_max"     INTEGER,
  ADD COLUMN "num_torres"    INTEGER,
  ADD COLUMN "num_andares"   INTEGER,
  ADD COLUMN "latitude"      DECIMAL(10,7),
  ADD COLUMN "longitude"     DECIMAL(10,7),
  ADD COLUMN "amenidades"    JSONB NOT NULL DEFAULT '[]';
