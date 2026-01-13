"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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

// Services & Hooks
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { useAuthStore } from "@/store/authStore";
import { AuthError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

function VerifyOTPContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { login } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpType, setOtpType] = useState("registration");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const passwordParam = searchParams.get("password");
    const typeParam = searchParams.get("type") || "registration";

    if (!emailParam) {
      router.push("/register");
      return;
    }

    setEmail(emailParam);
    setPassword(passwordParam || "");
    setOtpType(typeParam);
  }, [searchParams, router]);

  // Countdown timer for OTP resend
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Verify OTP mutation
  const verifyMutation = useMutation({
    mutationFn: async () => {
      return authService.verifyOTP({
        identifier: email,
        otp_code: otp,
        otp_type: otpType,
        role: "organizer",
      });
    },
    onSuccess: async () => {
      toast.success("auth.toast.otpVerified", "Email verified successfully!");

      if (otpType === "password_reset") {
        // For password reset, redirect to reset password page
        router.push(
          `/resetpassword?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`
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
        toast.error("", err.message || "Invalid OTP. Please try again.", err.details);
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
      setError("");
      setOtp("");
      toast.success("auth.toast.otpResent", "New code sent to your email");
      setResendTimer(60);
    },
    onError: (err: Error) => {
      if (err instanceof AuthError) {
        toast.error("", err.message || "Failed to resend OTP. Please try again.", err.details);
      } else {
        toast.error("", "Failed to resend OTP. Please try again.");
      }
    },
  });

  const handleVerify = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (otp.length < 6) {
      setError(
        t("auth.verifyOTP.errors.otpIncomplete", "Please enter the complete 6-digit code")
      );
      return;
    }
    setError("");
    verifyMutation.mutate();
  };

  const handleResendOTP = () => {
    resendMutation.mutate();
  };

  return (
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
                  {t("auth.verifyOTP.subtitle", "Enter the 6-digit code sent to")}
                  <br />
                  <strong>{email}</strong>
                  <br />
                  {t("auth.verifyOTP.otpValidity", "The code will expire in 10 minutes.")}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* OTP Form */}
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className="h-14 w-14 text-lg" />
                      <InputOTPSlot index={1} className="h-14 w-14 text-lg" />
                      <InputOTPSlot index={2} className="h-14 w-14 text-lg" />
                      <InputOTPSlot index={3} className="h-14 w-14 text-lg" />
                      <InputOTPSlot index={4} className="h-14 w-14 text-lg" />
                      <InputOTPSlot index={5} className="h-14 w-14 text-lg" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>

                {/* Verify Button */}
                <Button
                  type="submit"
                  disabled={verifyMutation.isPending || otp.length < 6}
                  className={cn(
                    "w-full h-12 rounded-lg font-medium transition-all duration-200",
                    "bg-blue-600 hover:bg-blue-700 text-white",
                    "shadow-lg hover:shadow-xl",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    verifyMutation.isPending && "animate-pulse"
                  )}
                >
                  {verifyMutation.isPending
                    ? t("auth.verifyOTP.verifying", "Verifying...")
                    : t("auth.verifyOTP.verifyButton", "Verify OTP")}
                </Button>
              </form>

              {/* Resend OTP */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  {t("auth.verifyOTP.didntReceive", "Didn't receive the code?")}{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendMutation.isPending || resendTimer > 0}
                    className="font-medium cursor-pointer text-primary hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {resendMutation.isPending
                      ? t("auth.verifyOTP.resending", "Resending...")
                      : resendTimer > 0
                        ? `${t("auth.verifyOTP.resendIn", "Resend in")} ${resendTimer}s`
                        : t("auth.verifyOTP.resend", "Resend")}
                  </button>
                </p>
                <p className="text-xs text-gray-500">
                  {t(
                    "auth.verifyOTP.checkSpam",
                    "Check your spam folder if you don't see the email"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpForm() {
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
      <VerifyOTPContent />
    </Suspense>
  );
}
