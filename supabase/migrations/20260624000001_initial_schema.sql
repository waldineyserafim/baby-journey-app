-- ============================================================
-- Baby Journey — Schema inicial
-- ============================================================

-- TENANTS
CREATE TABLE public.tenants (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  plan_type  text NOT NULL DEFAULT 'free',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id  uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  full_name  text NOT NULL,
  nickname   text,
  role       text NOT NULL DEFAULT 'partner',
  avatar_url text,
  phone      text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT profiles_role_check CHECK (role IN ('platform_admin','partner','family_viewer'))
);

-- Auto-criar profile no signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    'partner'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- PREGNANCIES
CREATE TABLE public.pregnancies (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id         uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  baby_name         text,
  baby_sex          text DEFAULT 'unknown',
  lmp_date          date NOT NULL,
  due_date          date NOT NULL,
  actual_birth_date date,
  status            text DEFAULT 'active',
  notes             text,
  created_at        timestamptz DEFAULT now(),
  updated_at        timestamptz DEFAULT now(),
  CONSTRAINT pregnancies_sex_check CHECK (baby_sex IN ('male','female','unknown')),
  CONSTRAINT pregnancies_status_check CHECK (status IN ('active','completed','archived'))
);

-- BABY DEVELOPMENT CONTENT (global)
CREATE TABLE public.baby_development_content (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  week                  int UNIQUE NOT NULL CHECK (week BETWEEN 1 AND 42),
  fruit_name            text NOT NULL,
  fruit_emoji           text,
  size_cm               numeric(5,1),
  weight_g              numeric(7,1),
  development_summary   text NOT NULL,
  organ_development     text,
  mom_changes           text,
  common_symptoms       text[],
  recommended_food      text,
  recommended_exercises text,
  important_care        text,
  curiosities           text,
  created_at            timestamptz DEFAULT now()
);

-- TIMELINE MILESTONES
CREATE TABLE public.timeline_milestones (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id   uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id      uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  milestone_type text NOT NULL,
  title          text NOT NULL,
  description    text,
  milestone_date date NOT NULL,
  week_number    int,
  is_public      bool DEFAULT false,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now()
);

CREATE TABLE public.milestone_media (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.timeline_milestones(id) ON DELETE CASCADE,
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  media_type   text NOT NULL,
  storage_path text NOT NULL,
  caption      text,
  created_at   timestamptz DEFAULT now()
);

-- APPOINTMENTS
CREATE TABLE public.appointments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id     uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id        uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  appointment_type text NOT NULL DEFAULT 'obstetric',
  title            text NOT NULL,
  doctor_name      text,
  clinic_name      text,
  appointment_at   timestamptz NOT NULL,
  notes            text,
  status           text DEFAULT 'scheduled',
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now(),
  CONSTRAINT appointments_type_check CHECK (appointment_type IN ('obstetric','specialized')),
  CONSTRAINT appointments_status_check CHECK (status IN ('scheduled','completed','cancelled'))
);

CREATE TABLE public.appointment_files (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  tenant_id      uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  storage_path   text NOT NULL,
  file_name      text NOT NULL,
  file_type      text NOT NULL,
  created_at     timestamptz DEFAULT now()
);

-- EXAMS
CREATE TABLE public.exams (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  exam_type    text NOT NULL DEFAULT 'laboratory',
  exam_name    text NOT NULL,
  doctor_name  text,
  clinic_name  text,
  exam_date    date NOT NULL,
  result       text,
  notes        text,
  week_number  int,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  CONSTRAINT exams_type_check CHECK (exam_type IN ('ultrasound','laboratory','complementary'))
);

