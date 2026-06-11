import { Schema, model } from "mongoose";

export interface MemoryRecord {
  _id?: string;
  userId: string;
  groupId?: string;
  key: string;
  value: string;
  timestamp: number;
  ttl?: number;
}

const memorySchema = new Schema<MemoryRecord>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    groupId: {
      type: String,
      index: true,
    },
    key: {
      type: String,
      required: true,
    },
    value: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Number,
      default: () => Date.now(),
      index: true,
    },
    ttl: Number,
  },
  {
    timestamps: false,
  }
);

// TTL index: automatically delete records after ttl seconds
memorySchema.index(
  { timestamp: 1 },
  { expireAfterSeconds: 2592000 } // 30 days default
);

export const MemoryModel = model<MemoryRecord>(
  "Memory",
  memorySchema
);
