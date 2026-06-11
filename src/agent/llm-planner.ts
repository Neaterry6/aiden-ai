import logger from "../utils/utils";
import { groqProvider } from "../ai/providers/groq.provider";
import toolEngine from "../core/tool-engine";

export interface PlanStep {
  action: string;
  tool?: string;
  input?: any;
}

export interface LLMPlan {
  goal: string;
  steps: PlanStep[];
}

export class LLMPlanner {
  async createPlan(goal: string): Promise<LLMPlan> {
    logger.info("🧠 LLM Planner generating plan...");

    const system = `
You are an AI planning engine.

Return ONLY valid JSON.

Format:
{
  "goal": "...",
  "steps": [
    {
      "action": "...",
      "tool": "optional tool name",
      "input": {}
    }
  ]
}

Rules:
- Use tools only when necessary
- If no tool is needed, omit "tool"
- Keep steps minimal and logical
`;

    const toolsList = toolEngine.listTools();

    const user = `
Create a plan for: ${goal}

Available tools:
${toolsList.map(t => `- ${t.name}: ${t.description || ""}`).join("\n")}
`;

    const raw = await groqProvider.chat(
      system,
      user,
      "llama-3.1-70b-versatile"
    );

    try {
      const parsed = JSON.parse(raw);

      return parsed as LLMPlan;
    } catch (err) {
      logger.error("LLM plan parse failed:", err);

      return {
        goal,
        steps: [
          {
            action: "respond directly",
          },
        ],
      };
    }
  }
}

export const llmPlanner = new LLMPlanner();

export default llmPlanner;
