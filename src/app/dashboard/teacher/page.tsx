import {
  BookOpenCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import { z } from "zod";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { profileRowSchema } from "@/lib/auth/roles";
import { requireRole } from "@/lib/auth/session";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Teacher Dashboard",
};

const profileListSchema = z.array(profileRowSchema);

export default async function TeacherDashboardPage() {
  const { profile } = await requireRole("teacher");
  const supabase = await createSupabaseServerClient();

  // RLS policy "Teachers can view student profiles" (using public.is_role('teacher'))
  // permits reading student profiles directly from the database.
  const { data: rawStudents } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .limit(20);

  const parsedStudents = profileListSchema.safeParse(rawStudents ?? []);
  const students = parsedStudents.success ? parsedStudents.data : [];

  return (
    <DashboardShell
      profile={profile}
      title="Teacher Workspace"
      subtitle="Manage question banks, author rich-text and KaTeX lessons, and monitor student progress."
    >
      {/* KPI Cards */}
      <section
        aria-label="Teacher overview metrics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Students
            </span>
            <Users className="h-5 w-5 text-amber-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">
            {students.length}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Authorized via <code className="font-mono">is_role(&apos;teacher&apos;)</code> RLS
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Question Bank
            </span>
            <BookOpenCheck className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-500">
            MCQ &amp; short-answer CRUD in upcoming milestone
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Bulk CSV Imports
            </span>
            <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">Ready</p>
          <p className="mt-1 text-xs text-slate-500">
            Batch import pipeline scheduled for Teacher Tools milestone
          </p>
        </div>
      </section>

      {/* Student Roster */}
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Enrolled Students Roster
            </h2>
            <p className="text-sm text-slate-600">
              Student profiles visible through PostgreSQL Row Level Security
              policy <code className="font-mono text-xs">Teachers can view student profiles</code>.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800 sm:self-auto">
            <GraduationCap className="h-3.5 w-3.5" />
            <span>{students.length} Students</span>
          </span>
        </div>

        {students.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center">
            <FileText className="mx-auto h-8 w-8 text-slate-400" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              No student accounts registered yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead>
                <tr className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="py-3 pr-4">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="py-3 pl-4">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => (
                  <tr key={student.id}>
                    <td className="py-3 pr-4 font-medium text-slate-900">
                      {student.full_name ?? "Unnamed Student"}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {student.email}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-semibold text-sky-700">
                        {student.role}
                      </span>
                    </td>
                    <td className="py-3 pl-4 text-slate-500">
                      {new Date(student.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </DashboardShell>
  );
}
