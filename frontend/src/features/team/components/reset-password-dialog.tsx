"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { useResetMemberPassword } from "../hooks/use-team";
import { resetPasswordSchema, type ResetPasswordValues } from "../schemas/member.schema";
import type { TeamMember } from "../types";

const FORM_ID = "reset-password-form";

interface ResetPasswordDialogProps {
  member: TeamMember | null;
  onClose: () => void;
}

export function ResetPasswordDialog({ member, onClose }: ResetPasswordDialogProps) {
  const resetPassword = useResetMemberPassword();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "" },
  });

  const close = () => {
    reset();
    onClose();
  };

  const onSubmit = handleSubmit(({ password }) => {
    if (!member) return;
    resetPassword.mutate(
      { id: member.id, password },
      {
        onSuccess: () => {
          toast.success(`${member.fullName}'s password has been reset.`);
          close();
        },
        onError: (error) => toast.error(toApiError(error).message),
      },
    );
  });

  return (
    <Dialog open={member !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Reset password</DialogTitle>
          <DialogDescription>
            Set a new password for {member?.fullName}. This also unlocks the account if it was
            locked.
          </DialogDescription>
        </DialogHeader>
        <form id={FORM_ID} onSubmit={onSubmit} noValidate>
          <FormField id="reset-password" label="New password" error={errors.password?.message}>
            <PasswordInput
              id="reset-password"
              autoComplete="new-password"
              {...register("password")}
            />
          </FormField>
        </form>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
          <Button type="submit" form={FORM_ID} disabled={resetPassword.isPending}>
            {resetPassword.isPending && <Loader2 className="animate-spin" />}
            Reset password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
