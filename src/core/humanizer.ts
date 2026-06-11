import logger from "../utils/logger";

export interface HumanizedResponse {
  text: string;

  delayMs: number;
}

export class Humanizer {
  private minDelay = 800;

  private maxDelay = 3500;

  private groupMultiplier = 1.3;

  async process(
    text: string,
    isGroup: boolean
  ): Promise<HumanizedResponse> {
    const baseDelay = this.randomDelay();

    const delay = isGroup
      ? Math.floor(baseDelay * this.groupMultiplier)
      : baseDelay;

    logger.info(`Humanizer delay: ${delay}ms`);

    return {
      text: this.format(text),
      delayMs: delay,
    };
  }

  private randomDelay(): number {
    return Math.floor(
      Math.random() *
        (this.maxDelay - this.minDelay) +
        this.minDelay
    );
  }

  private format(text: string): string {
    // light human cleanup rules

    let output = text.trim();

    // avoid robotic empty lines
    output = output.replace(/\n{3,}/g, "\n\n");

    // simulate casual tone tweaks
    if (output.length < 30) {
      output = output;
    }

    return output;
  }
}

export const humanizer = new Humanizer();

export default humanizer;
