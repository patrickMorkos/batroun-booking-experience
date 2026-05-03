-- ============================================
-- Ô Batroun Admin Panel - Supabase Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create chalets table
CREATE TABLE public.chalets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tagline TEXT NOT NULL,
  capacity TEXT,
  features TEXT[] DEFAULT '{}',
  weekday_price NUMERIC NOT NULL DEFAULT 0,
  weekend_price NUMERIC NOT NULL DEFAULT 0,
  check_in TEXT NOT NULL DEFAULT '3:00 PM',
  check_out TEXT NOT NULL DEFAULT '11:00 AM',
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create chalet_images table
CREATE TABLE public.chalet_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chalet_id UUID NOT NULL REFERENCES public.chalets(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create page_views table
CREATE TABLE public.page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL,
  chalet_slug TEXT,
  session_id TEXT NOT NULL,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for analytics queries
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
CREATE INDEX idx_page_views_chalet_slug ON public.page_views(chalet_slug) WHERE chalet_slug IS NOT NULL;

-- 5. Helper functions (SECURITY DEFINER to avoid RLS recursion)

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid());
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin');
$$;

-- 6. Row Level Security Policies

-- Profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view profiles"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Super admins can insert profiles"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can update profiles"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (public.is_super_admin());

CREATE POLICY "Super admins can delete profiles"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- Chalets
ALTER TABLE public.chalets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active chalets"
  ON public.chalets FOR SELECT
  TO anon, authenticated
  USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins can insert chalets"
  ON public.chalets FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update chalets"
  ON public.chalets FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete chalets"
  ON public.chalets FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Chalet Images
ALTER TABLE public.chalet_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view chalet images"
  ON public.chalet_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert chalet images"
  ON public.chalet_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update chalet images"
  ON public.chalet_images FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete chalet images"
  ON public.chalet_images FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Page Views
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON public.page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can view page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- 6. Database Functions for Analytics

CREATE OR REPLACE FUNCTION get_daily_page_views(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE(day DATE, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT DATE(created_at) as day, COUNT(*) as count
  FROM public.page_views
  WHERE created_at >= start_date AND created_at <= end_date
  GROUP BY DATE(created_at)
  ORDER BY day ASC;
$$;

CREATE OR REPLACE FUNCTION get_chalet_page_views(start_date TIMESTAMPTZ, end_date TIMESTAMPTZ)
RETURNS TABLE(chalet_slug TEXT, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT chalet_slug, COUNT(*) as count
  FROM public.page_views
  WHERE created_at >= start_date AND created_at <= end_date
    AND chalet_slug IS NOT NULL
  GROUP BY chalet_slug
  ORDER BY count DESC;
$$;

-- 7. Storage bucket (run this in the Supabase Dashboard > Storage section)
-- Create a new PUBLIC bucket called "chalet-images"
-- Then add these policies via SQL:

INSERT INTO storage.buckets (id, name, public) VALUES ('chalet-images', 'chalet-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view chalet images storage"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'chalet-images');

CREATE POLICY "Admins can upload chalet images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'chalet-images'
    AND public.is_admin()
  );

CREATE POLICY "Admins can delete chalet images storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'chalet-images'
    AND public.is_admin()
  );
