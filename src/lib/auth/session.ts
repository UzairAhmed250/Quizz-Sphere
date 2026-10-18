import "server-only";
import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import {
  getDashboardPathForRole,
  isRole,
  profileRowSchema,
  type Profile,
  type UserRole,
} from "@/lib/auth/roles";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export interface AuthenticatedSession {
  user: User;
  profile: Profile;
}

export async function getCurrentUserWithProfile(): Promise<AuthenticatedSession | null> {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data: rawProfile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !rawProfile) {
    return null;
  }

  const parsedProfile = profileRowSchema.safeParse(rawProfile);
  if (!parsedProfile.success) {
    return null;
  }

  return {
    user,
    profile: parsedProfile.data,
  };
}

/**
 * Server-side guard that verifies authentication and exact role match.
 * Redirects unauthenticated users to /login and unauthorized roles to their own dashboard.
 */
export async function requireRole(
  requiredRole: UserRole,
): Promise<AuthenticatedSession> {
  const session = await getCurrentUserWithProfile();

  if (!session) {
    redirect("/login");
  }

  if (!isRole(session.profile.role, requiredRole)) {
    redirect(getDashboardPathForRole(session.profile.role));
  }

  return session;
}
