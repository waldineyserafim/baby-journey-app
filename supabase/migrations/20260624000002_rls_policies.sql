-- ============================================================
-- Baby Journey — Row Level Security Policies
-- ============================================================

-- Helper functions
CREATE OR REPLACE FUNCTION public.auth_tenant_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.auth_role()
RETURNS text LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid()
$$;

-- Enable RLS on all tables
ALTER TABLE public.tenants             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pregnancies         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timeline_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestone_media     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_files   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exams               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_files          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vaccines            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptoms_log        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.photos              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diary_entries       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kick_counts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractions        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layette_catalog     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.layette_user_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_plan           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hospital_bag_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.birth_plan          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.move_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- TENANTS
-- ============================================================
CREATE POLICY "tenant_select_own" ON public.tenants
  FOR SELECT USING (id = auth_tenant_id() OR auth_role() = 'platform_admin');

CREATE POLICY "tenant_admin_all" ON public.tenants
  FOR ALL USING (auth_role() = 'platform_admin');

-- ============================================================
-- PROFILES
-- ============================================================
CREATE POLICY "profiles_select_own_tenant" ON public.profiles
  FOR SELECT USING (
    tenant_id = auth_tenant_id()
    OR id = auth.uid()
    OR auth_role() = 'platform_admin'
  );

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid() OR auth_role() = 'platform_admin');

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- ============================================================
-- PREGNANCIES
-- ============================================================
CREATE POLICY "pregnancies_select" ON public.pregnancies
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');

CREATE POLICY "pregnancies_write" ON public.pregnancies
  FOR INSERT WITH CHECK (
    tenant_id = auth_tenant_id()
    AND auth_role() IN ('partner', 'platform_admin')
  );

CREATE POLICY "pregnancies_update" ON public.pregnancies
  FOR UPDATE USING (
    tenant_id = auth_tenant_id()
    AND auth_role() IN ('partner', 'platform_admin')
  );

CREATE POLICY "pregnancies_delete" ON public.pregnancies
  FOR DELETE USING (
    tenant_id = auth_tenant_id()
    AND auth_role() IN ('partner', 'platform_admin')
  );

-- ============================================================
-- BABY DEVELOPMENT CONTENT (global read)
-- ============================================================
CREATE POLICY "baby_dev_read_all" ON public.baby_development_content
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "baby_dev_admin_write" ON public.baby_development_content
  FOR ALL USING (auth_role() = 'platform_admin');

-- ============================================================
-- TIMELINE MILESTONES
-- ============================================================
CREATE POLICY "milestones_select" ON public.timeline_milestones
  FOR SELECT USING (
    tenant_id = auth_tenant_id()
    AND (is_public = true OR auth_role() IN ('partner', 'platform_admin'))
    OR auth_role() = 'platform_admin'
  );

CREATE POLICY "milestones_write" ON public.timeline_milestones
  FOR ALL USING (
    tenant_id = auth_tenant_id()
    AND auth_role() IN ('partner', 'platform_admin')
  );

-- ============================================================
-- MILESTONE MEDIA
-- ============================================================
CREATE POLICY "milestone_media_select" ON public.milestone_media
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');

CREATE POLICY "milestone_media_write" ON public.milestone_media
  FOR ALL USING (
    tenant_id = auth_tenant_id()
    AND auth_role() IN ('partner', 'platform_admin')
  );

-- ============================================================
-- Macro para tabelas com acesso padrão por tenant
-- partner pode tudo, family_viewer somente lê
-- ============================================================

-- APPOINTMENTS
CREATE POLICY "appointments_select" ON public.appointments
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "appointments_write" ON public.appointments
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

CREATE POLICY "appt_files_select" ON public.appointment_files
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "appt_files_write" ON public.appointment_files
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- EXAMS
CREATE POLICY "exams_select" ON public.exams
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "exams_write" ON public.exams
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

CREATE POLICY "exam_files_select" ON public.exam_files
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "exam_files_write" ON public.exam_files
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- VACCINES
CREATE POLICY "vaccines_select" ON public.vaccines
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "vaccines_write" ON public.vaccines
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- SYMPTOMS
CREATE POLICY "symptoms_select" ON public.symptoms_log
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "symptoms_write" ON public.symptoms_log
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- PHOTOS (family_viewer vê somente is_public=true)
CREATE POLICY "photos_select_partner" ON public.photos
  FOR SELECT USING (
    (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'))
    OR (tenant_id = auth_tenant_id() AND is_public = true)
  );
CREATE POLICY "photos_write" ON public.photos
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- DIARY (privado — somente partner)
CREATE POLICY "diary_select" ON public.diary_entries
  FOR SELECT USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));
CREATE POLICY "diary_write" ON public.diary_entries
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- KICKS
CREATE POLICY "kicks_select" ON public.kick_counts
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "kicks_write" ON public.kick_counts
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- CONTRACTIONS
CREATE POLICY "contractions_select" ON public.contractions
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "contractions_write" ON public.contractions
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- LAYETTE CATALOG (global read)
CREATE POLICY "layette_catalog_read" ON public.layette_catalog
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
CREATE POLICY "layette_catalog_admin" ON public.layette_catalog
  FOR ALL USING (auth_role() = 'platform_admin');

-- LAYETTE USER ITEMS
CREATE POLICY "layette_user_select" ON public.layette_user_items
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "layette_user_write" ON public.layette_user_items
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- MOVE PLAN
CREATE POLICY "move_plan_select" ON public.move_plan
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "move_plan_write" ON public.move_plan
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- HOSPITAL BAG
CREATE POLICY "bag_select" ON public.hospital_bag_items
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "bag_write" ON public.hospital_bag_items
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- BIRTH PLAN
CREATE POLICY "birth_plan_select" ON public.birth_plan
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "birth_plan_write" ON public.birth_plan
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- DOCUMENTS
CREATE POLICY "docs_select" ON public.documents
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "docs_write" ON public.documents
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- MOVE CHECKLIST
CREATE POLICY "move_checklist_select" ON public.move_checklist_items
  FOR SELECT USING (tenant_id = auth_tenant_id() OR auth_role() = 'platform_admin');
CREATE POLICY "move_checklist_write" ON public.move_checklist_items
  FOR ALL USING (tenant_id = auth_tenant_id() AND auth_role() IN ('partner','platform_admin'));

-- NOTIFICATIONS
CREATE POLICY "notifications_select" ON public.notifications
  FOR SELECT USING (user_id = auth.uid() OR auth_role() = 'platform_admin');
CREATE POLICY "notifications_update" ON public.notifications
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "notifications_insert" ON public.notifications
  FOR INSERT WITH CHECK (
    tenant_id = auth_tenant_id()
    AND auth_role() IN ('partner','platform_admin')
  );
