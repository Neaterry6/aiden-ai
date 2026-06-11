import fs from "fs";
import path from "path";

import { memoryInjector } from "./memory-injector";

export class PromptBuilder {
  async build(ctx: any) {
    const systemPrompt = fs.readFileSync(
      path.join(__dirname, "../prompts/system.txt"),
      "utf-8"
    );

    const memoryContext = await memoryInjector.buildContext(
      ctx.senderId,
      ctx.text
    );

    const userPrompt = `
User Message:
${ctx.text}

${memoryContext || ""}
    `.trim();

    return {
      system: systemPrompt,
      user: userPrompt,
    };
  }
}

export const promptBuilder = new PromptBuilder();
export default promptBuilder;
