'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { UserIcon, EnvelopeIcon, PencilIcon } from '@phosphor-icons/react/dist/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authService } from '@/services/authService';
import { AuthError } from '@/lib/errors';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { createValidationHelpers } from '@/lib/validation';

import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';

// Validation schema
const createProfileSchema = (t: (key: string, fallback?: string) => string) => {
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
    phone: z
      .string()
      .min(1, v.required("Phone number"))
      .refine(
        (val) => !val || val.length === 0 || (typeof val === 'string' && isValidPhoneNumber(val)),
        v.phone("Phone")
      ),
  });
}


export default function ProfileSettingsPage() {
  const { user, fetchProfile } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const schema = createProfileSchema(t);
  type ProfileFormData = z.infer<typeof schema>;

  // Helper function to combine country code and phone number
  const getFullPhoneNumber = (phone?: string, countryCode?: string): string => {
    if (!phone) return '';
    if (!countryCode) return phone;
    // If phone already starts with +, return as is
    if (phone.startsWith('+')) return phone;
    // Combine country code and phone number
    return `${countryCode}${phone}`;
  };

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: getFullPhoneNumber(user?.phone, user?.countryCode),
    },
    mode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = form;

  // Update form when user data changes (e.g., after profile fetch)
  useEffect(() => {
    if (user) {
      const fullPhone = user.phone && user.countryCode && !user.phone.startsWith('+')
        ? `${user.countryCode}${user.phone}`
        : user.phone || '';

      reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: fullPhone,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);

    try {
      // Parse phone number if provided to extract country code
      let parsedPhone = data.phone;
      let countryCode: string | undefined = undefined;

      if (data.phone && isValidPhoneNumber(data.phone)) {
        const parsed = parsePhoneNumber(data.phone);
        if (parsed) {
          parsedPhone = parsed.nationalNumber;
          countryCode = `+${parsed.countryCallingCode}`;
        }
      }

      await authService.updateProfile({
        first_name: data.firstName,
        last_name: data.lastName,
        phone: parsedPhone || undefined,
        country_code: countryCode,
      });

      await fetchProfile();
      toast.success('settings.toast.profileUpdated', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Profile update failed:', error);
      if (error instanceof AuthError) {
        toast.error('settings.toast.updateFailed', error.message || 'Failed to update profile');
      } else {
        toast.error('settings.toast.updateFailed', 'Failed to update profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: getFullPhoneNumber(user?.phone, user?.countryCode),
    });
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {t('settings.profile.title', 'Profile Settings')}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {t('settings.profile.subtitle', 'Manage your personal information')}
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.6)',
              backdropFilter: 'blur(20px)',
            }}
          >
            <PencilIcon size={16} weight="duotone" />
            {t('settings.profile.editButton', 'Edit Profile')}
          </Button>
        )}
      </div>

      {/* Profile Form */}
      <div className="glass-card rounded-xl p-6">
        {/* Avatar Section */}
        <div className="flex items-center gap-6 pb-6 border-b border-gray-200">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-sm text-gray-600">{user?.email}</p>
            {user?.isEmailVerified && (
              <span className="inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                ✓ Verified
              </span>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* First Name */}
            <div className="space-y-2">
              <label htmlFor="firstName" className="text-sm font-medium text-gray-900 block">
                {t('settings.profile.firstName', 'First Name')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <UserIcon weight='duotone' size={18} className="text-gray-600" />
                </div>
                <Input
                  id="firstName"
                  type="text"
                  disabled={!isEditing}
                  className={cn(
                    "h-11 pl-11 pr-4",
                    !isEditing && "bg-gray-50 cursor-not-allowed",
                    errors.firstName && "border-destructive"
                  )}
                  {...register('firstName')}
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-destructive">{errors.firstName.message}</p>
              )}
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <label htmlFor="lastName" className="text-sm font-medium text-gray-900 block">
                {t('settings.profile.lastName', 'Last Name')}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <UserIcon weight='duotone' size={18} className="text-gray-600" />
                </div>
                <Input
                  id="lastName"
                  type="text"
                  disabled={!isEditing}
                  className={cn(
                    "h-11 pl-11 pr-4",
                    !isEditing && "bg-gray-50 cursor-not-allowed",
                    errors.lastName && "border-destructive"
                  )}
                  {...register('lastName')}
                />
              </div>
              {errors.lastName && (
                <p className="text-xs text-destructive">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-gray-900 block">
              {t('settings.profile.email', 'Email Address')}
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <EnvelopeIcon weight='duotone' size={18} className="text-gray-600" />
              </div>
              <Input
                id="email"
                type="email"
                value={user?.email || ''}
                disabled
                className="h-11 pl-11 pr-4 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-500">
              {t('settings.profile.emailNote', 'Email cannot be changed')}
            </p>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-sm font-medium text-gray-900 block">
              {t('settings.profile.phone', 'Phone Number')}
            </label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  value={field.value || ''}
                  onChange={(value) => field.onChange(value || '')}
                  disabled={!isEditing}
                  defaultCountry="NP"
                  className={cn(
                    !isEditing && "opacity-50 cursor-not-allowed",
                    errors.phone && "border-destructive"
                  )}
                />
              )}
            />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={isLoading || !isDirty}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isLoading ? t('settings.profile.saving', 'Saving...') : t('settings.profile.saveButton', 'Save Changes')}
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600"
              >
                {t('settings.profile.cancelButton', 'Cancel')}
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
