"use client";

import { useState } from "react";
import { KeyRound, Lock, MoreHorizontal, UserCheck, UserPlus, UserX } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { toApiError } from "@/lib/api/api-error";
import { formatRelative, initials } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useSetMemberActive, useTeam } from "../hooks/use-team";
import type { TeamMember } from "../types";
import { AddMemberForm } from "./add-member-form";
import { ResetPasswordDialog } from "./reset-password-dialog";

interface TeamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamDialog({ open, onOpenChange }: TeamDialogProps) {
  const { user } = useAuth();
  const { data: members, isLoading } = useTeam(open);
  const setActive = useSetMemberActive();
  const [isAdding, setIsAdding] = useState(false);
  const [resetFor, setResetFor] = useState<TeamMember | null>(null);

  const toggleActive = (member: TeamMember) =>
    setActive.mutate(
      { id: member.id, isActive: !member.isActive },
      {
        onSuccess: (updated) =>
          toast.success(
            updated.isActive
              ? `${updated.fullName} can sign in again.`
              : `${updated.fullName} has been signed out and disabled.`,
          ),
        onError: (error) => toast.error(toApiError(error).message),
      },
    );

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) setIsAdding(false);
          onOpenChange(next);
        }}
      >
        <DialogContent className="max-h-[calc(100svh-2rem)] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Team</DialogTitle>
            <DialogDescription>
              Who can sign in to the back office, and what they&apos;re allowed to do.
            </DialogDescription>
          </DialogHeader>

          {isAdding ? (
            <AddMemberForm onDone={() => setIsAdding(false)} />
          ) : (
            <Button
              variant="outline"
              className="justify-self-start"
              onClick={() => setIsAdding(true)}
            >
              <UserPlus />
              Add team member
            </Button>
          )}

          <ul className="divide-y rounded-lg border">
            {isLoading || !members
              ? Array.from({ length: 2 }, (_, i) => (
                  <li key={i} className="p-3">
                    <Skeleton className="h-10 w-full" />
                  </li>
                ))
              : members.map((member) => {
                  const isYou = member.id === user?.id;
                  return (
                    <li
                      key={member.id}
                      className={cn(
                        "flex items-center gap-3 p-3",
                        !member.isActive && "opacity-60",
                      )}
                    >
                      <Avatar className="size-9">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials(member.fullName)}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
                          {member.fullName}
                          {isYou && (
                            <span className="text-muted-foreground text-xs font-normal">(you)</span>
                          )}
                          <RoleTag role={member.role} />
                          {!member.isActive && (
                            <StatusTag className="bg-zinc-500/10 text-zinc-500">Disabled</StatusTag>
                          )}
                          {member.isLocked && (
                            <StatusTag className="bg-rose-500/10 text-rose-600 dark:text-rose-400">
                              <Lock className="size-3" />
                              Locked
                            </StatusTag>
                          )}
                        </p>
                        <p className="text-muted-foreground truncate text-xs">
                          @{member.username} ·{" "}
                          {member.lastLoginAt
                            ? `last signed in ${formatRelative(member.lastLoginAt)}`
                            : "hasn't signed in yet"}
                        </p>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label={`Actions for ${member.fullName}`}
                            />
                          }
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => setResetFor(member)}>
                            <KeyRound />
                            Reset password
                          </DropdownMenuItem>
                          {!isYou && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                variant={member.isActive ? "destructive" : "default"}
                                onClick={() => toggleActive(member)}
                              >
                                {member.isActive ? <UserX /> : <UserCheck />}
                                {member.isActive ? "Disable account" : "Enable account"}
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </li>
                  );
                })}
          </ul>
        </DialogContent>
      </Dialog>

      <ResetPasswordDialog member={resetFor} onClose={() => setResetFor(null)} />
    </>
  );
}

function RoleTag({ role }: { role: TeamMember["role"] }) {
  return (
    <StatusTag
      className={role === "Admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}
    >
      {role}
    </StatusTag>
  );
}

function StatusTag({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
        className,
      )}
    >
      {children}
    </span>
  );
}
