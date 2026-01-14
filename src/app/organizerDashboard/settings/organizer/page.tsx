"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/lib/toast";
import { PencilIcon, BuildingOfficeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/authService";
import { AuthError } from "@/lib/errors";
import Image from "next/image";
import { queryKeys } from "@/lib/queryKeys";
import { RejectionNotice } from "@/components/organizer/RejectionNotice";
import { OrganizerProfileForm } from "@/components/organizer/OrganizerProfileForm";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useTranslation } from "@/hooks/useTranslation";
import { OrganizerProfileFormValues } from "@/lib/validation";

// Define proper types for the organization data
interface OrganizationData {
  business_name?: string;
  business_description?: string;
  business_logo_url?: string;
}

interface ProfileData {
  data?: unknown;
  organization?: OrganizationData;
  organizer?: { organization?: OrganizationData };
  user?: { organizer?: { organization?: OrganizationData } };
}

export default function OrganizerProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { locale } = useLanguageStore();
  const { t } = useTranslation(locale);
  const { isOrganizerRejected } = useAuthStore();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: queryKeys.organizerProfile.all,
    queryFn: async () => {
      const res = await authService.getOrganizerProfile();
      return res as unknown;
    },
    retry: false,
  });

  const rawData = (profile as ProfileData)?.data || profile;
  const org: OrganizationData = (rawData as ProfileData)?.organization ||
    (rawData as ProfileData)?.organizer?.organization ||
    (rawData as ProfileData)?.user?.organizer?.organization ||
    (rawData as OrganizationData) || {};

  const mutation = useMutation({
    mutationFn: async ({ data, logo }: { data: OrganizerProfileFormValues; logo: File | null | undefined }) => {
      await authService.updateOrganizerProfile({
        business_name: data.business_name,
        business_description: data.business_description,
        business_logo: logo,
        role: 'organizer',
      });
    },
    onSuccess: () => {
      toast.success("profile.toast.updateSuccess", "Organizer profile updated successfully.");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.organizerProfile.all });
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("profile.toast.updateError", "Failed to update organizer profile.");
      }
    },
  });

  const handleSubmit = (data: OrganizerProfileFormValues, logo: File | null | undefined) => {
    mutation.mutate({ data, logo });
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  if (isLoadingProfile) {
    return <div>{t("common.loading", "Loading...")}</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            {t("settings.menu.organizer", "Organizer Profile")}
          </h1>
          <p className="text-sm text-gray-600">
            {t("settings.organizerProfile.description", "Manage your organization details and branding")}
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm"
          >
            <PencilIcon size={16} weight="duotone" />
            {t("profile.editButton", "Edit Profile")}
          </Button>
        )}
      </div>

      {isOrganizerRejected() && <RejectionNotice />}

      <div className="glass-card rounded-xl p-6">
        {isEditing ? (
          <OrganizerProfileForm
            defaultValues={{
              business_name: org?.business_name || "",
              business_description: org?.business_description || "",
            }}
            initialLogoUrl={org?.business_logo_url}
            isEditing={true}
            isPending={mutation.isPending}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            showActions={true}
            showLogoUploader={true}
          />
        ) : (
            <div className="space-y-6">
              {/* Logo Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">
                  {t("settings.organizerProfile.businessLogo", "Business Logo")}
                </label>
                <div className="w-[182px] h-[182px] relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                  {org?.business_logo_url ? (
                    <Image
                      src={org.business_logo_url}
                      alt="Business Logo"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <BuildingOfficeIcon size={48} className="text-gray-300" />
                  )}
                </div>
              </div>

              {/* Business Name Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">
                  {t("settings.organizerProfile.businessName", "Business Name")}
                </label>
                <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg">
                  {org?.business_name || t("common.notSpecified", "Not specified")}
                </p>
              </div>

              {/* Description Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-900 block">
                  {t("settings.organizerProfile.about", "Description")}
                </label>
                <p className="text-gray-700 bg-gray-50 px-4 py-3 rounded-lg min-h-[100px]">
                  {org?.business_description || t("common.notSpecified", "Not specified")}
                </p>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}
