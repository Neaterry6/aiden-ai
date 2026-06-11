import logger from "../utils/logger";

import { messageRouter } from "../core/router";
import { aiService } from "../services/ai.service";
import { responseBuilder } from "../core/response-builder";

import { messageSender } from "../whatsapp/sender";
import { whatsappConnection } from "../whatsapp/connection";
import { rateLimiter } from "../security/rate-limiter";
import { presenceEngine } from "../core/presence-engine";
import { groupApprovalGate } from "../permissions/group-approval";

export class MessageHandler {
  async handle(event: any): Promise<void> {
    try {
      const message = event.messages?.[0];
      if (!message?.message) return;

      const isGroup = message.key?.remoteJid?.endsWith("@g.us");

      const senderId =
        message.key?.participant ||
        message.key?.remoteJid;

      const groupId = isGroup
        ? message.key?.remoteJid
        : undefined;

      const text =
        message.message?.conversation ||
        message.message?.extendedTextMessage?.text ||
        "";

      if (isGroup) {
        const approval = await groupApprovalGate.evaluate({
          sock: whatsappConnection.getSocket(),
          groupId,
          senderId,
          text,
        });

        if (!approval.allowed) {
          if (approval.response) {
            await messageSender.sendText({
              jid: groupId!,
              text: approval.response,
              quoted: message,
            });
          }

          return;
        }
      }

      // 🚨 RATE LIMIT CHECK
      if (isGroup) {
        if (!rateLimiter.allowGroup(groupId!)) return;
      } else {
        if (!rateLimiter.allowUser(senderId)) return;
      }

      const ctx = {
        senderId,
        groupId,
        isGroup,
        text,
      };

      logger.info("Incoming message:", ctx);

      // ⚡ COMMAND ROUTER FIRST
      const route = await messageRouter.route(ctx);

      if (route.handled) {
        if (route.response) {
          const jid = groupId || senderId;

          await messageSender.sendText({
            jid,
            text: route.response,
            quoted: message,
          });
        }
        return;
      }

      // 🧠 AI GENERATION
      const ai = await aiService.generate(ctx);

      const final = await responseBuilder.build({
        text: ai.text,
        mode: isGroup ? "GROUP" : "DM",
        senderId,
      });

      const jid = groupId || senderId;

      // 🧍 HUMAN-LIKE RESPONSE DELAY
      const delay = await presenceEngine.simulate({
        isGroup,
        text: final.text,
      });

      setTimeout(async () => {
        await messageSender.sendText({
          jid,
          text: final.text,
          quoted: message,
        });
      }, delay);

    } catch (err) {
      logger.error("Message handler error:", err);
    }
  }
}

export const messageHandler = new MessageHandler();
export default messageHandler;
