-- ============================================
-- Seed Data: Insert existing 9 chalets
-- Run AFTER migration.sql
-- ============================================

INSERT INTO public.chalets (name, slug, tagline, capacity, features, weekday_price, weekend_price, check_in, check_out, display_order) VALUES
  ('Ô Batroun 101', 'o-batroun-101', 'Cozy studio with Mediterranean charm', '4-5', ARRAY['Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Balcony', 'Sea View'], 50, 100, '3:00 PM', '11:00 AM', 0),
  ('Ô Batroun 102', 'o-batroun-102', 'Comfortable retreat for couples', '4-5', ARRAY['Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Balcony', 'Sea View'], 50, 100, '3:00 PM', '11:00 AM', 1),
  ('Ô Batroun 103', 'o-batroun-103', 'Stylish hideaway with garden views', '4-5', ARRAY['Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Balcony', 'Garden View'], 50, 100, '3:00 PM', '11:00 AM', 2),
  ('Ô Batroun 201', 'o-batroun-201', 'Luxury 3-bedroom with private jacuzzi', '12', ARRAY['Wi-Fi', 'Air Conditioning', 'Full Kitchen', 'Jacuzzi', 'Sea View', '3 Bedrooms', 'Living Room'], 50, 100, '3:00 PM', '11:00 AM', 3),
  ('Ô Batroun 202', 'o-batroun-202', 'Intimate studio with modern design', '3', ARRAY['Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Compact Balcony'], 50, 100, '3:00 PM', '11:00 AM', 4),
  ('Ô Batroun 203', 'o-batroun-203', 'Quiet corner with mountain breezes', '3', ARRAY['Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Mountain View'], 50, 100, '3:00 PM', '11:00 AM', 5),
  ('Ô Batroun 204', 'o-batroun-204', 'Bright studio with sunrise views', '3', ARRAY['Wi-Fi', 'Air Conditioning', 'Kitchenette', 'East-facing Balcony'], 50, 100, '3:00 PM', '11:00 AM', 6),
  ('Ô Batroun 205', 'o-batroun-205', 'Peaceful escape with lush garden outlook', '3', ARRAY['Wi-Fi', 'Air Conditioning', 'Kitchenette', 'Garden View'], 50, 100, '3:00 PM', '11:00 AM', 7),
  ('Ô Batroun Private', 'o-batroun-private', 'Exclusive 2-bedroom with private pool', '6', ARRAY['Wi-Fi', 'Air Conditioning', 'Full Kitchen', 'Private Pool', 'Sea View', '2 Bedrooms', 'BBQ Area'], 50, 100, '3:00 PM', '11:00 AM', 8);
