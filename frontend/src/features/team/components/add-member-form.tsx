"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { PasswordInput } from "@/components/shared/password-input";
import { toApiError } from "@/lib/api/api-error";
import { useCreateMember } from "../hooks/use-team";
import { addMemberSchema, type AddMemberValues } from "../schemas/member.schema";

const roleItems = [
  { value: "Staff", label: "Staff - can add and edit pets" },
  { value: "Admin", label: "Admin - full access" },
];

export function AddMemberForm({ onDone }: { onDone: () => void }) {
  const createMember = useCreateMember();
  const {
    register,
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<AddMemberValues>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: { fullName: "", username: "", password: "", role: "Staff" },
  });

  useEffect(() => {
    if (!createMember.error) return;
    const { fieldErrors, message } = toApiError(createMember.error);
    const fields = ["username", "fullName", "password"] as const;
    const field = fields.find((name) => fieldErrors[name]);
    if (field) setError(field, { message: fieldErrors[field] });
    else toast.error(message);
  }, [createMember.error, setError]);

  const onSubmit = handleSubmit((values) =>
    createMember.mutate(values, {
      onSuccess: (member) => {
        toast.success(`${member.fullName} can now sign in as "${member.username}".`);
        onDone();
      },
    }),
  );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="bg-muted/40 grid gap-4 rounded-lg border p-4 sm:grid-cols-2"
    >
      <FormField id="member-fullName" label="Full name" required error={errors.fullName?.message}>
        <Input id="member-fullName" placeholder="e.g. Somchai Jaidee" {...register("fullName")} />
      </FormField>
      <FormField id="member-username" label="Username" required error={errors.username?.message}>
        <Input
          id="member-username"
          placeholder="e.g. somchai"
          autoComplete="off"
          {...register("username")}
        />
      </FormField>
      <FormField
        id="member-password"
        label="Temporary password"
        required
        hint="Share it with them and ask them to change it after signing in."
        error={errors.password?.message}
      >
        <PasswordInput id="member-password" autoComplete="new-password" {...register("password")} />
      </FormField>
      <FormField id="member-role" label="Role" required>
        <Controller
          control={control}
          name="role"
          render={({ field }) => (
            <Select
              items={roleItems}
              value={field.value}
              onValueChange={(value) => value && field.onChange(value)}
            >
              <SelectTrigger id="member-role" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roleItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>
      <div className="flex justify-end gap-2 sm:col-span-2">
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
        <Button type="submit" disabled={createMember.isPending}>
          {createMember.isPending ? <Loader2 className="animate-spin" /> : <UserPlus />}
          Add member
        </Button>
      </div>
    </form>
  );
}
