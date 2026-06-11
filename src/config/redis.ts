import Redis from "ioredis";
import logger from "../utils/logger";

const redisUrl = process.env.REDIS_URL;
let redis: Redis;

if (redisUrl) {
  // Use Redis URL from env (e.g., Upstash)
  redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    enableReadyCheck: true,
  });
} else {
  // Fallback to local Redis
  redis = new Redis({
    host: process.env.REDIS_HOST || "127.0.0.1",
    port: Number(process.env.REDIS_PORT || 6379),
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
  });
}

redis.on("connect", () => {
  logger.info("✅ Redis connected");
});

redis.on("error", (err) => {
  logger.error("❌ Redis error:", err);
});

export default redis;
