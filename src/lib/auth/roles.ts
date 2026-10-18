import { z } from "zod";
import type { Enums, Tables } from "@/types/database.types";

export const USER_ROLES = ["student", "teacher", "admin"] as const;

export type UserRole = Enums<"user_role">;

export type Profile = Tables<"profiles">;

export const userRoleSchema = z.enum(USER_ROLES);

export const profileRowSchema: z.ZodType<Profile> = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  full_name: z.string().nullable(),
  avatar_url: z.string().nullable(),
  role: userRoleSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const ROLE_DASHBOARD_PATHS: Readonly<Record<UserRole, string>> = {
  student: "/dashboard/student",
  teacher: "/dashboard/teacher",
  admin: "/dashboard/admin",
};

export const ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Administrator",
};

const PROTECTED_ROUTE_PREFIX = "/dashboard";
const AUTH_ENTRY_ROUTES = ["/login", "/signup"] as const;

const ROLE_ROUTE_PREFIXES: ReadonlyArray<{
  prefix: string;
  requiredRole: UserRole;
}> = [
  { prefix: "/dashboard/student", requiredRole: "student" },
  { prefix: "/dashboard/teacher", requiredRole: "teacher" },
  { prefix: "/dashboard/admin", requiredRole: "admin" },
];

export type RouteAccessReason =
  | "public_route"
  | "authorized"
  | "already_authenticated"
  | "unauthenticated"
  | "invalid_role"
  | "role_dashboard_dispatch"
  | "insufficient_role";

export type RouteAccessDecision =
  | {
      allowed: true;
      reason: "public_route" | "authorized";
    }
  | {
      allowed: false;
      redirectTo: string;
      reason: Exclude<RouteAccessReason, "public_route" | "authorized">;
    };

/**
 * Type guard verifying whether an unknown value is a valid UserRole ('student' | 'teacher' | 'admin').
 */
export function isValidRole(value: unknown): value is UserRole {
  return userRoleSchema.safeParse(value).success;
}

/**
 * Application-layer counterpart to the Postgres `public.is_role(required_role)` helper.
 * Returns true if and only if `userRole` is a valid role matching `requiredRole`.
 */
export function isRole(userRole: unknown, requiredRole: UserRole): boolean {
  if (!isValidRole(userRole)) {
    return false;
  }
  return userRole === requiredRole;
}

/**
 * Checks whether `userRole` matches at least one role in `allowedRoles`.
 */
export function hasAnyRole(
  userRole: unknown,
  allowedRoles: readonly UserRole[],
): boolean {
  if (!isValidRole(userRole)) {
    return false;
  }
  return allowedRoles.some((requiredRole) => isRole(userRole, requiredRole));
}

/**
 * Returns the canonical dashboard path for a given role.
 */
export function getDashboardPathForRole(role: UserRole): string {
  return ROLE_DASHBOARD_PATHS[role];
}

function matchesPathSegment(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

/**
 * Determines whether a pathname is under a protected route namespace.
 */
export function isProtectedPath(pathname: string): boolean {
  return matchesPathSegment(pathname, PROTECTED_ROUTE_PREFIX);
}

/**
 * Determines whether a pathname is an authentication entry route (/login or /signup).
 */
export function isAuthEntryPath(pathname: string): boolean {
  return AUTH_ENTRY_ROUTES.some((route) => matchesPathSegment(pathname, route));
}

/**
 * Extracts the required UserRole for a role-specific dashboard path, or null if none.
 */
export function getRequiredRoleForPath(pathname: string): UserRole | null {
  for (const entry of ROLE_ROUTE_PREFIXES) {
    if (matchesPathSegment(pathname, entry.prefix)) {
      return entry.requiredRole;
    }
  }
  return null;
}

/**
 * Evaluates whether a user with `userRole` is permitted to access a specific pathname.
 */
export function canAccessRoute(pathname: string, userRole: unknown): boolean {
  const decision = resolveRouteAccess({
    pathname,
    isAuthenticated: isValidRole(userRole),
    userRole,
  });
  return decision.allowed;
}

/**
 * Pure, deterministic route protection evaluator used by Next.js middleware.
 */
export function resolveRouteAccess(params: {
  pathname: string;
  isAuthenticated: boolean;
  userRole: unknown;
}): RouteAccessDecision {
  const { pathname, isAuthenticated, userRole } = params;

  if (isAuthEntryPath(pathname)) {
    if (isAuthenticated && isValidRole(userRole)) {
      return {
        allowed: false,
        redirectTo: getDashboardPathForRole(userRole),
        reason: "already_authenticated",
      };
    }
    return {
      allowed: true,
      reason: "public_route",
    };
  }

  if (!isProtectedPath(pathname)) {
    return {
      allowed: true,
      reason: "public_route",
    };
  }

  if (!isAuthenticated) {
    return {
      allowed: false,
      redirectTo: "/login",
      reason: "unauthenticated",
    };
  }

  if (!isValidRole(userRole)) {
    return {
      allowed: false,
      redirectTo: "/login?error=missing_profile",
      reason: "invalid_role",
    };
  }

  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    return {
      allowed: false,
      redirectTo: getDashboardPathForRole(userRole),
      reason: "role_dashboard_dispatch",
    };
  }

  const requiredRole = getRequiredRoleForPath(pathname);
  if (requiredRole !== null && !isRole(userRole, requiredRole)) {
    return {
      allowed: false,
      redirectTo: getDashboardPathForRole(userRole),
      reason: "insufficient_role",
    };
  }

  return {
    allowed: true,
    reason: "authorized",
  };
}
