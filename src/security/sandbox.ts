import logger from "../utils/logger";

export class Sandbox {
  async safeExecute(fn: Function, timeoutMs = 5000) {
    return Promise.race([
      fn(),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Tool timeout")), timeoutMs)
      ),
    ])
      .then((res) => res)
      .catch((err) => {
        logger.error("Sandbox blocked execution:", err);
        return {
          error: "Execution blocked or timed out",
        };
      });
  }
}

export const sandbox = new Sandbox();
