import logger from "../utils/utils";
import toolService from "../services/tool.service";
import llmPlanner from "./llm-planner";
import { responseSynthesizer } from "./response-synthesizer";

export class AgentCore {
  async run(goal: string) {
    logger.info(`🧠 Agent processing: ${goal}`);

    // 1. LLM PLAN
    const plan = await llmPlanner.createPlan(goal);

    const steps: any[] = [];

    // 2. EXECUTE STEPS
    for (const step of plan.steps) {
      try {
        if (step.tool) {
          const result = await toolService.execute(
            step.tool,
            step.input || {}
          );

          steps.push({
            action: step.action,
            tool: step.tool,
            result,
          });
        } else {
          steps.push({
            action: step.action,
            result: step.action,
          });
        }
      } catch (err: any) {
        logger.error("Step error:", err);

        steps.push({
          action: step.action,
          error: true,
        });
      }
    }

    // 3. SYNTHESIZE FINAL RESPONSE
    const final = await responseSynthesizer.build(
      plan.goal,
      steps
    );

    return {
      plan,
      steps,
      final,
    };
  }
}

export const agentCore = new AgentCore();

export default agentCore;
