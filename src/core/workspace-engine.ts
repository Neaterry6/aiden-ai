import redis from "../config/redis";
import logger from "../utils/logger";

export interface Workspace {
  userId: string;

  name?: string;

  personality: string;

  tone: string;

  memoryStyle: string;

  lastActive: number;
}

export class WorkspaceEngine {
  private key(userId: string) {
    return `workspace:${userId}`;
  }

  async get(userId: string): Promise<Workspace> {
    const data = await redis.get(this.key(userId));

    if (data) {
      return JSON.parse(data);
    }

    const fresh: Workspace = {
      userId,
      personality: "neutral",
      tone: "friendly",
      memoryStyle: "balanced",
      lastActive: Date.now(),
    };

    await this.save(fresh);

    return fresh;
  }

  async save(workspace: Workspace): Promise<void> {
    workspace.lastActive = Date.now();

    await redis.set(
      this.key(workspace.userId),
      JSON.stringify(workspace)
    );

    logger.info(`Workspace saved: ${workspace.userId}`);
  }

  async update(userId: string, update: Partial<Workspace>) {
    const ws = await this.get(userId);

    const updated = {
      ...ws,
      ...update,
    };

    await this.save(updated);

    return updated;
  }
}

export const workspaceEngine = new WorkspaceEngine();

export default workspaceEngine;
