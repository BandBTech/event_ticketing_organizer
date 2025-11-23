"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { CreatePasswordFormData, createPasswordSchema } from "@/lib/validation";
import { EyeClosedIcon, EyeIcon, KeyIcon } from "@phosphor-icons/react";

export default function CreatePassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEmail(params.get("email") || "");
    setToken(params.get("token") || "");
  }, []);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createPasswordSchema),
  });

  const onSubmit = async (data: CreatePasswordFormData) => {
    if (!email) {
      setError("Missing email. Try again.");
      return;
    }
    if (!token) {
      setError("Missing token. Try again.");
    }
    setError("");
    setSuccess("");
    try {
      const res = await fetch(
        "https://sandbox.timroticket.com/api/v1/auth/organizer/set-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            password: data.password,
            token: token,
          }),
        }
      );
      const result = await res.json();
      if (!res.ok) {
        setError(result.message || "Failed to create password");
        return;
      }
      setSuccess("Password created successfully! Redirecting...");
      setTimeout(() => {
        router.push("/auth/pages/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Server error. Try agin later");
    }
  };
  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Password</h1>
      <p className="text-sm text-gray-600">
        Set a password for: <strong>{email}</strong>
      </p>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Password */}
        <div>
          <label className="text-sm font-medium text-gray-700">Password</label>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              placeholder="Enter password"
              className="w-full pl-10 pr-10 text-gray-400 py-2 border rounded-lg"
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeIcon className="text-gray-400" />
              ) : (
                <EyeClosedIcon className="text-gray-400" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="text-sm font-medium text-gray-700">
            Confirm Password
          </label>
          <div className="relative">
            <KeyIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />

            <input
              type={showPassword ? "text" : "password"}
              {...register("confirmPassword")}
              placeholder="Confirm password"
              className="w-full pl-10 pr-10 py-2 text-gray-400 border rounded-lg"
            />

            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeIcon className="text-gray-400" />
              ) : (
                <EyeClosedIcon className="text-gray-400" />
              )}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-sm text-red-500">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Password"}
        </button>
      </form>
    </div>
  );
}
