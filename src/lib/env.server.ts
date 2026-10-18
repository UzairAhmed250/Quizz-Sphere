import "server-only";
import { z } from "zod";
import { parsePublicEnv, type PublicEnv, type RawPublicEnvInput } from "@/lib/env";

const PLACEHOLDER_SERVICE_ROLE_KEY =
  "your-supabase-service-role-key-placeholder";

export const serviceRoleKeySchema = z
  .string()
  .trim()
  .min(
    15,
    "SUPABASE_SERVICE_ROLE_KEY must be a valid Supabase service role key.",
  )
  .refine(
    (val) => val !== PLACEHOLDER_SERVICE_ROLE_KEY,
    "SUPABASE_SERVICE_ROLE_KEY is still set to the .env.example placeholder.",
  );

export type ServerEnv = PublicEnv & {
  SUPABASE_SERVICE_ROLE_KEY: string;
};

export interface RawServerEnvInput extends RawPublicEnvInput {
  SUPABASE_SERVICE_ROLE_KEY?: string | undefined;
}

export function getServerEnv(
  rawEnv: RawServerEnvInput = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },
): ServerEnv {
  const publicResult = parsePublicEnv(rawEnv);
  if (!publicResult.success) {
    throw new Error(
      `Invalid server environment configuration: ${publicResult.error}`,
    );
  }

  const serviceRoleParsed = serviceRoleKeySchema.safeParse(
    rawEnv.SUPABASE_SERVICE_ROLE_KEY,
  );
  if (!serviceRoleParsed.success) {
    const message = serviceRoleParsed.error.issues
      .map((issue) => issue.message)
      .join(" ");
    throw new Error(`Invalid server environment configuration: ${message}`);
  }

  return {
    ...publicResult.data,
    SUPABASE_SERVICE_ROLE_KEY: serviceRoleParsed.data,
  };
}
