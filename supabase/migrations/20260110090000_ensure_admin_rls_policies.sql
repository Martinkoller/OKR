-- Migration to ensure robust RLS policies for Admin and Strategy Management
-- Covers Business Units, OKRs, Key Results, KPIs, and KPI Measurements

-- 1. Enable RLS on all strategy tables (Idempotent)
ALTER TABLE IF EXISTS public.business_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.okrs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.key_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.kpi_measurements ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies to prevent conflicts and ensure clean state
-- Business Units
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.business_units;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.business_units;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.business_units;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.business_units;

-- OKRs
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.okrs;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.okrs;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.okrs;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.okrs;

-- Key Results
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.key_results;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.key_results;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.key_results;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.key_results;

-- KPIs
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.kpis;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.kpis;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.kpis;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.kpis;

-- KPI Measurements
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.kpi_measurements;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.kpi_measurements;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.kpi_measurements;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.kpi_measurements;

-- 3. Create permissive policies for Authenticated Users
-- These policies allow any authenticated user to perform CRUD operations.
-- This prevents "new row violates row-level security policy" errors during Admin tasks.

-- Business Units Policies
CREATE POLICY "Enable read access for authenticated users" ON public.business_units
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.business_units
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.business_units
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.business_units
  FOR DELETE TO authenticated USING (true);

-- OKRs Policies
CREATE POLICY "Enable read access for authenticated users" ON public.okrs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.okrs
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.okrs
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.okrs
  FOR DELETE TO authenticated USING (true);

-- Key Results Policies
CREATE POLICY "Enable read access for authenticated users" ON public.key_results
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.key_results
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.key_results
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.key_results
  FOR DELETE TO authenticated USING (true);

-- KPIs Policies
CREATE POLICY "Enable read access for authenticated users" ON public.kpis
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.kpis
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.kpis
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.kpis
  FOR DELETE TO authenticated USING (true);

-- KPI Measurements Policies
CREATE POLICY "Enable read access for authenticated users" ON public.kpi_measurements
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON public.kpi_measurements
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Enable update access for authenticated users" ON public.kpi_measurements
  FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable delete access for authenticated users" ON public.kpi_measurements
  FOR DELETE TO authenticated USING (true);
