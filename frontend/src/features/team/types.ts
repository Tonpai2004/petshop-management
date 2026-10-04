import type { UserRole } from "@/features/auth/types";

export interface TeamMember {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  isLocked: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface CreateMemberPayload {
  username: string;
  fullName: string;
  password: string;
  role: UserRole;
}
