import mongoose, { Schema, type Document } from "mongoose"
import bcrypt from "bcryptjs"

export interface Users extends Document {
  email: string
  password: string
  username?: string
  full_name?: string
  avatar_url?: string
  role: "admin" | "seller" | "client"
  is_active: boolean
  last_login_at?: Date
  created_at: Date
  updated_at: Date
  email_confirmed_at?: Date
  balance?: string
  admin_approved: boolean
  reset_token?: string
  reset_token_expires?: Date
  comparePassword(candidatePassword: string): Promise<boolean>
}

const UserSchema: Schema = new Schema<Users>({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String, unique: true, sparse: true },
  full_name: { type: String },
  avatar_url: { type: String },
  role: {
    type: String,
    enum: ["admin", "seller", "client"],
    default: "client",
  },
  is_active: { type: Boolean, default: true },
  last_login_at: { type: Date },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  email_confirmed_at: { type: Date },
  balance: { type: String },
  admin_approved: { type: Boolean, default: false },
  reset_token: { type: String },
  reset_token_expires: { type: Date },
})

// // Hash password before saving
// UserSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next()

//   try {
//     const salt = await bcrypt.genSalt(12)
//     this.password = await bcrypt.hash(this.password, salt)
//     next()
//   } catch (error: any) {
//     next(error)
//   }
// })

// // Compare password method
// UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
//   return bcrypt.compare(candidatePassword, this.password)
// }

export default mongoose.models.User || mongoose.model<Users>("User", UserSchema)