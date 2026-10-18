"use client";

import { AlertCircle, Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useActionState, useState } from "react";
import { loginAction } from "@/lib/auth/actions";
import { INITIAL_AUTH_ACTION_STATE } from "@/lib/auth/schemas";

interface LoginFormProps {
  queryError?: string;
}

const QUERY_ERROR_MESSAGES: Readonly<Record<string, string>> = {
  supabase_not_configured:
    "Supabase environment variables are not configured yet. Please copy .env.example to .env.local and add your Supabase project URL and anon key.",
  missing_profile:
    "Your account profile could not be loaded. Please sign in again or contact an administrator.",
  invalid_auth_callback:
    "The authentication callback link was invalid or expired. Please sign in with your credentials.",
  auth_exchange_failed:
    "Could not verify your email confirmation code. Please try signing in.",
};

export function LoginForm({ queryError }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    INITIAL_AUTH_ACTION_STATE,
  );
  const [showPassword, setShowPassword] = useState(false);

  const bannerError =
    state.status === "error"
      ? state.message
      : queryError
        ? (QUERY_ERROR_MESSAGES[queryError] ??
          "Please sign in to access this page.")
        : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate={false}>
      {bannerError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
        >
          <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
          <span>{bannerError}</span>
        </div>
      )}

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
              state.fieldErrors?.email ? "login-email-error" : undefined
            }
            className="block w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-xs transition placeholder:text-slate-400 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none"
          />
        </div>
        {state.fieldErrors?.email?.[0] && (
          <p id="login-email-error" className="mt-1.5 text-xs text-red-600">
            {state.fieldErrors.email[0]}
          </p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between">
          <label
            htmlFor="current-password"
            className="block text-sm font-medium text-slate-700"
          >
            Password
          </label>
          <span className="text-xs text-slate-500">Minimum 8 characters</span>
        </div>
        <div className="relative mt-1.5">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
            <Lock className="h-4 w-4" aria-hidden="true" />
          </div>
          <input
            type={showPassword ? "text" : "password"}
            id="current-password"
            name="current-password"
            autoComplete="current-password"
            enterKeyHint="done"
            required
            placeholder="Enter your password"
            aria-describedby={
              state.fieldErrors?.password ? "login-password-error" : undefined
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
          <p id="login-password-error" className="mt-1.5 text-xs text-red-600">
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
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In</span>
        )}
      </button>

      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account yet?{" "}
        <Link
          href="/signup"
          className="font-semibold text-indigo-600 hover:text-indigo-500"
        >
          Create account
        </Link>
      </p>
    </form>
  );
}
