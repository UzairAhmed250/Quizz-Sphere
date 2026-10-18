"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  getDashboardPathForRole,
  isRole,
  userRoleSchema,
} from "@/lib/auth/roles";
import {
  parseLoginFormData,
  parseSignUpFormData,
  roleUpdateInputSchema,
  type AuthActionState,
} from "@/lib/auth/schemas";
import { parsePublicEnv } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedInput = parseLoginFormData(formData);

  if (!parsedInput.success) {
    const flattened = parsedInput.error.flatten();
    return {
      status: "error",
      message: "Please fix the highlighted errors before signing in.",
      fieldErrors: {
        email: flattened.fieldErrors.email,
        password: flattened.fieldErrors.password,
      },
    };
  }

  const envCheck = parsePublicEnv();
  if (!envCheck.success) {
    return {
      status: "error",
      message:
        "Supabase environment variables are not configured yet. Copy .env.example to .env.local and add your project URL and anon key.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const { data: authData, error: signInError } =
    await supabase.auth.signInWithPassword({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
    });

  if (signInError || !authData.user) {
    return {
      status: "error",
      message: signInError?.message ?? "Invalid email or password.",
    };
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .single();

  const parsedRole = userRoleSchema.safeParse(profileData?.role);
  const destination = parsedRole.success
    ? getDashboardPathForRole(parsedRole.data)
    : "/dashboard/student";

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signUpAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsedInput = parseSignUpFormData(formData);

  if (!parsedInput.success) {
    const flattened = parsedInput.error.flatten();
    return {
      status: "error",
      message: "Please review your registration details.",
      fieldErrors: {
        fullName: flattened.fieldErrors.fullName,
        email: flattened.fieldErrors.email,
        password: flattened.fieldErrors.password,
      },
    };
  }

  const envCheck = parsePublicEnv();
  if (!envCheck.success) {
    return {
      status: "error",
      message:
        "Supabase environment variables are not configured yet. Copy .env.example to .env.local and add your project URL and anon key.",
    };
  }

  const supabase = await createSupabaseServerClient();
  const callbackUrl = new URL(
    "/auth/callback",
    envCheck.data.NEXT_PUBLIC_SITE_URL,
  ).toString();

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: parsedInput.data.email,
    password: parsedInput.data.password,
    options: {
      emailRedirectTo: callbackUrl,
      data: {
        full_name: parsedInput.data.fullName,
      },
    },
  });

  if (signUpError) {
    return {
      status: "error",
      message: signUpError.message,
    };
  }

  // If email confirmation is disabled in Supabase, session is returned immediately
  if (signUpData.session && signUpData.user) {
    revalidatePath("/", "layout");
    redirect("/dashboard/student");
  }

  return {
    status: "success",
    message:
      "Account created! Please check your email inbox to confirm your address before signing in.",
  };
}

export async function signOutAction(): Promise<void> {
  const envCheck = parsePublicEnv();
  if (envCheck.success) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.signOut();
  }
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  const envCheck = parsePublicEnv();
  if (!envCheck.success) {
    redirect("/login?error=supabase_not_configured");
  }

  const rawUserId = formData.get("userId");
  const rawRole = formData.get("role");

  const parsed = roleUpdateInputSchema.safeParse({
    userId: typeof rawUserId === "string" ? rawUserId : "",
    role: typeof rawRole === "string" ? rawRole : "",
  });

  if (!parsed.success) {
    redirect("/dashboard/admin?error=invalid_role_input");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: callerProfile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!isRole(callerProfile?.role, "admin")) {
    redirect("/dashboard");
  }

  // Execute through standard authenticated client so database RLS (public.is_role('admin')) is enforced
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role })
    .eq("id", parsed.data.userId);

  if (error) {
    redirect("/dashboard/admin?error=role_update_failed");
  }

  revalidatePath("/dashboard/admin");
  redirect("/dashboard/admin?updated=true");
}
