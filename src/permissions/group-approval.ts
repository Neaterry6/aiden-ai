import fs from "node:fs/promises";
import path from "node:path";

import logger from "../utils/logger";
import { ownerPolicy } from "./owner-policy";

interface GroupApprovalRecord {
  groupId: string;
  approved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupApprovalStore {
  groups: Record<string, GroupApprovalRecord>;
}

interface GroupGateInput {
  sock: any;
  groupId?: string;
  senderId?: string;
  text?: string;
}

interface GroupGateResult {
  allowed: boolean;
  response?: string;
}

const APPROVAL_STORE_PATH = path.join(
  process.cwd(),
  "cache",
  "group-approvals.json"
);

const APPROVE_COMMAND = /^\s*aiden\s+(approve|allow|enable)(\s+(group|gc))?\s*$/i;

function jidDigits(value = ""): string {
  return String(value).replace(/\D/g, "");
}

function isParticipantAdmin(participant: any): boolean {
  return participant?.admin === "admin" || participant?.admin === "superadmin";
}

export class GroupApprovalGate {
  private store?: GroupApprovalStore;

  async evaluate(input: GroupGateInput): Promise<GroupGateResult> {
    const groupId = input.groupId;

    if (!groupId) {
      return { allowed: true };
    }

    const record = await this.getOrCreateRecord(groupId);

    if (record.approved) {
      return { allowed: true };
    }

    if (APPROVE_COMMAND.test(input.text || "")) {
      const canApprove = await this.canApprove(
        input.sock,
        groupId,
        input.senderId || ""
      );

      if (!canApprove) {
        logger.warn(
          `Ignoring group approval command from non-admin ${input.senderId || "unknown"} in ${groupId}`
        );
        return { allowed: false };
      }

      await this.approve(groupId, input.senderId || "unknown");

      return {
        allowed: false,
        response: "✅ Group approved. Aiden can now chat here.",
      };
    }

    logger.info(
      `Ignoring message in unapproved group ${groupId}; waiting for an admin to send \"Aiden approve\".`
    );

    return { allowed: false };
  }

  async markPending(groupId: string): Promise<void> {
    await this.getOrCreateRecord(groupId);
  }

  async approve(groupId: string, approvedBy: string): Promise<GroupApprovalRecord> {
    const store = await this.loadStore();
    const now = new Date().toISOString();
    const current = store.groups[groupId];

    const next: GroupApprovalRecord = {
      groupId,
      approved: true,
      approvedBy,
      approvedAt: now,
      createdAt: current?.createdAt || now,
      updatedAt: now,
    };

    store.groups[groupId] = next;
    await this.saveStore();

    return next;
  }

  async isApproved(groupId: string): Promise<boolean> {
    const store = await this.loadStore();
    return store.groups[groupId]?.approved === true;
  }

  private async canApprove(
    sock: any,
    groupId: string,
    senderId: string
  ): Promise<boolean> {
    if (ownerPolicy.isOwner(senderId)) {
      return true;
    }

    if (typeof sock?.groupMetadata !== "function") {
      return false;
    }

    const senderDigits = jidDigits(senderId);
    if (!senderDigits) return false;

    try {
      const metadata = await sock.groupMetadata(groupId);
      const participant = metadata?.participants?.find((entry: any) => {
        return jidDigits(entry?.id) === senderDigits;
      });

      return isParticipantAdmin(participant);
    } catch (error) {
      logger.warn("Could not fetch group metadata for approval:", error);
      return false;
    }
  }

  private async getOrCreateRecord(groupId: string): Promise<GroupApprovalRecord> {
    const store = await this.loadStore();
    const existing = store.groups[groupId];

    if (existing) return existing;

    const now = new Date().toISOString();
    const record: GroupApprovalRecord = {
      groupId,
      approved: false,
      createdAt: now,
      updatedAt: now,
    };

    store.groups[groupId] = record;
    await this.saveStore();

    return record;
  }

  private async loadStore(): Promise<GroupApprovalStore> {
    if (this.store) return this.store;

    try {
      const raw = await fs.readFile(APPROVAL_STORE_PATH, "utf8");
      const parsed = JSON.parse(raw) as Partial<GroupApprovalStore>;
      this.store = {
        groups: parsed.groups || {},
      };
    } catch {
      this.store = { groups: {} };
    }

    return this.store;
  }

  private async saveStore(): Promise<void> {
    if (!this.store) return;

    await fs.mkdir(path.dirname(APPROVAL_STORE_PATH), { recursive: true });
    await fs.writeFile(
      APPROVAL_STORE_PATH,
      `${JSON.stringify(this.store, null, 2)}\n`,
      "utf8"
    );
  }
}

export const groupApprovalGate = new GroupApprovalGate();

export default groupApprovalGate;
