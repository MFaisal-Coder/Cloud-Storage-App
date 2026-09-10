import * as z from "zod";

export const loginSchema = z.object({
  email: z.email({ message: "Invalid Credentials." }),
/*   password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" })
    .max(20, { message: "Password must be at most 20 characters long" }), */
  otp: z.string().length(4, { message: "OTP must be 4 characters long" }).optional(),
});

export const emailSchema = z.object({
    email: z.email({ message: "Invalid Credentials." }),
})

export const registerSchema = loginSchema.extend({
  name: z
    .string()
    .min(3, { message: "Name must be at least 3 characters long" })
    .max(50, { message: "Name must be at most 50 characters long" }),
});
