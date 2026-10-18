-- Seed file: supabase/seed.sql
-- Creates pre-confirmed Admin, Teacher, and Student accounts in auth.users,
-- auth.identities, and assigns their roles in public.profiles.
--
-- Credentials created by this seed script:
--   1. Admin   -> admin@quizzsphere.com   / AdminPass123!
--   2. Teacher -> teacher@quizzsphere.com / TeacherPass123!
--   3. Student -> student@quizzsphere.com / StudentPass123!

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

DO $$
DECLARE
  v_admin_id   uuid := '00000000-0000-0000-0000-000000000001';
  v_teacher_id uuid := '00000000-0000-0000-0000-000000000002';
  v_student_id uuid := '00000000-0000-0000-0000-000000000003';
BEGIN
  -- 1. Seed Admin User (admin@quizzsphere.com / AdminPass123!)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@quizzsphere.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_admin_id,
      'authenticated',
      'authenticated',
      'admin@quizzsphere.com',
      extensions.crypt('AdminPass123!', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Platform Admin"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_admin_id,
      v_admin_id,
      v_admin_id::text,
      jsonb_build_object(
        'sub', v_admin_id::text,
        'email', 'admin@quizzsphere.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- 2. Seed Teacher User (teacher@quizzsphere.com / TeacherPass123!)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'teacher@quizzsphere.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_teacher_id,
      'authenticated',
      'authenticated',
      'teacher@quizzsphere.com',
      extensions.crypt('TeacherPass123!', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Teacher"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_teacher_id,
      v_teacher_id,
      v_teacher_id::text,
      jsonb_build_object(
        'sub', v_teacher_id::text,
        'email', 'teacher@quizzsphere.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- 3. Seed Student User (student@quizzsphere.com / StudentPass123!)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'student@quizzsphere.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_student_id,
      'authenticated',
      'authenticated',
      'student@quizzsphere.com',
      extensions.crypt('StudentPass123!', extensions.gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Demo Student"}'::jsonb,
      now(),
      now(),
      '',
      '',
      '',
      ''
    );

    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_student_id,
      v_student_id,
      v_student_id::text,
      jsonb_build_object(
        'sub', v_student_id::text,
        'email', 'student@quizzsphere.com',
        'email_verified', true,
        'phone_verified', false
      ),
      'email',
      now(),
      now(),
      now()
    ) ON CONFLICT DO NOTHING;
  END IF;

  -- 4. Ensure roles are assigned in public.profiles
  UPDATE public.profiles
  SET role = 'admin'::public.user_role,
      full_name = 'Platform Admin'
  WHERE email = 'admin@quizzsphere.com';

  UPDATE public.profiles
  SET role = 'teacher'::public.user_role,
      full_name = 'Demo Teacher'
  WHERE email = 'teacher@quizzsphere.com';

  UPDATE public.profiles
  SET role = 'student'::public.user_role,
      full_name = 'Demo Student'
  WHERE email = 'student@quizzsphere.com';
END
$$;