CREATE TABLE public.exam_files (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id      uuid NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  storage_path text NOT NULL,
  file_name    text NOT NULL,
  file_type    text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

-- VACCINES
CREATE TABLE public.vaccines (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id   uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id      uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  vaccine_name   text NOT NULL,
  status         text DEFAULT 'pending',
  applied_date   date,
  scheduled_date date,
  notes          text,
  created_at     timestamptz DEFAULT now(),
  updated_at     timestamptz DEFAULT now(),
  CONSTRAINT vaccines_status_check CHECK (status IN ('applied','scheduled','pending'))
);

-- SYMPTOMS LOG
CREATE TABLE public.symptoms_log (
  id                       uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id             uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id                uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  log_date                 date NOT NULL,
  week_number              int,
  nausea_level             int CHECK (nausea_level BETWEEN 0 AND 10),
  vomiting                 bool DEFAULT false,
  heartburn_level          int CHECK (heartburn_level BETWEEN 0 AND 10),
  pain_description         text,
  swelling_level           int CHECK (swelling_level BETWEEN 0 AND 10),
  blood_pressure_systolic  int,
  blood_pressure_diastolic int,
  blood_glucose            numeric(5,1),
  weight_kg                numeric(5,2),
  notes                    text,
  created_at               timestamptz DEFAULT now(),
  UNIQUE (pregnancy_id, log_date)
);

-- PHOTOS
CREATE TABLE public.photos (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category     text NOT NULL DEFAULT 'belly',
  storage_path text NOT NULL,
  caption      text,
  photo_date   date NOT NULL,
  week_number  int,
  is_public    bool DEFAULT false,
  created_at   timestamptz DEFAULT now(),
  CONSTRAINT photos_category_check CHECK (category IN ('belly','ultrasound','events','maternity','family'))
);

-- DIARY ENTRIES
CREATE TABLE public.diary_entries (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id       uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id          uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  entry_date         date NOT NULL,
  week_number        int,
  content            text NOT NULL,
  mood               text,
  energy_level       int CHECK (energy_level BETWEEN 1 AND 5),
  photo_storage_path text,
  created_at         timestamptz DEFAULT now(),
  updated_at         timestamptz DEFAULT now(),
  UNIQUE (pregnancy_id, entry_date),
  CONSTRAINT diary_mood_check CHECK (mood IN ('happy','tired','anxious','excited','sad','neutral') OR mood IS NULL)
);

-- KICK COUNTS
CREATE TABLE public.kick_counts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id  uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  count_date    date NOT NULL,
  week_number   int,
  kick_count    int NOT NULL DEFAULT 0,
  session_start timestamptz,
  session_end   timestamptz,
  notes         text,
  created_at    timestamptz DEFAULT now()
);

-- CONTRACTIONS
CREATE TABLE public.contractions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id      uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id         uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  contraction_start timestamptz NOT NULL,
  contraction_end   timestamptz,
  duration_seconds  int,
  interval_seconds  int,
  intensity         text,
  notes             text,
  created_at        timestamptz DEFAULT now(),
  CONSTRAINT contractions_intensity_check CHECK (intensity IN ('mild','moderate','strong') OR intensity IS NULL)
);

-- LAYETTE CATALOG (global)
CREATE TABLE public.layette_catalog (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category            text NOT NULL,
  item_name           text NOT NULL,
  description         text,
  ideal_quantity      int DEFAULT 1,
  criticality         text NOT NULL DEFAULT 'IMPORTANTE',
  usage_period        text NOT NULL DEFAULT 'NO_NASCIMENTO',
  price_brl_min       numeric(10,2),
  price_brl_max       numeric(10,2),
  price_usd_min       numeric(10,2),
  price_usd_max       numeric(10,2),
  base_recommendation text DEFAULT 'COMPRAR_AGORA_BRASIL',
  is_active           bool DEFAULT true,
  sort_order          int DEFAULT 0,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  CONSTRAINT layette_category_check CHECK (category IN ('quarto','higiene','alimentacao','passeio','roupas')),
  CONSTRAINT layette_criticality_check CHECK (criticality IN ('CRITICO','IMPORTANTE','OPCIONAL')),
  CONSTRAINT layette_usage_check CHECK (usage_period IN ('NO_NASCIMENTO','ATE_3_MESES','ATE_6_MESES','APOS_6_MESES')),
  CONSTRAINT layette_rec_check CHECK (base_recommendation IN ('COMPRAR_AGORA_BRASIL','AGUARDAR_EUA','SO_PROMOCAO','RECEBER_PRESENTE','NAO_PRIORITARIO'))
);

-- LAYETTE USER ITEMS
CREATE TABLE public.layette_user_items (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  catalog_id          uuid NOT NULL REFERENCES public.layette_catalog(id),
  pregnancy_id        uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  quantity_ideal      int DEFAULT 1,
  quantity_purchased  int DEFAULT 0,
  quantity_received   int DEFAULT 0,
  status              text DEFAULT 'nao_comprado',
  planned_value       numeric(10,2),
  paid_value          numeric(10,2),
  store_name          text,
  purchase_date       date,
  discount_obtained   numeric(10,2),
  user_recommendation text,
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE (catalog_id, pregnancy_id),
  CONSTRAINT layette_user_status_check CHECK (status IN ('nao_comprado','comprado','ganho','dispensado'))
);

