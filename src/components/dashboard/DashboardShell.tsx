"use client";

import {
  BookOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { signOutAction } from "@/lib/auth/actions";
import {
  getDashboardPathForRole,
  ROLE_LABELS,
  type Profile,
  type UserRole,
} from "@/lib/auth/roles";

interface DashboardShellProps {
  profile: Profile;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

const ROLE_BADGE_STYLES: Readonly<Record<UserRole, string>> = {
  student: "bg-sky-50 text-sky-700 border-sky-200",
  teacher: "bg-amber-50 text-amber-800 border-amber-200",
  admin: "bg-purple-50 text-purple-800 border-purple-200",
};

export function DashboardShell({
  profile,
  title,
  subtitle,
  children,
}: DashboardShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dashboardHref = getDashboardPathForRole(profile.role);
  const roleLabel = ROLE_LABELS[profile.role];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-xs">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-expanded={mobileMenuOpen}
              aria-label="Toggle navigation menu"
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 md:hidden"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-5 w-5" aria-hidden="true" />
              )}
            </button>

            <Link
              href={dashboardHref}
              className="flex items-center gap-2.5 text-slate-900"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <GraduationCap className="h-5 w-5" aria-hidden="true" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                QuizzSphere
              </span>
            </Link>

            <span
              className={`ml-1 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ROLE_BADGE_STYLES[profile.role]}`}
            >
              {roleLabel}
            </span>
          </div>

          {/* Desktop Navigation & User Controls */}
          <div className="hidden md:flex md:items-center md:gap-6">
            <nav className="flex items-center gap-1" aria-label="Workspace">
              <Link
                href={dashboardHref}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-900"
              >
                <LayoutDashboard className="h-4 w-4 text-indigo-600" />
                <span>{roleLabel} Dashboard</span>
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              >
                <Sparkles className="h-4 w-4 text-slate-400" />
                <span>Platform Home</span>
              </Link>
            </nav>

            <div className="h-6 w-px bg-slate-200" aria-hidden="true" />

            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {profile.full_name ?? "Platform User"}
                </p>
                <p className="text-xs text-slate-500">{profile.email}</p>
              </div>

              <form action={signOutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 pt-3 pb-4 md:hidden">
            <div className="mb-3 rounded-xl bg-slate-50 p-3">
              <p className="text-sm font-semibold text-slate-900">
                {profile.full_name ?? "Platform User"}
              </p>
              <p className="text-xs text-slate-500">{profile.email}</p>
            </div>
            <nav className="space-y-1" aria-label="Mobile Workspace">
              <Link
                href={dashboardHref}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg bg-indigo-50 px-3 py-2.5 text-sm font-semibold text-indigo-700"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>{roleLabel} Dashboard</span>
              </Link>
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <BookOpen className="h-4 w-4 text-slate-400" />
                <span>Platform Home</span>
              </Link>
            </nav>
            <div className="mt-4 border-t border-slate-100 pt-3">
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-red-600"
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  <span>Sign Out</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
          </div>

          <div className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs text-slate-600 shadow-2xs sm:self-auto">
            {profile.role === "admin" ? (
              <ShieldCheck className="h-4 w-4 text-purple-600" />
            ) : profile.role === "teacher" ? (
              <Users className="h-4 w-4 text-amber-600" />
            ) : (
              <BookOpen className="h-4 w-4 text-sky-600" />
            )}
            <span>
              RLS Policy:{" "}
              <code className="font-mono font-semibold text-slate-900">
                is_role(&apos;{profile.role}&apos;)
              </code>
            </span>
          </div>
        </div>

        {children}
      </main>
    </div>
  );
}
