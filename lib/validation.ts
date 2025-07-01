import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const updateProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional(),
  avatar_url: z.string().url("Invalid image URL").optional(),
});

export const adminUpdateUser = z.object({
  email: z.string().email("Please enter a valid email"),
  full_name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .optional(),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .optional(),
});

export const createDomain = z.object({
  domain: z.string().min(1, "Domain name is required"),
  description: z.string().optional().nullable(),
  price: z.number().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  tags: z
    .array(z.string(), {
      required_error: "Tags must be an array of strings",
    })
    .optional()
    .nullable(),
});

export const editDomain = z.object({
  id: z.string().min(1, "Domain id is required"),
  domain: z.string().min(1, "Domain name is required"),
  description: z.string().optional().nullable(),
  price: z.number().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  tags: z
    .array(z.string(), {
      required_error: "Tags must be an array of strings",
    })
    .optional()
    .nullable(),
});

export const domainAdmin = z.object({
  id: z.string().min(1, "Domain id is required"),
  domain: z.string().min(1, "Domain name is required"),
  description: z.string().optional().nullable(),
  price: z.number().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  country: z.string().optional().nullable(),
  premium: z.boolean().optional().nullable(),
  tags: z
    .array(z.string(), {
      required_error: "Tags must be an array of strings",
    })
    .optional()
    .nullable(),
  status: z.string().min(1, "Status is required"),
  seller_id: z.string().min(1, "Seller is required"),
  admin_notes: z.string().optional().nullable(),
  da_score: z.number().optional().nullable(),
  pa_score: z.number().optional().nullable(),
  traffic: z.number().optional().nullable(),
});

export const createWebShellSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  file_path: z.string().min(1, "File path is required"),
  language: z.string().min(1, "Language is required"),
  category: z.string().min(1, "Category is required"),
  tags: z.array(z.string()).optional(),
  is_active: z.boolean().optional(),
});
