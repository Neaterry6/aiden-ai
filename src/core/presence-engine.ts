import logger from "../utils/logger";

export interface PresenceOptions {
  isGroup: boolean;

  text: string;
}

export class PresenceEngine {
  async simulate(options: PresenceOptions): Promise<number> {
    const base = this.baseDelay(options.text);

    const modifier = options.isGroup ? 1.4 : 1.0;

    const random = Math.random() * 1200;

    const delay = Math.floor(base * modifier + random);

    logger.info(`Presence delay: ${delay}ms`);

    return delay;
  }

  private baseDelay(text: string): number {
    const len = text.length;

    if (len < 40) return 800;
    if (len < 120) return 1500;
    if (len < 300) return 2500;

    return 3500;
  }

  async typingDelay(): Promise<number> {
    return 800 + Math.random() * 1200;
  }
}

export const presenceEngine = new PresenceEngine();

export default presenceEngine;
