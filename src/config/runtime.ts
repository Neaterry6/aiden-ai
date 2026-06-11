import logger from "../utils/logger";

export interface RuntimeState {
  activeModel: string;

  activeProvider: string;

  globalBotEnabled: boolean;
}

const state: RuntimeState = {
  activeModel: "llama-3.1-70b",

  activeProvider: "groq",

  globalBotEnabled: true,
};

export function getRuntimeConfig(): RuntimeState {
  return state;
}

export function setRuntimeConfig(
  update: Partial<RuntimeState>
): void {
  Object.assign(state, update);

  logger.info("Runtime updated:", state);
}

export default {
  getRuntimeConfig,
  setRuntimeConfig,
};
