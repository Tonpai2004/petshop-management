"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2, ServerCrash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AppHeader } from "@/components/layout/app-header";
import { routes } from "@/config/routes";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { sessionCookie } from "@/lib/auth/session-cookie";

// proxy.ts already bounces visitors without a session cookie. This is the second line:
// it waits for /auth/me so we never render the dashboard for a token the API doesn't accept.
export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoading, isError, retry, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !user && !sessionCookie.get()) {
      router.replace(`${routes.login}?from=${encodeURIComponent(pathname)}`);
    }
  }, [isLoading, user, pathname, router]);

  if (!user && isError) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
        <ServerCrash className="text-muted-foreground size-8" />
        <div>
          <p className="font-medium">We can&apos;t reach the server right now</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Make sure the API is running, then try again.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={signOut}>
            Sign out
          </Button>
          <Button onClick={retry}>Try again</Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-muted-foreground flex min-h-svh items-center justify-center gap-2 text-sm">
        <Loader2 className="size-4 animate-spin" />
        Loading your workspace...
      </div>
    );
  }

  return (
    <div className="min-h-svh">
      <AppHeader />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
