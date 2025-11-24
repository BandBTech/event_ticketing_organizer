// components/auth/BasicInfoForm.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { cn } from "@/lib/utils";
import { BasicInfoData, createBasicInfoSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserIcon, EnvelopeSimpleIcon, ArrowRightIcon } from "@phosphor-icons/react/dist/ssr";
import type { Country } from "react-phone-number-input";
import Link from "next/link";

interface BasicInfoFormProps {
  isLoading: boolean;
  defaultCountry: Country;
  onBasicInfoSubmit: (data: BasicInfoData) => Promise<void>;
}

export default function BasicInfoForm({
  isLoading,
  defaultCountry,
  onBasicInfoSubmit,
}: BasicInfoFormProps) {
  const basicInfoSchema = createBasicInfoSchema();
  const basicInfoForm = useForm<BasicInfoData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    },
    mode: "onChange",
  });

  return (
    <>
      <form onSubmit={basicInfoForm.handleSubmit(onBasicInfoSubmit)} className="space-y-6">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="firstName"
              className="text-sm font-medium text-gray-900 block"
            >
              First Name
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
                placeholder="Enter first name"
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
                {basicInfoForm.formState.errors.firstName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label
              htmlFor="lastName"
              className="text-sm font-medium text-gray-900 block"
            >
              Last Name
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
                placeholder="Enter last name"
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
                {basicInfoForm.formState.errors.lastName.message}
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
            Email
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
              placeholder="Enter email address"
              className={cn(
                "h-12 pl-14 pr-4 login-input",
                basicInfoForm.formState.errors.email && "border-destructive"
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
            Contact Number
          </label>
          <Controller
            name="phone"
            control={basicInfoForm.control}
            render={({ field }) => (
              <PhoneInput
                value={field.value}
                onChange={field.onChange}
                defaultCountry={defaultCountry}
                placeholder="Enter valid contact number"
                className={cn(
                  basicInfoForm.formState.errors.phone && "border-destructive"
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

      {/* Footer */}
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/auth/pages/login"
              className="font-medium text-blue-600 hover:text-blue-700"
            >
              Sign in as Organizer.
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
            By continuing, you consent to the fact that you have read and
            understood our{" "}
            <Link
              href="/terms"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              terms and conditions
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="text-blue-600 hover:text-blue-700 underline"
            >
              privacy policy
            </Link>
            .
          </p>
        </div>
      </div>
    </>
  );
}