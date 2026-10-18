# QuizzSphere — Online Learning Platform (Milestone 1: Auth & Roles)

Next.js (App Router) + TypeScript, Supabase (PostgreSQL, Auth, RLS), Tailwind CSS, Zod, and Vitest.

## Milestone 1 Deliverables

1. **Supabase Auth (Email Sign-Up, Sign-In, Sign-Out, PKCE Callback)**
   - [`src/app/login/page.tsx`](./src/app/login/page.tsx) & [`src/components/auth/LoginForm.tsx`](./src/components/auth/LoginForm.tsx)
   - [`src/app/signup/page.tsx`](./src/app/signup/page.tsx) & [`src/components/auth/SignUpForm.tsx`](./src/components/auth/SignUpForm.tsx)
   - [`src/app/auth/callback/route.ts`](./src/app/auth/callback/route.ts)
   - [`src/lib/auth/actions.ts`](./src/lib/auth/actions.ts) & [`src/lib/auth/schemas.ts`](./src/lib/auth/schemas.ts) (Zod-validated Server Actions)
2. **PostgreSQL `profiles` Table & `is_role()` RLS Helper**
   - [`supabase/migrations/20261018000001_init_auth_and_profiles.sql`](./supabase/migrations/20261018000001_init_auth_and_profiles.sql)
   - `public.user_role` enum (`'student' | 'teacher' | 'admin'`)
   - `public.profiles` linked to `auth.users(id) ON DELETE CASCADE`
   - `public.is_role(required_role public.user_role)` `SECURITY DEFINER` function used across `SELECT`, `INSERT`, `UPDATE`, and `DELETE` RLS policies
   - `public.handle_new_user()` trigger provisioning new sign-ups as `'student'` and `public.prevent_role_escalation()` trigger blocking non-admin role modifications
3. **Role-Based Route Protection & Dashboards**
   - [`src/middleware.ts`](./src/middleware.ts) & [`src/lib/supabase/middleware.ts`](./src/lib/supabase/middleware.ts)
   - [`src/lib/auth/roles.ts`](./src/lib/auth/roles.ts) (`isRole()`, `resolveRouteAccess()`, `canAccessRoute()`)
   - [`src/app/dashboard/student/page.tsx`](./src/app/dashboard/student/page.tsx) (`student` workspace)
   - [`src/app/dashboard/teacher/page.tsx`](./src/app/dashboard/teacher/page.tsx) (`teacher` workspace with RLS student roster)
   - [`src/app/dashboard/admin/page.tsx`](./src/app/dashboard/admin/page.tsx) (`admin` workspace with live role management)
4. **Vitest Unit & Security Test Suite**
   - [`src/lib/auth/__tests__/roles.test.ts`](./src/lib/auth/__tests__/roles.test.ts)
   - [`src/lib/auth/__tests__/schemas.test.ts`](./src/lib/auth/__tests__/schemas.test.ts)
   - [`src/lib/auth/__tests__/security-and-rls.test.ts`](./src/lib/auth/__tests__/security-and-rls.test.ts)

## Getting Started

1. **Configure Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

2. **Apply Database Migrations**
   Run the migration in [`supabase/migrations/20261018000001_init_auth_and_profiles.sql`](./supabase/migrations/20261018000001_init_auth_and_profiles.sql) via Supabase CLI (`supabase db push`) or the Supabase SQL Editor.

3. **Run Development Server & Tests**
   ```bash
   npm run dev
   npm test
   npm run typecheck
   npm run build
   ```
