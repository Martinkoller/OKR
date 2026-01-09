-- Migration to fix RLS policies for Business Units and other tables

-- 1. Business Units
ALTER TABLE public.business_units ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Authenticated users can view BUs" ON public.business_units;
DROP POLICY IF EXISTS "Authenticated users can manage BUs" ON public.business_units;
DROP POLICY IF EXISTS "Authenticated users can view business_units" ON public.business_units;
DROP POLICY IF EXISTS "Authenticated users can insert business_units" ON public.business_units;
DROP POLICY IF EXISTS "Authenticated users can update business_units" ON public.business_units;
DROP POLICY IF EXISTS "Authenticated users can delete business_units" ON public.business_units;

-- Create explicit policies
CREATE POLICY "Enable read access for authenticated users" ON public.business_units
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.business_units
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.business_units
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.business_units
  FOR DELETE TO authenticated USING (true);

-- 2. OKRs
ALTER TABLE public.okrs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view OKRs" ON public.okrs;
DROP POLICY IF EXISTS "Authenticated users can manage OKRs" ON public.okrs;

CREATE POLICY "Enable read access for authenticated users" ON public.okrs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.okrs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.okrs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.okrs
  FOR DELETE TO authenticated USING (true);

-- 3. Key Results
ALTER TABLE public.key_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view KRs" ON public.key_results;
DROP POLICY IF EXISTS "Authenticated users can manage KRs" ON public.key_results;

CREATE POLICY "Enable read access for authenticated users" ON public.key_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.key_results
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.key_results
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.key_results
  FOR DELETE TO authenticated USING (true);

-- 4. KPIs (Re-applying for consistency and ensuring INSERT works)
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view kpis" ON public.kpis;
DROP POLICY IF EXISTS "Authenticated users can insert kpis" ON public.kpis;
DROP POLICY IF EXISTS "Authenticated users can update kpis" ON public.kpis;
DROP POLICY IF EXISTS "Authenticated users can delete kpis" ON public.kpis;

CREATE POLICY "Enable read access for authenticated users" ON public.kpis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.kpis
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.kpis
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.kpis
  FOR DELETE TO authenticated USING (true);
