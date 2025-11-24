// components/auth/VerifyOTP.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { OTPFormData, createOTPSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";

interface VerifyOTPProps {
  registrationData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    countryCode?: string;
  };
  isLoading: boolean;
  resendTimer: number;
  onOTPSubmit: (data: OTPFormData) => Promise<void>;
  onResendOTP: () => Promise<void>;
}

export default function VerifyOTP({
  registrationData,
  isLoading,
  resendTimer,
  onOTPSubmit,
  onResendOTP,
}: VerifyOTPProps) {
  const otpSchema = createOTPSchema();
  const otpForm = useForm<OTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={otpForm.handleSubmit(onOTPSubmit)} className="space-y-6">
      <div className="text-center">
        <p className="text-gray-600">Enter the 6-digit code sent to</p>
        <p className="font-medium">{registrationData.email}</p>
        <p className="text-gray-600">
          The code will automatically expire after 10 minutes.
        </p>
      </div>

      <div className="space-y-4">
        <Controller
          name="otp"
          control={otpForm.control}
          render={({ field }) => (
            <div className="flex justify-center">
              <InputOTP
                maxLength={6}
                value={field.value}
                onChange={field.onChange}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} className="h-14 w-14 text-lg" />
                  <InputOTPSlot index={1} className="h-14 w-14 text-lg" />
                  <InputOTPSlot index={2} className="h-14 w-14 text-lg" />
                  <InputOTPSlot index={3} className="h-14 w-14 text-lg" />
                  <InputOTPSlot index={4} className="h-14 w-14 text-lg" />
                  <InputOTPSlot index={5} className="h-14 w-14 text-lg" />
                </InputOTPGroup>
              </InputOTP>
            </div>
          )}
        />
        {otpForm.formState.errors.otp && (
          <p className="text-sm text-destructive text-center">
            {otpForm.formState.errors.otp.message}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading || otpForm.watch("otp").length < 6}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Verifying..." : "Verify Email"}
        </Button>
      </div>

      <div className="text-center">
        Didn&apos;t receive code?{" "}
        <button
          type="button"
          onClick={onResendOTP}
          disabled={isLoading || resendTimer > 0}
          className="text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend"}
        </button>
      </div>
    </form>
  );
}