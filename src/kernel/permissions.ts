import { Role } from "../types/permission";

export function hasRole(
  current: Role,
  required: Role
): boolean {
  const hierarchy = [
    Role.USER,
    Role.GROUP_ADMIN,
    Role.DEVELOPER,
    Role.OWNER,
  ];

  return (
    hierarchy.indexOf(current) >=
    hierarchy.indexOf(required)
  );
}
