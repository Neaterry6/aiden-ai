import logger from "../utils/logger";
import { memoryEngine } from "./memory-engine";

export class MemoryInjector {
  async buildContext(userId: string, query: string): Promise<string> {
    try {
      const memories = await memoryEngine.search(userId, query);

      if (!memories.length) {
        return "";
      }

      const formatted = memories
        .map((m) => `- ${m.key}: ${m.value}`)
        .join("\n");

      logger.info(`Memory injected for ${userId}`);

      return `
MEMORY CONTEXT:
${formatted}
      `.trim();
    } catch (err) {
      logger.error("Memory injector error:", err);
      return "";
    }
  }
}

export const memoryInjector = new MemoryInjector();

export default memoryInjector;
