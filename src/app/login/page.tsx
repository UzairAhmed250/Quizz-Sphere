import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
};

interface LoginPageProps {
  searchParams: Promise<{
    error?: string;
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = await searchParams;
  const queryError =
    typeof resolvedParams.error === "string" ? resolvedParams.error : undefined;

  return (
    <div className="flex min-h-screen flex-col justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className="mx-auto flex w-fit items-center gap-2.5 text-slate-900"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="text-xl font-bold tracking-tight">QuizzSphere</span>
        </Link>

        <h1 className="mt-6 text-center text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Sign in to your account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Access your student, teacher, or administrator dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xs sm:px-10">
          <LoginForm queryError={queryError} />
        </div>
      </div>
    </div>
  );
}
