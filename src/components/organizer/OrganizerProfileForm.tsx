"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BuildingOfficeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useLanguageStore } from "@/store/languageStore";
import { useCurrencyStore } from "@/store/currencyStore";
import { useTranslation } from "@/hooks/useTranslation";
import { createOrganizerProfileSchema, OrganizerProfileFormValues } from "@/lib/validation";
import { SUPPORTED_CURRENCIES } from "@/lib/currencies";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

interface OrganizerProfileFormProps {
  /** Default values for the form */
  defaultValues?: Partial<OrganizerProfileFormValues>;
  /** Initial logo URL if editing existing profile */
  initialLogoUrl?: string | null;
  /** Whether the form is in edit mode */
  isEditing?: boolean;
  /** Whether the form submission is pending */
  isPending?: boolean;
  /** Callback when form is submitted */
  onSubmit: (data: OrganizerProfileFormValues, logo: File | null | undefined) => void;
  /** Callback when form is cancelled (only in edit mode) */
  onCancel?: () => void;
  /** Whether to show action buttons */
  showActions?: boolean;
  /** Custom cancel button text */
  cancelText?: string;
  /** Whether to show the logo uploader */
  showLogoUploader?: boolean;
  /** Form instance if you want to control it externally */
  form?: UseFormReturn<OrganizerProfileFormValues>;
}

