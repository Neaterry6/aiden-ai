import logger from "../../utils/logger";
import { MemoryModel } from "../../database/models/memory.model";
import redis from "../../config/redis";

export class MemoryStorage {
  private cacheKeyPrefix = "mem:";

  async saveUserMemory(
    userId: string,
    key: string,
    value: string,
    groupId?: string
  ): Promise<void> {
    try {
      // Save to MongoDB
      await MemoryModel.create({
        userId,
        groupId,
        key,
        value,
        timestamp: Date.now(),
      });

      // Invalidate cache
      await this.invalidateCache(userId);

      logger.info(
        `Saved memory: ${userId} -> ${key}`
      );
    } catch (err) {
      logger.error("Failed to save memory:", err);
    }
  }

  async getUserMemory(userId: string, key?: string) {
    try {
      // Try cache first
      const cached = await redis.get(
        this.cacheKeyPrefix + userId
      );
      if (cached) {
        return JSON.parse(cached);
      }

      // Fetch from MongoDB
      let query: any = { userId };
      if (key) query.key = key;

      const memories = await MemoryModel.find(query)
        .sort({ timestamp: -1 })
        .limit(100);

      // Cache for 1 hour
      await redis.setex(
        this.cacheKeyPrefix + userId,
        3600,
        JSON.stringify(memories)
      );

      return memories;
    } catch (err) {
      logger.error("Failed to get memory:", err);
      return [];
    }
  }

  async searchUserMemory(userId: string, query: string) {
    try {
      return await MemoryModel.find({
        userId,
        $or: [
          { key: { $regex: query, $options: "i" } },
          { value: { $regex: query, $options: "i" } },
        ],
      })
        .sort({ timestamp: -1 })
        .limit(50);
    } catch (err) {
      logger.error("Failed to search memory:", err);
      return [];
    }
  }

  async injectMemoryContext(
    userId: string,
    query: string
  ): Promise<string> {
    try {
      const memories = await this.searchUserMemory(
        userId,
        query
      );

      if (!memories.length) {
        return "";
      }

      return memories
        .slice(0, 5)
        .map((m) => `${m.key}: ${m.value}`)
        .join("\n");
    } catch (err) {
      logger.error(
        "Failed to inject memory context:",
        err
      );
      return "";
    }
  }

  private async invalidateCache(
    userId: string
  ): Promise<void> {
    await redis.del(this.cacheKeyPrefix + userId);
  }
}

export const memoryStorage = new MemoryStorage();

export default memoryStorage;
