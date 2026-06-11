import makeWASocket, {
  Browsers,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  useMultiFileAuthState,
} from "@whiskeysockets/baileys";

import { Boom } from "@hapi/boom";
import P from "pino";
import logger from "../utils/logger";

const DEFAULT_SESSION_PATH = "./sessions/auth";
const MAX_RECONNECT_DELAY_MS = 30000;
const RECONNECT_STEP_MS = 2500;
const baileysLogger = P({ level: "silent" });
const signalKeyLogger = P({ level: "fatal" }).child({ level: "fatal" });

function getBrowserProfile() {
  return typeof Browsers?.ubuntu === "function"
    ? Browsers.ubuntu("Chrome")
    : Browsers.macOS("Chrome");
}

type WhatsAppStatus = "open" | "closed" | "connecting";

type WhatsAppEvent = "close" | "error" | "open";

function getDisconnectStatusCode(error: unknown): number {
  const boom = error as Boom;
  const outputStatus = boom?.output?.statusCode;
  const directStatus = (error as { statusCode?: number })?.statusCode;

  return Number(outputStatus || directStatus || 0);
}

function normalizePairingNumber(value?: string): string {
  return (value || "").replace(/[^0-9]/g, "");
}

function formatPairingCode(code: string): string {
  return code.match(/.{1,4}/g)?.join("-") || code;
}

export class WhatsAppConnection {
  private sock: any;

  private readonly authFolder =
    process.env.WHATSAPP_SESSION_PATH || DEFAULT_SESSION_PATH;

  private status: WhatsAppStatus = "closed";

  private reconnectAttempts = 0;

  private reconnectTimer?: NodeJS.Timeout;

  private isShuttingDown = false;

  private isStarting = false;

  private listeners: Record<
    WhatsAppEvent,
    ((arg?: any) => void)[]
  > = {
    close: [],
    error: [],
    open: [],
  };

  async start(): Promise<void> {
    if (this.isStarting || this.status === "open") {
      return;
    }

    this.isStarting = true;
    this.status = "connecting";

    try {
      const { state, saveCreds } =
        await useMultiFileAuthState(this.authFolder);

      const { version } = await fetchLatestBaileysVersion().catch(() => ({
        version: [2, 3000, 1025091844] as [number, number, number],
      }));

      const pairingNumber = normalizePairingNumber(
        process.env.WHATSAPP_PAIRING_NUMBER || process.env.OWNER_NUMBER
      );
      let pairingRequested = false;

      logger.info(
        `Connecting to WhatsApp with Baileys v${version.join(".")}...`
      );

      this.closeSocket();

      this.sock = makeWASocket({
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            signalKeyLogger
          ),
        },
        printQRInTerminal: false,
        browser: getBrowserProfile(),
        markOnlineOnConnect: false,
        syncFullHistory: false,
        defaultQueryTimeoutMs: 60000,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 25000,
        retryRequestDelayMs: 250,
        generateHighQualityLinkPreview: false,
        logger: baileysLogger,
        version,
        getMessage: async () => ({ conversation: "" }),
      });

      this.sock.ev.on("creds.update", saveCreds);

