"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "@/hooks/useTranslation";
import { createTierTemplateSchema, TierTemplateFormData } from "@/lib/validation";
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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface CreateTierTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (template: TierTemplate) => void;
  initialData?: TierTemplate | null;
}

export function CreateTierTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
  initialData,
}: CreateTierTemplateDialogProps) {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!initialData;

  const tierTemplateSchema = useMemo(() => createTierTemplateSchema(t), [t]);

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

  const onSubmit = async (data: TierTemplateFormData) => {
    try {
      setIsSubmitting(true);
      let result: TierTemplate;
      
      if (isEditing && initialData) {
        result = await tierService.updateTierTemplate(initialData.id, data);
        toast.success("Tier template updated successfully");
      } else {
        result = await tierService.createTierTemplate(data);
        toast.success("Tier template created successfully");
      }
      
      onSuccess(result);
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast.error(isEditing ? "Failed to update template" : "Failed to create template");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Tier Template" : "Create Tier Template"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="template_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Template Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., VIP, Early Bird" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this tier..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    {isEditing ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  isEditing ? "Update" : "Create"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
