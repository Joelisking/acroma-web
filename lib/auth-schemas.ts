import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

/** Industry-standard strong-password checks, also used by the live checklist UI. */
export const PASSWORD_RULES = [
  { id: "length", label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { id: "letter", label: "Contains a letter", test: (v: string) => /[A-Za-z]/.test(v) },
  { id: "number", label: "Contains a number", test: (v: string) => /\d/.test(v) },
  {
    id: "special",
    label: "Contains a special character",
    test: (v: string) => /[^A-Za-z0-9]/.test(v),
  },
] as const;

const strongPassword = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Password is too long")
  .regex(/[A-Za-z]/, "Add at least one letter")
  .regex(/\d/, "Add at least one number")
  .regex(/[^A-Za-z0-9]/, "Add at least one special character");

export const registerSchema = z
  .object({
    name: z.string().min(2, "Business name is too short").max(80),
    email: z.string().email("Enter a valid email address"),
    password: strongPassword,
    confirmPassword: z.string().min(1, "Confirm your password"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords don't match",
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
