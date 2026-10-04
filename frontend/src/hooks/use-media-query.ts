import { useSyncExternalStore } from "react";

/**
 * True when the media query matches. On the server (and the very first client render)
 * it returns `serverValue`, so markup stays the same until the browser can actually measure.
 */
export function useMediaQuery(query: string, serverValue = false) {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