export function OrganizerProfileForm({
  defaultValues,
  initialLogoUrl,
  isEditing = true,
  isPending = false,
  onSubmit,
  onCancel,
  showActions = true,
  cancelText,
  showLogoUploader = true,
  form: externalForm,
}: OrganizerProfileFormProps) {
  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { setCurrency } = useCurrencyStore();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialLogoUrl || null);
  const [logoError, setLogoError] = useState<string | null>(null);

  // Create schema with translation function - uses translation keys
  const organizerProfileSchema = useMemo(() => createOrganizerProfileSchema((key, fallback) => key), []);

  const internalForm = useForm<OrganizerProfileFormValues>({
    resolver: zodResolver(organizerProfileSchema),
    mode: "onChange",
    defaultValues: {
      business_name: defaultValues?.business_name || "",
      business_description: defaultValues?.business_description || "",
      currency: defaultValues?.currency || "",
    },
  });

  const form = externalForm || internalForm;

  // Update preview URL when initialLogoUrl changes
  useEffect(() => {
    if (initialLogoUrl) {
      setPreviewUrl(initialLogoUrl);
    }
  }, [initialLogoUrl]);

  // Track if this is the initial mount
  const isInitialMount = useRef(true);
  const prevDefaultValuesRef = useRef<string | null>(null);

  // Only reset form when defaultValues actually change (by content, not reference)
  // Skip on initial mount since useForm already handles initial defaultValues
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevDefaultValuesRef.current = JSON.stringify(defaultValues);
      return;
    }

    const currentDefaultValuesStr = JSON.stringify(defaultValues);
    if (defaultValues && prevDefaultValuesRef.current !== currentDefaultValuesStr) {
      prevDefaultValuesRef.current = currentDefaultValuesStr;
      form.reset({
        business_name: defaultValues.business_name || "",
        business_description: defaultValues.business_description || "",
        currency: defaultValues.currency || "",
      });
    }
  }, [defaultValues, form]);

  const validateLogo = () => {
    if (!selectedFile && !previewUrl) {
      setLogoError("settings.organizerProfile.logoRequired");
      return false;
    }
    return true;
  };

  const handleSubmit = (data: OrganizerProfileFormValues) => {
    // Validate logo is present
    if (!validateLogo()) {
      return;
    }
    if (data.currency) {
      setCurrency(data.currency);
    }
    // If we have no selected file and previewUrl is null, it means the user explicitly removed the logo
    const logo = selectedFile ? selectedFile : (previewUrl ? undefined : null);
    onSubmit(data, logo);
  };

  const handleInvalid = () => {
    // Manually trigger logo validation even if other fields fail
    validateLogo();
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(initialLogoUrl || null);
    setLogoError(null);
    form.reset({
      business_name: defaultValues?.business_name || "",
      business_description: defaultValues?.business_description || "",
      currency: defaultValues?.currency || "",
    });
    onCancel?.();
  };

  const handleLogoChange = (file: File | null) => {
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setLogoError(null);
    } else {
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleLogoRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, handleInvalid)} className="space-y-6">
        {/* Logo Uploader */}
        {showLogoUploader && isEditing && (
          <div className="space-y-2 organizer-profile-form">
            <ImageUploader
              label={t("settings.organizerProfile.businessLogo", "Business Logo")}
              value={previewUrl || ""}
              onChange={handleLogoChange}
              onRemove={handleLogoRemove}
              maxSizeMB={2}
              maxWidth={500}
              maxHeight={500}
              required={true}
              error={logoError || undefined}
              helperText={t("settings.organizerProfile.logoHelperText", "Recommended size: 500x500px.")}
              helperTextSize={t("settings.organizerProfile.logoHelperTextSize", "Max size: 2MB.")}
              browseButtonText={t("event.helperText.bannerImageBrowse", "Browse File")}
            />
          </div>
        )}

        {/* Business Name Field */}
        <FormField
          control={form.control}
          name="business_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-900">
                {t("settings.organizerProfile.businessName", "Business Name")}{" "}
                <span className="text-red-500">*</span>
              </FormLabel>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <BuildingOfficeIcon size={18} className="text-gray-600" weight="duotone" />
                </div>
                <FormControl>
                  <Input
                    {...field}
                    disabled={!isEditing}
                    maxLength={50}
                    placeholder={t("settings.organizerProfile.businessNamePlaceholder", "Enter your business name")}
                    className={cn(
                      "pl-10",
                      !isEditing && "bg-gray-50 cursor-not-allowed"
                    )}
                  />
                </FormControl>
              </div>
              <div className="flex justify-between">
                <TranslatedFormMessage t={t} />
                {isEditing && (
                  <p className="text-xs text-gray-400 ml-auto">
                    {field.value?.length || 0}/50 characters
                  </p>
                )}
              </div>
            </FormItem>
          )}
        />

        {/* Currency Field */}
        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-900">
                {t("settings.organizerProfile.currency", "Default Currency")}
              </FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || ""}
                disabled={!isEditing}
              >
                <FormControl>
                  <SelectTrigger className={cn(!isEditing && "bg-gray-50 cursor-not-allowed")}>
                    <SelectValue placeholder={t("event.placeholder.currency", "Select currency")} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {SUPPORTED_CURRENCIES.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <TranslatedFormMessage t={t} />
            </FormItem>
          )}
        />

        {/* Description Field */}
        <FormField
          control={form.control}
          name="business_description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-900">
                {t("settings.organizerProfile.about", "About")}
              </FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  disabled={!isEditing}
                  maxLength={500}
                  placeholder={t("settings.organizerProfile.aboutPlaceholder", "Write about your organization...")}
                  className={cn(
                    "min-h-[100px]",
                    !isEditing && "bg-gray-50 cursor-not-allowed"
                  )}
                />
              </FormControl>
              <div className="flex justify-between">
                <TranslatedFormMessage t={t} />
                {isEditing && (
                  <p className="text-xs text-gray-400 ml-auto">
                    {field.value?.length || 0}/500 characters
                  </p>
                )}
              </div>
            </FormItem>
          )}
        />

        {/* Action Buttons */}
        {showActions && isEditing && (
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending
                ? t("common.saving", "Saving...")
                : t("common.saveChanges", "Save Changes")}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600"
              >
                {t("common.cancel", "Cancel")}
              </Button>
            )}
          </div>
        )}
      </form>
    </Form>
  );
}

export { type OrganizerProfileFormProps };
