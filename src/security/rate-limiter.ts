import logger from "../utils/logger";

interface Bucket {
  count: number;
  lastReset: number;
}

export class RateLimiter {
  private userBuckets: Map<string, Bucket> = new Map();

  private groupBuckets: Map<string, Bucket> = new Map();

  private windowMs = 10 * 1000; // 10 seconds

  private limit = 5; // messages per window

  private getBucket(map: Map<string, Bucket>, id: string): Bucket {
    if (!map.has(id)) {
      map.set(id, {
        count: 0,
        lastReset: Date.now(),
      });
    }

    return map.get(id)!;
  }

  private isExpired(bucket: Bucket): boolean {
    return Date.now() - bucket.lastReset > this.windowMs;
  }

  allowUser(userId: string): boolean {
    const bucket = this.getBucket(this.userBuckets, userId);

    if (this.isExpired(bucket)) {
      bucket.count = 0;
      bucket.lastReset = Date.now();
    }

    bucket.count++;

    if (bucket.count > this.limit) {
      logger.warn(`User rate limited: ${userId}`);
      return false;
    }

    return true;
  }

  allowGroup(groupId: string): boolean {
    const bucket = this.getBucket(this.groupBuckets, groupId);

    if (this.isExpired(bucket)) {
      bucket.count = 0;
      bucket.lastReset = Date.now();
    }

    bucket.count++;

    if (bucket.count > this.limit) {
      logger.warn(`Group rate limited: ${groupId}`);
      return false;
    }

    return true;
  }
}

export const rateLimiter = new RateLimiter();
