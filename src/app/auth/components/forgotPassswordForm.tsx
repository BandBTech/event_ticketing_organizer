"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ForgotPasswordFormData, forgotPasswordSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";

export default function ForgotPassword() {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const {register, handleSubmit, formState: {errors, isSubmitting},
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const onSubmit =async (data: ForgotPasswordFormData) => {
    setError("");
    setSuccess("");
        try {
      const res = await fetch(
        "https://sandbox.timroticket.com/api/v1/auth/organizer/reset-password-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: data.email }),
        }
      );

      const result = await res.json();

      if (!res.ok) {
        setError(result.message || result.error || "Something went wrong");
      ;
        return;
      }

      setSuccess("OTP sent to your email for password reset.");
      localStorage.setItem("reset_email", data.email);
      setTimeout(() => {
        router.push(`/auth/pages/verifyotp?email=${encodeURIComponent(data.email)}&type=reset`);
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again later.");
    } 
  
  };

  return (
    <div className="w-full max-w-md bg-white  shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 ">
          Forgot Password 
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Email Field */}
        <div className="relative w-full">
          <label 
            htmlFor="email"
            className="text-sm font-medium text-gray-700 "
          >
            Email
          </label>
          <div className="relative w-full">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              placeholder="Enter registered email address"
              {...register("email")}
            className={`w-full pl-10 pr-4 py-2 border rounded-lg bg-white text-gray-900  
                ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-gray-300  focus:ring-blue-500"
                }`}/>
                
          </div>
           {errors.email && (
            <p className="text-sm text-red-500 mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
        >
      {isSubmitting ? "Sending..." : "Reset Password"}
        </button>
      </form>

      {/* Footer Link */}
      <p className="text-center text-sm text-gray-600 ">
        <Link href="/auth/pages/login" className="text-blue-600 hover:underline">
         Return to login page
        </Link>
      </p>
    </div>
  );
}
