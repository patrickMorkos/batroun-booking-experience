-- Gallery Media table for the common area media carousel
CREATE TABLE public.gallery_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'image',
  title TEXT NOT NULL DEFAULT '',
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gallery_media ENABLE ROW LEVEL SECURITY;

-- Public can view gallery
CREATE POLICY "Anyone can view gallery media"
  ON public.gallery_media FOR SELECT
  USING (true);

-- Admins can insert
CREATE POLICY "Admins can insert gallery media"
  ON public.gallery_media FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Admins can update
CREATE POLICY "Admins can update gallery media"
  ON public.gallery_media FOR UPDATE
  TO authenticated
  USING (public.is_admin());

-- Admins can delete
CREATE POLICY "Admins can delete gallery media"
  ON public.gallery_media FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-media', 'gallery-media', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view gallery media files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'gallery-media');

CREATE POLICY "Admins can upload gallery media files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'gallery-media' AND public.is_admin());

CREATE POLICY "Admins can update gallery media files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'gallery-media' AND public.is_admin());

CREATE POLICY "Admins can delete gallery media files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'gallery-media' AND public.is_admin());
