"use client";

import { useState, useMemo } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { parsePhoneNumber } from "react-phone-number-input";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { authService } from "@/services/authService";
import { AuthError } from "@/lib/errors";
import { toast } from "@/lib/toast";
import { cn, isValidRegistrationData, safeParseJSON } from "@/lib/utils";
import {
  registerBasicInfoSchema,
  registerOTPSchema,
  registerPasswordSchema,
  RegisterBasicInfoFormData,
  RegisterOTPFormData,
  RegisterPasswordFormData,
} from "@/lib/validation";
import Link from "next/link";
import { useRouter } from "next/router";
import { PasswordRequirements } from "./PasswordRequirements";
import { Loader2 } from "lucide-react";

type RegistrationStep = 1 | 2 | 3;

export default function MultiStepRegister() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [defaultCountry, setDefaultCountry] = useState<Country>("JP");
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
    if (!router.isReady) return;
    
    const stepParam = router.query.step;
    const savedDataStr = sessionStorage.getItem("registration_data");

    if (stepParam) {
      const step = parseInt(stepParam as string) as RegistrationStep;
      const isValidStep = step >= 1 && step <= 3;

      if (isValidStep) {
        if (savedDataStr) {
          const parsedData = safeParseJSON(savedDataStr);

          if (isValidRegistrationData(parsedData)) {
            setRegistrationData(parsedData);
            setCurrentStep(step);
          } else {
            sessionStorage.removeItem("registration_data");
            setCurrentStep(1);
          }
        } else if (step === 1) {
          setCurrentStep(1);
        }
      }
    }
  }, [router.isReady, router.query]);

  // Update URL when step changes
  React.useEffect(() => {
    if (!router.isReady) return;
    
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, step: currentStep },
      },
      undefined,
      { shallow: true }
    );
  }, [currentStep, router.isReady]);

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
        console.log("Could not detect country, using default (JP)", error);
      }
    };

    detectCountry();
  }, []);

  // Step 1: Basic Info Form
  const basicInfoSchema = useMemo(() => registerBasicInfoSchema((key, fallback, params) => key), []);

  const basicInfoForm = useForm<RegisterBasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  // TanStack Query mutation for registration
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterBasicInfoFormData) => {
      const phoneNumber = parsePhoneNumber(data.phone);
      const countryCode = phoneNumber?.countryCallingCode
        ? `+${phoneNumber.countryCallingCode}`
        : undefined;
      const phone = phoneNumber?.nationalNumber || data.phone;

      await authService.register({
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: phone,
        country_code: countryCode,
      });

      return { email: data.email, firstName: data.firstName, lastName: data.lastName, phone, countryCode };
    },
    onSuccess: (data) => {
      setRegistrationData({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        countryCode: data.countryCode,
      });
      toast.success("auth.toast.otpSent", "Verification code sent to your email");
      setResendTimer(60);
      setCurrentStep(2);
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        toast.error("", error.message || "Registration failed. Please try again.", error.details);
      } else {
        toast.error("", "Registration failed. Please try again.");
      }
    },
  });

  const onBasicInfoSubmit = (data: RegisterBasicInfoFormData) => {
    registerMutation.mutate(data);
  };

  // Step 2: OTP Verification Form
  const otpSchema = useMemo(() => registerOTPSchema((key, fallback, params) => key), []);

  const otpForm = useForm<RegisterOTPFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
    mode: "onChange",
  });

  // TanStack Query mutation for OTP verification
  const verifyOTPMutation = useMutation({
    mutationFn: async (data: RegisterOTPFormData) => {
      if (!registrationData) throw new Error("No registration data");
      await authService.verifyOTP({
        identifier: registrationData.email,
        otp_code: data.otp,
        otp_type: "registration",
      });
    },
    onSuccess: () => {
      toast.success("auth.toast.otpVerified", "Email verified successfully!");
      setCurrentStep(3);
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        toast.error(
          "",
          error.message || "Invalid OTP. Please try again.",
          error.details
        );
      } else {
        toast.error(
          "",
          "Verification failed. Please try again."
        );
      }
    },
  });

  const onOTPSubmit = (data: RegisterOTPFormData) => {
    verifyOTPMutation.mutate(data);
  };

  // TanStack Query mutation for resending OTP
  const resendOTPMutation = useMutation({
    mutationFn: async () => {
      if (!registrationData) throw new Error("No registration data");
      await authService.sendOTP({
        identifier: registrationData.email,
        otp_type: "registration",
      });
    },
    onSuccess: () => {
      toast.success(
        "auth.toast.otpResent",
        "New verification code sent to your email"
      );
      setResendTimer(60);
    },
    onError: () => {
      toast.error(
        "auth.toast.resendFailed",
        "Failed to resend code. Please try again."
      );
    },
  });

  const handleResendOTP = () => {
    resendOTPMutation.mutate();
  };

  // Step 3: Set Password Form
  const passwordSchema = useMemo(() => registerPasswordSchema((key, fallback, params) => key), []);

  const passwordForm = useForm<RegisterPasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  // TanStack Query mutation for setting password
  const setPasswordMutation = useMutation({
    mutationFn: async (data: RegisterPasswordFormData) => {
      if (!registrationData) throw new Error("No registration data");
      return authService.setPassword({
        email: registrationData.email,
        password: data.password,
      });
    },
    onSuccess: (result) => {
      toast.success(
        "auth.toast.signupSuccess",
        result.message || "Account created successfully!"
      );
      sessionStorage.removeItem("registration_data");
      router.push("/login");
    },
    onError: (error: Error) => {
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
    },
  });

  const onPasswordSubmit = (data: RegisterPasswordFormData) => {
    setPasswordMutation.mutate(data);
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
                  {t("auth.signup.pageStep", "Step {currentStep} of 3:", { currentStep })}{" "}
                  {currentStep === 1
                    ? t("auth.signup.basicInfo", "Basic Information")
                    : currentStep === 2
                      ? t("auth.verifyOTP.title", "Verify OTP")
                      : t("auth.signup.setPassword", "Set Password")}
                </p>
              </div>

              {/* STEP 1: Basic Information */}
              {currentStep === 1 && (
                <Form {...basicInfoForm}>
                  <form
                    onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)}
                    className="space-y-6"
                  >
                    {/* Name Fields */}
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={basicInfoForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">
                              {t("auth.signup.firstName", "First Name")}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                  <UserIcon
                                    weight="duotone"
                                    size={24}
                                    className="text-gray-600"
                                  />
                                </div>
                                <Input
                                  type="text"
                                  disabled={registerMutation.isPending}
                                  placeholder={t(
                                    "auth.signup.firstNamePlaceholder",
                                    "John"
                                  )}
                                  className={cn(
                                    "h-12 pl-14 pr-4 login-input",
                                    basicInfoForm.formState.errors.firstName &&
                                    "border-destructive"
                                  )}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <TranslatedFormMessage t={t} />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={basicInfoForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-sm font-medium text-gray-900">
                              {t("auth.signup.lastName", "Last Name")}
                            </FormLabel>
                            <FormControl>
                              <div className="relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                  <UserIcon
                                    weight="duotone"
                                    size={24}
                                    className="text-gray-600"
                                  />
                                </div>
                                <Input
                                  type="text"
                                  disabled={registerMutation.isPending}
                                  placeholder={t(
                                    "auth.signup.lastNamePlaceholder",
                                    "Doe"
                                  )}
                                  className={cn(
                                    "h-12 login-input pl-14 pr-4",
                                    basicInfoForm.formState.errors.lastName &&
                                    "border-destructive"
                                  )}
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <TranslatedFormMessage t={t} />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Email Field */}
                    <FormField
                      control={basicInfoForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            {t("auth.signup.email", "Email")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <EnvelopeSimpleIcon
                                  weight="duotone"
                                  size={24}
                                  className="text-gray-600"
                                />
                              </div>
                              <Input
                                type="email"
                                disabled={registerMutation.isPending}
                                placeholder={t(
                                  "auth.signup.emailPlaceholder",
                                  "Enter email address"
                                )}
                                className={cn(
                                  "h-12 pl-14 pr-4 login-input",
                                  basicInfoForm.formState.errors.email &&
                                  "border-destructive"
                                )}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <TranslatedFormMessage t={t} />
                        </FormItem>
                      )}
                    />

                    {/* Phone Field */}
                    <FormField
                      control={basicInfoForm.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            {t("auth.signup.phone", "Contact Number")}
                          </FormLabel>
                          <FormControl>
                            <PhoneInput
                              value={field.value}
                              onChange={field.onChange}
                              defaultCountry={defaultCountry}
                              disabled={registerMutation.isPending}
                              placeholder={t(
                                "auth.signup.phonePlaceholder",
                                "981-234-5678"
                              )}
                              className={cn(
                                basicInfoForm.formState.errors.phone &&
                                "border-destructive"
                              )}
                            />
                          </FormControl>
                          <TranslatedFormMessage t={t} />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={registerMutation.isPending}
                      className={cn(
                        "w-full h-12 rounded-lg font-medium",
                        "bg-blue-600 hover:bg-blue-700 text-white",
                        "shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                      )}
                    >
                      {registerMutation.isPending ? (
                        t("auth.signup.sendingOTP", "Sending verification code...")
                      ) : (
                        <>
                          {t("common.continue", "Continue")}
                          <ArrowRightIcon size={20} weight="bold" />
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              {/* STEP 2: OTP Verification */}
              {currentStep === 2 && registrationData && (
                <Form {...otpForm}>
                  <form
                    onSubmit={otpForm.handleSubmit(onOTPSubmit)}
                    className="space-y-6"
                  >
                    <div className="text-center">
                      <p className="text-gray-600">
                        {t("auth.verifyOTP.subtitle", "Enter the 6-digit code sent to")}
                      </p>
                      <p className="font-medium">
                        {registrationData.email}
                      </p>
                      <p className="text-gray-600">
                        {t(
                          "auth.verifyOTP.otpValidity",
                          "The code will automatically expire after 10 minutes."
                        )}
                      </p>
                    </div>

                    <FormField
                      control={otpForm.control}
                      name="otp"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="flex justify-center">
                              <InputOTP
                                maxLength={6}
                                value={field.value}
                                onChange={field.onChange}
                                disabled={verifyOTPMutation.isPending || resendOTPMutation.isPending}
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
                          </FormControl>
                          <div className="text-center">
                            <TranslatedFormMessage t={t} />
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={
                          verifyOTPMutation.isPending || otpForm.watch("otp").length < 6
                        }
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {verifyOTPMutation.isPending ? t("auth.verifyOTP.verifying", "Verifying...") : t("auth.verifyOTP.title", "Verify OTP")}
                      </Button>
                    </div>

                    <div className="text-center">
                      {t("auth.verifyOTP.didntReceiveCode", "Didn't receive code?")}{" "}
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={verifyOTPMutation.isPending || resendOTPMutation.isPending || resendTimer > 0}
                        className="text-blue-600 hover:text-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendTimer > 0
                          ? t("auth.verifyOTP.resendIn", "Resend in {resendTimer}s", { resendTimer })
                          : t("auth.verifyOTP.resend", "Resend")}
                      </button>
                    </div>
                  </form>
                </Form>
              )}

              {/* STEP 3: Set Password */}
              {currentStep === 3 && registrationData && (
                <Form {...passwordForm}>
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
                    <FormField
                      control={passwordForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            {t("auth.signup.password", "Password")}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <KeyIcon
                                  weight="duotone"
                                  size={24}
                                  className="text-gray-600"
                                />
                              </div>
                              <Input
                                type={showPassword ? "text" : "password"}
                                disabled={setPasswordMutation.isPending}
                                placeholder={t(
                                  "auth.signup.passwordPlaceholder",
                                  "••••••••••••"
                                )}
                                className={cn(
                                  "h-12 pl-14 pr-16 login-input",
                                  passwordForm.formState.errors.password &&
                                  "border-destructive"
                                )}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={setPasswordMutation.isPending}
                                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 disabled:cursor-not-allowed"
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
                          </FormControl>
                          {passwordForm.formState.errors.password &&
                            passwordForm.formState.errors.password.message !== "Invalid input" &&
                            // Filter out messages that are already covered by PasswordRequirements
                            !passwordForm.formState.errors.password.message?.includes("must be at least 8 characters") &&
                            !passwordForm.formState.errors.password.message?.includes("uppercase and one lowercase") &&
                            !passwordForm.formState.errors.password.message?.includes("special character") &&
                            !passwordForm.formState.errors.password.message?.includes("numeric digit") && (
                              <TranslatedFormMessage t={t} />
                            )}
                          <PasswordRequirements password={passwordForm.watch("password")} />
                        </FormItem>
                      )}
                    />

                    {/* Confirm Password Field */}
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-gray-900">
                            {t(
                              "auth.signup.confirmPassword",
                              "Confirm Password"
                            )}
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                                <KeyIcon
                                  weight="duotone"
                                  size={24}
                                  className="text-gray-600"
                                />
                              </div>
                              <Input
                                type={showConfirmPassword ? "text" : "password"}
                                disabled={setPasswordMutation.isPending}
                                placeholder={t(
                                  "auth.signup.confirmPasswordPlaceholder",
                                  "••••••••••••"
                                )}
                                className={cn(
                                  "h-12 pl-14 pr-16 login-input",
                                  passwordForm.formState.errors.confirmPassword &&
                                  "border-destructive"
                                )}
                                {...field}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                disabled={setPasswordMutation.isPending}
                                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 disabled:cursor-not-allowed"
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
                          </FormControl>
                          <TranslatedFormMessage t={t} />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        disabled={setPasswordMutation.isPending}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {setPasswordMutation.isPending
                          ? t("auth.signup.creatingAccount", "Creating Account...")
                          : t("auth.signup.completeRegistration", "Complete Registration")}
                      </Button>
                    </div>
                  </form>
                </Form>
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
                        href="/login"
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
