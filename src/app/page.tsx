import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Lock,
  Shield,
  Users,
} from "lucide-react";
import Link from "next/link";
import { getDashboardPathForRole, ROLE_LABELS } from "@/lib/auth/roles";
import { getCurrentUserWithProfile } from "@/lib/auth/session";
import { isSupabaseConfigured } from "@/lib/env";

export default async function HomePage() {
  const configured = isSupabaseConfigured();
  const session = configured ? await getCurrentUserWithProfile() : null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              QuizzSphere
            </span>
            <span className="hidden rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-700 sm:inline-block">
              Milestone 1: Auth &amp; Roles
            </span>
          </div>

          <div className="flex items-center gap-3">
            {session ? (
              <Link
                href={getDashboardPathForRole(session.profile.role)}
                className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500"
              >
                <span>Open {ROLE_LABELS[session.profile.role]} Dashboard</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Hero */}
      <main className="mx-auto flex-1 max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
        {!configured && (
          <div className="mb-10 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Supabase Environment Setup Pending
                </h2>
                <p className="mt-1 text-xs text-amber-800 sm:text-sm">
                  Copy <code className="font-mono font-semibold">.env.example</code>{" "}
                  to <code className="font-mono font-semibold">.env.local</code>{" "}
                  and populate your Supabase URL and keys, then apply{" "}
                  <code className="font-mono font-semibold">
                    supabase/migrations/20261018000001_init_auth_and_profiles.sql
                  </code>
                  .
                </p>
              </div>
              <Link
                href="/login"
                className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-xl bg-amber-900 px-3.5 py-2 text-xs font-semibold text-white hover:bg-amber-800 sm:self-auto"
              >
                <span>Preview Auth UI</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}

        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-700">
            <Lock className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Database-Enforced Row Level Security (RLS)</span>
          </span>

          <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Master complex subjects with{" "}
            <span className="text-indigo-600">role-tailored</span> workspaces
          </h1>

          <p className="mt-6 text-base leading-relaxed text-slate-600 sm:text-lg">
            Built with Next.js App Router, strict TypeScript, Zod validation,
            and Supabase PostgreSQL Row Level Security. Separate dashboards and
            permissions for students, teachers, and administrators.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            {session ? (
              <Link
                href={getDashboardPathForRole(session.profile.role)}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:w-auto"
              >
                <span>Continue to {ROLE_LABELS[session.profile.role]} Dashboard</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 sm:w-auto"
                >
                  <span>Create Student Account</span>
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 sm:w-auto"
                >
                  Sign In to Workspace
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Role Cards */}
        <section
          aria-label="Platform roles"
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
              <BookOpen className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Student Workspace
            </h2>
            <p className="mt-2 flex-1 text-sm text-slate-600">
              Study structured subjects and topics, practice server-graded MCQ
              and short-answer questions, and track topic mastery and streaks.
            </p>
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Automatic student profile on sign-up</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Protected route: /dashboard/student</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Teacher Workspace
            </h2>
            <p className="mt-2 flex-1 text-sm text-slate-600">
              Author rich-text and KaTeX questions, import question banks via
              CSV, and monitor student progress and completion metrics.
            </p>
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>RLS read access to student profiles via is_role()</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Protected route: /dashboard/teacher</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-2xs sm:col-span-2 lg:col-span-1">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Shield className="h-5 w-5" aria-hidden="true" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">
              Admin Workspace
            </h2>
            <p className="mt-2 flex-1 text-sm text-slate-600">
              Manage platform users, promote roles between Student, Teacher, and
              Admin, and oversee curriculum hierarchy and security policies.
            </p>
            <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Full profile &amp; role management via is_role(&apos;admin&apos;)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Protected route: /dashboard/admin</span>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
