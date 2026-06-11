import logger from "../utils/utils";

export interface ToolDefinition {
  name: string;

  description: string;

  handler: (input: any) => Promise<any>;

  ownerOnly?: boolean;
}

export class ToolRegistry {
  private tools: Map<string, ToolDefinition> = new Map();

  register(tool: ToolDefinition) {
    this.tools.set(tool.name, tool);

    logger.info(`🧰 Tool registered: ${tool.name}`);
  }

  get(name: string): ToolDefinition | undefined {
    return this.tools.get(name);
  }

  list(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  has(name: string): boolean {
    return this.tools.has(name);
  }
}

export const toolRegistry = new ToolRegistry();

export default toolRegistry;
