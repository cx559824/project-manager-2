import express from "express";

import { validateRequest } from "zod-express-middleware";
import {
	loginUser,
	registerUser,
	resetPasswordRequest,
	verifyEmail,
	verifyResetPasswordTokenAndResetPassword,
} from "../controllers/auth-controller.js";
import {
	emailSchema,
	loginSchema,
	registerSchema,
	resetPasswordSchema,
	verifySchema,
} from "../libs/validate-schema.js";

const router = express.Router();

router.post(
	"/register",
	validateRequest({ body: registerSchema }),
	registerUser,
);

router.post("/login", validateRequest({ body: loginSchema }), loginUser);

router.post(
	"/verify-email",
	validateRequest({ body: verifySchema }),
	verifyEmail,
);

router.post(
	"/reset-password-request",
	validateRequest({ body: emailSchema }),
	resetPasswordRequest,
);

router.post(
	"/reset-password",
	validateRequest({ body: resetPasswordSchema }),
	verifyResetPasswordTokenAndResetPassword,
);

export default router;
