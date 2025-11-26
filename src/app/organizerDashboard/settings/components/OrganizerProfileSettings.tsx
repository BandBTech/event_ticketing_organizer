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
import { Dropzone, DropzoneContent, DropzoneEmptyState } from "@/components/ui/shadcn-io/dropzone";
import { authService, AuthError } from "@/lib/authService";
import { cn } from "@/lib/utils";
import Image from "next/image";

const organizerProfileSchema = z.object({
  business_name: z.string().min(3, "Business name must be at least 3 characters"),
  business_description: z.string().optional(),
});

type OrganizerProfileFormValues = z.infer<typeof organizerProfileSchema>;

export default function OrganizerProfileSettings() {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ["organizerProfile"],
    queryFn: async () => {
      const res = await authService.getOrganizerProfile();
      return res as unknown; // Casting as unknown for now since we know the structure roughly
    },
  });

  console.log("=== ORGANIZER PROFILE DEBUG ===");
  console.log("1. Raw profile:", profile);

  const rawData = (profile as { data?: unknown })?.data || profile;
  console.log("2. After data extraction:", rawData);

  const org = (rawData as any)?.organization ||
    (rawData as any)?.organizer?.organization ||
    (rawData as any)?.user?.organizer?.organization ||
    rawData || {};

  console.log("3. Final org object:", org);
  console.log("4. org.business_name:", (org as any)?.business_name);
  console.log("5. org.business_description:", (org as any)?.business_description);
  console.log("6. org.business_logo_url:", (org as any)?.business_logo_url);
  console.log("=== END DEBUG ===");

  const form = useForm<OrganizerProfileFormValues>({
    resolver: zodResolver(organizerProfileSchema),
    values: {
      business_name: (org as any)?.business_name || "",
      business_description: (org as any)?.business_description || "",
    },
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = form;

  useEffect(() => {
    if ((org as { business_logo_url?: string })?.business_logo_url) {
      setPreviewUrl((org as { business_logo_url?: string }).business_logo_url || null);
    }
  }, [org]);

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
      queryClient.invalidateQueries({ queryKey: ["organizerProfile"] });
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
      const rawData = (profile as { data?: unknown })?.data || profile;
      const org = (rawData as any)?.organization ||
        (rawData as any)?.organizer?.organization ||
        (rawData as any)?.user?.organizer?.organization ||
        rawData || {};
      reset({
        business_name: (org as any)?.business_name || "",
        business_description: (org as any)?.business_description || "",
      });
      setPreviewUrl((org as any)?.business_logo_url || null);
    }
  };

  if (isLoadingProfile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">
            Organizer Profile
          </h1>
          <p className="text-sm text-gray-600 mt-1">
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
            <label className="text-sm font-medium text-gray-900 block">
              Business Logo
            </label>

            {isEditing ? (
              <div className="space-y-2">
                <Dropzone
                  onDrop={handleDrop}
                  accept={{ "image/*": [] }}
                  maxSize={2 * 1024 * 1024}
                  maxFiles={1}
                  className="min-h-[150px] border-dashed border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {previewUrl ? (
                    <div className="relative w-full h-full min-h-[150px] flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <Image
                          src={previewUrl}
                          alt="Logo preview"
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg text-white font-medium cursor-pointer">
                        Change Logo
                      </div>
                    </div>
                  ) : (
                    <>
                      <DropzoneContent />
                      <DropzoneEmptyState />
                    </>
                  )}
                </Dropzone>
                <p className="text-xs text-gray-500">
                  Recommended size: 500x500px. Max size: 2MB.
                </p>
              </div>
            ) : (
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
