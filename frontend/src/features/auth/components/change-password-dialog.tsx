"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { toApiError } from "@/lib/api/api-error";
import { authApi } from "../api/auth.api";
import { changePasswordSchema, type ChangePasswordValues } from "../schemas/change-password.schema";

const FORM_ID = "change-password-form";

interface ChangePasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangePasswordDialog({ open, onOpenChange }: ChangePasswordDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const changePassword = useMutation({ mutationFn: authApi.changePassword });

  useEffect(() => {
    if (!changePassword.error) return;
    const { fieldErrors, message } = toApiError(changePassword.error);
    if (fieldErrors.currentPassword)
      setError("currentPassword", { message: fieldErrors.currentPassword });
    else if (fieldErrors.newPassword) setError("newPassword", { message: fieldErrors.newPassword });
    else toast.error(message);
  }, [changePassword.error, setError]);

  const close = (next: boolean) => {
    if (!next) {
      reset();
      changePassword.reset();
    }
    onOpenChange(next);
  };

  const onSubmit = handleSubmit(({ currentPassword, newPassword }) =>
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          toast.success("Your password has been changed.");
          close(false);
        },
      },
    ),
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Change password</DialogTitle>
          <DialogDescription>
            Use at least 8 characters with an uppercase letter, a lowercase letter and a number.
          </DialogDescription>
        </DialogHeader>

        <form id={FORM_ID} onSubmit={onSubmit} noValidate className="grid gap-4">
          <FormField
            id="currentPassword"
            label="Current password"
            error={errors.currentPassword?.message}
          >
            <PasswordInput
              id="currentPassword"
              autoComplete="current-password"
              {...register("currentPassword")}
            />
          </FormField>
          <FormField id="newPassword" label="New password" error={errors.newPassword?.message}>
            <PasswordInput
              id="newPassword"
              autoComplete="new-password"
              {...register("newPassword")}
            />
          </FormField>
          <FormField
            id="confirmPassword"
            label="Confirm new password"
            error={errors.confirmPassword?.message}
          >
            <PasswordInput
              id="confirmPassword"
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </FormField>
        </form>

        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form={FORM_ID} disabled={changePassword.isPending}>
            {changePassword.isPending && <Loader2 className="animate-spin" />}
            Update password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
