"use client";

import { useState } from "react";
import { ChevronDown, KeyRound, LogOut, ShieldCheck, User, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChangePasswordDialog } from "@/features/auth/components/change-password-dialog";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { TeamDialog } from "@/features/team/components/team-dialog";
import { initials } from "@/lib/format";

export function UserMenu() {
  const { user, isAdmin, signOut } = useAuth();
  const [dialog, setDialog] = useState<"password" | "team" | null>(null);

  if (!user) return null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              className="h-10 gap-2.5 rounded-full py-1 pr-2.5 pl-1 hover:bg-white/10 aria-expanded:bg-white/10"
            />
          }
        >
          <Avatar className="ring-primary/60 size-8 ring-2 ring-offset-2 ring-offset-black">
            <AvatarFallback className="bg-primary text-xs font-semibold text-white">
              {initials(user.fullName)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left leading-tight lg:block">
            <p className="text-[13px] font-medium text-white">{user.fullName}</p>
            <p className="text-[11px] text-white/50">
              {user.role === "Admin" ? "Administrator" : "Staff"}
            </p>
          </div>
          <ChevronDown className="hidden size-4 text-white/50 sm:block" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="font-normal">
              <p className="text-foreground text-sm font-medium">{user.fullName}</p>
              <p className="text-muted-foreground text-xs">@{user.username}</p>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            {user.role === "Admin" ? <ShieldCheck /> : <User />}
            {user.role === "Admin" ? "Administrator" : "Staff member"}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setDialog("password")}>
            <KeyRound />
            Change password
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem onClick={() => setDialog("team")}>
              <Users />
              Manage team
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={signOut}>
            <LogOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog
        open={dialog === "password"}
        onOpenChange={(open) => !open && setDialog(null)}
      />
      {isAdmin && (
        <TeamDialog open={dialog === "team"} onOpenChange={(open) => !open && setDialog(null)} />
      )}
    </>
  );
}
