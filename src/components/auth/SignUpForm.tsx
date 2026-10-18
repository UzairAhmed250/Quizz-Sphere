"use client";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { signUpAction } from "@/lib/auth/actions";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/auth/schemas";

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState(
    signUpAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="space-y-5" noValidate={false}>
      {state.status === "error" && state.message && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <span>{state.message}</span>
        </div>
      )}

      {state.status === "success" && state.message && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="font-medium">{state.message}</p>
            <p className="mt-1 text-xs text-emerald-700">
              Once confirmed, you can{" "}
              <Link href="/login" className="font-semibold underline">
                sign in here
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      <div>
        <label
          htmlFor="fullName"
          className="block text-sm font-medium text-slate-700"
        >
          Full name
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <User className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            type="text"
            id="fullName"
            name="fullName"
            autoComplete="name"
            enterKeyHint="next"
            required
            placeholder="Ada Lovelace"
            aria-describedby={
              state.fieldErrors?.fullName ? "signup-fullname-error" : undefined
            }
            className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
          />
        </div>
        {state.fieldErrors?.fullName?.[0] && (
          <p id="signup-fullname-error" className="mt-1.5 text-xs text-red-600">
            {state.fieldErrors.fullName[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-700"
        >
          Email address
        </label>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            type="email"
            id="email"
            name="email"
            autoComplete="username"
            spellCheck={false}
            enterKeyHint="next"
            required
            placeholder="you@example.com"
            aria-describedby={
              state.fieldErrors?.email ? "signup-email-error" : undefined
            }
            className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
          />
        </div>
        {state.fieldErrors?.email?.[0] && (
          <p id="signup-email-error" className="mt-1.5 text-xs text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="new-password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <span className="text-xs text-slate-500">
            8+ chars, letters &amp; numbers
          </span>
        </div>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="new-password"
            name="new-password"
            autoComplete="new-password"
            enterKeyHint="done"
            required
            minLength={8}
            placeholder="Create a strong password"
            aria-describedby={
              state.fieldErrors?.password ? "signup-password-error" : undefined
            }
            className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-16 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute inset-y-0 right-0 flex items-center pr-3 text-xs font-medium text-slate-500 hover:text-slate-800"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Eye className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </button>
        </div>
        {state.fieldErrors?.password?.[0] && (
          <p
            id="signup-password-error"
            className="mt-1.5 text-xs text-red-600"
          >
            {state.fieldErrors.password[0]}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span>Creating account...</span>
          </>
        ) : (
          <span>Create account</span>
        )}
      </button>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
        New accounts are provisioned with the{" "}
        <span className="font-semibold text-slate-800">Student</span> role by
        default via database trigger. Administrators can promote accounts to{" "}
        <span className="font-semibold text-slate-800">Teacher</span> or{" "}
        <span className="font-semibold text-slate-800">Admin</span>.
      </div>

      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Sign In
        </Link>
      </p>
    </form>
  );
}
