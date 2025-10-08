import { postData } from "@/lib/fetch-util";
import type { SignupFormData } from "@/routes/auth/sign-up";
import { useMutation } from "@tanstack/react-query";
import type { LoginResponse, SignInSchema, User } from "@/types";

export const useSignUpMutation = () => {
  return useMutation<User, Error, SignupFormData>({
    mutationFn: (data) => postData<User>("/auth/register", data),
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation<{ message: string }, Error, { token: string }>({
    mutationFn: (data) =>
      postData<{ message: string }>("/auth/verify-email", data),
  });
};

export const useLoginMutation = () => {
  return useMutation<LoginResponse, Error, SignInSchema>({
    mutationFn: (data) => postData<LoginResponse>("/auth/login", data),
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation<{ message: string }, Error, { email: string }>({
    mutationFn: (data) =>
      postData<{ message: string }>("/auth/reset-password-request", data),
  });
};

export const useResetPasswordMutation = () => {
  return useMutation<
    { message: string },
    Error,
    { token: string; newPassword: string; confirmPassword: string }
  >({
    mutationFn: (data) =>
      postData<{ message: string }>("/auth/reset-password", data),
  });
};
