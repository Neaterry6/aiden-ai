import { Schema, model } from "mongoose";

export interface Group {
  _id?: string;
  groupId: string;
  name: string;
  participants: string[];
  admins: string[];
  owner: string;
  enabled: boolean;
  settings: {
    autoRespond: boolean;
    ignoreKeywords: string[];
    respondOnlyToMentions: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const groupSchema = new Schema<Group>(
  {
    groupId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    participants: [String],
    admins: [String],
    owner: {
      type: String,
      required: true,
      index: true,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    settings: {
      autoRespond: { type: Boolean, default: true },
      ignoreKeywords: [String],
      respondOnlyToMentions: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const GroupModel = model<Group>(
  "Group",
  groupSchema
);
