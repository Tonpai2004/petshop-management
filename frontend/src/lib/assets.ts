import { env } from "@/config/env";

/** The API stores photos as "/uploads/..."; the browser needs the full address of the API host. */
export function resolveAssetUrl(path: string | null | undefined) {
  if (!path) return null;
  return path.startsWith("/") ? `${env.apiOrigin}${path}` : path;
}
