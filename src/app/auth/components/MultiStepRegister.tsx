"use client";

import { useState } from "react";
import * as React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { isValidPhoneNumber, parsePhoneNumber } from "react-phone-number-input";
import type { Country } from "react-phone-number-input";
import {
  EyeIcon,
  EnvelopeSimpleIcon,
  KeyIcon,
  EyeClosedIcon,
  UserIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@phosphor-icons/react/dist/ssr";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { AuthError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { createValidationHelpers } from "@/lib/validation";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PasswordRequirements } from "./PasswordRequirements";

// Step 1: Basic Info Schema
const createBasicInfoSchema = (
  t: (key: string, fallback?: string) => string
) => {
  const v = createValidationHelpers(t);

  return z.object({
    firstName: z
      .string()
      .min(1, v.required("First name"))
      .min(3, v.minLength("First name", 3))
      .max(50, v.maxLength("First name", 50)),
    lastName: z
      .string()
      .min(1, v.required("Last name"))
      .min(3, v.minLength("Last name", 3))
      .max(50, v.maxLength("Last name", 50)),
    email: z.string().min(1, v.required("Email")).email(v.email("Email")),
    phone: z
      .string()
      .min(1, v.required("Contact number"))
      .refine((val) => isValidPhoneNumber(val), v.phone("Phone")),
  });
};

// Step 2: OTP Schema
const createOTPSchema = (t: (key: string, fallback?: string) => string) => {
  const v = createValidationHelpers(t);

  return z.object({
    otp: z.string().length(6, "OTP must be 6 digits"),
  });
};

// Step 3: Password Schema
const createPasswordSchema = (
  t: (key: string, fallback?: string) => string
) => {
  const v = createValidationHelpers(t);

  return z
    .object({
      password: z
        .string()
        .min(1, v.required("Password"))
        .min(8, v.minLength("Password", 8))
        .max(100, v.maxLength("Password", 100))
        .regex(/(?=.*[a-z])(?=.*[A-Z])/)
        .regex(/[^A-Za-z0-9]/)
        .regex(/[0-9]/),
      confirmPassword: z.string().min(1, v.required("Confirm Password")),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: v.passwordMatch(),
      path: ["confirmPassword"],
    });
};

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
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);

  // Load step and data from URL/sessionStorage on mount
  React.useEffect(() => {
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
  }, []);

  // Update URL when step changes
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("step", currentStep.toString());
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}?${params.toString()}`
    );
  }, [currentStep]);

  // Save registration data to sessionStorage
  React.useEffect(() => {
    if (registrationData) {
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
      } catch (error) {
        console.log("Could not detect country, using default (NP)", error);
      }
    };

    detectCountry();
  }, []);

  // Step 1: Basic Info Form
  const basicInfoSchema = createBasicInfoSchema(t);
  type BasicInfoData = z.infer<typeof basicInfoSchema>;

  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    mode: "onChange", // Validate on change for real-time feedback
  });

  const onBasicInfoSubmit = async (data: BasicInfoData) => {
    setIsLoading(true);

    try {
      // Extract country code from phone number
      const phoneNumber = parsePhoneNumber(data.phone);
      const countryCode = phoneNumber?.countryCallingCode
        ? `+${phoneNumber.countryCallingCode}`
        : undefined;
      const phone = phoneNumber?.nationalNumber || data.phone;

      // Step 1: Register user (sends OTP to email)
      const result = await authService.register({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: phone,
        country_code: countryCode,
      });

      // Store registration data for next steps
      setRegistrationData({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: phone,
        countryCode: countryCode,
      });

      toast.success(
        "auth.toast.otpSent",
        "Verification code sent to your email"
      );

      // Start 1-minute resend timer
      setResendTimer(60);

      // Move to OTP verification step
      setCurrentStep(2);
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(
          "",
          error.message || "Registration failed. Please try again.",
          error.details
        );
      } else {
        toast.error(
          "",
          "Registration failed. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: OTP Verification Form
  const otpSchema = createOTPSchema(t);
  type OTPData = z.infer<typeof otpSchema>;

  const otpForm = useForm<OTPData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
    mode: "onChange", // Validate on change for real-time feedback
  });

  const onOTPSubmit = async (data: OTPData) => {
    if (!registrationData) return;

    setIsLoading(true);

    try {
      // Verify OTP
      await authService.verifyOTP({
        identifier: registrationData.email,
        otp_code: data.otp,
        otp_type: "registration",
      });

      toast.success("auth.toast.otpVerified", "Email verified successfully!");

      // Move to password setup step
      setCurrentStep(3);
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(
          "auth.toast.verificationFailed",
          error.message || "Invalid OTP. Please try again.",
          error.details
        );
      } else {
        toast.error(
          "auth.toast.verificationFailed",
          "Verification failed. Please try again."
        );
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

      toast.success(
        "auth.toast.otpResent",
        "New verification code sent to your email"
      );

      // Restart 1-minute timer
      setResendTimer(60);
    } catch (error) {
      toast.error(
        "auth.toast.resendFailed",
        "Failed to resend code. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Set Password Form
  const passwordSchema = createPasswordSchema(t);
  type PasswordData = z.infer<typeof passwordSchema>;

  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange", // Validate on change for real-time feedback
  });

  const onPasswordSubmit = async (data: PasswordData) => {
    if (!registrationData) return;

    setIsLoading(true);

    try {
      // Set password to complete registration
      const result = await authService.setPassword({
        email: registrationData.email,
        password: data.password,
      });

      toast.success(
        "auth.toast.signupSuccess",
        result.message || "Account created successfully!"
      );

      // Clear sessionStorage on successful registration
      sessionStorage.removeItem("registration_data");

      // Redirect to login
      router.push(`/auth/pages/login`);
    } catch (error) {
      if (error instanceof AuthError) {
        toast.error(
          "",
          error.message || "Failed to set password. Please try again.",
          error.details
        );
      } else {
        toast.error(
          "auth.toast.signupError",
          "Failed to complete registration."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center px-4 py-8 sm:py-20">
      <div className="w-full max-w-[480px] relative z-10">
        <div className="relative">
          <div className="glass-login-card rounded-2xl p-4 sm:p-6">
            <div className="space-y-6 p-2 sm:p-3">
              {/* Back Button for Step 2 */}
              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
                >
                  <ArrowLeftIcon size={16} />
                  {t("auth.verifyOTP.back", "Back")}
                </button>
              )}

              {/* Header */}
              <div className="space-y-1">
                <div className="flex flex-col sm:flex-row items-baseline gap-1">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 font-poppins">
                    {t("auth.signup.title", "Register")}
                  </h1>
                  <span className="text-sm font-medium text-blue-500">
                    {t("auth.login.asOrganizer", "as Organizer")}
                  </span>
                </div>

                {/* Progress Indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={cn(
                        "flex-1 h-1 rounded-full transition-colors",
                        step <= currentStep
                          ? "bg-blue-600"
                          : "bg-gray-200"
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Step {currentStep} of 3:{" "}
                  {currentStep === 1
                    ? "Basic Information"
                    : currentStep === 2
                      ? "Verify OTP"
                      : "Set Password"}
                </p>
              </div>

              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <form
                  onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)}
                  className="space-y-6"
                >
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label
                        htmlFor="firstName"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("auth.signup.firstName", "First Name")}
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <UserIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <Input
                          id="firstName"
                          type="text"
                          placeholder={t(
                            "auth.signup.firstNamePlaceholder",
                            "John"
                          )}
                          className={cn(
                            "h-12 pl-14 pr-4 login-input",
                            basicInfoForm.formState.errors.firstName &&
                            "border-destructive"
                          )}
                          {...basicInfoForm.register("firstName")}
                        />
                      </div>
                      {basicInfoForm.formState.errors.firstName && (
                        <p className="text-sm text-destructive">
                          {
                            basicInfoForm.formState.errors.firstName
                              .message
                          }
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label
                        htmlFor="lastName"
                        className="text-sm font-medium text-gray-900 block"
                      >
                        {t("auth.signup.lastName", "Last Name")}
                      </label>
                      <div className="relative">
                        <div className="absolute left-4 top-1/2 -translate-y-1/2">
                          <UserIcon
                            weight="duotone"
                            size={24}
                            className="text-gray-600"
                          />
                        </div>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder={t(
                            "auth.signup.lastNamePlaceholder",
                            "Doe"
                          )}
                          className={cn(
                            "h-12 login-input pl-14 pr-4",
                            basicInfoForm.formState.errors.lastName &&
                            "border-destructive"
                          )}
                          {...basicInfoForm.register("lastName")}
                        />
                      </div>
                      {basicInfoForm.formState.errors.lastName && (
                        <p className="text-sm text-destructive">
                          {
                            basicInfoForm.formState.errors.lastName
                              .message
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-gray-900 block"
                    >
                      {t("auth.signup.email", "Email")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <EnvelopeSimpleIcon
                          weight="duotone"
                          size={24}
                          className="text-gray-600"
                        />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder={t(
                          "auth.signup.emailPlaceholder",
                          "Enter email address"
                        )}
                        className={cn(
                          "h-12 pl-14 pr-4 login-input",
                          basicInfoForm.formState.errors.email &&
                          "border-destructive"
                        )}
                        {...basicInfoForm.register("email")}
                      />
                    </div>
                    {basicInfoForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {basicInfoForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="phone"
                      className="text-sm font-medium text-gray-900 block"
                    >
                      {t("auth.signup.phone", "Contact Number")}
                    </label>
                    <Controller
                      name="phone"
                      control={basicInfoForm.control}
                      render={({ field }) => (
                        <PhoneInput
                          value={field.value}
                          onChange={field.onChange}
                          defaultCountry={defaultCountry}
                          placeholder={t(
                            "auth.signup.phonePlaceholder",
                            "981-234-5678"
                          )}
                          className={cn(
                            basicInfoForm.formState.errors.phone &&
                            "border-destructive"
                          )}
                        />
                      )}
                    />
                    {basicInfoForm.formState.errors.phone && (
                      <p className="text-sm text-destructive">
                        {basicInfoForm.formState.errors.phone.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={cn(
                      "w-full h-12 rounded-lg font-medium",
                      "bg-blue-600 hover:bg-blue-700 text-white",
                      "shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                    )}
                  >
                    {isLoading ? (
                      "Sending verification code..."
                    ) : (
                      <>
                        Continue
                        <ArrowRightIcon size={20} weight="bold" />
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* STEP 2: OTP Verification */}
              {currentStep === 2 && registrationData && (
                <form
                  onSubmit={otpForm.handleSubmit(onOTPSubmit)}
                  className="space-y-6"
                >
                  <div className="text-center">
                    <p className="text-gray-600">
                      Enter the 6-digit code sent to
                    </p>
                    <p className="font-medium">
                      {registrationData.email}
                    </p>
                    <p className="text-gray-600">
                      {t(
                        "auth.verifyOTP.otpValidity",
                        "The code will automaticaly expire after 10 minutes."
                      )}
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
                              <InputOTPSlot
                                index={0}
                                className="h-14 w-14 text-lg"
                              />
                              <InputOTPSlot
                                index={1}
                                className="h-14 w-14 text-lg"
                              />
                              <InputOTPSlot
                                index={2}
                                className="h-14 w-14 text-lg"
                              />
                              <InputOTPSlot
                                index={3}
                                className="h-14 w-14 text-lg"
                              />
                              <InputOTPSlot
                                index={4}
                                className="h-14 w-14 text-lg"
                              />
                              <InputOTPSlot
                                index={5}
                                className="h-14 w-14 text-lg"
                              />
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
                    {/* <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCurrentStep(1)}
                      className="flex-1"
                    >
                      <ArrowLeftIcon size={16} className="mr-2" />
                      Back
                    </Button> */}
                    <Button
                      type="submit"
                      disabled={
                        isLoading || otpForm.watch("otp").length < 6
                      }
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                  </div>

                  <div className="text-center">
                    Didn&apos;t receive code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOTP}
                      disabled={isLoading || resendTimer > 0}
                      className="text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : "Resend"}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Set Password */}
              {currentStep === 3 && registrationData && (
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-6"
                >
                  <div className="text-center space-y-1">
                    <p className="text-sm text-gray-600">
                      {t(
                        "auth.signup.setPassword",
                        "Create a secure password for"
                      )}
                    </p>
                    <p className="font-medium text-gray-900">
                      {registrationData.email}
                    </p>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-900 block"
                    >
                      {t("auth.signup.password", "Password")}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <KeyIcon
                          weight="duotone"
                          size={24}
                          className="text-gray-600"
                        />
                      </div>
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={t(
                          "auth.signup.passwordPlaceholder",
                          "••••••••••••"
                        )}
                        className={cn(
                          "h-12 pl-14 pr-16 login-input",
                          passwordForm.formState.errors.password &&
                          "border-destructive"
                        )}
                        {...passwordForm.register("password")}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeIcon
                            size={24}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        ) : (
                          <EyeClosedIcon
                            size={24}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.password &&
                      passwordForm.formState.errors.password.message !== "Invalid input" &&
                      // Filter out messages that are already covered by PasswordRequirements
                      !passwordForm.formState.errors.password.message?.includes("must be at least 8 characters") &&
                      !passwordForm.formState.errors.password.message?.includes("uppercase and one lowercase") &&
                      !passwordForm.formState.errors.password.message?.includes("special character") &&
                      !passwordForm.formState.errors.password.message?.includes("numeric digit") && (
                        <p className="text-sm text-destructive">
                          {passwordForm.formState.errors.password.message}
                        </p>
                      )}
                    <PasswordRequirements password={passwordForm.watch("password")} />
                  </div>

                  {/* Confirm Password Field */}
                  <div className="space-y-2">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-900 block"
                    >
                      {t(
                        "auth.signup.confirmPassword",
                        "Confirm Password"
                      )}
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2">
                        <KeyIcon
                          weight="duotone"
                          size={24}
                          className="text-gray-600"
                        />
                      </div>
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder={t(
                          "auth.signup.confirmPasswordPlaceholder",
                          "••••••••••••"
                        )}
                        className={cn(
                          "h-12 pl-14 pr-16 login-input",
                          passwordForm.formState.errors.confirmPassword &&
                          "border-destructive"
                        )}
                        {...passwordForm.register("confirmPassword")}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2"
                      >
                        {showConfirmPassword ? (
                          <EyeIcon
                            size={24}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        ) : (
                          <EyeClosedIcon
                            size={24}
                            className="text-gray-600"
                            weight="duotone"
                          />
                        )}
                      </button>
                    </div>
                    {passwordForm.formState.errors.confirmPassword && (
                      <p className="text-sm text-destructive">
                        {
                          passwordForm.formState.errors.confirmPassword
                            .message
                        }
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="flex-1 bg-blue-600 hover:bg-blue-700"
                    >
                      {isLoading
                        ? t("auth.signup.creatingAccount", "Creating Account...")
                        : t("auth.signup.completeRegistration", "Complete Registration")}
                    </Button>
                  </div>
                </form>
              )}

              {/* Footer - Only show on step 1 */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      {t(
                        "auth.signup.haveAccount",
                        "Already have an account?"
                      )}{" "}
                      <Link
                        href="/auth/pages/login"
                        className="cursor-pointer font-medium text-blue-600 hover:text-blue-700"
                      >
                        {t(
                          "auth.signup.loginAsOrganizer",
                          "Sign in as Organizer."
                        )}
                      </Link>
                    </p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200/50"></div>
                    </div>
                  </div>

                  <div className="text-center pt-3">
                    <p className="text-xs text-gray-600 leading-relaxed">
                      {t(
                        "auth.signup.termsPrefix",
                        "By continuing, you consent to the fact that you have read and understood our"
                      )}{" "}
                      <Link
                        href="/terms"
                        className="cursor-pointer text-blue-600 hover:text-blue-700 underline"
                      >
                        {t("auth.signup.terms", "terms and conditions")}
                      </Link>{" "}
                      {t("auth.signup.termsAnd", "and")}{" "}
                      <Link
                        href="/privacy"
                        className="cursor-pointer text-blue-600 hover:text-blue-700 underline"
                      >
                        {t("auth.signup.privacy", "privacy policy")}
                      </Link>
                      .
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
