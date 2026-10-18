-- Migration: 20261018000001_init_auth_and_profiles.sql
-- Description: Milestone 1 - User roles enum, profiles table linked to auth.users,
--              is_role() security helper function, triggers, and strict RLS policies.

-- 1. Create the user_role enum type
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typnamespace = 'public'::regnamespace) THEN
    CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin');
  END IF;
END
$$;

-- 2. Create the profiles table linked to auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  role public.user_role NOT NULL DEFAULT 'student'::public.user_role,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_email_not_empty CHECK (char_length(trim(email)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 3. Create the is_role() helper function used in RLS policies
-- SECURITY DEFINER with explicit search_path prevents infinite RLS recursion when querying public.profiles
CREATE OR REPLACE FUNCTION public.is_role(required_role public.user_role)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = required_role
  );
$$;

REVOKE ALL ON FUNCTION public.is_role(public.user_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_role(public.user_role) TO authenticated, service_role;

-- 4. Keep updated_at current on profile modifications
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. Prevent non-admin users from escalating or changing their role on update
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    -- Allow service_role / postgres superuser (where auth.uid() is null in direct admin contexts)
    -- or authenticated admins verified via public.is_role('admin')
    IF auth.uid() IS NOT NULL AND NOT public.is_role('admin'::public.user_role) THEN
      RAISE EXCEPTION 'Unauthorized: only admins can modify user roles.'
        USING ERRCODE = '42501';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_role_change_security ON public.profiles;
CREATE TRIGGER enforce_role_change_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 6. Automatically create a student profile when a new auth.users entry is created
-- Never trust client-supplied raw_user_meta_data for role assignment to prevent privilege escalation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'full_name', '')), ''),
    NULLIF(trim(COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')), ''),
    'student'::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. Enable and force Row Level Security on public.profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

-- SELECT policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Teachers can view student profiles" ON public.profiles;
CREATE POLICY "Teachers can view student profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    public.is_role('teacher'::public.user_role)
    AND role = 'student'::public.user_role
  );

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (public.is_role('admin'::public.user_role));

-- INSERT policies
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
CREATE POLICY "Admins can insert profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_role('admin'::public.user_role));

-- UPDATE policies
DROP POLICY IF EXISTS "Users can update own profile without changing role" ON public.profiles;
CREATE POLICY "Users can update own profile without changing role"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      (role = 'student'::public.user_role AND public.is_role('student'::public.user_role))
      OR (role = 'teacher'::public.user_role AND public.is_role('teacher'::public.user_role))
      OR public.is_role('admin'::public.user_role)
    )
  );

DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;
CREATE POLICY "Admins can update any profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (public.is_role('admin'::public.user_role))
  WITH CHECK (public.is_role('admin'::public.user_role));

-- DELETE policies
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
CREATE POLICY "Admins can delete profiles"
  ON public.profiles
  FOR DELETE
  TO authenticated
  USING (public.is_role('admin'::public.user_role));
