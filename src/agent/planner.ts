import logger from "../utils/utils";

export interface PlanStep {
  id: number;

  action: string;

  tool?: string;

  input?: any;
}

export interface Plan {
  goal: string;

  steps: PlanStep[];
}

export class Planner {
  createPlan(goal: string): Plan {
    logger.info(`🧠 Creating plan for: ${goal}`);

    // simple heuristic planner (can later be LLM-driven)
    const steps: PlanStep[] = [];

    if (goal.toLowerCase().includes("search")) {
      steps.push({
        id: 1,
        action: "search information",
        tool: "search",
        input: { query: goal },
      });
    }

    if (goal.toLowerCase().includes("calculate")) {
      steps.push({
        id: 1,
        action: "perform calculation",
        tool: "calculator",
        input: { expression: goal },
      });
    }

    if (steps.length === 0) {
      steps.push({
        id: 1,
        action: "respond normally",
      });
    }

    return {
      goal,
      steps,
    };
  }
}

export const planner = new Planner();

export default planner;
