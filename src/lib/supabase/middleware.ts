import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  isAuthEntryPath,
  isProtectedPath,
  resolveRouteAccess,
  userRoleSchema,
  type UserRole,
} from "@/lib/auth/roles";
import { parsePublicEnv } from "@/lib/env";
import type { Database } from "@/types/database.types";

export async function updateSessionAndEnforceRoles(
  request: NextRequest,
): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const parsedEnv = parsePublicEnv();

  // If Supabase env vars are not configured yet, never allow unauthenticated access to protected routes
  if (!parsedEnv.success) {
    if (isProtectedPath(pathname)) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "supabase_not_configured");
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient<Database>(
    parsedEnv.data.NEXT_PUBLIC_SUPABASE_URL,
    parsedEnv.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(
          cookiesToSet: {
            name: string;
            value: string;
            options: CookieOptions;
          }[],
        ) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          supabaseResponse = NextResponse.next({
            request,
          });
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Verify the authenticated user directly against Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let userRole: UserRole | null = null;

  if (user && (isProtectedPath(pathname) || isAuthEntryPath(pathname))) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const parsedRole = userRoleSchema.safeParse(profileData?.role);
    if (parsedRole.success) {
      userRole = parsedRole.data;
    }
  }

  const decision = resolveRouteAccess({
    pathname,
    isAuthenticated: Boolean(user),
    userRole,
  });

  if (!decision.allowed) {
    const redirectUrl = new URL(decision.redirectTo, request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);

    // Preserve any refreshed session cookies on redirect
    for (const cookie of supabaseResponse.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }

    return redirectResponse;
  }

  return supabaseResponse;
}
