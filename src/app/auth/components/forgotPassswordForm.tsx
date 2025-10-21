"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
        try {
      const res = await fetch(
        "https://sandbox.timroticket.com/api/v1/auth/reset-password-request",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || data.error || "Something went wrong");
      ;
        return;
      }

      setSuccess("OTP sent to your email for password reset.");
      localStorage.setItem("reset_email", email);
      setTimeout(() => {
        router.push(`/auth/pages/verifyotp?email=${encodeURIComponent(email)}&type=reset`);
      }, 1500);
    } catch (err) {
      console.error("Error:", err);
      setError("Server error. Please try again later.");
    } 
  
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Forgot Password 
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email Field */}
        <div className="relative w-full">
          <label 
            htmlFor="email"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <div className="relative w-full">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="email"
              type="email"
              placeholder="Enter registered email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
          </div>
        </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
        >
          Reset Password
        </button>
      </form>

      {/* Footer Link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        <Link href="/auth/pages/login" className="text-blue-600 hover:underline">
         Return to login page
        </Link>
      </p>
    </div>
  );
}
