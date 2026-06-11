import logger from "../utils/utils";

export class ResponseSynthesizer {
  async build(goal: string, steps: any[]) {
    logger.info("🧠 Synthesizing response...");

    const toolOutputs: string[] = [];

    for (const s of steps) {
      if (s.result) {
        const text =
          typeof s.result === "string"
            ? s.result
            : JSON.stringify(s.result);

        toolOutputs.push(text);
      }
    }

    // Clean human-style response (not raw logs)
    const final = this.format(goal, toolOutputs);

    return final;
  }

  private format(goal: string, outputs: string[]) {
    if (!outputs.length) {
      return `I understand your request about "${goal}", but I don’t have enough data to process it fully right now.`;
    }

    if (outputs.length === 1) {
      return outputs[0];
    }

    return outputs
      .map((o) => `• ${o}`)
      .join("\n");
  }
}

export const responseSynthesizer =
  new ResponseSynthesizer();

export default responseSynthesizer;
