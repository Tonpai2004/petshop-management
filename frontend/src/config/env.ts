const APP_ENVIRONMENTS = ["development", "uat", "production"] as const;

export type AppEnvironment = (typeof APP_ENVIRONMENTS)[number];

// NEXT_PUBLIC_* values are inlined at build time, so each one has to be referenced
// with its full literal name. A dynamic process.env[key] lookup would come back empty.
const raw = {
  appEnv: process.env.NEXT_PUBLIC_APP_ENV,
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  apiTimeoutMs: process.env.NEXT_PUBLIC_API_TIMEOUT_MS,
  showDemoAccounts: process.env.NEXT_PUBLIC_SHOW_DEMO_ACCOUNTS,
};

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Check your .env files.`);
  }
  return value;
}

function toAppEnvironment(value: string | undefined): AppEnvironment {
  return APP_ENVIRONMENTS.find((env) => env === value) ?? "development";
}

const apiBaseUrl = required("NEXT_PUBLIC_API_BASE_URL", raw.apiBaseUrl).replace(/\/+$/, "");

export const env = {
  appEnv: toAppEnvironment(raw.appEnv),
  appName: raw.appName ?? "One Pet Shop",
  apiBaseUrl,
  // Uploaded files are served from the API host itself (e.g. http://localhost:5080/uploads/...).
  apiOrigin: new URL(apiBaseUrl).origin,
  apiTimeoutMs: Number(raw.apiTimeoutMs ?? 15000),
  showDemoAccounts: raw.showDemoAccounts === "true",
} as const;
