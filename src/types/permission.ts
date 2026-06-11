export enum Role {
  USER = "USER",
  GROUP_ADMIN = "GROUP_ADMIN",
  DEVELOPER = "DEVELOPER",
  OWNER = "OWNER"
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
}
