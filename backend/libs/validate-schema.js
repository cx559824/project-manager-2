import z from "zod";

const registerSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

const loginSchema = z.object({
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters long"),
});

const verifySchema = z.object({
	token: z.string().min(1, "Verification token is required"),
});

const resetPasswordSchema = z.object({
	token: z.string().min(1, "Reset password token is required"),
	newPassword: z.string().min(8, "Password must be at least 8 characters long"),
	confirmPassword: z.string().min(8, "Confirm password is required"),
});

const emailSchema = z.object({
	email: z.string().email("Invalid email address"),
});

export {
	registerSchema,
	loginSchema,
	verifySchema,
	resetPasswordSchema,
	emailSchema,
};
