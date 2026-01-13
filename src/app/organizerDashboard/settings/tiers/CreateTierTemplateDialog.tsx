"use client";

import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/hooks/useTranslation";
import { createTierTemplateSchema, TierTemplateFormData, TIER_NAME_MAX, TIER_DESC_MAX } from "@/lib/validation";
import { tierService, TierTemplate } from "@/services/tierService";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  TranslatedFormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";

interface CreateTierTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (template: TierTemplate) => void;
  initialData?: TierTemplate | null;
}

export function CreateTierTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: CreateTierTemplateDialogProps) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEditing = !!initialData;

  const tierTemplateSchema = useMemo(() => createTierTemplateSchema((key, fallback, params) => key), []);

  const form = useForm<TierTemplateFormData>({
    resolver: zodResolver(tierTemplateSchema),
    defaultValues: {
      template_name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          template_name: initialData.template_name,
          description: initialData.description || "",
        });
      } else {
        form.reset({
          template_name: "",
          description: "",
        });
      }
    }
  }, [open, initialData, form]);

  // Create mutation with optimistic update
  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data: TierTemplateFormData) => tierService.createTierTemplate(data),
    onSuccess: (result) => {
      // Update cache immediately with server result (pseudo-optimistic / fast-update)
      // Merge with form values to ensure we have data to show even if server response is partial
      const fullTemplate = {
        ...result,
        template_name: form.getValues("template_name") || result.template_name,
        description: form.getValues("description") || result.description
      };

      queryClient.setQueryData<TierTemplate[]>(queryKeys.tierTemplates.all, (old) =>
        old ? [fullTemplate, ...old] : [fullTemplate]
      );

      // Invalidate to ensure consistency in background
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });

      onSuccess?.(fullTemplate);
      onOpenChange(false);
    },
  });

  // Update mutation with optimistic update
  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TierTemplateFormData }) =>
      tierService.updateTierTemplate(id, data),
    onSuccess: (result, variables) => {
      // Update cache immediately using the variables (what was sent)
      // because the server response might not contain the full object or updated fields
      queryClient.setQueryData<TierTemplate[]>(queryKeys.tierTemplates.all, (old) =>
        old?.map((template) =>
          template.id === variables.id
            ? {
              ...template,
              ...variables.data,
              // Ensure updated_at is refreshed locally
              updated_at: new Date().toISOString()
            }
            : template
        ) ?? []
      );

      // Invalidate to ensure consistency in background
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });

      // Pass the constructed full object to onSuccess callback if needed
      // We reconstruct it from variables since result might be partial
      const fullTemplate = {
        id: variables.id,
        ...variables.data,
        is_active: true, // assumption for typings, though usually strictly read from cache
        organizer_id: "", // placeholder, not critical for form selection
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as TierTemplate;

      onSuccess?.(fullTemplate);
      onOpenChange(false);
    },
    onError: () => {
      toast.error("Failed to update template");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data: TierTemplateFormData) => {
    if (isEditing && initialData) {
      updateMutation.mutate({ id: initialData.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("tierTemplates.dialog.editTierTemplate.title", "Edit Tier Template") : t("tierTemplates.dialog.createTierTemplate.title", "Create Tier Template")}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="template_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tierTemplates.columns.templateName", "Template Name")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("tierTemplates.placeholder.templateName", "e.g., VIP, Early Bird")} maxLength={TIER_NAME_MAX} {...field} />
                  </FormControl>
                  <div className="flex justify-between items-center -mt-1 min-h-[20px]">
                    <TranslatedFormMessage t={t} />
                    <div className="text-xs text-muted-foreground ml-auto">
                      {field.value?.length || 0}/{TIER_NAME_MAX} {t("common.characters", "characters")}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("tierTemplates.columns.description", "Description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("tierTemplates.placeholder.description", "Describe this tier...")}
                      rows={3}
                      maxLength={TIER_DESC_MAX}
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between items-center -mt-1 min-h-[20px]">
                    <TranslatedFormMessage t={t} />
                    <div className="text-xs text-muted-foreground ml-auto">
                      {field.value?.length || 0}/{TIER_DESC_MAX} {t("common.characters", "characters")}
                    </div>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  {t("common.cancel", "Cancel")}
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEditing ? t("common.updating", "Updating...") : t("common.creating", "Creating...")}
                  </>
                ) : (
                    isEditing ? t("common.update", "Update") : t("common.create", "Create")
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
