import { z } from "zod";

const strongPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.")
  .max(100, "Password must be 100 characters or fewer.")
  .regex(/[a-z]/, "Password must include at least one lowercase letter.")
  .regex(/[A-Z]/, "Password must include at least one uppercase letter.")
  .regex(/[0-9]/, "Password must include at least one number.")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must include at least one special character.",
  );

export const signupSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
  password: strongPasswordSchema,
  displayName: z.string().min(2).max(40).optional(),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(100),
});

export const profileUpdateSchema = z
  .object({
    displayName: z.string().min(2).max(40).optional(),
    avatarUrl: z.string().url().max(500).optional(),
    bio: z.string().max(400).optional(),
    location: z.string().max(120).optional(),
  })
  .refine((payload) => Object.keys(payload).length > 0, {
    message: "At least one profile field is required.",
  });
