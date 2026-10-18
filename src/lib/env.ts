import { z } from "zod";

const PLACEHOLDER_URL = "https://your-project-ref.supabase.co";
const PLACEHOLDER_KEYS = new Set([
  "your-supabase-anon-key-placeholder",
  "your-supabase-publishable-key-placeholder",
]);

export const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .trim()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL.")
    .refine(
      (val) => val !== PLACEHOLDER_URL,
      "NEXT_PUBLIC_SUPABASE_URL is still set to the .env.example placeholder.",
    ),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z
    .string()
    .trim()
    .min(
      15,
      "NEXT_PUBLIC_SUPABASE_ANON_KEY (or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) must be set.",
    )
    .refine(
      (val) => !PLACEHOLDER_KEYS.has(val),
      "Supabase public key is still set to the .env.example placeholder.",
    ),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    (val) =>
      typeof val === "string" && val.trim().length > 0
        ? val.trim()
        : "http://localhost:3000",
    z.string().url("NEXT_PUBLIC_SITE_URL must be a valid URL."),
  ),
});

export type PublicEnv = z.infer<typeof publicEnvSchema>;

export interface RawPublicEnvInput {
  NEXT_PUBLIC_SUPABASE_URL?: string | undefined;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string | undefined;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string | undefined;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY?: string | undefined;
  NEXT_PUBLIC_SITE_URL?: string | undefined;
}

export function parsePublicEnv(
  rawEnv: RawPublicEnvInput = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
): { success: true; data: PublicEnv } | { success: false; error: string } {
  const resolvedPublicKey =
    rawEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    rawEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    rawEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: rawEnv.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: resolvedPublicKey,
    NEXT_PUBLIC_SITE_URL: rawEnv.NEXT_PUBLIC_SITE_URL,
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => issue.message)
      .join(" ");
    return { success: false, error: message };
  }
  return { success: true, data: parsed.data };
}

export function getPublicEnv(): PublicEnv {
  const result = parsePublicEnv();
  if (!result.success) {
    throw new Error(
      `Invalid Supabase public environment configuration: ${result.error}`,
    );
  }
  return result.data;
}

export function isSupabaseConfigured(): boolean {
  return parsePublicEnv().success;
}
