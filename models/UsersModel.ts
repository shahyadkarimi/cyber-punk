import mongoose, { Schema, Types, type Document } from "mongoose";

export interface Users extends Document {
  id: number;
  email: string;
  password: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  role: "admin" | "seller" | "client";
  is_active: boolean;
  last_login_at?: Date;
  parent_referral?: number;
  referral_code?: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
  email_confirmed_at?: Date;
  balance?: number;
  admin_approved: boolean;
  reset_token?: string;
  reset_token_expires?: Date;
}

const UserSchema: Schema = new Schema<Users>({
  id: { type: Number, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, sparse: true, default: null },
  full_name: { type: String, default: null },
  avatar_url: { type: String, default: null },
  role: {
    type: String,
    enum: ["admin", "seller", "client"],
    default: "client",
  },
  is_active: { type: Boolean, default: true },
  last_login_at: { type: Date, default: null },
  referral_code: { type: Number, required: true, unique: true },
  parent_referral: {
    type: Number,
    default: null,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
  email_confirmed_at: { type: Date, default: null },
  balance: { type: Number, default: 0 },
  admin_approved: { type: Boolean, default: false },
  reset_token: { type: String, default: null },
  reset_token_expires: { type: Date, default: null },
});

export default mongoose.models.User ||
  mongoose.model<Users>("User", UserSchema);
