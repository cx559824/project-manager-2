import { z } from "zod";

export const signUpSchema = z
	.object({
		email: z.string().email("Invalid email address"),
		password: z.string().min(8, "Password must be 8 characters"),
		confirmPassword: z.string().min(8, "Confirm password must be 8 characters"),
		name: z
			.string()
			.min(1, "Name is required")
			.regex(/^[a-zA-Z\s]+$/, "Name must contain only letters and spaces"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type SignUpSchema = z.infer<typeof signUpSchema>;
