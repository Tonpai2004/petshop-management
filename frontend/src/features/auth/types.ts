export type UserRole = "Admin" | "Staff";

export interface UserProfile {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresAt: string;
  user: UserProfile;
}
