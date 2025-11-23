
"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function VerifyOtpContent() {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [type, setType] = useState("signup");
  const [isClient, setIsClient] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();


  // Initialize email and type 
  useEffect(() => {
    setIsClient(true);
  const searchParams = new URLSearchParams(window.location.search);
    const urlEmail = searchParams.get("email");
    const urlType = searchParams.get("type");
    
    // Only access localStorage on client side
    const storedEmail = localStorage.getItem("signup_email");
    
    setEmail(urlEmail || storedEmail || "");
    setType(urlType || "signup");
  }, []);

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      setError("Please enter a valid OTP.");
      return;
    }
    
    if (!email) {
      setError("Email is required.");
      return;
    }
   

    setSubmitting(true);
    try {
      const payload ={
        identifier: email.trim(),
        otp_code: otpCode,
        otp_type: type ==="reset" ? "password_reset" : "registration",
       
      };

      const res = await fetch(
        "https://sandbox.timroticket.com/api/v1/auth/organizer/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || data.error || "Invalid OTP. Please try again");
        return;
      }

      setSuccess("OTP verified successfully!");
      
      if (localStorage.getItem("signup_email")) {
        localStorage.removeItem("signup_email");
      }
      
      setTimeout(() => {
        if (type === "reset") {
          router.push(
            `/auth/pages/resetpassword?email=${encodeURIComponent(email)}&otp=${otpCode}`
          );
        } else {
          router.push(`/auth/pages/createpassword?email=${encodeURIComponent(email)}&otp=${otpCode}`);
        }
      }, 1500);
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError("Server error. Please try again later");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError("Missing email address!");
      return;
    }
  
    setError("");
    setSuccess("");
    setResending(true);
    try {
      const payload = {
        identifier: email.trim(),
        otp_type: type === "reset" ? "password_reset" : "registration",
  
      };
      const res = await fetch(
        "https://sandbox.timroticket.com/api/v1/auth/organizer/send-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify( payload ),
        }
      );
      const data = await res.json();
      if (!res.ok) setError(data.message || "Failed to resend OTP");

  
      setSuccess("New OTP sent to your email!");
    } catch (err) {
      console.error("Error resending OTP:", err);
      setError("Could not resend OTP. Please try again later!");
    } finally {
      setResending(false);
    }
  };

 
  if (!isClient) {
    return (
      <div className="w-full max-w-md bg-white  shadow-lg rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <p className="text-gray-600 ">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 ">
          Check your email
        </h1>
        <p className="text-sm text-gray-600  mt-1">
          We sent a reset link to <br />
          <strong>{email}</strong> <br /> Enter 6 digit code that mentioned in
          the email
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* OTP Boxes */}
        <div className="flex justify-between gap-2">
          {otp.map((digit, index) => (
            <div key={index} className="relative">
              <input
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                placeholder="."
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl font-bold border border-gray-300  rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 "
                disabled={submitting}
              />
            </div>
          ))}
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-500">{success}</p>}
        
        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-medium transition-colors"
        >
          {submitting ? "Verifying..." : "Verify OTP"}
        </button>
      </form>

      {/* Footer Link */}
      <p className="text-center text-sm text-gray-600 ">
        Haven&apos;t got the email yet?{" "}
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="text-blue-600 hover:underline disabled:text-blue-400"
        >
          {resending ? "Resending..." : "Resend Code"}
        </button>
      </p>
    </div>
  );
}