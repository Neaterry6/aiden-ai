import logger from "../utils/logger";
import { commandHandler } from "../handlers/command.handler";
import { getRuntimeConfig } from "../config/runtime";

export class MessageRouter {
  async route(ctx: any): Promise<{ handled: boolean; response?: string }> {
    try {
      const { text, senderId } = ctx;

      // 🔒 GLOBAL BOT CHECK
      if (!getRuntimeConfig().globalBotEnabled) {
        return {
          handled: true,
          response: "Bot is currently disabled.",
        };
      }

      // 1. COMMAND LAYER
      const commandResponse = await commandHandler.handle(
        text,
        senderId
      );

      if (commandResponse) {
        logger.info("Command executed");

        return {
          handled: true,
          response: commandResponse,
        };
      }

      // 2. FEATURE GATES
      if (!this.isAllowed(ctx)) {
        return {
          handled: true,
          response: "Access restricted.",
        };
      }

      return {
        handled: false,
      };
    } catch (err) {
      logger.error("Router error:", err);

      return {
        handled: true,
        response: "Routing error occurred.",
      };
    }
  }

  private isAllowed(ctx: any): boolean {
    return true;
  }
}

export const messageRouter = new MessageRouter();

export default messageRouter;
