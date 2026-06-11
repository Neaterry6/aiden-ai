import logger from "../utils/logger";
import { connection } from "../whatsapp/connection";

export class Supervisor {
  private isRunning = false;

  private heartbeatInterval: any;

  start() {
    if (this.isRunning) return;

    this.isRunning = true;

    logger.info("🛡 Supervisor started");

    this.startHeartbeat();
    this.watchConnection();
  }

  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      try {
        const status = connection.getStatus?.();

        logger.info("💓 Heartbeat:", status);

        if (!status || status === "closed") {
          this.recover();
        }
      } catch (err) {
        logger.error("Heartbeat error:", err);
        this.recover();
      }
    }, 15000); // every 15s
  }

  private watchConnection() {
    connection.on?.("close", () => {
      logger.warn("⚠️ Connection closed detected");
      this.recover();
    });

    connection.on?.("error", (err: any) => {
      logger.error("❌ Connection error:", err);
      this.recover();
    });
  }

  private async recover() {
    try {
      logger.warn("🔄 Attempting recovery...");

      await connection.reconnect?.();

      logger.info("✅ Recovery successful");
    } catch (err) {
      logger.error("❌ Recovery failed:", err);

      setTimeout(() => this.recover(), 5000);
    }
  }

  stop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.isRunning = false;

    logger.info("🛑 Supervisor stopped");
  }
}

export const supervisor = new Supervisor();

export default supervisor;
