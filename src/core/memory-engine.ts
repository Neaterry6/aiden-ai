import redis from "../config/redis";
import logger from "../utils/logger";

export interface MemoryRecord {
  id: string;

  userId: string;

  groupId?: string;

  key: string;

  value: string;

  timestamp: number;
}

export class MemoryEngine {
  private key(userId: string) {
    return `memory:${userId}`;
  }

  async write(record: MemoryRecord): Promise<void> {
    const key = this.key(record.userId);

    await redis.lpush(key, JSON.stringify(record));

    await redis.ltrim(key, 0, 200); // keep last 200 memories

    logger.info(`Memory saved for ${record.userId}`);
  }

  async read(userId: string): Promise<MemoryRecord[]> {
    const key = this.key(userId);

    const data = await redis.lrange(key, 0, -1);

    return data.map((d) => JSON.parse(d));
  }

  async search(userId: string, query: string): Promise<MemoryRecord[]> {
    const all = await this.read(userId);

    return all.filter(
      (m) =>
        m.key.includes(query) ||
        m.value.includes(query)
    );
  }

  async clear(userId: string): Promise<void> {
    await redis.del(this.key(userId));

    logger.warn(`Memory cleared for ${userId}`);
  }
}

export const memoryEngine = new MemoryEngine();

export default memoryEngine;
