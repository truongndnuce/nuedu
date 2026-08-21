import { z } from "zod";

// Docker ARGs/env vars that are declared but not given a value come through
// as "" rather than undefined, which skips zod's `.default()` (that only
// fires on undefined) and fails `.url()` validation. Treat blank strings as
// absent so an unset var falls back to its default instead of crashing the
// build.
const emptyToUndefined = (val: unknown) =>
  typeof val === "string" && val === "" ? undefined : val;

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:4000"),
  ),
  NEXT_PUBLIC_SITE_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().default("http://localhost:3000"),
  ),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.preprocess(
    emptyToUndefined,
    z.enum(["vi", "en"]).default("vi"),
  ),
});

const serverEnvSchema = z.object({
  NEXT_REVALIDATE_TOKEN: z.preprocess(emptyToUndefined, z.string().optional()),
  INTERNAL_API_URL: z.preprocess(
    emptyToUndefined,
    z.string().url().optional(),
  ),
});

function parseEnv() {
  const result = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DEFAULT_LOCALE: process.env.NEXT_PUBLIC_DEFAULT_LOCALE,
  });
  if (!result.success) {
    throw new Error(`Invalid env: ${result.error.message}`);
  }
  return result.data;
}

export const env = parseEnv();

export function getServerEnv() {
  const result = serverEnvSchema.safeParse({
    NEXT_REVALIDATE_TOKEN: process.env.NEXT_REVALIDATE_TOKEN,
    INTERNAL_API_URL: process.env.INTERNAL_API_URL,
  });
  if (!result.success) {
    throw new Error(`Invalid server env: ${result.error.message}`);
  }
  return result.data;
}
