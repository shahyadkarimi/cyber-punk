import mongoose, { Schema, type Document, Types } from "mongoose";
import type { Users } from "./UsersModel";
import type { Domains } from "./DomainsModel";


export interface Watchlist extends Document {
  user: Types.ObjectId | Users;
  domain: number;
  added_at: Date;
}

const WatchlistSchema: Schema = new Schema<Watchlist>({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  domain: {
    type: Number,
    required: true,
    index: true,
  },
  added_at: {
    type: Date,
    default: Date.now,
  },
});

WatchlistSchema.index({ user: 1, domain: 1 }, { unique: true });

export default mongoose.models.Watchlist ||
  mongoose.model<Watchlist>("Watchlist", WatchlistSchema);
