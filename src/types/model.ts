export type Provider =
  | "groq"
  | "openai"
  | "gemini"
  | "openrouter"
  | "local";

export interface ModelConfig {
  provider: Provider;
  model: string;
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}
