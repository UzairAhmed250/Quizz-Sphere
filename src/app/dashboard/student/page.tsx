import {
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  Layers,
  Sparkles,
} from "lucide-react";
import type { Metadata } from "next";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { requireRole } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Student Dashboard",
};

export default async function StudentDashboardPage() {
  const { profile } = await requireRole("student");

  return (
    <DashboardShell
      profile={profile}
      title={`Welcome back, ${profile.full_name ?? "Student"}`}
      subtitle="Track your topic progress, daily study streak, and upcoming quiz sessions."
    >
      {/* KPI Cards */}
      <section
        aria-label="Student learning metrics"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completed Topics
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-500">
            Unlocks in Curriculum Milestone
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Average Score
            </span>
            <Award className="h-5 w-5 text-indigo-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">—%</p>
          <p className="mt-1 text-xs text-slate-500">
            Server-graded MCQ &amp; short answers
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Active Streak
            </span>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">1 day</p>
          <p className="mt-1 text-xs text-slate-500">
            Account active &amp; verified
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Enrolled Subjects
            </span>
            <Layers className="h-5 w-5 text-sky-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900">0</p>
          <p className="mt-1 text-xs text-slate-500">
            Subjects &gt; Topics &gt; Lessons
          </p>
        </div>
      </section>

      {/* Main Grid */}
      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <BookOpen className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-bold text-slate-900">
              Curriculum &amp; Practice Queue
            </h2>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Your student workspace is ready. In upcoming milestones, you will
            explore subjects, study lessons with rich text, images, and KaTeX
            math formulas, and complete server-graded quizzes here.
          </p>

          <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-indigo-500" />
            <h3 className="mt-2 text-sm font-semibold text-slate-900">
              No active topics assigned yet
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Once teachers publish subjects and topics, they will appear in
              your personalized study feed.
            </p>
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
          <h2 className="text-lg font-bold text-slate-900">
            Account &amp; Role Profile
          </h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between border-b border-slate-100 pb-2.5">
              <dt className="text-slate-500">Full Name</dt>
              <dd className="font-medium text-slate-900">
                {profile.full_name ?? "Not set"}
              </dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2.5">
              <dt className="text-slate-500">Email</dt>
              <dd className="font-medium text-slate-900">{profile.email}</dd>
            </div>
            <div className="flex justify-between border-b border-slate-100 pb-2.5">
              <dt className="text-slate-500">Role</dt>
              <dd className="font-semibold capitalize text-sky-700">
                {profile.role}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Joined</dt>
              <dd className="font-medium text-slate-900">
                {new Date(profile.created_at).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </aside>
      </div>
    </DashboardShell>
  );
}
