import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getDashboardPathForRole, userRoleSchema } from "@/lib/auth/roles";
import { isSupabaseConfigured } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const callbackQuerySchema = z.object({
  code: z.string().min(1),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const requestUrl = new URL(request.url);
  const parsedQuery = callbackQuerySchema.safeParse({
    code: requestUrl.searchParams.get("code"),
  });

  if (!parsedQuery.success || !isSupabaseConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=invalid_auth_callback", request.url),
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(
    parsedQuery.data.code,
  );

  if (error || !data.user) {
    return NextResponse.redirect(
      new URL("/login?error=auth_exchange_failed", request.url),
    );
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", data.user.id)
    .single();

  const parsedRole = userRoleSchema.safeParse(profile?.role);
  const destination = parsedRole.success
    ? getDashboardPathForRole(parsedRole.data)
    : "/dashboard/student";

  return NextResponse.redirect(new URL(destination, request.url));
}
