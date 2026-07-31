-- Lets a super_admin set/change another admin's password. Until now the
-- only way to set a password was at account creation (create_admin_user);
-- self-service reset is intentionally disabled (see useAuth.ts resetPassword),
-- so there was no way to rotate a forgotten or compromised password.
-- Run this manually against the self-hosted Postgres instance (pgAdmin).

CREATE OR REPLACE FUNCTION update_admin_password(p_id uuid, p_password text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT is_super_admin() THEN
    RAISE EXCEPTION 'Only super admins can change passwords';
  END IF;

  IF length(p_password) < 6 THEN
    RAISE EXCEPTION 'Password must be at least 6 characters';
  END IF;

  UPDATE profiles
  SET password_hash = crypt(p_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = p_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION update_admin_password(uuid, text) TO authenticated;
