"use client";

import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import Link from "next/link";
import { useRouter } from "next/router";

// Icons
import {
  EyeIcon,
  EnvelopeIcon,
  KeyIcon,
  EyeClosedIcon,
} from "@phosphor-icons/react/dist/ssr";

// UI Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useAuthStore } from "@/store/authStore";
import { AuthError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { LoginFormData, loginSchema } from "@/lib/validation";


export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { login, isAuthenticated, clearError } = useAuthStore();

  // Get user from auth store for role-based redirect
  const { user } = useAuthStore();

  // Redirect if already authenticated - role-based
  useEffect(() => {
    if (isAuthenticated && user) {
      const userRoles = user.roles || [];
      // Staff and manager go to staff dashboard, others to organizer dashboard
      if (userRoles.includes('staff') || userRoles.includes('manager')) {
        router.push("/staffDashboard");
      } else {
        router.push("/organizerDashboard");
      }
    }
  }, [isAuthenticated, user, router]);

  const loginFormSchema = useMemo(() => loginSchema((key, fallback, params) => key), []);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
    mode: "onChange",
  });

  // TanStack Query mutation wrapping auth store login
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return login(
        { email: data.email, password: data.password },
        data.rememberMe
      );
    },
    onSuccess: () => {
      toast.success("auth.toast.loginSuccess", "Welcome back!");
      // Role-based redirect after login
      const currentUser = useAuthStore.getState().user;
      const userRoles = currentUser?.roles || [];
      if (userRoles.includes('staff') || userRoles.includes('manager')) {
        router.push("/staffDashboard");
      } else {
        router.push("/organizerDashboard");
      }
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        switch (error.code) {
          case "UNAUTHORIZED":
            toast.error("", error.message || "Invalid email or password");
            break;
          case "NETWORK_ERROR":
            toast.error(
              "auth.toast.networkError",
              "Network error. Please check your connection."
            );
            break;
          case "INTERNAL_SERVER_ERROR":
            toast.error(
              "",
              "Login failed.",
              error.details
            );
            break;
          case "ACCOUNT_INACTIVE":
            toast.error(
              "auth.toast.accountInactive",
              error.message || "Account is inactive. Please contact support.",
              "auth.toast.contactSupportToReactivate"
            );
            break;
          default:
            toast.error(
              "auth.toast.loginError",
              error.message || "Login failed. Please try again."
            );
        }
      } else {
        toast.error("auth.toast.loginError", "Login failed. Please try again.");
      }
    },
  });

  const onSubmit = (data: LoginFormData) => {
    clearError();
    loginMutation.mutate(data);
  };

  return (
    <div className="relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
      <div className="w-full max-w-[480px] relative z-10">
        <div className="relative">
          <div className="glass-login-card rounded-2xl p-4 sm:p-6">
            <div className="space-y-6 p-2 sm:p-3">
              {/* Header */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-baseline gap-1">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                    {t("auth.login.title", "Login")}
                  </h1>
                  <span className="text-sm font-medium text-blue-500">
                    {t("auth.login.asOrganizer", "as Organizer")}
                  </span>
                </div>
              </div>

              {/* Form with shadcn Form components */}
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email Field */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                           {t("auth.login.email", "Email")}
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
                              placeholder={t(
                                "auth.login.emailPlaceholder",
                                "Enter email address"
                              )}
                              className={cn(
                                "h-12 pl-16 pr-4 login-input",
                                form.formState.errors.email && "border-destructive"
                              )}
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <TranslatedFormMessage t={t} />
                      </FormItem>
                    )}
                  />

                  {/* Password Field */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          {t("auth.login.password", "Password")}
                        </FormLabel>
                        <FormControl>
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
                              type={showPassword ? "text" : "password"}
                              autoComplete="current-password"
                              placeholder={t(
                                "auth.login.passwordPlaceholder",
                                "••••••••••••"
                              )}
                              className={cn(
                                "h-12 pl-16 pr-16 login-input",
                                form.formState.errors.password && "border-destructive"
                              )}
                              {...field}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              aria-label={
                                showPassword
                                  ? t("auth.login.hidePassword", "Hide password")
                                  : t("auth.login.showPassword", "Show password")
                              }
                              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
                            >
                              {showPassword ? (
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
                        </FormControl>
                        <TranslatedFormMessage t={t} />
                      </FormItem>
                    )}
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-gray-900 cursor-pointer">
                            {t("auth.login.rememberMe", "Remember Me")}
                          </FormLabel>
                        </FormItem>
                      )}
                    />

                    <Link
                      href="/forgotpassword"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                    >
                      {t("auth.login.forgotPassword", "Forgot Password?")}
                    </Link>
                  </div>

                  {/* Login Button */}
                  <div className="space-y-4 pt-2">
                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className={cn(
                        "w-full h-12 rounded-lg font-medium transition-all duration-200",
                        "bg-blue-600 hover:bg-blue-700 text-white",
                        "shadow-lg hover:shadow-xl",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        loginMutation.isPending && "animate-pulse"
                      )}
                    >
                      {loginMutation.isPending
                        ? t("auth.login.signingIn", "Signing in...")
                        : t("auth.login.loginButton", "Login")}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Sign Up Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {t("auth.login.noAccount", "Don't have an account?")}{" "}
                  <Link
                    href="/register"
                    className="font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    {t("auth.login.signUpHere", "Sign up here")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
