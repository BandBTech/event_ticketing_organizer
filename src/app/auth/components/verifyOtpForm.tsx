"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService, AuthError } from "@/lib/authService";
import { useAuthStore } from "@/store/authStore";
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
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const passwordParam = searchParams.get("password");
    const typeParam = searchParams.get("type") || "registration";

    if (!emailParam) {
      router.push("/signup");
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

  const handleVerify = async () => {
    if (otp.length < 6) {
      setError(
        t(
          "auth.verifyOTP.errors.otpIncomplete",
          "Please enter the complete 6-digit code"
        )
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Verify OTP
      await authService.verifyOTP({
        identifier: email,
        otp_code: otp,
        otp_type: otpType,
        role: "user",
      });

      // Show success toast
      toast.success("auth.toast.otpVerified", "Email verified successfully!");

      // Handle different OTP types
      if (otpType === "password_reset") {
        // For password reset, redirect to reset password page
        router.push(
          `/reset-password?email=${encodeURIComponent(
            email
          )}&otp=${encodeURIComponent(otp)}`
        );
      } else if (password) {
        // For registration, auto-login
        await login({
          email,
          password,
        });
        router.push("/");
      } else {
        // Fallback to homepage
        router.push("/");
      }
    } catch (err) {

      // Show error toast
      if (err instanceof AuthError) {
        toast.error(
          "",
          err.message || "Invalid OTP. Please try again.",
          err.details
        );
      } else {
        toast.error("auth.toast.serverError", "Invalid OTP. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setIsResending(true);
    setError("");

    try {
      await authService.sendOTP({
        identifier: email,
        otp_type: otpType,
      });

      setError("");
      setOtp("");
      // Show success toast
      toast.success("auth.toast.otpResent", "New code sent to your email");

      // Restart 1-minute timer
      setResendTimer(60);
    } catch (err) {
      // Show error toast
      if (err instanceof AuthError) {
        toast.error("", err.message || "Failed to resend OTP. Please try again.", err.details);
      } else {
        toast.error("", "Failed to resend OTP. Please try again.");
      }
    } finally {
      setIsResending(false);
    }
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
                  {t(
                    "auth.verifyOTP.subtitle",
                    "Enter the 6-digit code sent to"
                  )}
                  <br />
                  <strong>{email}</strong>
                  <br />
                  {t(
                    "auth.verifyOTP.otpValidity",
                    "The code will expire in 10 minutes."
                  )}
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* OTP Input */}
              <div className="space-y-6">
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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

                {/* Verify Button */}
                <Button
                  onClick={handleVerify}
                  disabled={isLoading || otp.length < 6}
                  className={cn(
                    "w-full h-12 rounded-lg font-medium transition-all duration-200",
                    "bg-blue-600 hover:bg-blue-700 text-white",
                    "shadow-lg hover:shadow-xl",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isLoading && "animate-pulse"
                  )}
                >
                  {isLoading
                    ? t("auth.verifyOTP.verifying", "Verifying...")
                    : t("auth.verifyOTP.verifyButton", "Verify OTP")}
                </Button>
              </div>

              {/* Resend OTP */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-600">
                  {t(
                    "auth.verifyOTP.didntReceive",
                    "Didn't receive the code?"
                  )}{" "}
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isResending || resendTimer > 0}
                    className="font-medium cursor-pointer text-primary hover:text-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending
                      ? t("auth.verifyOTP.resending", "Resending...")
                      : resendTimer > 0
                        ? `Resend in ${resendTimer}s`
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

export default function VerifyOTPPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyOTPContent />
    </Suspense>
  );
}
