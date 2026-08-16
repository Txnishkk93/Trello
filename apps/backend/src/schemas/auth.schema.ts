import { z } from "zod";

export const signupSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(30),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const signinSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});
export type SigninInput = z.infer<typeof signinSchema>;
