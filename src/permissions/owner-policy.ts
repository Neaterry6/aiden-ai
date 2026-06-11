import env from "../config/env";
import logger from "../utils/logger";

const DEFAULT_OWNER_NUMBERS = [
  "+234 913 081 5781",
  "23408120478393",
];

function clean(value: string): string {
  return value.replace(/\D/g, "");
}

function numberVariants(value: string): string[] {
  const digits = clean(value);
  if (!digits) return [];

  const variants = [digits];

  if (digits.startsWith("2340")) {
    variants.push(`234${digits.slice(4)}`);
  }

  return variants;
}

function configuredOwners(): string[] {
  return [
    env.owner.number,
    process.env.OWNER_NUMBERS || "",
    ...DEFAULT_OWNER_NUMBERS,
  ]
    .flatMap((value) => String(value || "").split(","))
    .flatMap((value) => numberVariants(value))
    .filter(Boolean);
}

export class OwnerPolicy {
  isOwner(userId: string): boolean {
    const owners = configuredOwners();

    if (!owners.length) {
      logger.warn("OWNER_NUMBER or OWNER_NUMBERS not set in env");
      return false;
    }

    return numberVariants(userId).some((value) => owners.includes(value));
  }

  canOwnerAction(
    action: string
  ): { allowed: boolean; reason?: string } {
    // Owners can execute all actions
    return { allowed: true };
  }
}

export const ownerPolicy = new OwnerPolicy();

export function isOwner(userId: string): boolean {
  return ownerPolicy.isOwner(userId);
}

export function canOwnerAction(action: string): {
  allowed: boolean;
  reason?: string;
} {
  return ownerPolicy.canOwnerAction(action);
}
