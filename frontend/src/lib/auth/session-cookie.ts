import Cookies from "js-cookie";
import { SESSION_COOKIE } from "./constants";

// The token lives in a cookie (not localStorage) so proxy.ts can see it and redirect
// before the page renders. In a real deployment the API would set this as an httpOnly cookie.
export const sessionCookie = {
  get(): string | undefined {
    return Cookies.get(SESSION_COOKIE);
  },

  set(token: string, expiresAt: string) {
    Cookies.set(SESSION_COOKIE, token, {
      expires: new Date(expiresAt),
      sameSite: "strict",
      secure: window.location.protocol === "https:",
      path: "/",
    });
  },

  clear() {
    Cookies.remove(SESSION_COOKIE, { path: "/" });
  },
};