-- MOVE PLAN
CREATE TABLE public.move_plan (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id           uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  pregnancy_id        uuid REFERENCES public.pregnancies(id),
  planned_move_date   date NOT NULL,
  destination_city    text NOT NULL,
  destination_state   text NOT NULL,
  destination_country text DEFAULT 'US',
  notes               text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- HOSPITAL BAG ITEMS
CREATE TABLE public.hospital_bag_items (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id    uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  person       text NOT NULL DEFAULT 'mae',
  item_name    text NOT NULL,
  status       text DEFAULT 'pendente',
  notes        text,
  sort_order   int DEFAULT 0,
  created_at   timestamptz DEFAULT now(),
  updated_at   timestamptz DEFAULT now(),
  CONSTRAINT bag_person_check CHECK (person IN ('mae','bebe','pai','documentos')),
  CONSTRAINT bag_status_check CHECK (status IN ('pendente','pronto'))
);

-- BIRTH PLAN
CREATE TABLE public.birth_plan (
  id                         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pregnancy_id               uuid NOT NULL REFERENCES public.pregnancies(id) ON DELETE CASCADE,
  tenant_id                  uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  hospital_name              text,
  doctor_name                text,
  companion_name             text,
  analgesia_preference       text,
  music_preferences          text,
  pain_management_options    text[],
  birth_position_preferences text[],
  cord_cutting_preference    text,
  skin_to_skin               bool DEFAULT true,
  breastfeeding_intention    bool DEFAULT true,
  additional_notes           text,
  created_at                 timestamptz DEFAULT now(),
  updated_at                 timestamptz DEFAULT now(),
  UNIQUE (pregnancy_id)
);

-- DOCUMENTS
CREATE TABLE public.documents (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id     uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  pregnancy_id  uuid REFERENCES public.pregnancies(id),
  category      text NOT NULL DEFAULT 'medical',
  document_name text NOT NULL,
  storage_path  text NOT NULL,
  file_type     text NOT NULL,
  notes         text,
  created_at    timestamptz DEFAULT now(),
  updated_at    timestamptz DEFAULT now(),
  CONSTRAINT docs_category_check CHECK (category IN ('exams','medical','baby_docs','family_docs')),
  CONSTRAINT docs_type_check CHECK (file_type IN ('pdf','image'))
);

-- MOVE CHECKLIST ITEMS
CREATE TABLE public.move_checklist_items (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id  uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  category   text NOT NULL DEFAULT 'documentos',
  item_name  text NOT NULL,
  status     text DEFAULT 'pendente',
  due_date   date,
  notes      text,
  sort_order int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT move_status_check CHECK (status IN ('pendente','em_andamento','concluido'))
);

-- NOTIFICATIONS
CREATE TABLE public.notifications (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id      uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  user_id        uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type           text NOT NULL DEFAULT 'custom',
  title          text NOT NULL,
  message        text NOT NULL,
  scheduled_for  timestamptz NOT NULL,
  reference_id   uuid,
  reference_type text,
  is_read        bool DEFAULT false,
  is_sent        bool DEFAULT false,
  created_at     timestamptz DEFAULT now()
);

-- INDEXES
CREATE INDEX idx_profiles_tenant ON public.profiles(tenant_id);
CREATE INDEX idx_pregnancies_tenant ON public.pregnancies(tenant_id);
CREATE INDEX idx_pregnancies_status ON public.pregnancies(status);
CREATE INDEX idx_appointments_date ON public.appointments(appointment_at, tenant_id);
CREATE INDEX idx_appointments_status ON public.appointments(status);
CREATE INDEX idx_exams_date ON public.exams(exam_date, tenant_id);
CREATE INDEX idx_symptoms_date ON public.symptoms_log(log_date, pregnancy_id);
CREATE INDEX idx_photos_pregnancy ON public.photos(pregnancy_id, category);
CREATE INDEX idx_diary_date ON public.diary_entries(entry_date, pregnancy_id);
CREATE INDEX idx_kicks_date ON public.kick_counts(count_date, pregnancy_id);
CREATE INDEX idx_contractions_start ON public.contractions(contraction_start, pregnancy_id);
CREATE INDEX idx_layette_user_tenant ON public.layette_user_items(tenant_id, pregnancy_id);
CREATE INDEX idx_notifications_scheduled ON public.notifications(scheduled_for, is_sent);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_timeline_pregnancy ON public.timeline_milestones(pregnancy_id, milestone_date);
