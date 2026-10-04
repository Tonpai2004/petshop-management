export type ActivityAction =
  | "SignedIn"
  | "AccountLocked"
  | "PasswordChanged"
  | "ProductCreated"
  | "ProductUpdated"
  | "ProductDeleted"
  | "ProductPhotoChanged"
  | "ProductPhotoRemoved"
  | "StockAdjusted"
  | "UserCreated"
  | "UserDisabled"
  | "UserEnabled"
  | "PasswordReset";

export interface Activity {
  id: number;
  action: ActivityAction;
  entityType: "Product" | "User";
  entityId: number | null;
  summary: string;
  userFullName: string | null;
  createdAt: string;
}
