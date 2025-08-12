import z from "zod";

export const resetPasswordSchema = z
	.object({
		newPassword: z.string().min(8, "Password must be 8 characters"),
		confirmPassword: z.string().min(8, "Password must be 8 characters"),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>;
