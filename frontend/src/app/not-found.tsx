import Link from "next/link";
import { PawPrint } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { routes } from "@/config/routes";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 px-6 text-center">
      <span className="bg-primary/10 text-primary flex size-14 items-center justify-center rounded-2xl">
        <PawPrint className="size-7" />
      </span>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          This page wandered off. Let&apos;s get you back.
        </p>
      </div>
      <Link href={routes.dashboard} className={buttonVariants()}>
        Back to dashboard
      </Link>
    </main>
  );
}
