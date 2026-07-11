-- NutriFit Pro initial schema

CREATE TYPE plan_type AS ENUM ('diet', 'workout', 'combined');
CREATE TYPE plan_status AS ENUM ('draft', 'active', 'archived', 'completed');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE report_format AS ENUM ('preview', 'pdf', 'docx');

CREATE TABLE business_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  professional_name TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  website TEXT NOT NULL DEFAULT '',
  logo_url TEXT,
  signature_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE,
  gender gender_type,
  phone TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  measured_at DATE NOT NULL,
  weight NUMERIC(6,2),
  height NUMERIC(6,2),
  bmi NUMERIC(5,2),
  body_fat_percent NUMERIC(5,2),
  chest NUMERIC(6,2),
  waist NUMERIC(6,2),
  hip NUMERIC(6,2),
  arm NUMERIC(6,2),
  thigh NUMERIC(6,2),
  calf NUMERIC(6,2),
  neck NUMERIC(6,2),
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type plan_type NOT NULL,
  status plan_status NOT NULL DEFAULT 'draft',
  current_revision_number INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plan_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(plan_id, revision_number)
);

CREATE TABLE foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  calories NUMERIC(8,2),
  protein NUMERIC(8,2),
  carbs NUMERIC(8,2),
  fat NUMERIC(8,2),
  unit TEXT NOT NULL DEFAULT 'g',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT true,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  muscle_group TEXT NOT NULL DEFAULT '',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT true,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  type plan_type NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_revision_id UUID NOT NULL REFERENCES plan_revisions(id) ON DELETE CASCADE,
  practitioner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  format report_format NOT NULL DEFAULT 'preview',
  generated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_clients_practitioner ON clients(practitioner_id);
CREATE INDEX idx_measurements_client ON measurements(client_id);
CREATE INDEX idx_plans_client ON plans(client_id);
CREATE INDEX idx_plan_revisions_plan ON plan_revisions(plan_id);
CREATE INDEX idx_foods_practitioner ON foods(practitioner_id);
CREATE INDEX idx_exercises_practitioner ON exercises(practitioner_id);
CREATE INDEX idx_templates_practitioner ON plan_templates(practitioner_id);
CREATE INDEX idx_reports_practitioner ON reports(practitioner_id);

ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY business_settings_policy ON business_settings FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY clients_policy ON clients FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY measurements_policy ON measurements FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY plans_policy ON plans FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY plan_revisions_policy ON plan_revisions FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY foods_policy ON foods FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY exercises_policy ON exercises FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY plan_templates_policy ON plan_templates FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());
CREATE POLICY reports_policy ON reports FOR ALL USING (practitioner_id = auth.uid()) WITH CHECK (practitioner_id = auth.uid());

INSERT INTO storage.buckets (id, name, public) VALUES ('business-assets', 'business-assets', false) ON CONFLICT DO NOTHING;

CREATE POLICY business_assets_select ON storage.objects FOR SELECT USING (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY business_assets_insert ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY business_assets_update ON storage.objects FOR UPDATE USING (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY business_assets_delete ON storage.objects FOR DELETE USING (bucket_id = 'business-assets' AND auth.uid()::text = (storage.foldername(name))[1]);
