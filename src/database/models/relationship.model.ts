import { Schema, model } from "mongoose";

export interface Relationship {
  _id?: string;
  fromUserId: string;
  toUserId: string;
  type:
    | "friend"
    | "blocked"
    | "muted"
    | "favorite";
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const relationshipSchema = new Schema<Relationship>(
  {
    fromUserId: {
      type: String,
      required: true,
      index: true,
    },
    toUserId: {
      type: String,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["friend", "blocked", "muted", "favorite"],
      required: true,
    },
    metadata: Schema.Types.Mixed,
  },
  {
    timestamps: true,
  }
);

// Ensure unique relationship per user pair and type
relationshipSchema.index(
  { fromUserId: 1, toUserId: 1, type: 1 },
  { unique: true }
);

export const RelationshipModel =
  model<Relationship>("Relationship", relationshipSchema);
