import { describe, expect, it } from "vitest";
import {
  canAccessRoute,
  getDashboardPathForRole,
  getRequiredRoleForPath,
  hasAnyRole,
  isAuthEntryPath,
  isProtectedPath,
  isRole,
  isValidRole,
  profileRowSchema,
  resolveRouteAccess,
  USER_ROLES,
} from "@/lib/auth/roles";

describe("Role validation and isRole() helper logic", () => {
  it("validates only student, teacher, and admin as valid roles", () => {
    for (const role of USER_ROLES) {
      expect(isValidRole(role)).toBe(true);
    }

    expect(isValidRole("superadmin")).toBe(false);
    expect(isValidRole("STUDENT")).toBe(false);
    expect(isValidRole("")).toBe(false);
    expect(isValidRole(null)).toBe(false);
    expect(isValidRole(undefined)).toBe(false);
    expect(isValidRole(42)).toBe(false);
    expect(isValidRole({ role: "admin" })).toBe(false);
  });

  it("evaluates isRole() accurately across all role combinations", () => {
    expect(isRole("student", "student")).toBe(true);
    expect(isRole("teacher", "teacher")).toBe(true);
    expect(isRole("admin", "admin")).toBe(true);

    expect(isRole("student", "teacher")).toBe(false);
    expect(isRole("student", "admin")).toBe(false);
    expect(isRole("teacher", "student")).toBe(false);
    expect(isRole("teacher", "admin")).toBe(false);
    expect(isRole("admin", "student")).toBe(false);
    expect(isRole("admin", "teacher")).toBe(false);

    expect(isRole(null, "student")).toBe(false);
    expect(isRole(undefined, "admin")).toBe(false);
    expect(isRole("guest", "student")).toBe(false);
  });

  it("evaluates hasAnyRole() for multi-role permission checks", () => {
    expect(hasAnyRole("teacher", ["teacher", "admin"])).toBe(true);
    expect(hasAnyRole("admin", ["teacher", "admin"])).toBe(true);
    expect(hasAnyRole("student", ["teacher", "admin"])).toBe(false);
    expect(hasAnyRole(null, ["student", "teacher", "admin"])).toBe(false);
    expect(hasAnyRole("student", [])).toBe(false);
  });

  it("returns the canonical dashboard route for each role", () => {
    expect(getDashboardPathForRole("student")).toBe("/dashboard/student");
    expect(getDashboardPathForRole("teacher")).toBe("/dashboard/teacher");
    expect(getDashboardPathForRole("admin")).toBe("/dashboard/admin");
  });
});

describe("Route classification helpers", () => {
  it("identifies protected dashboard paths without false positives", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/dashboard/student")).toBe(true);
    expect(isProtectedPath("/dashboard/teacher/questions")).toBe(true);
    expect(isProtectedPath("/dashboard/admin/users")).toBe(true);

    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/dashboard-preview")).toBe(false);
  });

  it("identifies authentication entry routes", () => {
    expect(isAuthEntryPath("/login")).toBe(true);
    expect(isAuthEntryPath("/signup")).toBe(true);
    expect(isAuthEntryPath("/auth/callback")).toBe(false);
    expect(isAuthEntryPath("/dashboard")).toBe(false);
  });

  it("extracts required role for role-scoped dashboard routes", () => {
    expect(getRequiredRoleForPath("/dashboard/student")).toBe("student");
    expect(getRequiredRoleForPath("/dashboard/student/quizzes")).toBe(
      "student",
    );
    expect(getRequiredRoleForPath("/dashboard/teacher")).toBe("teacher");
    expect(getRequiredRoleForPath("/dashboard/teacher/import")).toBe("teacher");
    expect(getRequiredRoleForPath("/dashboard/admin")).toBe("admin");
    expect(getRequiredRoleForPath("/dashboard/admin/settings")).toBe("admin");

    expect(getRequiredRoleForPath("/dashboard")).toBeNull();
    expect(getRequiredRoleForPath("/")).toBeNull();
  });
});

