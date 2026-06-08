import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000"),
  NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),
  NEXT_PUBLIC_DEFAULT_LOCALE: z.enum(["vi", "en"]).default("vi"),
});

const serverEnvSchema = z.object({
  NEXT_REVALIDATE_TOKEN: z.string().optional(),
  INTERNAL_API_URL: z.string().url().optional(),
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
