import { z } from "zod"

export const registerFormSchema = z.object({
  name: z
    .string()
    .min(2, "Display name must be at least 2 characters")
    .regex(/^[A-Za-z0-9_]+$/, "Use letters, numbers or underscores only"),
  email: z
    .string()
    .email("Enter a valid email")
    .refine((e) => e.toLowerCase().endsWith("stud.noroff.no"), {
      message: "Email must end with @stud.noroff.no",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  venueManager: z.boolean(),
})

export type RegisterFormValues = z.infer<typeof registerFormSchema>

export const loginFormSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
