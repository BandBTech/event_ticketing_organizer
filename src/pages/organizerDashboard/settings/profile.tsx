

import { useState, useEffect, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useMutation } from '@tanstack/react-query';
import { UserIcon, EnvelopeIcon, PencilIcon } from '@phosphor-icons/react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PhoneInput } from '@/components/ui/phone-input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from '@/components/ui/form';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { useTranslation } from '@/hooks/useTranslation';
import { authService } from '@/services/authService';
import { AuthError } from '@/lib/errors';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input';
import SettingsLayout from "@/components/layout/SettingsLayout";
import { ProtectedRoute } from "@/components/providers/ProtectedRoute";
import Head from "next/head";

const createProfileSchema = () => {
  return z.object({
    firstName: z
      .string()
      .min(1, 'settings.profile.validation.firstNameRequired')
      .min(3, 'settings.profile.validation.firstNameMinLength')
      .max(50, 'settings.profile.validation.firstNameMaxLength'),
    lastName: z
      .string()
      .min(1, 'settings.profile.validation.lastNameRequired')
      .min(3, 'settings.profile.validation.lastNameMinLength')
      .max(50, 'settings.profile.validation.lastNameMaxLength'),
    phone: z
      .string()
      .refine(
        (val) => !val || val.length === 0 || (typeof val === 'string' && isValidPhoneNumber(val)),
        { message: 'settings.profile.validation.phoneInvalid' }
      ),
  });
};

type ProfileFormData = z.infer<ReturnType<typeof createProfileSchema>>;

export default function ProfileSettingsPage() {
  const { user, fetchProfile } = useAuthStore();
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const [isEditing, setIsEditing] = useState(false);

  const schema = useMemo(() => createProfileSchema(), []);

  const getFullPhoneNumber = (phone?: string, countryCode?: string): string => {
    if (!phone) return '';
    if (!countryCode) return phone;
    if (phone.startsWith('+')) return phone;
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

  const isInitialMount = useRef(true);
  const prevUserRef = useRef<string | null>(null);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevUserRef.current = JSON.stringify(user);
      return;
    }

    const currentUserStr = JSON.stringify(user);
    if (user && prevUserRef.current !== currentUserStr) {
      prevUserRef.current = currentUserStr;
      const fullPhone = user.phone && user.countryCode && !user.phone.startsWith('+')
        ? `${user.countryCode}${user.phone}`
        : user.phone || '';

      form.reset({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: fullPhone,
      });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: async (data: ProfileFormData) => {
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
    },
    onSuccess: async () => {
      await fetchProfile();
      toast.success(
        "settings.toast.profileUpdated",
        "Profile updated successfully!",
      );
      setIsEditing(false);
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        toast.error(
          "settings.toast.updateFailed",
          error.message || "Failed to update profile.",
        );
      } else {
        toast.error("settings.toast.updateFailed", "Failed to update profile.");
      }
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    mutation.mutate(data);
  };

  const handleCancel = () => {
    form.reset({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: getFullPhoneNumber(user?.phone, user?.countryCode),
    });
    setIsEditing(false);
  };

  return (
    <>
      <Head>
        <title>Profile Settings | Organizer Dashboard</title>
      </Head>
      <SettingsLayout>
        <ProtectedRoute>
          <div className="space-y-4 max-w-4xl mx-auto p-4 md:p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">
                  {t('settings.profile.title', 'Profile Settings')}
                </h1>
                <p className="text-sm text-gray-600">
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

            <div className="glass-card rounded-xl p-6 bg-white/60 shadow-blur-subtle-md">
              <div className="flex items-center gap-6 pb-6 border-b border-gray-100">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                  {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                  {user?.isEmailVerified && (
                    <span className="inline-flex items-center px-2 py-0.5 mt-2 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                      ✓ {t('settings.profile.verified', 'Verified')}
                    </span>
                  )}
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required className="text-sm font-medium text-gray-900">
                            {t('settings.profile.firstName', 'First Name')}
                          </FormLabel>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <UserIcon weight='duotone' size={18} className="text-gray-600" />
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                disabled={!isEditing}
                                className={cn(
                                  "h-11 pl-11 pr-4",
                                  !isEditing && "bg-gray-50/50 cursor-not-allowed"
                                )}
                              />
                            </FormControl>
                          </div>
                          <TranslatedFormMessage t={t} />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel required className="text-sm font-medium text-gray-900">
                            {t('settings.profile.lastName', 'Last Name')}
                          </FormLabel>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                              <UserIcon weight='duotone' size={18} className="text-gray-600" />
                            </div>
                            <FormControl>
                              <Input
                                {...field}
                                type="text"
                                disabled={!isEditing}
                                className={cn(
                                  "h-11 pl-11 pr-4",
                                  !isEditing && "bg-gray-50/50 cursor-not-allowed"
                                )}
                              />
                            </FormControl>
                          </div>
                          <TranslatedFormMessage t={t} />
                        </FormItem>
                      )}
                    />
                  </div>

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
                        className="h-11 pl-11 pr-4 bg-gray-50/50 cursor-not-allowed"
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      {t('settings.profile.emailNote', 'Email cannot be changed')}
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-900">
                          {t('settings.profile.phone', 'Phone Number')}
                        </FormLabel>
                        <FormControl>
                          <PhoneInput
                            value={field.value || ''}
                            onChange={(value) => field.onChange(value || '')}
                            disabled={!isEditing}
                            defaultCountry="NP"
                            className={cn(
                              !isEditing && "opacity-50 cursor-not-allowed"
                            )}
                          />
                        </FormControl>
                        <TranslatedFormMessage t={t} />
                      </FormItem>
                    )}
                  />

                  {isEditing && (
                    <div className="flex gap-3 pt-4 border-t border-gray-100">
                      <Button
                        type="submit"
                        disabled={mutation.isPending || !form.formState.isDirty}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {mutation.isPending
                          ? t('common.saving', 'Saving...')
                          : t('common.saveChanges', 'Save Changes')}
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleCancel}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 border-none"
                      >
                        {t('common.cancel', 'Cancel')}
                      </Button>
                    </div>
                  )}
                </form>
              </Form>
            </div>
          </div>
        </ProtectedRoute>
      </SettingsLayout>
    </>
  );
}
