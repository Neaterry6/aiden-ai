import axios from "axios";
import logger from "../../utils/logger";
import { keyManager } from "./key-manager";

export class GroqProvider {
  async chat(system: string, user: string, model: string): Promise<string> {
    const key = keyManager.getRandomKey("groq");

    if (!key) {
      return "No available Groq API keys right now.";
    }

    try {
      const res = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ],
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${key}`,
            "Content-Type": "application/json"
          }
        }
      );

      return res.data.choices?.[0]?.message?.content || "";
    } catch (err: any) {
      logger.error("Groq request failed");

      // auto-disable bad key (rate limit / failure)
      keyManager.disableKey("groq", key, 60 * 1000);

      return "I had trouble thinking right now.";
    }
  }
}

export const groqProvider = new GroqProvider();
