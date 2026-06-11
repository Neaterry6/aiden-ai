import dotenv from "dotenv";

dotenv.config();

function required(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function optional(name: string, fallback = ""): string {
  return process.env[name] || fallback;
}

function boolean(name: string, fallback = false): boolean {
  const value = process.env[name];

  if (!value) return fallback;

  return value.toLowerCase() === "true";
}

export const env = {
  app: {
    name: optional("APP_NAME", "Aiden"),
    env: optional("NODE_ENV", "development"),
    logLevel: optional("LOG_LEVEL", "info"),
  },

  owner: {
    lid: optional("OWNER_LID"),
    number: optional("OWNER_NUMBER"),
  },

  ai: {
    defaultProvider: optional("DEFAULT_PROVIDER", "groq"),
    defaultModel: optional("DEFAULT_MODEL", "llama-3.3-70b-versatile"),

    groqApiKey: optional("GROQ_API_KEY"),

    openaiApiKey: optional("OPENAI_API_KEY"),

    geminiApiKey: optional("GEMINI_API_KEY"),

    openrouterApiKey: optional("OPENROUTER_API_KEY"),
  },

  database: {
    url: optional("DATABASE_URL"),
  },

  redis: {
    url: optional("REDIS_URL"),
  },

  storage: {
    workspaceRoot: optional("WORKSPACE_ROOT", "./workspaces"),
    mediaRoot: optional("MEDIA_ROOT", "./storage"),
  },

  features: {
    vision: boolean("ENABLE_VISION", true),
    audio: boolean("ENABLE_AUDIO", true),
    groups: boolean("ENABLE_GROUPS", true),
    dms: boolean("ENABLE_DMS", true),

    selfImprovement: boolean(
      "ENABLE_SELF_IMPROVEMENT",
      false
    ),

    toolCreation: boolean(
      "ENABLE_TOOL_CREATION",
      false
    ),
  },
};

export default env;