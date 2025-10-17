"use client";

import { useState, useRef } from "react";


export default function VerifyOtp() {
const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return; // only allow digits

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

const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ otp }); // ✅ Replace with API call
  };

  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header */}
      <div className="text-left">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Check your email
        </h1>
           <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
           We sent a reset link to <br/> your.example@email.com <br/> Enter 6 digit code that mentioned in the email
          </p>
      </div>
 
      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Email Field */}
    {/* OTP Boxes */}
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={(el) => {inputRefs.current[index] = el}}
                  type="text"
                  inputMode="numeric"
                  placeholder="."
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-12 text-center text-xl font-bold border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            ))}
          </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition-colors"
        >
          verify OTP
        </button>
      </form>

      {/* Footer Link */}
      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
       Haven&apos;t got the email yet? {" "}
    <button
            type="button"
            onClick={() => alert("Resend OTP triggered")} 
            className="text-blue-600 hover:underline"
          >
            Resend Code
          </button>
      </p>
    </div>
  );
}
