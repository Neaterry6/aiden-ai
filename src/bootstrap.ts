import logger from "./utils/logger";
import { connection } from "./whatsapp/connection";
import { supervisor } from "./kernel/supervisor";

export async function bootstrap() {
  try {
    logger.info("🚀 Booting Aiden AI...");

    // Connect WhatsApp
    await connection.connect();

    // Start supervisor (auto-recovery system)
    supervisor.start();

    logger.info("✅ Aiden is online");
  } catch (err) {
    logger.error("❌ Bootstrap failed:", err);

    setTimeout(() => bootstrap(), 5000);
  }
}

export default bootstrap;
