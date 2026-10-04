import { NextResponse, type NextRequest } from "next/server";
import { protectedRoutes, routes } from "@/config/routes";
import { SESSION_COOKIE } from "@/lib/auth/constants";

// Optimistic check only: we just look for the cookie so users get redirected before anything renders.
// Whether the token is actually valid is decided by the API.
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE);
  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtected && !hasSession) {
    const loginUrl = new URL(routes.login, request.url);
    loginUrl.searchParams.set("from", pathname + search);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === routes.login && hasSession && !request.nextUrl.searchParams.has("expired")) {
    return NextResponse.redirect(new URL(routes.dashboard, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
