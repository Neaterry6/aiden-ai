import logger from "../utils/logger";
import toolService from "../services/tool.service";

export interface ToolCall {
  name: string;

  input: any;
}

export class ToolRouter {
  async maybeExecute(
    aiText: string
  ): Promise<{ text: string; toolResult?: any }> {
    try {
      // simple pattern-based tool trigger (can later be replaced with LLM tool calling)
      const match = aiText.match(/tool:(\w+)\((.*)\)/);

      if (!match) {
        return { text: aiText };
      }

      const toolName = match[1];

      let input = {};

      try {
        input = JSON.parse(match[2] || "{}");
      } catch {
        input = {};
      }

      logger.info(`Tool requested: ${toolName}`);

      const result = await toolService.execute(
        toolName,
        input
      );

      return {
        text: JSON.stringify(result),
        toolResult: result,
      };
    } catch (err) {
      logger.error("Tool router error:", err);

      return {
        text: aiText,
      };
    }
  }
}

export const toolRouter = new ToolRouter();

export default toolRouter;
