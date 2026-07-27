import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const confirmResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required"),
    password: z.string().min(6, "Password must be at least 6 characters long"),
    confirmPassword: z
      .string()
      .min(6, "Password must be at least 6 characters long"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export type ConfirmResetPasswordValues = z.infer<
  typeof confirmResetPasswordSchema
>;
