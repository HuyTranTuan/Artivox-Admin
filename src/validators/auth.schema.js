import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(6).max(50),
  phone: z.string().min(10).max(11),
  password: z.string().min(8).max(16),
  confirmPassword: z.string().min(6).max(16),
});
