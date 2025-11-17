"use client";

import { useEffect, useState } from "react";
import { Eye, Mail, KeyRound, EyeClosed } from "lucide-react";
import { useRouter } from "next/navigation";
import { useLoading, ButtonLoader, LinkLoader } from "@/components/loader";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginFormData, loginSchema } from "@/lib/validation";
import { useForm } from "react-hook-form";
import { setCookie } from "cookies-next";

export default function Login() {
  const [error, setError] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState:{errors, isSubmitting},
  } =useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })
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
    if (token) router.push("/organizerDashboard");
  }, [router]);

  const onSubmit = async (data: LoginFormData) => {
    setError("");
    startLogin();

    try {
      const res = await fetch(
        "https://sandbox.timroticket.com/api/v1/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
       
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || result.error || "Invalid email or password");
        return;
      }

      localStorage.setItem("auth_token", result.token);
      router.push("/organizerDashboard");
    // setCookie("auth_token", result.token, {
    //   path: "/",
    //   secure: true,
    //   sameSite: "strict",
    // });

    // setCookie("user_role", result.role, {
    //   path: "/",
    //   secure: true,
    //   sameSite: "strict",
    // });
    //     if (result.role === "organizer") {
    //   router.push("/organizerDashboard");
    // } else if (result.role === "staff") {
    //   router.push("/staffDashboard");
    // } else {
    //   router.push("/auth/pages/login");
    // }
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
    <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Login{" "}
          <span className="text-blue-600 text-sm font-normal">
            as Organizer
          </span>
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              placeholder="Enter email address"
           {...register("email")}
              disabled={isLoggingIn}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
             {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}

          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="********"
           {...register("password")}
              disabled={isLoggingIn}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
             
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
          </div>
            {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>

        {/* Remember + Forgot */}
        <div className="flex items-center justify-between">
          <label className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              disabled={isLoggingIn}
              className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
            />
            <span className={isLoggingIn ? "opacity-50" : ""}>Remember Me</span>
          </label>
          <LinkLoader
            href="/auth/pages/forgotpassword"
            isLoading={isSigningUp}
            onClick={handleSignupClick}
            loadingText="Processing..."
          >
            Forgot Password?
          </LinkLoader>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoggingIn}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
        >
          {isLoggingIn ? <ButtonLoader loadingText="Logging in..." /> : "Login"}
        </button>
      </form>

      {/* Footer Link */}
      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
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
