-- Create Business Units table
CREATE TABLE IF NOT EXISTS public.business_units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  slug TEXT,
  parent_id UUID REFERENCES public.business_units(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create OKRs table
CREATE TABLE IF NOT EXISTS public.okrs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  bu_id UUID REFERENCES public.business_units(id) ON DELETE CASCADE NOT NULL,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  scope TEXT DEFAULT 'ANNUAL',
  start_date DATE,
  end_date DATE,
  weight NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'DRAFT',
  progress NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create Key Results table
CREATE TABLE IF NOT EXISTS public.key_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  okr_id UUID REFERENCES public.okrs(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  unit TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clean up existing data to allow type change if necessary
TRUNCATE TABLE public.kpi_measurements CASCADE;
TRUNCATE TABLE public.kpis CASCADE;

-- Alter KPIs table to link to Business Units
ALTER TABLE public.kpis 
  ALTER COLUMN bu_id TYPE UUID USING bu_id::uuid,
  ADD CONSTRAINT kpis_bu_id_fkey FOREIGN KEY (bu_id) REFERENCES public.business_units(id);

-- Enable RLS
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Authenticated users can view BUs" ON public.business_units FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage BUs" ON public.business_units FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view OKRs" ON public.okrs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage OKRs" ON public.okrs FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated users can view KRs" ON public.key_results FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage KRs" ON public.key_results FOR ALL TO authenticated USING (true);
