"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BuildingOfficeIcon, PencilIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploader } from "@/components/ui/image-uploader";
import { authService } from "@/services/authService";
import { AuthError } from "@/lib/errors";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { queryKeys } from "@/lib/queryKeys";

const organizerProfileSchema = z.object({
  business_name: z.string().min(3, "Business name must be at least 3 characters."),
  business_description: z.string().optional(),
});

type OrganizerProfileFormValues = z.infer<typeof organizerProfileSchema>;

export default function OrganizerProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: queryKeys.organizerProfile.all,
    queryFn: async () => {
      const res = await authService.getOrganizerProfile();
      return res as unknown; // Casting as unknown for now since we know the structure roughly
    },
    retry: false, // Don't retry on permission errors
  });

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

  const rawData = (profile as ProfileData)?.data || profile;

  const org: OrganizationData = (rawData as ProfileData)?.organization ||
    (rawData as ProfileData)?.organizer?.organization ||
    (rawData as ProfileData)?.user?.organizer?.organization ||
    (rawData as OrganizationData) || {};

  const form = useForm<OrganizerProfileFormValues>({
    resolver: zodResolver(organizerProfileSchema),
    values: {
      business_name: org?.business_name || "",
      business_description: org?.business_description || "",
    },
  });

  const { register, handleSubmit, formState: { errors }, reset } = form;

  useEffect(() => {
    if (org?.business_logo_url) {
      setPreviewUrl(org.business_logo_url);
    }
  }, [org?.business_logo_url]);

  const mutation = useMutation({
    mutationFn: async (data: OrganizerProfileFormValues) => {
      await authService.updateOrganizerProfile({
        business_name: data.business_name,
        business_description: data.business_description,
        business_logo: selectedFile || undefined,
        role: 'organizer',
      });
    },
    onSuccess: () => {
      toast.success("Organizer profile updated successfully");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: queryKeys.organizerProfile.all });
    },
    onError: (error: Error) => {
      if (error instanceof AuthError) {
        toast.error(error.message);
      } else {
        toast.error("Failed to update organizer profile");
      }
    },
  });

  const onSubmit = (data: OrganizerProfileFormValues) => {
    mutation.mutate(data);
  };

  const handleDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.size > 2 * 1024 * 1024) {
        toast.error("File size must be less than 2MB");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (profile) {
      const rawData = (profile as ProfileData)?.data || profile;
      const org: OrganizationData = (rawData as ProfileData)?.organization ||
        (rawData as ProfileData)?.organizer?.organization ||
        (rawData as ProfileData)?.user?.organizer?.organization ||
        (rawData as OrganizationData) || {};
      reset({
        business_name: org?.business_name || "",
        business_description: org?.business_description || "",
      });
      setPreviewUrl(org?.business_logo_url || null);
    }
  };

  if (isLoadingProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            Organizer Profile
          </h1>
          <p className="text-sm text-gray-600">
            Manage your organization details and branding
          </p>
        </div>
        {!isEditing && (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2 px-4 py-1.5 rounded-lg border-blue-600 text-blue-600 hover:bg-blue-50 shadow-sm"
          >
            <PencilIcon size={16} weight="duotone" />
            Edit Profile
          </Button>
        )}
      </div>

      <div className="glass-card rounded-xl p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

          {/* Logo Section */}
          <div className="space-y-2">

            {isEditing ? (
              <ImageUploader
                label="Business Logo"
                value={previewUrl || ""}
                onChange={(file) => {
                  if (file) {
                    setSelectedFile(file);
                    setPreviewUrl(URL.createObjectURL(file));
                  } else {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }
                }}
                onRemove={() => {
                  setSelectedFile(null);
                  setPreviewUrl(null);
                }}
                maxSizeMB={2}
                helperText="Recommended size: 500x500px."
                helperTextSize="Max size: 2MB."
              // checkAspectRatio={true} // Optional: we can enforce 1:1 if desired, but user didn't explicitly ask for strict 1:1 enforcement here, just validation "such as Invalid media file"
              // Let's keep it simple as per requirement "Validation such as Invalid media file, limit exceed missing"
              />
            ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-900 block">
                    Business Logo
                  </label>
                  <div className="w-32 h-32 relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center">
                    {previewUrl ? (
                      <Image
                        src={previewUrl}
                        alt="Business Logo"
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <BuildingOfficeIcon size={48} className="text-gray-300" />
                    )}
                  </div>
              </div>
            )}
          </div>

          {/* Business Name */}
          <div className="space-y-2">
            <label htmlFor="business_name" className="text-sm font-medium text-gray-900 block">
              Business Name
            </label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <BuildingOfficeIcon size={18} className="text-gray-600" weight="duotone" />
              </div>
              <Input
                id="business_name"
                {...register("business_name")}
                disabled={!isEditing}
                className={cn(
                  "pl-10",
                  !isEditing && "bg-gray-50 cursor-not-allowed",
                  errors.business_name && "border-red-500"
                )}
              />
            </div>
            {errors.business_name && (
              <p className="text-sm text-red-500">{errors.business_name.message}</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label htmlFor="business_description" className="text-sm font-medium text-gray-900 block">
              Description
            </label>
            <Textarea
              id="business_description"
              {...register("business_description")}
              disabled={!isEditing}
              className={cn(
                "min-h-[100px]",
                !isEditing && "bg-gray-50 cursor-not-allowed"
              )}
              placeholder="Tell us about your organization..."
            />
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                type="submit"
                disabled={mutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {mutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                className="bg-gray-200 hover:bg-gray-300 text-gray-600"
              >
                Cancel
              </Button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