      this.sock.ev.on("connection.update", async (update: any) => {
        const { connection, lastDisconnect, qr } = update;

        if (connection === "connecting") {
          this.status = "connecting";

          if (!state.creds?.registered && !pairingRequested) {
            pairingRequested = true;

            setTimeout(() => {
              this.requestPairingCode(pairingNumber).catch((error) => {
                logger.warn(
                  `Pairing request failed: ${(error as Error).message}`
                );
              });
            }, 2000);
          }
        }

        if (qr) {
          logger.warn(
            "QR event received, but pairing-code login is required. Set WHATSAPP_PAIRING_NUMBER to receive a code."
          );
        }

        if (connection === "open") {
          this.reconnectAttempts = 0;
          this.status = "open";
          logger.info("🤖 WhatsApp Bot LIVE → Connected and ready.");
          this.setupEventHandlers();
          this.emit("open");
        }

        if (connection === "close") {
          const statusCode = getDisconnectStatusCode(
            lastDisconnect?.error
          );
          const shouldReconnect =
            statusCode !== DisconnectReason.loggedOut && statusCode !== 401;

          this.status = "closed";
          logger.warn(
            `WhatsApp connection closed. Code: ${statusCode || "unknown"}`
          );
          this.closeSocket();

          if (this.isShuttingDown) return;

          if (!shouldReconnect) {
            logger.warn(
              `Session logged out. Remove ${this.authFolder} and restart with WHATSAPP_PAIRING_NUMBER to pair again.`
            );
            this.emit("close", statusCode);
            return;
          }

          this.scheduleReconnect();
          this.emit("close", statusCode);
        }
      });
    } catch (error) {
      this.status = "closed";
      this.emit("error", error);
      this.scheduleReconnect();
      throw error;
    } finally {
      this.isStarting = false;
    }
  }

  getSocket() {
    return this.sock;
  }

  getStatus() {
    return this.status;
  }

  on(event: WhatsAppEvent, handler: (arg?: any) => void) {
    this.listeners[event].push(handler);
  }

  async reconnect() {
    logger.warn("Attempting to reconnect...");
    this.clearReconnectTimer();
    this.status = "closed";
    await this.start();
  }

  async shutdown(signal = "shutdown") {
    this.isShuttingDown = true;
    this.clearReconnectTimer();
    logger.info(`Received ${signal}; shutting down WhatsApp bot...`);
    this.closeSocket(signal);
  }

  private async requestPairingCode(pairingNumber: string): Promise<void> {
    if (!this.sock || this.sock.authState?.creds?.registered) {
      return;
    }

    if (!pairingNumber) {
      logger.warn(
        "Set WHATSAPP_PAIRING_NUMBER (digits only, country code included) to receive a WhatsApp pairing code."
      );
      return;
    }

    const code = await this.sock.requestPairingCode(pairingNumber);
    logger.info(`PAIRING CODE: ${formatPairingCode(code)}`);
  }

  private setupEventHandlers() {
    if (!this.sock) return;

    this.sock.ev.removeAllListeners("messages.upsert");

    this.sock.ev.on("messages.upsert", async (event: any) => {
      try {
        const message = event.messages?.[0];

        if (!message?.message) return;

        logger.info("Incoming WhatsApp message received");
        const { messageHandler } = await import(
          "../handlers/message.handler"
        );
        await messageHandler.handle(event);
      } catch (error) {
        logger.error("WhatsApp message handler error:", error);
        this.emit("error", error);
      }
    });

    this.sock.ev.on("groups.upsert", async (groups: any[]) => {
      try {
        const { groupApprovalGate } = await import(
          "../permissions/group-approval"
        );

        for (const group of groups || []) {
          if (group?.id) {
            await groupApprovalGate.markPending(group.id);
          }
        }
      } catch (error) {
        logger.warn("Could not mark new group as pending approval:", error);
      }
    });

    logger.info("All WhatsApp event handlers registered.");
  }

  private scheduleReconnect() {
    if (this.isShuttingDown || this.reconnectTimer) return;

    this.reconnectAttempts += 1;
    const delayMs = Math.min(
      MAX_RECONNECT_DELAY_MS,
      this.reconnectAttempts * RECONNECT_STEP_MS
    );

    logger.warn(
      `Scheduling WhatsApp reconnect attempt ${this.reconnectAttempts} in ${delayMs}ms...`
    );

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.start().catch((error) => {
        logger.error("Reconnect failed:", error);
        this.scheduleReconnect();
      });
    }, delayMs);
  }

  private clearReconnectTimer() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
  }

  private closeSocket(reason = "reconnect") {
    try {
      this.sock?.ev?.removeAllListeners?.();
      this.sock?.ws?.close?.();
      this.sock?.end?.(new Error(reason));
    } catch (_error) {
      // Ignore socket teardown errors; Baileys may already have closed it.
    } finally {
      this.sock = undefined;
    }
  }

  private emit(event: WhatsAppEvent, arg?: any) {
    this.listeners[event].forEach((handler) => handler(arg));
  }
}

export const whatsappConnection = new WhatsAppConnection();

export default whatsappConnection;
