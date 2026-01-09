-- Fix RLS Policies for Admin Strategy Management
-- This migration drops existing restrictive policies and creates permissive ones for authenticated users
-- across Business Units, OKRs, KPIs, and related tables to ensure smooth CRUD operations.

-- 1. Business Units
ALTER TABLE IF EXISTS public.business_units ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.business_units;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.business_units;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.business_units;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.business_units;
DROP POLICY IF EXISTS "Authenticated users can view BUs" ON public.business_units;
DROP POLICY IF EXISTS "Authenticated users can manage BUs" ON public.business_units;

CREATE POLICY "Enable all access for authenticated users" ON public.business_units
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 2. OKRs
ALTER TABLE IF EXISTS public.okrs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.okrs;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.okrs;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.okrs;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.okrs;
DROP POLICY IF EXISTS "Authenticated users can view OKRs" ON public.okrs;
DROP POLICY IF EXISTS "Authenticated users can manage OKRs" ON public.okrs;

CREATE POLICY "Enable all access for authenticated users" ON public.okrs
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Key Results
ALTER TABLE IF EXISTS public.key_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.key_results;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.key_results;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.key_results;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.key_results;
DROP POLICY IF EXISTS "Authenticated users can view KRs" ON public.key_results;
DROP POLICY IF EXISTS "Authenticated users can manage KRs" ON public.key_results;

CREATE POLICY "Enable all access for authenticated users" ON public.key_results
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 4. KPIs
ALTER TABLE IF EXISTS public.kpis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.kpis;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.kpis;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.kpis;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.kpis;
DROP POLICY IF EXISTS "Authenticated users can view kpis" ON public.kpis;
DROP POLICY IF EXISTS "Authenticated users can manage kpis" ON public.kpis;

CREATE POLICY "Enable all access for authenticated users" ON public.kpis
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 5. KPI Measurements
ALTER TABLE IF EXISTS public.kpi_measurements ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.kpi_measurements;
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON public.kpi_measurements;
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON public.kpi_measurements;
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON public.kpi_measurements;

CREATE POLICY "Enable all access for authenticated users" ON public.kpi_measurements
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
