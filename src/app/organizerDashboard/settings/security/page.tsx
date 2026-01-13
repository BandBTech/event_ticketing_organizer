'use client';

import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { EyeIcon, EyeClosedIcon, KeyIcon } from '@phosphor-icons/react/dist/ssr';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from '@/components/ui/form';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authService } from '@/services/authService';
import { AuthError } from '@/lib/errors';
import { toast } from '@/lib/toast';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { PasswordRequirements } from '@/app/(auth)/components/PasswordRequirements';

// Validation schema - returns translation keys for TranslatedFormMessage
const createChangePasswordSchema = () => {
  return z
    .object({
      currentPassword: z
        .string()
        .min(1, 'settings.security.validation.currentPasswordRequired'),
      newPassword: z
        .string()
        .min(1, 'settings.security.validation.newPasswordRequired')
        .min(8, 'settings.security.validation.passwordMinLength')
        .max(100, 'settings.security.validation.passwordMaxLength')
        .regex(/(?=.*[a-z])(?=.*[A-Z])/, 'settings.security.validation.passwordUpperLower')
        .regex(/[^A-Za-z0-9]/, 'settings.security.validation.passwordSpecialChar')
        .regex(/[0-9]/, 'settings.security.validation.passwordNumber'),
      confirmPassword: z.string().min(1, 'settings.security.validation.confirmPasswordRequired'),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: 'settings.security.validation.passwordMismatch',
      path: ['confirmPassword'],
    });
};

type ChangePasswordFormData = z.infer<ReturnType<typeof createChangePasswordSchema>>;

export default function SecuritySettingsPage() {
  const router = useRouter();
  const { logout } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Create schema once - it returns translation keys, not translated strings
  const schema = useMemo(() => createChangePasswordSchema(), []);

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  // Use TanStack Query mutation for password change
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
        'Password changed successfully',
        t("auth.toast.passwordChangedLogin")
      );

      // Logout and redirect after a short delay to show toast
      setTimeout(async () => {
        await logout();
        router.push('/login');
      }, 500);
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        toast.error('', error.message || 'Failed to change password', error.details);
      } else {
        toast.error('auth.toast.passwordChangeFailed', 'Failed to change password');
      }
    },
  });

  const onSubmit = (data: ChangePasswordFormData) => {
    mutation.mutate(data);
  };

  // Check if the error message is related to password requirements (which are shown separately)
  const isPasswordRequirementError = (message?: string) => {
    if (!message) return false;
    const requirementKeys = [
      'settings.security.validation.passwordMinLength',
      'settings.security.validation.passwordUpperLower',
      'settings.security.validation.passwordSpecialChar',
      'settings.security.validation.passwordNumber',
    ];
    return requirementKeys.includes(message);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 font-poppins">
          {t('settings.security.title', 'Security Settings')}
        </h1>
        <p className="text-sm text-gray-600">
          {t('settings.security.subtitle', 'Manage your password and authentication')}
        </p>
      </div>

      {/* Change Password Section */}
      <div className="glass-card rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {t('settings.security.changePassword', 'Change Password')}
            </h2>
            <p className="text-sm text-gray-600">
              {t('settings.security.changePasswordDesc', 'Update your password regularly to keep your account secure')}
            </p>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Current Password */}
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900">
                    {t('settings.security.currentPassword', 'Current Password')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <KeyIcon weight='duotone' size={18} className="text-gray-600" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type={showCurrentPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder={t('settings.security.currentPasswordPlaceholder', 'Enter current password')}
                        className="h-11 pl-11 pr-12"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showCurrentPassword ? (
                        <EyeIcon size={18} className="text-gray-600" weight="duotone" />
                      ) : (
                        <EyeClosedIcon size={18} className="text-gray-600" weight="duotone" />
                      )}
                    </button>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* New Password */}
            <FormField
              control={form.control}
              name="newPassword"
              render={({ field, fieldState }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900">
                    {t('settings.security.newPassword', 'New Password')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <KeyIcon weight='duotone' size={18} className="text-gray-600" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type={showNewPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={t('settings.security.newPasswordPlaceholder', 'Enter new password')}
                        className="h-11 pl-11 pr-12"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showNewPassword ? (
                        <EyeIcon size={18} className="text-gray-600" weight="duotone" />
                      ) : (
                        <EyeClosedIcon size={18} className="text-gray-600" weight="duotone" />
                      )}
                    </button>
                  </div>
                  {/* Only show TranslatedFormMessage for non-requirement errors */}
                  {fieldState.error && !isPasswordRequirementError(fieldState.error.message) && (
                    <TranslatedFormMessage t={t} />
                  )}
                  <PasswordRequirements password={field.value} />
                </FormItem>
              )}
            />

            {/* Confirm Password */}
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-900">
                    {t('settings.security.confirmPassword', 'Confirm New Password')}
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2">
                      <KeyIcon weight='duotone' size={18} className="text-gray-600" />
                    </div>
                    <FormControl>
                      <Input
                        {...field}
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        placeholder={t('settings.security.confirmPasswordPlaceholder', 'Enter new password again')}
                        className="h-11 pl-11 pr-12"
                      />
                    </FormControl>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeIcon size={18} className="text-gray-600" weight="duotone" />
                      ) : (
                        <EyeClosedIcon size={18} className="text-gray-600" weight="duotone" />
                      )}
                    </button>
                  </div>
                  <TranslatedFormMessage t={t} />
                </FormItem>
              )}
            />

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {mutation.isPending
                  ? t('common.updating', 'Updating...')
                  : t('settings.security.updateButton', 'Update Password')}
              </Button>
              <Button
                type="button"
                onClick={() => form.reset()}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600"
              >
                {t('common.cancel', 'Cancel')}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
