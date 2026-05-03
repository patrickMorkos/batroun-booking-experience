-- ============================================
-- Site Images - Supabase Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Create site_images table
CREATE TABLE public.site_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. RLS policies
ALTER TABLE public.site_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view site images"
  ON public.site_images FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert site images"
  ON public.site_images FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update site images"
  ON public.site_images FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admins can delete site images"
  ON public.site_images FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 3. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-images', 'site-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view site images storage"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'site-images');

CREATE POLICY "Admins can upload site images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'site-images' AND public.is_admin());

CREATE POLICY "Admins can update site images storage"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin());

CREATE POLICY "Admins can delete site images storage"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'site-images' AND public.is_admin());
