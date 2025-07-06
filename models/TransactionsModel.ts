import mongoose, { Schema, type Document, Types } from "mongoose";
import type { Users } from "./UsersModel";
import type { Domains } from "./DomainsModel";

export interface Transactions extends Document {
  domain_id?: number;
  seller_id?: Types.ObjectId | Users | null;
  buyer_id?: Types.ObjectId | Users | null;
  amount: number;
  status: string;
  payment_method?: string;
  transaction_hash?: string;
  order_id: string;
  track_id: string;
  currency?: string;
  network?: string;
  wallet_address?: string;
  completed_at?: Date;
  created_at: Date;
}

const TransactionSchema: Schema = new Schema<Transactions>({
  order_id: { type: String, required: true, unique: true },
  track_id: { type: String, required: true, unique: true },
  domain_id: {
    type: Number,
    default: null,
  },
  seller_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  buyer_id: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    required: true,
  },
  payment_method: { type: String, default: "oxapay" },
  transaction_hash: { type: String, default: null },

  currency: { type: String, default: null },
  network: { type: String, default: null },
  wallet_address: { type: String, default: null },

  completed_at: { type: Date, default: null },
  created_at: { type: Date, default: Date.now },
});

export default mongoose.models.Transactions ||
  mongoose.model<Transactions>("Transactions", TransactionSchema);
