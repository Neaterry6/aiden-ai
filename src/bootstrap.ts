import logger from "./utils/logger";
import connection from "./whatsapp/connection";
import { supervisor } from "./kernel/supervisor";

let shutdownHandlersRegistered = false;

function registerShutdownHandlers() {
  if (shutdownHandlersRegistered) return;

  shutdownHandlersRegistered = true;

  process.once("SIGINT", async () => {
    supervisor.stop();
    await connection.shutdown("SIGINT");
    process.exit(0);
  });

  process.once("SIGTERM", async () => {
    supervisor.stop();
    await connection.shutdown("SIGTERM");
    process.exit(0);
  });
}

export async function bootstrap() {
  try {
    logger.info("🚀 Booting Aiden AI...");
    registerShutdownHandlers();

    // Connect WhatsApp
    await connection.start();

    // Start supervisor (auto-recovery system)
    supervisor.start();

    logger.info("✅ Aiden is online");
  } catch (err) {
    logger.error("❌ Bootstrap failed:", err);

    setTimeout(() => bootstrap(), 5000);
  }
}

export default bootstrap;
