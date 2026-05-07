import { useState, useMemo, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";
import { EyeIcon, EyeClosedIcon, KeyIcon } from "@phosphor-icons/react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigationGuard } from "@/hooks/useNavigationGuard";
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
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/router";
import { PasswordRequirements } from "@/components/auth/PasswordRequirements";
import SettingsLayout from "@/components/layout/SettingsLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import Head from "next/head";
import { UnsavedChangesDialog } from "@/components/organizerDashboard/eventForm/createEventForm/UnsavedChangesDialog";

const createChangePasswordSchema = () => {
  return z
    .object({
      currentPassword: z
        .string()
        .min(1, "settings.security.validation.currentPasswordRequired"),
      newPassword: z
        .string()
        .min(1, "settings.security.validation.newPasswordRequired")
        .min(8, "settings.security.validation.passwordMinLength")
        .max(100, "settings.security.validation.passwordMaxLength")
        .regex(
          /(?=.*[a-z])(?=.*[A-Z])/,
          "settings.security.validation.passwordUpperLower",
        )
        .regex(
          /[^A-Za-z0-9]/,
          "settings.security.validation.passwordSpecialChar",
        )
        .regex(/[0-9]/, "settings.security.validation.passwordNumber"),
      confirmPassword: z
        .string()
        .min(1, "settings.security.validation.confirmPasswordRequired"),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "settings.security.validation.passwordMismatch",
      path: ["confirmPassword"],
    });
};

type ChangePasswordFormData = z.infer<
  ReturnType<typeof createChangePasswordSchema>
>;

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const schema = useMemo(() => createChangePasswordSchema(), []);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const { isDirty } = form.formState;

  const hasUnsavedChanges = useCallback(() => {
    return isDirty;
  }, [isDirty]);

  const { showLeaveDialog, setShowLeaveDialog, confirmLeave, cancelLeave } =
    useNavigationGuard({
      hasUnsavedChanges,
      onBeforeLeave: () => {
        form.reset(form.getValues());
      },
    });

  const mutation = useMutation({
    mutationFn: async (data: ChangePasswordFormData) => {
      await authService.changePassword({
        current_password: data.currentPassword,
        new_password: data.newPassword,
        confirm_password: data.confirmPassword,
      });
    },
    onSuccess: () => {
      toast.success(
        "auth.toast.passwordChanged",
        "Password changed successfully",
        t("auth.toast.passwordChangedLogin"),
      );

      setTimeout(async () => {
        await logout();
        router.push("/login");
      }, 500);
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        toast.error("", "Failed to change password", error.details);
      } else {
        toast.error(
          "auth.toast.passwordChangeFailed",
          "Failed to change password",
        );
      }
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    mutation.mutate(data);
  };

  const isPasswordRequirementError = (message?: string) => {
    if (!message) return false;
    const requirementKeys = [
      "settings.security.validation.passwordMinLength",
      "settings.security.validation.passwordUpperLower",
      "settings.security.validation.passwordSpecialChar",
      "settings.security.validation.passwordNumber",
    ];
    return requirementKeys.includes(message);
  };

  return (
    <>
      <Head>
        <title>{t("settings.security.title", "Security Settings")}</title>
      </Head>
      <SettingsLayout>
        <ProtectedRoute>
          <div className="space-y-4 max-w-4xl mx-auto px-1 md:p-6 md:pt-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                {t("settings.security.title", "Security Settings")}
              </h1>
              <p className="text-sm text-gray-600">
                {t(
                  "settings.security.subtitle",
                  "Manage your password and authentication",
                )}
              </p>
            </div>

            <div className="glass-card rounded-xl p-6 bg-white/60 shadow-blur-subtle-md">
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {t("settings.security.changePassword", "Change Password")}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {t(
                      "settings.security.changePasswordDesc",
                      "Update your password regularly to keep your account secure",
                    )}
                  </p>
                </div>
              </div>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="currentPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          {t(
                            "settings.security.currentPassword",
                            "Current Password",
                          )}
                        </FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <KeyIcon
                              weight="duotone"
                              size={18}
                              className="text-gray-600"
                            />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              type={showCurrentPassword ? "text" : "password"}
                              autoComplete="current-password"
                              disabled={mutation.isPending}
                              placeholder={t(
                                "settings.security.currentPasswordPlaceholder",
                                "Enter current password",
                              )}
                              className="h-11 pl-11 pr-12 bg-white"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            disabled={mutation.isPending}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {showCurrentPassword ? (
                              <EyeIcon
                                size={18}
                                className="text-gray-600"
                                weight="duotone"
                              />
                            ) : (
                              <EyeClosedIcon
                                size={18}
                                className="text-gray-600"
                                weight="duotone"
                              />
                            )}
                          </button>
                        </div>
                        <TranslatedFormMessage t={t} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field, fieldState }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          {t("settings.security.newPassword", "New Password")}
                        </FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <KeyIcon
                              weight="duotone"
                              size={18}
                              className="text-gray-600"
                            />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              type={showNewPassword ? "text" : "password"}
                              autoComplete="new-password"
                              disabled={mutation.isPending}
                              placeholder={t(
                                "settings.security.newPasswordPlaceholder",
                                "Enter new password",
                              )}
                              className="h-11 pl-11 pr-12 bg-white"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            disabled={mutation.isPending}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {showNewPassword ? (
                              <EyeIcon
                                size={18}
                                className="text-gray-600"
                                weight="duotone"
                              />
                            ) : (
                              <EyeClosedIcon
                                size={18}
                                className="text-gray-600"
                                weight="duotone"
                              />
                            )}
                          </button>
                        </div>
                        {fieldState.error &&
                          !isPasswordRequirementError(
                            fieldState.error.message,
                          ) && <TranslatedFormMessage t={t} />}
                        <PasswordRequirements password={field.value} />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          {t(
                            "settings.security.confirmPassword",
                            "Confirm New Password",
                          )}
                        </FormLabel>
                        <div className="relative">
                          <div className="absolute left-3 top-1/2 -translate-y-1/2">
                            <KeyIcon
                              weight="duotone"
                              size={18}
                              className="text-gray-600"
                            />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              disabled={mutation.isPending}
                              placeholder={t(
                                "settings.security.confirmPasswordPlaceholder",
                                "Enter new password again",
                              )}
                              className="h-11 pl-11 pr-12 bg-white"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={mutation.isPending}
                            className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
                          >
                            {showConfirmPassword ? (
                              <EyeIcon
                                size={18}
                                className="text-gray-600"
                                weight="duotone"
                              />
                            ) : (
                              <EyeClosedIcon
                                size={18}
                                className="text-gray-600"
                                weight="duotone"
                              />
                            )}
                          </button>
                        </div>
                        <TranslatedFormMessage t={t} />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4 border-t border-gray-100">
                    <Button
                      type="submit"
                      disabled={mutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      {mutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {mutation.isPending
                        ? t("common.updating", "Updating...")
                        : t(
                            "settings.security.updateButton",
                            "Update Password",
                          )}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => form.reset()}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-none"
                    >
                      {t("common.cancel", "Cancel")}
                    </Button>
                  </div>
                </form>
              </Form>

              <UnsavedChangesDialog
                open={showLeaveDialog}
                onOpenChange={setShowLeaveDialog}
                onConfirm={confirmLeave}
                onCancel={cancelLeave}
              />
            </div>
          </div>
        </ProtectedRoute>
      </SettingsLayout>
    </>
  );
}
