import mongoose, { Schema, type Document, Types } from "mongoose";
import type { Users } from "./UsersModel";

export interface Domains extends Document {
  id: number;
  domain: string;
  description?: string | null;
  price?: number | null;
  status: "pending" | "approved" | "rejected" | "sold";
  seller_id: Types.ObjectId | Users;
  buyer_id?: Types.ObjectId | Users | null;
  admin_notes?: string | null;
  da_score?: number | null;
  pa_score?: number | null;
  traffic?: number | null;
  category?: string | null;
  country?: string | null;
  premium?: boolean;
  tags: string[];
  approved_at?: Date | null;
  approved_by?: Types.ObjectId | Users | null;
  sold_at?: Date | null;
  created_at: Date;
  deleted_at: Date | null;
}

const DomainSchema: Schema = new Schema<Domains>({
  id: { type: Number, required: true, unique: true },
  domain: { type: String, required: true, unique: true },
  description: { type: String, default: null },
  price: { type: Number, default: null },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected", "sold"],
    default: "pending",
  },
  seller_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  buyer_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  admin_notes: { type: String, default: null },
  da_score: { type: Number, default: null },
  pa_score: { type: Number, default: null },
  traffic: { type: Number, default: null },
  category: { type: String, default: null },
  country: { type: String, default: null },
  premium: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  approved_at: { type: Date, default: null },
  approved_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  sold_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

export default mongoose.models.Domains ||
  mongoose.model<Domains>("Domains", DomainSchema);
