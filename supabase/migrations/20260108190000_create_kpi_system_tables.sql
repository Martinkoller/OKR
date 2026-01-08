-- Create profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create kpis table
CREATE TABLE IF NOT EXISTS public.kpis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  unit TEXT NOT NULL,
  owner_id UUID REFERENCES public.profiles(id),
  bu_id TEXT NOT NULL,
  weight NUMERIC DEFAULT 0,
  type TEXT DEFAULT 'QUANT',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Create kpi_measurements table for history
CREATE TABLE IF NOT EXISTS public.kpi_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kpi_id UUID REFERENCES public.kpis(id) ON DELETE CASCADE NOT NULL,
  value NUMERIC NOT NULL,
  comment TEXT,
  recorded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_onboarding table
CREATE TABLE IF NOT EXISTS public.user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kpi_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;

-- Policies (Permissive for demo purposes, strictly authenticated)
CREATE POLICY "Authenticated users can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Authenticated users can view kpis" ON public.kpis FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert kpis" ON public.kpis FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update kpis" ON public.kpis FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete kpis" ON public.kpis FOR DELETE TO authenticated USING (true);

CREATE POLICY "Authenticated users can view measurements" ON public.kpi_measurements FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert measurements" ON public.kpi_measurements FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update measurements" ON public.kpi_measurements FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete measurements" ON public.kpi_measurements FOR DELETE TO authenticated USING (true);

CREATE POLICY "Users can view own onboarding" ON public.user_onboarding FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update own onboarding" ON public.user_onboarding FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own onboarding" ON public.user_onboarding FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'full_name', 'Novo Usuário'));
  
  INSERT INTO public.user_onboarding (user_id, completed)
  VALUES (new.id, FALSE);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new auth users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
