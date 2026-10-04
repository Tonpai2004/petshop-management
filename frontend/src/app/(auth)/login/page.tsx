import { Suspense } from "react";
import type { Metadata } from "next";
import { Check } from "lucide-react";
import { BrandLogo } from "@/components/shared/brand-logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { LoginForm } from "@/features/auth/components/login-form";
import { getCategoryLook } from "@/features/products/looks";

export const metadata: Metadata = {
  title: "Sign in",
};

const highlights = [
  "Every product from delivery to checkout",
  "Low stock flagged before the shelf runs empty",
  "Separate access for admins and front desk",
];

const showcase = ["Food", "Treats", "Toys", "Accessories", "Grooming", "Health"];

export default function LoginPage() {
  return (
    <main className="grid min-h-svh lg:grid-cols-[1.15fr_1fr]">
      {/* Always dark, so the brand panel looks the same whichever theme is picked. */}
      <section className="dark text-foreground relative hidden overflow-hidden border-r bg-black p-10 lg:flex lg:flex-col">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-[radial-gradient(ellipse_at_bottom_left,rgb(242_11_126/0.16),transparent_60%)]" />

        <BrandLogo className="relative" />

        <div className="relative my-auto max-w-lg">
          <p className="text-primary text-sm font-medium tracking-wide uppercase">
            Pet supply store
          </p>
          <h1 className="mt-3 text-4xl leading-tight font-semibold tracking-tight">
            Run the whole shop
            <br />
            from one screen.
          </h1>

          <ul className="mt-8 grid gap-3">
            {highlights.map((item) => (
              <li key={item} className="text-muted-foreground flex items-center gap-3">
                <span className="bg-primary/15 text-primary flex size-5 items-center justify-center rounded-full">
                  <Check className="size-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-12 grid grid-cols-3 gap-3">
            {showcase.map((category) => {
              const look = getCategoryLook(category);
              const Icon = look.icon;
              return (
                <div
                  key={category}
                  className="bg-card flex h-24 flex-col justify-between rounded-lg border p-3"
                >
                  <span
                    className={`flex size-8 items-center justify-center rounded-md ${look.className}`}
                  >
                    <Icon className="size-4" />
                  </span>
                  <span className="text-muted-foreground text-xs">{category}</span>
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-muted-foreground relative text-xs">
          Only For Application Full Stack Dev Position at ONEE.
        </p>
      </section>

      <section className="relative flex items-center justify-center px-6 py-12">
        <ThemeToggle className="absolute top-4 right-4" />
        <div className="w-full max-w-sm">
          <BrandLogo className="mb-10 lg:hidden" />

          <div className="mb-8">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">Sign in</h2>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              Use your staff account to continue.
            </p>
          </div>

          {/* useSearchParams needs a Suspense boundary. */}
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </main>
  );
}
