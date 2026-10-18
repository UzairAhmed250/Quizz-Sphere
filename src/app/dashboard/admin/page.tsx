import {
  CheckCircle2,
  Shield,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { z } from "zod";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { updateUserRoleAction } from "@/lib/auth/actions";
import {
  profileRowSchema,
  ROLE_LABELS,
  USER_ROLES,
} from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
};

const profileListSchema = z.array(profileRowSchema);

interface AdminDashboardPageProps {
  searchParams: Promise<{
    updated?: string;
    error?: string;
  }>;
}

export default async function AdminDashboardPage({
  searchParams,
}: AdminDashboardPageProps) {
  const { profile } = await requireRole("admin");
  const resolvedParams = await searchParams;
  const supabase = await createSupabaseServerClient();

  // Authorized via PostgreSQL RLS policy "Admins can view all profiles" (public.is_role('admin'))
  const { data: rawProfiles } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  const parsedProfiles = profileListSchema.safeParse(rawProfiles ?? []);
  const allProfiles = parsedProfiles.success ? parsedProfiles.data : [];

  const studentCount = allProfiles.filter((p) => p.role === "student").length;
  const teacherCount = allProfiles.filter((p) => p.role === "teacher").length;
  const adminCount = allProfiles.filter((p) => p.role === "admin").length;

  return (
    <DashboardShell
      profile={profile}
      title="Administrator Console"
      subtitle="Manage platform users, role assignments, and database security policies."
    >
      {resolvedParams.updated === "true" && (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-900"
        >
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          <span>User role updated and persisted via Supabase RLS.</span>
        </div>
      )}

      {/* Role Distribution Cards */}
      <section
        aria-label="User role distribution"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Profiles
            </span>
            <Users className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {allProfiles.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">Linked to auth.users</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Students
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-sky-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {studentCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Default signup role</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Teachers
            </span>
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {teacherCount}
          </p>
          <p className="mt-1 text-xs text-slate-500">Curriculum authors</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Administrators
            </span>
            <Shield className="h-5 w-5 text-purple-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">{adminCount}</p>
          <p className="mt-1 text-xs text-slate-500">Full platform control</p>
        </div>
      </section>

      {/* User & Role Management Table */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              User &amp; Role Management
            </h2>
            <p className="text-sm text-slate-600">
              Update roles directly. Enforced in Postgres by{" "}
              <code className="font-mono text-xs">
                public.is_role(&apos;admin&apos;)
              </code>{" "}
              and the{" "}
              <code className="font-mono text-xs">
                prevent_role_escalation()
              </code>{" "}
              trigger.
            </p>
          </div>

          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800 sm:self-auto">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>RLS Admin Policy Active</span>
          </span>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
            <thead>
              <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-3 pr-4">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Current Role</th>
                <th className="py-3 pl-4">Change Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allProfiles.map((userProfile) => (
                <tr key={userProfile.id}>
                  <td className="py-3.5 pr-4 font-medium text-slate-900">
                    {userProfile.full_name ?? "Platform User"}
                    {userProfile.id === profile.id && (
                      <span className="ml-2 rounded-md bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600">
                        You
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">
                    {userProfile.email}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold capitalize text-slate-800">
                      {userProfile.role}
                    </span>
                  </td>
                  <td className="py-3.5 pl-4">
                    <form
                      action={updateUserRoleAction}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="hidden"
                        name="userId"
                        value={userProfile.id}
                      />
                      <label
                        htmlFor={`role-select-${userProfile.id}`}
                        className="sr-only"
                      >
                        Role for {userProfile.email}
                      </label>
                      <select
                        id={`role-select-${userProfile.id}`}
                        name="role"
                        defaultValue={userProfile.role}
                        className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                      >
                        {USER_ROLES.map((roleOption) => (
                          <option key={roleOption} value={roleOption}>
                            {ROLE_LABELS[roleOption]}
                          </option>
                        ))}
                      </select>
                      <button
                        type="submit"
                        className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700"
                      >
                        Save
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </DashboardShell>
  );
}
