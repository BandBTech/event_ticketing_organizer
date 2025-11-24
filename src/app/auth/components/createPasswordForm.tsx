
"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PasswordData, createPasswordSchema } from "@/lib/validation";
import { zodResolver } from "@hookform/resolvers/zod";
import { KeyIcon, EyeIcon, EyeClosedIcon } from "@phosphor-icons/react/dist/ssr";

interface CreatePasswordProps {
  registrationData: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    countryCode?: string;
  };
  isLoading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
  onPasswordSubmit: (data: PasswordData) => Promise<void>;
  onTogglePassword: () => void;
  onToggleConfirmPassword: () => void;
}

export default function CreatePassword({
  registrationData,
  isLoading,
  showPassword,
  showConfirmPassword,
  onPasswordSubmit,
  onTogglePassword,
  onToggleConfirmPassword,
}: CreatePasswordProps) {
  const passwordSchema = createPasswordSchema();
  const passwordForm = useForm<PasswordData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  return (
    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-sm text-gray-600">
          Create a secure password for
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
          Password
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <KeyIcon weight="duotone" size={24} className="text-gray-600" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••••••"
            className={cn(
              "h-12 pl-14 pr-16 login-input",
              passwordForm.formState.errors.password && "border-destructive"
            )}
            {...passwordForm.register("password")}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2"
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
        {passwordForm.formState.errors.password && (
          <p className="text-sm text-destructive">
            {passwordForm.formState.errors.password.message}
          </p>
        )}
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="text-sm font-medium text-gray-900 block"
        >
          Confirm Password
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <KeyIcon weight="duotone" size={24} className="text-gray-600" />
          </div>
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="••••••••••••"
            className={cn(
              "h-12 pl-14 pr-16 login-input",
              passwordForm.formState.errors.confirmPassword &&
                "border-destructive"
            )}
            {...passwordForm.register("confirmPassword")}
          />
          <button
            type="button"
            onClick={onToggleConfirmPassword}
            className="absolute right-3 top-1/2 -translate-y-1/2"
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
            {passwordForm.formState.errors.confirmPassword.message}
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700"
        >
          {isLoading ? "Creating account..." : "Complete Registration"}
        </Button>
      </div>
    </form>
  );
}