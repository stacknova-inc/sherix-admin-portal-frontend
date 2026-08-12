"use client";

import { useMutation } from "@tanstack/react-query";
import {
  authApi,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/services/auth";
import { useUiStore } from "@/store/use-ui-store";

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) => authApi.forgotPassword(input),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) => authApi.resetPassword(input),
  });
}

export function useLogout() {
  const signOut = useUiStore((state) => state.signOut);

  return useMutation({
    mutationFn: () => authApi.logout(),
    onSettled: () => signOut(),
  });
}
