"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

// Icons
import { EyeIcon, KeyIcon, EyeClosedIcon } from "@phosphor-icons/react/dist/ssr";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";

// Services & Hooks
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { AuthError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import {
  resetPasswordSchema,
  ResetPasswordFormData,
} from "@/lib/validation";

// Local components
import { PasswordRequirements } from "../components/PasswordRequirements";

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const otpParam = searchParams.get("otp");

    if (!emailParam || !otpParam) {
      router.push("/forgotpassword");
      return;
    }

    setEmail(emailParam);
    setOtp(otpParam);
  }, [searchParams, router]);

  // Use centralized schema with memoization
  const schema = useMemo(
    () => resetPasswordSchema((key, fallback, params) => key),
    []
  );

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // Reset password mutation
  const resetMutation = useMutation({
    mutationFn: async (data: ResetPasswordFormData) => {
      return authService.resetPassword({
        otp: otp,
        email_token: email,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
    },
    onSuccess: () => {
      toast.success("auth.toast.passwordResetSuccess", "Password reset successful!");
      setIsSuccess(true);
      sessionStorage.removeItem("password_reset_email");
      router.push("/login");
    },
    onError: (err: Error) => {
      if (err instanceof AuthError) {
        toast.error(
          "auth.toast.serverError",
          err.message || "Failed to reset password. Please try again."
        );
      } else {
        toast.error("auth.toast.serverError", "Failed to reset password. Please try again.");
      }
    },
  });

  const onSubmit = (data: ResetPasswordFormData) => {
    resetMutation.mutate(data);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
      <div className="w-full max-w-[480px] relative z-10">
        <div className="relative">
          <div className="glass-login-card rounded-2xl p-4 sm:p-6">
            <div className="space-y-6 p-2 sm:p-3">
              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                  {t("auth.resetPassword.title", "Reset Password")}
                </h1>
                <p className="text-sm text-gray-600">
                  {t("auth.resetPassword.subtitle", "Set a new password for")}{" "}
                  <strong>{email}</strong>
                </p>
              </div>

              {isSuccess ? (
                <div className="space-y-6">
                  <div className="p-4 rounded-lg bg-green-50 border border-green-200">
                    <p className="text-sm text-green-700 text-center">
                      {t(
                        "auth.resetPassword.successMessage",
                        "Password reset successful! Redirecting to login..."
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Form */}
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* New Password Field */}
                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">
                              {t("auth.resetPassword.newPassword", "New Password")}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div
                                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                                  aria-hidden="true"
                                >
                                  <KeyIcon weight="duotone" size={24} className="text-gray-600" />
                                </div>
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  autoComplete="new-password"
                                  placeholder={t(
                                    "auth.resetPassword.newPasswordPlaceholder",
                                    "••••••••••••"
                                  )}
                                  className={cn(
                                    "h-12 pl-16 pr-16 login-input",
                                    form.formState.errors.newPassword && "border-destructive"
                                  )}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  aria-label={showNewPassword ? "Hide password" : "Show password"}
                                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
                                >
                                  {showNewPassword ? (
                                    <EyeIcon weight="duotone" size={24} className="text-gray-600" />
                                  ) : (
                                    <EyeClosedIcon
                                      weight="duotone"
                                      size={24}
                                      className="text-gray-600"
                                    />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            {form.formState.errors.newPassword &&
                              form.formState.errors.newPassword.message !== "Invalid input" &&
                              // Filter out messages that are already covered by PasswordRequirements
                              !form.formState.errors.newPassword.message?.includes("must be at least 8 characters") &&
                              !form.formState.errors.newPassword.message?.includes("uppercase and one lowercase") &&
                              !form.formState.errors.newPassword.message?.includes("special character") &&
                              !form.formState.errors.newPassword.message?.includes("numeric digit") && (
                                <TranslatedFormMessage t={t} />
                              )}
                            <PasswordRequirements password={form.watch("newPassword")} />
                          </FormItem>
                        )}
                      />

                      {/* Confirm Password Field */}
                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">
                              {t("auth.resetPassword.confirmPassword", "Confirm Password")}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div
                                  className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                                  aria-hidden="true"
                                >
                                  <KeyIcon weight="duotone" size={24} className="text-gray-600" />
                                </div>
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  autoComplete="new-password"
                                  placeholder={t(
                                    "auth.resetPassword.confirmPasswordPlaceholder",
                                    "••••••••••••"
                                  )}
                                  className={cn(
                                    "h-12 pl-16 pr-16 login-input",
                                    form.formState.errors.confirmPassword && "border-destructive"
                                  )}
                                  {...field}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  aria-label={
                                    showConfirmPassword ? "Hide password" : "Show password"
                                  }
                                  className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
                                >
                                  {showConfirmPassword ? (
                                    <EyeIcon weight="duotone" size={24} className="text-gray-600" />
                                  ) : (
                                    <EyeClosedIcon
                                      weight="duotone"
                                      size={24}
                                      className="text-gray-600"
                                    />
                                  )}
                                </button>
                              </div>
                            </FormControl>
                            <TranslatedFormMessage t={t} />
                          </FormItem>
                        )}
                      />

                      {/* Submit Button */}
                      <div className="space-y-4 pt-2">
                        <Button
                          type="submit"
                          disabled={resetMutation.isPending}
                          className={cn(
                            "w-full h-12 rounded-lg font-medium transition-all duration-200",
                            "bg-blue-600 hover:bg-blue-700 text-white",
                            "shadow-lg hover:shadow-xl",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            resetMutation.isPending && "animate-pulse"
                          )}
                        >
                          {resetMutation.isPending
                            ? t("auth.resetPassword.resetting", "Resetting...")
                              : t("auth.resetPassword.title", "Reset Password")}
                        </Button>
                      </div>
                    </form>
                  </Form>

                  {/* Back to Login */}
                  <div className="text-center">
                    <Link
                      href="/login"
                      className="text-sm cursor-pointer font-medium text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      {t("auth.resetPassword.backToLogin", "Back to login")}
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordForm() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          {t("common.loading", "Loading...")}
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
