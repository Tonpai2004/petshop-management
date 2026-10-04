"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/shared/form-field";
import { env } from "@/config/env";
import { routes } from "@/config/routes";
import { toApiError } from "@/lib/api/api-error";
import { useLogin } from "../hooks/use-login";
import { loginSchema, type LoginFormValues } from "../schemas/login.schema";
import { DemoAccounts } from "./demo-accounts";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const sessionExpired = searchParams.get("expired") === "1";
  const serverError = login.error ? toApiError(login.error).message : null;

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: () => router.replace(safeRedirect(searchParams.get("from"))),
    });
  });

  const fillDemoAccount = (username: string, password: string) => {
    setValue("username", username, { shouldValidate: true });
    setValue("password", password, { shouldValidate: true });
  };

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5">
      {(serverError || sessionExpired) && (
        <div
          role="alert"
          className="border-destructive/30 bg-destructive/5 text-destructive flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm"
        >
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{serverError ?? "Your session has expired. Please sign in again."}</span>
        </div>
      )}

      <FormField id="username" label="Username" error={errors.username?.message}>
        <Input
          id="username"
          autoComplete="username"
          autoFocus
          placeholder="e.g. admin"
          className="h-10"
          aria-invalid={Boolean(errors.username)}
          {...register("username")}
        />
      </FormField>

      <FormField id="password" label="Password" error={errors.password?.message}>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-10 pr-10"
            aria-invalid={Boolean(errors.password)}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword((value) => !value)}
            className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>

      <Button type="submit" size="lg" className="h-10" disabled={login.isPending}>
        {login.isPending ? <Loader2 className="animate-spin" /> : <LogIn />}
        {login.isPending ? "Signing in..." : "Sign in"}
      </Button>

      {env.showDemoAccounts && <DemoAccounts onPick={fillDemoAccount} />}
    </form>
  );
}

// Only follow relative paths, so ?from= can't be abused to bounce users to another site.
function safeRedirect(from: string | null) {
  return from && from.startsWith("/") && !from.startsWith("//") ? from : routes.dashboard;
}
