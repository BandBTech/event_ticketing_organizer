"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";

// Icons
import { EnvelopeIcon } from "@phosphor-icons/react/dist/ssr";

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
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validation";

export default function ForgotPasswordForm() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Use centralized schema with memoization
  const schema = useMemo(
    () => forgotPasswordSchema((key, fallback, params) => key),
    [],
  );

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  // Populate email from sessionStorage if user navigated back
  useEffect(() => {
    const savedEmail = sessionStorage.getItem("password_reset_email");
    if (savedEmail) {
      form.setValue("email", savedEmail);
      sessionStorage.removeItem("password_reset_email");
    }
  }, [form]);

  // TanStack Query mutation
  const sendResetMutation = useMutation({
    mutationFn: async (email: string) => {
      return authService.requestPasswordReset(email);
    },
    onSuccess: (_, email) => {
      // Save email for potential back navigation
      sessionStorage.setItem("password_reset_email", email);

      // Show success toast
      toast.success(
        "auth.toast.passwordResetSent",
        "Password reset code sent to your email",
      );

      // Redirect to OTP verification page
      router.push(
        `/verify-otp?email=${encodeURIComponent(email)}&type=password_reset`,
      );
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        toast.error(
          "",
          error.message ||
            "Failed to send reset email. Please try again later.",
          error.details,
        );
      } else {
        toast.error("", "Failed to send reset email. Please try again later.");
      }
    },
  });

  const onSubmit = (data: ForgotPasswordFormData) => {
    sendResetMutation.mutate(data.email);
  };

  return (
    <>
      {sendResetMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-700">
              {t("auth.signup.sendingOTP", "Sending verification code")}
            </p>
          </div>
        </div>
      )}
      <div className="relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
        <div className="w-full max-w-[480px] relative z-10">
          <div className="relative">
            <div className="glass-login-card rounded-2xl p-4 sm:p-6">
              <div className="space-y-8 p-2 sm:p-3">
                {/* Header */}
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                    {t("auth.forgotPassword.title", "Forgot Password")}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {t(
                      "auth.forgotPassword.subtitle",
                      "Enter your email to receive a password reset code",
                    )}
                  </p>
                </div>

                {/* Form */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* Email Field */}
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            {t("auth.login.email", "Email Address")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div
                                className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                                aria-hidden="true"
                              >
                                <EnvelopeIcon
                                  weight="duotone"
                                  size={24}
                                  className="text-gray-600"
                                />
                              </div>
                              <Input
                                type="email"
                                autoComplete="email"
                                disabled={sendResetMutation.isPending}
                                placeholder={t(
                                  "auth.login.emailPlaceholder",
                                  "Enter your email address",
                                )}
                                className={cn(
                                  "h-12 pl-16 pr-4 login-input",
                                  form.formState.errors.email &&
                                    "border-destructive",
                                )}
                                {...field}
                              />
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
                        disabled={sendResetMutation.isPending}
                        className={cn(
                          "w-full h-12 rounded-lg font-medium transition-all duration-200",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                          "shadow-lg hover:shadow-xl",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          sendResetMutation.isPending && "animate-pulse",
                        )}
                      >
                        {sendResetMutation.isPending
                          ? t("common.sending", "Sending...")
                          : t(
                              "auth.forgotPassword.sendResetCode",
                              "Send Reset Code",
                            )}
                      </Button>
                    </div>
                  </form>
                </Form>

                {/* Back to Login */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    {t(
                      "auth.forgotPassword.rememberPassword",
                      "Remember your password?",
                    )}{" "}
                    <Link
                      href="/login"
                      className="font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {t("auth.forgotPassword.loginHere", "Login here")}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