describe("Middleware route access decision engine (resolveRouteAccess)", () => {
  it("redirects unauthenticated visitors away from all /dashboard routes to /login", () => {
    const protectedPaths = [
      "/dashboard",
      "/dashboard/student",
      "/dashboard/teacher",
      "/dashboard/admin",
    ];

    for (const pathname of protectedPaths) {
      const decision = resolveRouteAccess({
        pathname,
        isAuthenticated: false,
        userRole: null,
      });

      expect(decision).toEqual({
        allowed: false,
        redirectTo: "/login",
        reason: "unauthenticated",
      });
    }
  });

  it("redirects authenticated users with a missing or invalid profile role to /login?error=missing_profile", () => {
    const decision = resolveRouteAccess({
      pathname: "/dashboard/student",
      isAuthenticated: true,
      userRole: null,
    });

    expect(decision).toEqual({
      allowed: false,
      redirectTo: "/login?error=missing_profile",
      reason: "invalid_role",
    });
  });

  it("dispatches authenticated users from /dashboard root to their role dashboard", () => {
    expect(
      resolveRouteAccess({
        pathname: "/dashboard",
        isAuthenticated: true,
        userRole: "student",
      }),
    ).toEqual({
      allowed: false,
      redirectTo: "/dashboard/student",
      reason: "role_dashboard_dispatch",
    });

    expect(
      resolveRouteAccess({
        pathname: "/dashboard",
        isAuthenticated: true,
        userRole: "teacher",
      }),
    ).toEqual({
      allowed: false,
      redirectTo: "/dashboard/teacher",
      reason: "role_dashboard_dispatch",
    });

    expect(
      resolveRouteAccess({
        pathname: "/dashboard",
        isAuthenticated: true,
        userRole: "admin",
      }),
    ).toEqual({
      allowed: false,
      redirectTo: "/dashboard/admin",
      reason: "role_dashboard_dispatch",
    });
  });

  it("redirects already-authenticated users away from /login and /signup to their dashboard", () => {
    expect(
      resolveRouteAccess({
        pathname: "/login",
        isAuthenticated: true,
        userRole: "teacher",
      }),
    ).toEqual({
      allowed: false,
      redirectTo: "/dashboard/teacher",
      reason: "already_authenticated",
    });

    expect(
      resolveRouteAccess({
        pathname: "/signup",
        isAuthenticated: true,
        userRole: "admin",
      }),
    ).toEqual({
      allowed: false,
      redirectTo: "/dashboard/admin",
      reason: "already_authenticated",
    });
  });

  it("enforces strict role isolation across student, teacher, and admin dashboards", () => {
    // Student access matrix
    expect(canAccessRoute("/dashboard/student", "student")).toBe(true);
    expect(canAccessRoute("/dashboard/student/topics", "student")).toBe(true);
    expect(canAccessRoute("/dashboard/teacher", "student")).toBe(false);
    expect(canAccessRoute("/dashboard/admin", "student")).toBe(false);

    // Teacher access matrix
    expect(canAccessRoute("/dashboard/teacher", "teacher")).toBe(true);
    expect(canAccessRoute("/dashboard/teacher/questions", "teacher")).toBe(
      true,
    );
    expect(canAccessRoute("/dashboard/student", "teacher")).toBe(false);
    expect(canAccessRoute("/dashboard/admin", "teacher")).toBe(false);

    // Admin access matrix
    expect(canAccessRoute("/dashboard/admin", "admin")).toBe(true);
    expect(canAccessRoute("/dashboard/admin/users", "admin")).toBe(true);
    expect(canAccessRoute("/dashboard/student", "admin")).toBe(false);
    expect(canAccessRoute("/dashboard/teacher", "admin")).toBe(false);
  });

  it("redirects unauthorized role attempts to the user's own dashboard", () => {
    const studentTryingAdmin = resolveRouteAccess({
      pathname: "/dashboard/admin",
      isAuthenticated: true,
      userRole: "student",
    });
    expect(studentTryingAdmin).toEqual({
      allowed: false,
      redirectTo: "/dashboard/student",
      reason: "insufficient_role",
    });

    const teacherTryingAdmin = resolveRouteAccess({
      pathname: "/dashboard/admin",
      isAuthenticated: true,
      userRole: "teacher",
    });
    expect(teacherTryingAdmin).toEqual({
      allowed: false,
      redirectTo: "/dashboard/teacher",
      reason: "insufficient_role",
    });
  });

  it("validates database profile rows with Zod profileRowSchema", () => {
    const validProfile = {
      id: "550e8400-e29b-41d4-a716-446655440000",
      email: "ada@example.com",
      full_name: "Ada Lovelace",
      avatar_url: null,
      role: "teacher",
      created_at: "2026-10-18T12:00:00Z",
      updated_at: "2026-10-18T12:00:00Z",
    };

    expect(profileRowSchema.safeParse(validProfile).success).toBe(true);

    const invalidRoleProfile = {
      ...validProfile,
      role: "owner",
    };
    expect(profileRowSchema.safeParse(invalidRoleProfile).success).toBe(false);
  });
});
