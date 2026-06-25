-- =============================================================
-- Layette v2 — Catálogo inteligente com motor de recomendações
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Expandir layette_catalog
-- ─────────────────────────────────────────────────────────────

-- Remove constraints antigas restritivas (vamos expandir)
ALTER TABLE public.layette_catalog
  DROP CONSTRAINT IF EXISTS layette_category_check,
  DROP CONSTRAINT IF EXISTS layette_criticality_check,
  DROP CONSTRAINT IF EXISTS layette_usage_check,
  DROP CONSTRAINT IF EXISTS layette_rec_check;

-- Novos campos de metadados
ALTER TABLE public.layette_catalog
  ADD COLUMN IF NOT EXISTS subcategory     TEXT,
  ADD COLUMN IF NOT EXISTS tags            TEXT[]  DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS need_level      TEXT    DEFAULT 'recomendado',
  ADD COLUMN IF NOT EXISTS buy_week_from   INT,
  ADD COLUMN IF NOT EXISTS buy_week_to     INT,
  ADD COLUMN IF NOT EXISTS use_from_week   INT     DEFAULT 0,
  ADD COLUMN IF NOT EXISTS use_to_week     INT,
  ADD COLUMN IF NOT EXISTS max_quantity    INT,
  ADD COLUMN IF NOT EXISTS can_borrow      BOOL    DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_rent        BOOL    DEFAULT false,
  ADD COLUMN IF NOT EXISTS can_wait        BOOL    DEFAULT true,
  ADD COLUMN IF NOT EXISTS good_as_gift    BOOL    DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_large_item   BOOL    DEFAULT false,
  ADD COLUMN IF NOT EXISTS weight_kg       NUMERIC(5,2),
  ADD COLUMN IF NOT EXISTS country_rec     TEXT    DEFAULT 'brasil',
  ADD COLUMN IF NOT EXISTS avg_price_brl   NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS avg_price_usd   NUMERIC(10,2);

-- Preencher avg_price a partir dos dados existentes
UPDATE public.layette_catalog
SET
  avg_price_brl = ROUND((COALESCE(price_brl_min,0) + COALESCE(price_brl_max,0)) / 2, 2),
  avg_price_usd = ROUND((COALESCE(price_usd_min,0) + COALESCE(price_usd_max,0)) / 2, 2)
WHERE avg_price_brl IS NULL;

-- Migrar criticality → need_level nos dados existentes
UPDATE public.layette_catalog SET need_level = CASE
  WHEN criticality = 'CRITICO'    THEN 'essencial'
  WHEN criticality = 'IMPORTANTE' THEN 'recomendado'
  WHEN criticality = 'OPCIONAL'   THEN 'conveniente'
  ELSE 'recomendado'
END;

-- Migrar base_recommendation → country_rec
UPDATE public.layette_catalog SET country_rec = CASE
  WHEN base_recommendation = 'AGUARDAR_EUA'       THEN 'usa'
  WHEN base_recommendation = 'SO_PROMOCAO'        THEN 'so_promocao'
  WHEN base_recommendation = 'RECEBER_PRESENTE'   THEN 'presentear'
  WHEN base_recommendation = 'NAO_PRIORITARIO'    THEN 'qualquer'
  ELSE 'brasil'
END;

-- Preencher buy_week_to com base no usage_period existente
UPDATE public.layette_catalog SET
  buy_week_from  = CASE
    WHEN usage_period = 'NO_NASCIMENTO' THEN 20
    WHEN usage_period = 'ATE_3_MESES'  THEN 28
    WHEN usage_period = 'ATE_6_MESES'  THEN 32
    WHEN usage_period = 'APOS_6_MESES' THEN 36
    ELSE 24
  END,
  buy_week_to = CASE
    WHEN usage_period = 'NO_NASCIMENTO' THEN 36
    WHEN usage_period = 'ATE_3_MESES'  THEN 38
    WHEN usage_period = 'ATE_6_MESES'  THEN 40
    WHEN usage_period = 'APOS_6_MESES' THEN NULL
    ELSE 38
  END,
  use_from_week = CASE
    WHEN usage_period = 'NO_NASCIMENTO' THEN 0
    WHEN usage_period = 'ATE_3_MESES'  THEN 0
    WHEN usage_period = 'ATE_6_MESES'  THEN 13
    WHEN usage_period = 'APOS_6_MESES' THEN 26
    ELSE 0
  END,
  can_borrow = CASE
    WHEN criticality = 'OPCIONAL' THEN true
    ELSE false
  END,
  good_as_gift = CASE
    WHEN base_recommendation = 'RECEBER_PRESENTE' THEN true
    ELSE false
  END;

-- Novos constraints
ALTER TABLE public.layette_catalog
  ADD CONSTRAINT layette_need_level_check CHECK (
    need_level IN ('essencial','recomendado','conveniente','conforto','luxo')
  ),
  ADD CONSTRAINT layette_country_rec_check CHECK (
    country_rec IN ('brasil','usa','qualquer','so_promocao','alugar','presentear','nao_comprar')
  );

-- ─────────────────────────────────────────────────────────────
-- 2. Reformular layette_user_items
-- ─────────────────────────────────────────────────────────────

-- Remove constraint de status antiga (com valores incorretos)
ALTER TABLE public.layette_user_items
  DROP CONSTRAINT IF EXISTS layette_user_status_check;

-- Novos campos
ALTER TABLE public.layette_user_items
  ADD COLUMN IF NOT EXISTS action       TEXT DEFAULT 'pendente',
  ADD COLUMN IF NOT EXISTS quantity_owned INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gift_from    TEXT;

-- Migrar status existente → action (corrige o bug planned/purchased/gifted/received)
UPDATE public.layette_user_items SET action = CASE
  WHEN status IN ('comprado', 'purchased') THEN 'comprado'
  WHEN status IN ('ganho', 'received', 'gifted') THEN 'ganho'
  WHEN status = 'dispensado' THEN 'dispensado'
  WHEN status IN ('nao_comprado', 'planned', 'pendente') THEN 'pendente'
  ELSE 'pendente'
END
WHERE action = 'pendente' OR action IS NULL;

-- Sincronizar quantity_owned
UPDATE public.layette_user_items
SET quantity_owned = COALESCE(quantity_purchased, 0) + COALESCE(quantity_received, 0);

-- Constraint nova
ALTER TABLE public.layette_user_items
  ADD CONSTRAINT layette_action_check CHECK (
    action IN ('pendente','comprado','ganho','comprar_eua','lembrar_depois','dispensado','alugado')
  );
