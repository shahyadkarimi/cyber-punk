import mongoose, { Schema, type Document, Types } from "mongoose";
import type { Users } from "./UsersModel";
import type { Domains } from "./DomainsModel";

export interface WalletTransactions extends Document {
  order_id: string;
  track_id: string;
  user_id?: Types.ObjectId | Users | null;
  amount: number;
  status: string;
  payment_method?: string;
  transaction_hash?: string;
  currency?: string;
  network?: string;
  wallet_address?: string;
  completed_at?: Date;
  created_at: Date;
}

const TransactionSchema: Schema = new Schema<WalletTransactions>({
  order_id: { type: String, required: true, unique: true },
  track_id: { type: String, required: true, unique: true },
  user_id: {
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

export default mongoose.models.WalletTransactions ||
  mongoose.model<WalletTransactions>("WalletTransactions", TransactionSchema);
