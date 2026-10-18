import type { NextRequest } from "next/server";
import { updateSessionAndEnforceRoles } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSessionAndEnforceRoles(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, Next.js internals, and image optimization:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt
     * - static image extensions (.svg, .png, .jpg, .jpeg, .gif, .webp)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
