import logger from "../utils/utils";
import planner from "./planner";
import toolService from "../services/tool.service";

export class Executor {
  async execute(goal: string) {
    const plan = planner.createPlan(goal);

    logger.info(`⚙️ Executing plan for: ${goal}`);

    const results: any[] = [];

    for (const step of plan.steps) {
      try {
        if (step.tool) {
          const result = await toolService.execute(
            step.tool,
            step.input || {}
          );

          results.push({
            step: step.id,
            result,
          });
        } else {
          results.push({
            step: step.id,
            result: "no tool required",
          });
        }
      } catch (err) {
        logger.error(`Step failed: ${step.id}`, err);

        results.push({
          step: step.id,
          error: true,
        });
      }
    }

    return {
      goal,
      results,
    };
  }
}

export const executor = new Executor();

export default executor;
