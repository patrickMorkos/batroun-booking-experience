-- ============================================
-- FIX: Infinite recursion in profiles RLS
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- Drop the broken policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can update profiles" ON public.profiles;
DROP POLICY IF EXISTS "Super admins can delete profiles" ON public.profiles;

DROP POLICY IF EXISTS "Anyone can view active chalets" ON public.chalets;
DROP POLICY IF EXISTS "Admins can insert chalets" ON public.chalets;
DROP POLICY IF EXISTS "Admins can update chalets" ON public.chalets;
DROP POLICY IF EXISTS "Admins can delete chalets" ON public.chalets;

DROP POLICY IF EXISTS "Admins can insert chalet images" ON public.chalet_images;
DROP POLICY IF EXISTS "Admins can update chalet images" ON public.chalet_images;
DROP POLICY IF EXISTS "Admins can delete chalet images" ON public.chalet_images;

DROP POLICY IF EXISTS "Admins can view page views" ON public.page_views;

DROP POLICY IF EXISTS "Admins can upload chalet images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete chalet images storage" ON storage.objects;

-- Create helper functions that bypass RLS (SECURITY DEFINER)
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

-- Recreate profiles policies using helper functions
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

-- Recreate chalets policies
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

-- Recreate chalet_images policies
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

-- Recreate page_views policy
CREATE POLICY "Admins can view page views"
  ON public.page_views FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Recreate storage policies
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
