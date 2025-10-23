"use client";

import { useState, useEffect } from "react";
import { Eye, KeyRound, EyeClosed} from "lucide-react";

import { useLoading, ButtonLoader, LinkLoader } from "@/components/loader";
import { useRouter } from "next/navigation";

export default function Signup() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { isLoading, startLoading, stopLoading } = useLoading();
    const [email, setEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const router = useRouter();
 

   useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setEmail(searchParams.get("email") || "");
    setResetToken(searchParams.get("token") || "");
  }, []);

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if(!resetToken || !email){
      setError("Missing Email or Token. Please try the reset process again");
    ;
    return;
  }
  
  startLoading();

  try{
    const payload = {
      new_password: password,
      confirm_password: confirmPassword,
      email_token: email,
      reset_token: resetToken
    };
    const res = await fetch(
      "https://sandbox.timroticket.com/api/v1/auth/reset-password",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify(payload),
      }
    );
    const data = await res.json();
    if(!res.ok){
      setError(data.message || data.error || "Failed to reset Password");
      return;
    }
    setSuccess("Password reset successfully! Redirecting to login...");
    setTimeout(()=>{
      router.push("/auth/pages/login");
    }, 1500);
  }catch(err){
    setError("Server Error. Please try again later")
  }finally{
    stopLoading();
  }
  };

  return (
    
    <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Set a new password
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="********"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
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
        </div>
  {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}
        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="relative w-full flex items-center gap-2 justify-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors"
        >
           {isLoading ? (
            <ButtonLoader loadingText="Updating Password..." />
          ) : (
            "Update Password"
          )}
        </button>
      </form>

      {/* Footer Link */}
        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <LinkLoader
          href="/auth/pages/login"
          isLoading={isLoading}
          loadingText="Redirecting..."
        >
          Return to login page
        </LinkLoader>
      </div>
    </div>

  );
}
