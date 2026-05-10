"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useRouter } from "next/router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";

// Icons
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";

// UI Components
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  TranslatedFormMessage,
} from "@/components/ui/form";

// Services & Hooks
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { AuthError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { registerOTPSchema, RegisterOTPFormData } from "@/lib/validation";

function VerifyOTPContent() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpType, setOtpType] = useState("registration");
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    if (!router.isReady) return;

    const emailParam = router.query.email as string;
    const passwordParam = router.query.password as string;
    const typeParam = (router.query.type as string) || "registration";

    if (!emailParam) {
      router.push("/register");
      return;
    }

    setEmail(emailParam);
    setPassword(passwordParam || "");
    setOtpType(typeParam);
  }, [router.isReady, router.query]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Use centralized schema with memoization
  const otpSchema = useMemo(
    () => registerOTPSchema((key, fallback, params) => key),
    [],
  );

  const form = useForm<RegisterOTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
    mode: "onChange",
  });

  // Verify OTP mutation
  const verifyMutation = useMutation({
    mutationFn: async (data: RegisterOTPFormData) => {
      return authService.verifyOTP({
        identifier: email,
        otp_code: data.otp,
        otp_type: otpType,
        role: "organizer",
      });
    },
    onSuccess: async () => {
      toast.success("auth.toast.otpVerified", "Email verified successfully!");

      if (otpType === "password_reset") {
        // For password reset, redirect to reset password page
        router.push(
          `/resetpassword?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(form.getValues("otp"))}`,
        );
      } else if (password) {
        // For registration, auto-login
        await login({ email, password });
        router.push("/");
      } else {
        router.push("/");
      }
    },
    onError: (err: Error) => {
      if (err instanceof AuthError) {
        toast.error(
          "",
          err.message || "Invalid OTP. Please try again.",
          err.details,
        );
      } else {
        toast.error("auth.toast.serverError", "Invalid OTP. Please try again.");
      }
    },
  });

  // Resend OTP mutation
  const resendMutation = useMutation({
    mutationFn: async () => {
      return authService.sendOTP({
        identifier: email,
        otp_type: otpType,
      });
    },
    onSuccess: () => {
      form.reset();
      toast.success("auth.toast.otpResent", "New code sent to your email");
      setResendTimer(60);
    },
    onError: (err: Error) => {
      if (err instanceof AuthError) {
        toast.error(
          "",
          err.message || "Failed to resend OTP. Please try again.",
          err.details,
        );
      } else {
        toast.error("", "Failed to resend OTP. Please try again.");
      }
    },
  });

  const onSubmit = (data: RegisterOTPFormData) => {
    verifyMutation.mutate(data);
  };

  const handleResendOTP = () => {
    resendMutation.mutate();
  };

  return (
    <>
      {verifyMutation.isPending && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            <p className="text-sm font-medium text-gray-700">
              {t("auth.verifyOTP.verifying", "Verifying...")}
            </p>
          </div>
        </div>
      )}
      <div className="relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
        <div className="w-full max-w-[410px] relative z-10">
          <div className="relative">
            <div className="glass-login-card rounded-2xl p-4 sm:p-6">
              <div className="space-y-6 p-2 sm:p-3">
                {/* Back Button */}
                <button
                  onClick={() => {
                    if (otpType === "password_reset") {
                      sessionStorage.setItem("password_reset_email", email);
                    }
                    router.back();
                  }}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <ArrowLeftIcon size={16} />
                  {t("auth.verifyOTP.back", "Back")}
                </button>

                {/* Header */}
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                    {t("auth.verifyOTP.title", "Verify Your Email")}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {t(
                      "auth.verifyOTP.subtitle",
                      "Enter the 6-digit code sent to",
                    )}
                    <br />
                    <strong>{email}</strong>
                    <br />
                    {t(
                      "auth.verifyOTP.otpValidity",
                      "The code will expire in 10 minutes.",
                    )}
                  </p>
                </div>

                {/* OTP Form */}
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <FormField
                      control={form.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={6}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={
                                  verifyMutation.isPending ||
                                  resendMutation.isPending
                                }
                              >
                                <InputOTPGroup>
                                  <InputOTPSlot
                                    index={0}
                                    className="h-14 w-14 text-lg"
                                  />
                                  <InputOTPSlot
                                    index={1}
                                    className="h-14 w-14 text-lg"
                                  />
                                  <InputOTPSlot
                                    index={2}
                                    className="h-14 w-14 text-lg"
                                  />
                                  <InputOTPSlot
                                    index={3}
                                    className="h-14 w-14 text-lg"
                                  />
                                  <InputOTPSlot
                                    index={4}
                                    className="h-14 w-14 text-lg"
                                  />
                                  <InputOTPSlot
                                    index={5}
                                    className="h-14 w-14 text-lg"
                                  />
                                </InputOTPGroup>
                              </InputOTP>
                            </div>
                          </FormControl>
                          <div className="text-center">
                            <TranslatedFormMessage t={t} />
                          </div>
                        </FormItem>
                      )}
                    />

                    {/* Verify Button */}
                    <Button
                      type="submit"
                      disabled={
                        verifyMutation.isPending || form.watch("otp").length < 6
                      }
                      className={cn(
                        "w-full h-12 rounded-lg font-medium transition-all duration-200",
                        "bg-blue-600 hover:bg-blue-700 text-white",
                        "shadow-lg hover:shadow-xl",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        verifyMutation.isPending && "animate-pulse",
                      )}
                    >
                      {verifyMutation.isPending
                        ? t("auth.verifyOTP.verifying", "Verifying...")
                        : t("auth.verifyOTP.verifyButton", "Verify OTP")}
                    </Button>
                  </form>
                </Form>

                {/* Resend OTP */}
                <div className="text-center space-y-2">
                  <p className="text-sm text-gray-600">
                    {t(
                      "auth.verifyOTP.didntReceive",
                      "Didn't receive the code?",
                    )}{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={
                        resendMutation.isPending ||
                        verifyMutation.isPending ||
                        resendTimer > 0
                      }
                      className="font-medium cursor-pointer text-primary hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendMutation.isPending
                        ? t("auth.verifyOTP.resending", "Resending...")
                        : resendTimer > 0
                          ? t(
                              "auth.verifyOTP.resendIn",
                              "Resend in {resendTimer}s",
                              { resendTimer },
                            )
                          : t("auth.verifyOTP.resend", "Resend")}
                    </button>
                  </p>
                  <p className="text-xs text-gray-500">
                    {t(
                      "auth.verifyOTP.checkSpam",
                      "Check your spam folder if you don't see the email",
                    )}
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

export default function VerifyOtpForm() {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  return (
    <Suspense
      fallback={
        <div className="min-h-dvh flex items-center justify-center">
          {t("common.loading", "Loading...")}
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
