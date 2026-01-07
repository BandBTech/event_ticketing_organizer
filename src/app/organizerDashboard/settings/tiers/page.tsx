"use client";

import { useState } from "react";
import { PencilSimpleIcon, TrashIcon, PlusIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { tierService, TierTemplate } from "@/services/tierService";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateTierTemplateDialog } from "../../components/CreateTierTemplateDialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { Loader2 } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function TierTemplateSkeleton() {
  return (
    <div className="grid gap-4 @2xl:grid-cols-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div
          key={i}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm"
        >
          <div className="flex justify-between items-start mb-4 gap-2">
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
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<TierTemplate | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<TierTemplate | null>(null);

  // Fetch tier templates using TanStack Query
  const { data: templates = [], isLoading } = useQuery({
    queryKey: queryKeys.tierTemplates.all,
    queryFn: () => tierService.getTierTemplates(),
  });

  // Delete tier template mutation with optimistic update
  const deleteMutation = useMutation({
    mutationFn: (id: string) => tierService.deleteTierTemplate(id),
    onSuccess: (data, variables) => {
      // Eagerly update cache: remove the deleted item immediately
      queryClient.setQueryData<TierTemplate[]>(queryKeys.tierTemplates.all, (old) =>
        old ? old.filter((template) => template.id !== variables) : []
      );

      toast.success("Tier template deleted successfully");
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
      setTemplateToDelete(null);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
    },
  });

  const handleOpenDialog = (template?: TierTemplate) => {
    setCurrentTemplate(template || null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (template: TierTemplate) => {
    setTemplateToDelete(template);
  };

  const handleConfirmDelete = () => {
    if (templateToDelete) {
      deleteMutation.mutate(templateToDelete.id);
    }
  };

  return (
    <div className="space-y-6 @container">
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
        <div className="grid gap-4 @2xl:grid-cols-2">
          {templates.map((template) => (
            <div
              key={template.id}
              className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4 gap-2">
                <h3 className="font-semibold text-lg text-gray-900 break-all line-clamp-2">
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
                    onClick={() => handleDeleteClick(template)}
                    className="rounded-l-none h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  >
                    <TrashIcon weight="duotone" size={16} />
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

      <CreateTierTemplateDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.tierTemplates.all });
        }}
        initialData={currentTemplate}
      />

      <AlertDialog open={!!templateToDelete} onOpenChange={(open) => !open && setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tier Template</AlertDialogTitle>
            <AlertDialogDescription className="break-all">
              Are you sure you want to delete <span className="font-semibold">&quot;{templateToDelete?.template_name}&quot;</span>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
