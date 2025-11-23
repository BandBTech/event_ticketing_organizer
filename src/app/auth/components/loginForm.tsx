"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  useLoading,
  LinkLoader,
} from "@/components/layout/loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { EyeClosedIcon, EyeIcon, KeyIcon } from "@phosphor-icons/react";
import { Input } from "@/components/ui/input";
import { EnvelopeIcon } from "@phosphor-icons/react/dist/ssr";

export default function Login() {
  const [error, setError] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });
  const [showPassword, setShowPassword] = useState(false);
  const {
    isLoading: isLoggingIn,
    startLoading: startLogin,
    stopLoading: stopLogin,
  } = useLoading();
  const {
    isLoading: isSigningUp,
    startLoading: startSignup,
    stopLoading: stopSignup,
  } = useLoading();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) router.push("/organizer-dashboard");
  }, [router]);

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    startLogin();

    try {
      const res = await fetch(
        "https://sandbox.timroticket.com/api/v1/auth/organizer/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setError(
          result.message || result.error || "Invalid Email or Password."
        );
        return;
      }

      localStorage.setItem("auth_token", result.data.access_token);
      router.push("/organizerDashboard");
    } catch (err) {
      console.error(err);
      setError("Server Error");
    } finally {
      stopLogin();
    }
  };
  const handleSignupClick = () => {
    startSignup();
  };

  return (
    <div className="w-full max-w-md bg-white  shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 ">
          Login{" "}
          <span className="text-blue-600 text-sm font-normal">
            as Organizer
          </span>
        </h1>
      </div>

      {/* Form */}
      {/* Login Error */}
      {error && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
          <p className="text-sm text-destructive font-medium">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-900 block"
          >
            {"Email"}
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
              placeholder={"Enter email address"}
              className={cn(
                "h-12 pl-16 pr-4 login-input",
                errors.email && "border-destructive"
              )}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive font-medium" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-900 block"
          >
            {"Password"}
          </label>
          <div className="relative">
            <div
              className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full"
              aria-hidden="true"
            >
              <KeyIcon weight="duotone" size={24} className="text-gray-600" />
            </div>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder={"**********"}
              className={cn(
                "h-12 pl-16 pr-16 login-input",
                errors.password && "border-destructive"
              )}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-10 h-10 transition-colors"
            >
              {showPassword ? (
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
          {errors.password && (
            <p className="text-sm text-destructive font-medium" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="remember-me"
              // checked={rememberMe}
              // onCheckedChange={(checked) =>
              //   setValue("rememberMe", !!checked)
              // }
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <label
              htmlFor="remember-me"
              className="text-sm font-medium text-gray-900 cursor-pointer"
            >
              {"Remember Me"}
            </label>
          </div>

          <Link
            href="/auth/pages/forgotpassword"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
          >
            {"Forgot Password"}
          </Link>
        </div>

        {/* Login Button */}
        <div className="space-y-4">
          <Button
            type="submit"
            disabled={isLoggingIn}
            className={cn(
              "w-full h-12 rounded-lg font-medium transition-all duration-200",
              "bg-blue-600 hover:bg-blue-700 text-white",
              "shadow-lg hover:shadow-xl",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isLoggingIn && "animate-pulse"
            )}
          >
            {isLoggingIn ? "Signing in..." : "Login"}
          </Button>
        </div>
      </form>

      {/* Footer Link */}
      <div className="text-center text-sm text-gray-600 ">
        Don&apos;t have an account?{" "}
        <LinkLoader
          href="/auth/pages/signup"
          isLoading={isSigningUp}
          onClick={handleSignupClick}
          loadingText="Processing..."
        >
          Sign up here.
        </LinkLoader>
      </div>
    </div>
  );
}
