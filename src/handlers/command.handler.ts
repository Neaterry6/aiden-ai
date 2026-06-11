import logger from "../utils/logger";
import { runtimeConfig, setRuntimeConfig } from "../config/runtime";
import { keyAdmin } from "../ai/providers/key-admin";
import { ownerPolicy } from "../permissions/owner-policy";

export class CommandHandler {
  async handle(text: string, senderId: string): Promise<string | null> {
    try {
      if (!text.startsWith("Aiden ")) return null;

      const isOwner = ownerPolicy.isOwner(senderId);

      const args = text.replace("Aiden ", "").split(" ");
      const cmd = args[0];

      // ❌ BLOCK NON-OWNERS FOR DANGEROUS COMMANDS

      if (!isOwner && ["addkey", "provider", "switch", "bot"].includes(cmd)) {
        return "🚫 You are not authorized to run this command.";
      }

      // MODEL SWITCH
      if (cmd === "switch") {
        const model = args[1];

        setRuntimeConfig({
          activeModel: model,
        });

        return `Model switched to ${model}`;
      }

      // PROVIDER SWITCH
      if (cmd === "provider") {
        const provider = args[1];

        setRuntimeConfig({
          activeProvider: provider,
        });

        return `Provider switched to ${provider}`;
      }

      // ADD KEY
      if (cmd === "addkey") {
        const provider = args[1];
        const key = args.slice(2).join(" ");

        keyAdmin.add(provider, key);

        return `Key added for ${provider}`;
      }

      // LIST KEYS
      if (cmd === "keys") {
        const provider = args[1];

        const list = keyAdmin.list(provider);

        return JSON.stringify(list, null, 2);
      }

      // BOT TOGGLE
      if (cmd === "bot") {
        const state = args[1] === "on";

        setRuntimeConfig({
          globalBotEnabled: state,
        });

        return `Bot is now ${state ? "ON" : "OFF"}`;
      }

      return "Unknown command";
    } catch (err) {
      logger.error("Command error:", err);
      return "Command failed";
    }
  }
}

export const commandHandler = new CommandHandler();

export default commandHandler;
