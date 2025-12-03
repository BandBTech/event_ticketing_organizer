"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { EnvelopeIcon, ArrowLeftIcon } from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { AuthError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createValidationHelpers } from "@/lib/validation";

// Create validation schema
const createForgotPasswordSchema = (
  t: (key: string, fallback?: string) => string
) => {
  const v = createValidationHelpers(t);
  return z.object({
    email: z.string().min(1, v.required("Email")).email(v.email("Email"))
  });
}

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  const [isLoading, setIsLoading] = useState(false);

  const schema = createForgotPasswordSchema(t);
  type ForgotPasswordFormData = z.infer<typeof schema>;

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
    },
    mode: "onChange",
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = form;

  // Populate email from sessionStorage if user navigated back
  useEffect(() => {
    const savedEmail = sessionStorage.getItem('password_reset_email');
    if (savedEmail) {
      setValue('email', savedEmail);
      // Clear it after reading to avoid stale data
      sessionStorage.removeItem('password_reset_email');
    }
  }, []);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);

    try {
      await authService.requestPasswordReset(data.email);

      // Save email to sessionStorage for potential back navigation
      sessionStorage.setItem('password_reset_email', data.email);

      // Show success toast
      toast.success(
        "auth.toast.passwordResetSent",
        "Password reset code sent to your email"
      );

      // Redirect immediately to OTP verification page
      router.push(
        `/auth/pages/verify-otp?email=${encodeURIComponent(
          data.email
        )}&type=password_reset`
      );
    } catch (err) {
      if (err instanceof AuthError) {
        toast.error("", err.message || "Failed to send reset email. Please try again later.", err.details);
      } else {
        toast.error("", "Failed to send reset email. Please try again later.");
      }

      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
      <div className="w-full max-w-[480px] relative z-10">
        <div className="relative">
          <div className="glass-login-card rounded-2xl p-4 sm:p-6">
            <div className="space-y-8 p-2 sm:p-3">
              {/* Back Button */}
              {/* <Link
                href="/auth/pages/login"
                className="inline-flex cursor-pointer items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <ArrowLeftIcon size={16} />
                {t("auth.forgotPassword.backToLogin", "Back to login")}
              </Link> */}

              {/* Header */}
              <div className="space-y-2">
                <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                  {t("auth.forgotPassword.title", "Forgot Password")}
                </h1>
                <p className="text-sm text-gray-600">
                  {t(
                    "auth.forgotPassword.subtitle",
                    "Enter your email to receive a password reset code"
                  )}
                </p>
              </div>

              {
                <>
                  {/* Form */}
                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="space-y-8"
                  >
                    {/* Email Field */}
                    <div className="space-y-2">
                      <label
                        htmlFor="email"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("auth.forgotPassword.email", "Email Address")}
                      </label>
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
                          id="email"
                          type="email"
                          autoComplete="email"
                          placeholder={t(
                            "auth.forgotPassword.emailPlaceholder",
                            "Enter your email address"
                          )}
                          className={cn(
                            "h-12 pl-16 pr-4 login-input",
                            errors.email && "border-destructive"
                          )}
                          {...register("email")}
                        />
                      </div>
                      {errors.email && (
                        <p
                          className="text-sm text-destructive font-medium"
                          role="alert"
                        >
                          {errors.email.message}
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
                          ? t("auth.forgotPassword.sending", "Sending...")
                          : t(
                            "auth.forgotPassword.sendResetCode",
                            "Send Reset Code"
                          )}
                      </Button>
                    </div>
                  </form>

                  {/* Back to Login */}
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {t(
                        "auth.forgotPassword.rememberPassword",
                        "Remember your password?"
                      )}{" "}
                      <Link
                        href="/auth/pages/login"
                        className="font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                      >
                        {t("auth.forgotPassword.loginHere", "Login here")}
                      </Link>
                    </p>
                  </div>
                </>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
