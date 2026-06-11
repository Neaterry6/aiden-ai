import env from "../config/env";
import logger from "../utils/logger";

export class OwnerPolicy {
  isOwner(userId: string): boolean {
    const owner = env.OWNER_NUMBER;

    if (!owner) {
      logger.warn("OWNER_NUMBER not set in env");
      return false;
    }

    // normalize numbers (basic safety)
    const clean = (v: string) => v.replace(/\D/g, "");
    return clean(userId) === clean(owner);
  }
}

export const ownerPolicy = new OwnerPolicy();
