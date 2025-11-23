"use client";

import { useState, useEffect } from "react";
import { Eye, KeyRound, EyeClosed} from "lucide-react";

import { useLoading, ButtonLoader, LinkLoader } from "@/components/layout/loader";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { ResetPasswordFormData, resetPasswordSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZodEmail } from "zod";

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otp, setOtp] = useState("");
  const { isLoading, startLoading, stopLoading } = useLoading();
    const [email, setEmail] = useState("");
  const router = useRouter();

 

   useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    setEmail(searchParams.get("email") || "");
    setOtp(searchParams.get("otp") || "");
  }, []);

  const {
    register, handleSubmit, formState: {errors},
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  })
  const onSubmit =async (data: ResetPasswordFormData) => {
    setError("");
    setSuccess("");

    if(!email ||!otp ){
      setError("Missing required information. Please try again.");
    return;
  }
  
  startLoading();

  try{
    const payload = {
      new_password: data.password,
      confirm_password: data.confirmPassword,
      email_token: email,
      otp: otp,
      role: "organizer"
    };
    const res = await fetch(
      "https://sandbox.timroticket.com/api/v1/auth/organizer/reset-password",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body: JSON.stringify(payload),
      }
    );
    const result = await res.json();
    if(!res.ok){
      setError(result.message || result.error || "Failed to reset Password");
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
    
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 ">
          Set a new password
        </h1>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        {/* Password Field */}
        <div className="space-y-2">
          <label
            htmlFor="password"
            className="text-sm font-medium text-gray-700 "
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
       
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white  text-gray-900 "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 "
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
          </div>
          {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
        
        </div>
        <div className="space-y-2">
          <label
            htmlFor="confirmPassword"
            className="text-sm font-medium text-gray-700 "
          >
            Confirm Password
          </label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              placeholder="********"
          {...register("confirmPassword")}
           
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2 border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white  text-gray-900 "
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 "
            >
              {showPassword ? <Eye size={20} /> : <EyeClosed size={20} />}
            </button>
            {errors.confirmPassword && <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>}
        
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
        <div className="text-center text-sm text-gray-600 ">
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
