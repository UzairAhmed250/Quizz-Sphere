import { describe, expect, it } from "vitest";
import {
  loginInputSchema,
  parseLoginFormData,
  parseSignUpFormData,
  roleUpdateInputSchema,
  signUpInputSchema,
} from "@/lib/auth/schemas";
import { parsePublicEnv } from "@/lib/env";

describe("Authentication and role Zod schemas", () => {
  it("normalizes email and validates login credentials", () => {
    const result = loginInputSchema.safeParse({
      email: "  Student@Example.COM ",
      password: "Password123",
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("student@example.com");
    }
  });

  it("supports international Unicode names in signUpInputSchema", () => {
    const result = signUpInputSchema.safeParse({
      fullName: "Zoë Müller-O'Connor",
      email: "zoe@example.com",
      password: "StrongPassword9",
    });

    expect(result.success).toBe(true);
  });

  it("rejects weak passwords during sign-up", () => {
    const tooShort = signUpInputSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "Ab1",
    });
    expect(tooShort.success).toBe(false);

    const noDigits = signUpInputSchema.safeParse({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "OnlyLettersPassword",
    });
    expect(noDigits.success).toBe(false);
  });

  it("parses FormData for login and sign-up using current-password and new-password fields", () => {
    const loginForm = new FormData();
    loginForm.set("email", "teacher@example.com");
    loginForm.set("current-password", "SecretPass123");

    const parsedLogin = parseLoginFormData(loginForm);
    expect(parsedLogin.success).toBe(true);

    const signUpForm = new FormData();
    signUpForm.set("fullName", "Alan Turing");
    signUpForm.set("email", "alan@example.com");
    signUpForm.set("new-password", "EnigmaCode1940");

    const parsedSignUp = parseSignUpFormData(signUpForm);
    expect(parsedSignUp.success).toBe(true);
  });

  it("validates admin role update inputs strictly", () => {
    expect(
      roleUpdateInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        role: "teacher",
      }).success,
    ).toBe(true);

    expect(
      roleUpdateInputSchema.safeParse({
        userId: "not-a-uuid",
        role: "admin",
      }).success,
    ).toBe(false);

    expect(
      roleUpdateInputSchema.safeParse({
        userId: "550e8400-e29b-41d4-a716-446655440000",
        role: "root",
      }).success,
    ).toBe(false);
  });

  it("rejects .env.example placeholder values in parsePublicEnv()", () => {
    const placeholderResult = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://your-project-ref.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: "your-supabase-anon-key-placeholder",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });

    expect(placeholderResult.success).toBe(false);

    const validResult = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://xyzcompany.supabase.co",
      NEXT_PUBLIC_SUPABASE_ANON_KEY:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.valid_anon_key_payload",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });

    expect(validResult.success).toBe(true);

    const publishableKeyResult = parsePublicEnv({
      NEXT_PUBLIC_SUPABASE_URL: "https://xyzcompany.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
        "sb_publishable_valid_supabase_key_12345",
    });

    expect(publishableKeyResult.success).toBe(true);
    if (publishableKeyResult.success) {
      expect(publishableKeyResult.data.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(
        "sb_publishable_valid_supabase_key_12345",
      );
      expect(publishableKeyResult.data.NEXT_PUBLIC_SITE_URL).toBe(
        "http://localhost:3000",
      );
    }
  });
});
