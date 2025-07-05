import mongoose, { Schema, type Document, Types } from "mongoose";
import type { Users } from "./UsersModel";

export interface WebShells extends Document {
  name: string;
  description?: string | null;
  file_path: string;
  language: string;
  category: string;
  tags: string[];
  download_count: number;
  is_active: boolean;
  uploaded_by?: Types.ObjectId | Users | null;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date;
}

const WebShellSchema: Schema = new Schema<WebShells>({
  name: { type: String, required: true },
  description: { type: String, default: null },
  file_path: { type: String, required: true },
  language: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], default: [] },
  download_count: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
  uploaded_by: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  deleted_at: { type: Date, default: null },
});

export default mongoose.models.WebShells ||
  mongoose.model<WebShells>("WebShells", WebShellSchema);
