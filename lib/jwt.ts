import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

if (!JWT_SECRET) {
  throw new Error("Please define the JWT_SECRET environment variable");
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string | null): JWTPayload | null | undefined {
  try {
    if (token) {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    }
  } catch (error) {
    return null;
  }
}
