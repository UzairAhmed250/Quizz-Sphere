import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SignUpForm } from "@/components/auth/SignUpForm";

export const metadata: Metadata = {
  title: "Create Account",
};

export default function SignUpPage() {
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
          Create your account
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Join QuizzSphere to start practicing interactive lessons and quizzes
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-8 shadow-xs sm:px-10">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
