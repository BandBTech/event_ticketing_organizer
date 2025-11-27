"use client";

import { useState, useEffect, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import {
  EyeIcon,
  KeyIcon,
  EyeClosedIcon,
  // ArrowLeftIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/lib/authService";
import { AuthError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createValidationHelpers } from "@/lib/validation";
import { PasswordRequirements } from "./PasswordRequirements";

// Create validation schema - OTP is no longer needed as it's verified in previous step
const createResetPasswordSchema = (
  t: (key: string, fallback?: string) => string
) => {
  const v = createValidationHelpers(t);

  return z
    .object({
      newPassword: z
        .string()
        .min(1, v.required("Password"))
        .min(8, v.minLength("Password", 8))
        .max(100, v.maxLength("Password", 100))
        .regex(/(?=.*[a-z])(?=.*[A-Z])/)
        .regex(/[^A-Za-z0-9]/)
        .regex(/[0-9]/),
      confirmPassword: z.string().min(1, v.required("Confirm Password")),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: v.passwordMatch(),
      path: ["confirmPassword"],
    });
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const otpParam = searchParams.get("otp");

    if (!emailParam || !otpParam) {
      // Redirect to forgot password if email or OTP is missing
      router.push("/forgot-password");
      return;
    }

    setEmail(emailParam);
    setOtp(otpParam);
  }, [searchParams, router]);

  const schema = createResetPasswordSchema(t);
  type ResetPasswordFormData = z.infer<typeof schema>;

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setError("");

    try {
      await authService.resetPassword({
        otp: otp,
        email_token: email,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });

      // Show success toast
      toast.success(
        "auth.toast.passwordResetSuccess",
        "Password reset successful!"
      );

      setIsSuccess(true);

      // Redirect to login immediately
      router.push("/login");
    } catch (err) {
      console.log(typeof err);
      // Show error toast
      if (err instanceof AuthError) {
        console.error("Password reset failed:", err, err.message, err.details);
        toast.error(
          "auth.toast.serverError",
          err.message || "Failed to reset password. Please try again."
        );
      } else {
        toast.error(
          "auth.toast.serverError",
          "Failed to reset password. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
      <div className="w-full max-w-[480px] relative z-10">
        <div className="relative">
          <div className="glass-login-card rounded-2xl p-4 sm:p-6">
            <div className="space-y-6 p-2 sm:p-3">
              {/* Back Button */}
              {/* <Link
                href="/forgot-password"
                className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeftIcon size={16} />
                {t("auth.resetPassword.back", "Back")}
              </Link> */}

              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                  {t("auth.resetPassword.title", "Reset Password")}
                </h1>
                <p className="text-sm text-gray-600">
                  {t(
                    "auth.resetPassword.subtitle",
                    "Set a new password for"
                  )}{" "}
                  <strong>{email}</strong>
                </p>
              </div>

              {isSuccess ? (
                /* Success Message */
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
                  {/* Error Message */}
                  {error && (
                    <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  {/* Form */}
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    {/* New Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="newPassword"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t(
                          "auth.resetPassword.newPassword",
                          "New Password"
                        )}
                      </label>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                          aria-hidden="true"
                        >
                          <KeyIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <Input
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={t(
                            "auth.resetPassword.newPasswordPlaceholder",
                            "••••••••••••"
                          )}
                          className={cn(
                            "h-12 pl-16 pr-16 login-input",
                            errors.newPassword && "border-destructive"
                          )}
                          {...register("newPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowNewPassword(!showNewPassword)
                          }
                          aria-label={
                            showNewPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
                        >
                          {showNewPassword ? (
                            <EyeIcon
                              weight="duotone"
                              size={24}
                              className="text-gray-600"
                            />
                          ) : (
                            <EyeClosedIcon
                              weight="duotone"
                              size={24}
                              className="text-gray-600"
                            />
                          )}
                        </button>
                      </div>
                      <PasswordRequirements password={form.watch("newPassword")} />
                      {errors.newPassword &&
                        errors.newPassword.message !== "Invalid input" &&
                        // Filter out messages that are already covered by PasswordRequirements
                        !errors.newPassword.message?.includes("must be at least 8 characters") &&
                        !errors.newPassword.message?.includes("uppercase and one lowercase") &&
                        !errors.newPassword.message?.includes("special character") &&
                        !errors.newPassword.message?.includes("numeric digit") && (
                          <p
                            className="text-sm text-destructive"
                            role="alert"
                          >
                            {errors.newPassword.message}
                          </p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t(
                          "auth.resetPassword.confirmPassword",
                          "Confirm Password"
                        )}
                      </label>
                      <div className="relative">
                        <div
                          className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
                          aria-hidden="true"
                        >
                          <KeyIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder={t(
                            "auth.resetPassword.confirmPasswordPlaceholder",
                            "••••••••••••"
                          )}
                          className={cn(
                            "h-12 pl-16 pr-16 login-input",
                            errors.confirmPassword && "border-destructive"
                          )}
                          {...register("confirmPassword")}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <EyeIcon
                              weight="duotone"
                              size={24}
                              className="text-gray-600"
                            />
                          ) : (
                            <EyeClosedIcon
                              weight="duotone"
                              size={24}
                              className="text-gray-600"
                            />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p
                          className="text-sm text-destructive"
                          role="alert"
                        >
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    {/* Submit Button */}
                    <div className="space-y-4 pt-2">
                      <Button
                        type="submit"
                        disabled={isLoading}
                        className={cn(
                          "w-full h-12 rounded-lg font-medium transition-all duration-200",
                          "bg-blue-600 hover:bg-blue-700 text-white",
                          "shadow-lg hover:shadow-xl",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          isLoading && "animate-pulse"
                        )}
                      >
                        {isLoading
                          ? t(
                            "auth.resetPassword.resetting",
                            "Resetting..."
                          )
                          : t(
                            "auth.resetPassword.resetButton",
                            "Reset Password"
                          )}
                      </Button>
                    </div>
                  </form>

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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
