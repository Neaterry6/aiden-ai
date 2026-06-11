import logger from "../utils/utils";

import { promptBuilder } from "../core/prompt-builder";
import { runtimeConfig } from "../config/runtime";

import { groqProvider } from "../ai/providers/groq.provider";

export class AIService {
  async generate(ctx: any) {
    logger.info("AI generating response...");

    const prompt = await promptBuilder.build(ctx);

    const provider = runtimeConfig.activeProvider;
    const model = runtimeConfig.activeModel;

    let output = await this.callProvider(
      provider,
      model,
      prompt.system,
      prompt.user
    );

    return {
      text: output,
    };
  }

  private async callProvider(
    provider: string,
    model: string,
    system: string,
    user: string
  ): Promise<string> {
    if (provider === "groq") {
      return await groqProvider.chat(system, user, model);
    }

    return "No provider available";
  }
}

export const aiService = new AIService();
export default aiService;
