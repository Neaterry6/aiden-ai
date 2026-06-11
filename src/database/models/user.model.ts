import { Schema, model } from "mongoose";

export interface User {
  _id?: string;
  userId: string;
  phoneNumber: string;
  name?: string;
  role: "user" | "admin" | "owner";
  preferences: {
    language?: string;
    timezone?: string;
    dmEnabled: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<User>(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    name: String,
    role: {
      type: String,
      enum: ["user", "admin", "owner"],
      default: "user",
    },
    preferences: {
      language: { type: String, default: "en" },
      timezone: String,
      dmEnabled: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const UserModel = model<User>(
  "User",
  userSchema
);
