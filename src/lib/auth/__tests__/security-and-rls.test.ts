import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";
import { updateSessionAndEnforceRoles } from "@/lib/supabase/middleware";

describe("Database RLS migration & security invariants", () => {
  const migrationPath = resolve(
    process.cwd(),
    "supabase/migrations/20261018000001_init_auth_and_profiles.sql",
  );
  const migrationSql = readFileSync(migrationPath, "utf8");

  it("defines the user_role enum with student, teacher, and admin", () => {
    expect(migrationSql).toContain(
      "CREATE TYPE public.user_role AS ENUM ('student', 'teacher', 'admin')",
    );
  });

  it("creates the profiles table linked to auth.users with RLS enabled and forced", () => {
    expect(migrationSql).toContain("CREATE TABLE IF NOT EXISTS public.profiles");
    expect(migrationSql).toContain("REFERENCES auth.users(id) ON DELETE CASCADE");
    expect(migrationSql).toContain(
      "ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY",
    );
    expect(migrationSql).toContain(
      "ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY",
    );
  });

  it("defines the public.is_role() helper and uses it in RLS policies", () => {
    expect(migrationSql).toContain(
      "CREATE OR REPLACE FUNCTION public.is_role(required_role public.user_role)",
    );
    expect(migrationSql).toContain("public.is_role('teacher'::public.user_role)");
    expect(migrationSql).toContain("public.is_role('admin'::public.user_role)");
    expect(migrationSql).toContain("public.is_role('student'::public.user_role)");
  });

  it("never exposes SUPABASE_SERVICE_ROLE_KEY in client components", () => {
    const clientFiles = [
      "src/components/auth/LoginForm.tsx",
      "src/components/auth/SignUpForm.tsx",
      "src/components/dashboard/DashboardShell.tsx",
      "src/lib/supabase/client.ts",
      "src/lib/env.ts",
    ];

    for (const relativePath of clientFiles) {
      const content = readFileSync(resolve(process.cwd(), relativePath), "utf8");
      expect(content).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
      expect(content).not.toContain("env.server");
      expect(content).not.toContain("supabase/admin");
    }
  });

  it("protects /dashboard routes in middleware even when env vars are unconfigured", async () => {
    const request = new NextRequest(
      new URL("http://localhost:3000/dashboard/admin"),
    );
    const response = await updateSessionAndEnforceRoles(request);

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/login?error=supabase_not_configured",
    );
  });
});
