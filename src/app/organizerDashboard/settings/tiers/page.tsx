"use client";

import { useState, useMemo } from "react";
import { PencilSimpleIcon, TrashIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { tierService, TierTemplate } from "@/services/tierService";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createTierTemplateSchema, TierTemplateFormData } from "@/lib/validation";
import { useTranslation } from "@/hooks/useTranslation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { Loader2 } from "lucide-react";

function TierTemplateSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8" />
              <Skeleton className="h-8 w-8" />
            </div>
          </div>
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-2/3 mb-4" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function TierTemplatesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TierTemplate | null>(null);

  const tierTemplateSchema = useMemo(() => createTierTemplateSchema(t), [t]);

  const form = useForm<TierTemplateFormData>({
    resolver: zodResolver(tierTemplateSchema),
    defaultValues: {
      template_name: "",
      description: "",
    },
  });

  // Fetch tier templates using TanStack Query
  const { data: templates = [], isLoading } = useQuery({
    queryKey: queryKeys.tierTemplates.all,
    queryFn: () => tierService.getTierTemplates(),
  });

  // Create tier template mutation
  const createMutation = useMutation({
    mutationFn: (data: TierTemplateFormData) => tierService.createTierTemplate(data),
    onSuccess: () => {
      toast.success("Tier template created successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to create template");
    },
  });

  // Update tier template mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: TierTemplateFormData }) =>
      tierService.updateTierTemplate(id, data),
    onSuccess: () => {
      toast.success("Tier template updated successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
      setIsDialogOpen(false);
    },
    onError: () => {
      toast.error("Failed to update template");
    },
  });

  // Delete tier template mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tierService.deleteTierTemplate(id),
    onSuccess: () => {
      toast.success("Tier template deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
    },
    onError: () => {
      toast.error("Failed to delete template");
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const handleOpenDialog = (template?: TierTemplate) => {
    if (template) {
      setIsEditing(true);
      setCurrentTemplate(template);
      form.reset({
        template_name: template.template_name,
        description: template.description || "",
      });
    } else {
      setIsEditing(false);
      setCurrentTemplate(null);
      form.reset({
        template_name: "",
        description: "",
      });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = (data: TierTemplateFormData) => {
    if (isEditing && currentTemplate) {
      updateMutation.mutate({ id: currentTemplate.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tier Templates</h1>
          <p className="text-gray-500">Manage your reusable tier templates</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <PlusIcon size={16} />
          Create Template
        </Button>
      </div>

      {isLoading ? (
        <TierTemplateSkeleton />
      ) : templates.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No tier templates found</p>
          <Button variant="outline" onClick={() => handleOpenDialog()}>
            Create your first template
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-semibold text-lg text-gray-900">
                  {template.template_name}
                </h3>
                <div className="flex items-center rounded-md" role="group">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleOpenDialog(template)}
                    className="rounded-r-none border-r-0 h-8 w-8"
                  >
                    <PencilSimpleIcon weight="duotone" size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(template.id)}
                    disabled={deleteMutation.isPending}
                    className="rounded-l-none h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    {deleteMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <TrashIcon weight="duotone" size={16} />
                    )}
                  </Button>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {template.description || "No description"}
              </p>
              <div className="text-xs text-gray-400">
                Last updated: {new Date(template.updated_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                      <Loader2 className="w-4 h-4 animate-spin" />
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
    </div>
  );
}
