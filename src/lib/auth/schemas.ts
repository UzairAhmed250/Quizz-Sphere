import { z } from "zod";
import { userRoleSchema } from "@/lib/auth/roles";

export interface AuthActionState {
  status: "idle" | "error" | "success";
  message?: string;
  fieldErrors?: {
    fullName?: string[];
    email?: string[];
    password?: string[];
  };
}

export const INITIAL_AUTH_ACTION_STATE: AuthActionState = {
  status: "idle",
};

/**
 * Unicode-aware name validation allowing international characters, spaces, hyphens, and apostrophes.
 */
export const fullNameSchema = z
  .string()
  .trim()
  .min(2, "Full name must be at least 2 characters.")
  .max(100, "Full name must be at most 100 characters.")
  .regex(
    /^[\p{L}\p{M}\s'.-]+$/u,
    "Full name may only contain letters, spaces, hyphens, apostrophes, and periods.",
  );

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .email("Please enter a valid email address.")
  .max(255, "Email address is too long.")
  .transform((val) => val.toLowerCase());

export const loginPasswordSchema = z
  .string()
  .min(1, "Password is required.")
  .max(128, "Password must be at most 128 characters.");

export const signUpPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[A-Za-z]/, "Password must contain at least one letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

export const loginInputSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const signUpInputSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  password: signUpPasswordSchema,
});

export const roleUpdateInputSchema = z.object({
  userId: z.string().uuid("Invalid user ID."),
  role: userRoleSchema,
});

export type LoginInput = z.infer<typeof loginInputSchema>;
export type SignUpInput = z.infer<typeof signUpInputSchema>;
export type RoleUpdateInput = z.infer<typeof roleUpdateInputSchema>;

function getFormDataString(formData: FormData, key: string): string {
  const raw = formData.get(key);
  return typeof raw === "string" ? raw : "";
}

export function parseLoginFormData(formData: FormData) {
  return loginInputSchema.safeParse({
    email: getFormDataString(formData, "email"),
    password:
      getFormDataString(formData, "current-password") ||
      getFormDataString(formData, "password"),
  });
}

export function parseSignUpFormData(formData: FormData) {
  return signUpInputSchema.safeParse({
    fullName: getFormDataString(formData, "fullName"),
    email: getFormDataString(formData, "email"),
    password:
      getFormDataString(formData, "new-password") ||
      getFormDataString(formData, "password"),
  });
}
