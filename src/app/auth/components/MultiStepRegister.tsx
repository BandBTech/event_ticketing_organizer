"use client";

import { useState } from "react";
import * as React from "react";
import { parsePhoneNumber } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import { useRouter } from "next/navigation";
import { AuthError, authService } from "@/lib/services/authService";
import { cn } from "@/lib/utils";
import BasicInfoForm from "@/app/auth/components/signupForm";
import VerifyOTP from "@/app/auth/components/verifyOtpForm";
import CreatePassword from "@/app/auth/components/createPasswordForm";
import { BasicInfoData, OTPFormData, PasswordData } from "@/lib/validation";

type RegistrationStep = 1 | 2 | 3;

export default function MultiStepRegister() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [defaultCountry, setDefaultCountry] = useState<Country>("NP");
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [registrationData, setRegistrationData] = useState<{
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    countryCode?: string;
  } | null>(null);

  const router = useRouter();

  // Load step and data from URL/sessionStorage on mount
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const stepParam = params.get("step");
      const savedData = sessionStorage.getItem("registration_data");

      if (stepParam && savedData) {
        const step = parseInt(stepParam) as RegistrationStep;
        if (step >= 1 && step <= 3) {
          setCurrentStep(step);
          setRegistrationData(JSON.parse(savedData));
        }
      }
    }
  }, []);

  // Update URL when step changes
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      params.set("step", currentStep.toString());
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}?${params.toString()}`
      );
    }
  }, [currentStep]);

  // Save registration data to sessionStorage
  React.useEffect(() => {
    if (registrationData && typeof window !== "undefined") {
      sessionStorage.setItem(
        "registration_data",
        JSON.stringify(registrationData)
      );
    }
  }, [registrationData]);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Detect country from IP
  React.useEffect(() => {
    const detectCountry = async () => {
      try {
        if (typeof window !== "undefined") {
          const cached = sessionStorage.getItem("user_country_code");
          if (cached) {
            setDefaultCountry(cached as Country);
            return;
          }

          const response = await fetch("https://ipapi.co/json/");
          if (response.ok) {
            const data = await response.json();
            if (data.country_code) {
              setDefaultCountry(data.country_code as Country);
              sessionStorage.setItem("user_country_code", data.country_code);
            }
          }
        }
      } catch (error) {
        console.log("Could not detect country, using default (NP)", error);
      }
    };

    detectCountry();
  }, []);

  const onBasicInfoSubmit = async (data: BasicInfoData) => {
    setIsLoading(true);

    try {
      const phoneNumber = parsePhoneNumber(data.phone);
      const countryCode = phoneNumber?.countryCallingCode
        ? `+${phoneNumber.countryCallingCode}`
        : undefined;
      const phone = phoneNumber?.nationalNumber || data.phone;

      const result = await authService.register({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: phone,
        country_code: countryCode,
      });

      setRegistrationData({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: phone,
        countryCode: countryCode,
      });

      setResendTimer(60);
      setCurrentStep(2);
    } catch (error) {
      if (error instanceof AuthError) {
        console.error("Registration error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onOTPSubmit = async (data: OTPFormData) => {
    if (!registrationData) return;

    setIsLoading(true);

    try {
      await authService.verifyOTP({
        identifier: registrationData.email,
        otp_code: data.otp,
        otp_type: "registration",
      });

      setCurrentStep(3);
    } catch (error) {
      if (error instanceof AuthError) {
        console.error("OTP verification error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!registrationData) return;

    setIsLoading(true);

    try {
      await authService.sendOTP({
        identifier: registrationData.email,
        otp_type: "registration",
      });

      setResendTimer(60);
    } catch (error) {
      if (error instanceof AuthError) {
        console.error("Resend OTP error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordData) => {
    if (!registrationData) return;

    setIsLoading(true);

    try {
      await authService.setPassword({
        email: registrationData.email,
        password: data.password,
      });

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("registration_data");
      }

      router.push("/auth/pages/login");
    } catch (error) {
      if (error instanceof AuthError) {
        console.error("Set password error:", error.message);
      } else {
        console.error("Unexpected error:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white gap-2 shadow-lg rounded-2xl p-8 space-y-6">
      {/* Header Section */}
      <div className="text-left">
        <div className="flex flex-col sm:flex-row items-baseline gap-1">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
            Register
          </h1>
          <span className="text-sm font-medium text-blue-500">
            as Organizer
          </span>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={cn(
                "flex-1 h-1 rounded-full transition-colors",
                step <= currentStep ? "bg-blue-600" : "bg-gray-200"
              )}
            />
          ))}
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Step {currentStep} of 3:{" "}
          {currentStep === 1
            ? "Basic Information"
            : currentStep === 2
            ? "Verify Email"
            : "Set Password"}
        </p>
      </div>

      {/* STEP 1: Basic Information */}
      {currentStep === 1 && (
        <BasicInfoForm
          isLoading={isLoading}
          defaultCountry={defaultCountry}
          onBasicInfoSubmit={onBasicInfoSubmit}
        />
      )}

      {/* STEP 2: OTP Verification */}
      {currentStep === 2 && registrationData && (
        <VerifyOTP
          registrationData={registrationData}
          isLoading={isLoading}
          resendTimer={resendTimer}
          onOTPSubmit={onOTPSubmit}
          onResendOTP={handleResendOTP}
        />
      )}

      {/* STEP 3: Set Password */}
      {currentStep === 3 && registrationData && (
        <CreatePassword
          registrationData={registrationData}
          isLoading={isLoading}
          showPassword={showPassword}
          showConfirmPassword={showConfirmPassword}
          onPasswordSubmit={onPasswordSubmit}
          onTogglePassword={() => setShowPassword(!showPassword)}
          onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />
      )}
    </div>
  );
}