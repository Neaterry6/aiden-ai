import { Schema, model } from "mongoose";

export interface Workspace {
  _id?: string;
  name: string;
  ownerId: string;
  members: string[];
  settings: {
    publicMemory: boolean;
    sharedTools: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const workspaceSchema = new Schema<Workspace>(
  {
    name: {
      type: String,
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    members: [
      {
        type: String,
        index: true,
      },
    ],
    settings: {
      publicMemory: { type: Boolean, default: false },
      sharedTools: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const WorkspaceModel = model<Workspace>(
  "Workspace",
  workspaceSchema
);
